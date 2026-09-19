import { and, count, eq, sql } from 'drizzle-orm';
import type { Equipment, ExerciseType, MuscleGroup } from '../db/enums';
import { exercises, routineExercises } from '../db/schema';
import type { Database } from '../db/types';
import { normalizeSearch } from '../utils/text';

export type Exercise = typeof exercises.$inferSelect;

export type ExerciseInput = {
  name: string;
  muscleGroup: MuscleGroup;
  equipment: Equipment;
  type: ExerciseType;
};

export type ExerciseFilters = {
  search?: string;
  muscleGroup?: MuscleGroup;
  equipment?: Equipment;
};

function cleanName(name: string): string {
  const trimmed = name.trim();
  if (trimmed === '') {
    throw new Error('El nombre del ejercicio no puede estar vacío');
  }
  return trimmed;
}

export function createExercisesRepository(db: Database) {
  function getById(id: number): Exercise | undefined {
    return db.select().from(exercises).where(eq(exercises.id, id)).get();
  }

  // Solo los ejercicios propios se pueden editar o borrar.
  function getCustomOrThrow(id: number): Exercise {
    const exercise = getById(id);
    if (!exercise) {
      throw new Error('Ejercicio no encontrado');
    }
    if (!exercise.isCustom) {
      throw new Error('Los ejercicios de la biblioteca no se pueden modificar');
    }
    return exercise;
  }

  return {
    // El grupo y el equipo se filtran en SQL; el texto en TypeScript, porque
    // SQLite no ignora los acentos. COLLATE NOCASE: "banca" queda entre
    // "Aperturas" y "zancadas".
    list(filters: ExerciseFilters = {}): Exercise[] {
      const rows = db
        .select()
        .from(exercises)
        .where(
          and(
            filters.muscleGroup && eq(exercises.muscleGroup, filters.muscleGroup),
            filters.equipment && eq(exercises.equipment, filters.equipment),
          ),
        )
        .orderBy(sql`${exercises.name} COLLATE NOCASE`)
        .all();

      const search = normalizeSearch(filters.search ?? '');
      return search === ''
        ? rows
        : rows.filter((row) => normalizeSearch(row.name).includes(search));
    },

    getById,

    create(input: ExerciseInput): Exercise {
      return db
        .insert(exercises)
        .values({ ...input, name: cleanName(input.name), isCustom: true })
        .returning()
        .get();
    },

    update(id: number, changes: Partial<ExerciseInput>): Exercise {
      const existing = getCustomOrThrow(id);
      const { name, ...rest } = changes;
      const values = name === undefined ? rest : { ...rest, name: cleanName(name) };
      if (Object.keys(values).length === 0) {
        return existing;
      }
      return db.update(exercises).set(values).where(eq(exercises.id, id)).returning().get();
    },

    remove(id: number): void {
      getCustomOrThrow(id);
      const uses =
        db
          .select({ uses: count() })
          .from(routineExercises)
          .where(eq(routineExercises.exerciseId, id))
          .get()?.uses ?? 0;
      if (uses > 0) {
        throw new Error('El ejercicio se usa en alguna rutina');
      }
      db.delete(exercises).where(eq(exercises.id, id)).run();
    },
  };
}
