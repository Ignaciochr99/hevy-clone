import { and, count, eq, sql } from 'drizzle-orm';
import type { Equipment, ExerciseType, MuscleGroup } from '../db/enums';
import { exercises, routineExercises } from '../db/schema';
import type { Database } from '../db/types';
import type { Language } from '../i18n/language';
import { normalizeSearch } from '../utils/text';
import { RepositoryError } from './errors';

export type Exercise = typeof exercises.$inferSelect;

export type ExerciseInput = {
  name: string;
  muscleGroup: MuscleGroup;
  equipment: Equipment;
  type: ExerciseType;
  secondaryMuscleGroups?: MuscleGroup[];
};

export type ExerciseFilters = {
  search?: string;
  muscleGroup?: MuscleGroup;
  equipment?: Equipment;
  // Idioma en el que se ordena la lista (por defecto, español).
  language?: Language;
};

function cleanName(name: string): string {
  const trimmed = name.trim();
  if (trimmed === '') {
    throw new RepositoryError('exercise.nameEmpty', 'El nombre del ejercicio no puede estar vacío');
  }
  return trimmed;
}

// Quita los repetidos y comprueba que el grupo principal no esté entre ellos.
function cleanSecondary(primary: MuscleGroup, secondary: readonly MuscleGroup[]): MuscleGroup[] {
  if (secondary.includes(primary)) {
    throw new RepositoryError(
      'exercise.secondaryIncludesPrimary',
      'El grupo muscular secundario no puede ser el mismo que el principal',
    );
  }
  return [...new Set(secondary)];
}

export function createExercisesRepository(db: Database) {
  function getById(id: number): Exercise | undefined {
    return db.select().from(exercises).where(eq(exercises.id, id)).get();
  }

  // Solo los ejercicios propios se pueden editar o borrar.
  function getCustomOrThrow(id: number): Exercise {
    const exercise = getById(id);
    if (!exercise) {
      throw new RepositoryError('exercise.notFound', 'Ejercicio no encontrado');
    }
    if (!exercise.isCustom) {
      throw new RepositoryError('exercise.libraryReadOnly', 'Los ejercicios de la biblioteca no se pueden modificar');
    }
    return exercise;
  }

  return {
    // El grupo y el equipo se filtran en SQL; el texto en TypeScript, porque
    // SQLite no ignora los acentos. La búsqueda mira el nombre en español y en
    // inglés. COLLATE NOCASE: "banca" queda entre "Aperturas" y "zancadas".
    // En inglés se ordena por el nombre en inglés; los ejercicios propios, que
    // no lo tienen, se ordenan por el suyo (COALESCE).
    list(filters: ExerciseFilters = {}): Exercise[] {
      const orderName =
        filters.language === 'en'
          ? sql`COALESCE(${exercises.nameEn}, ${exercises.name}) COLLATE NOCASE`
          : sql`${exercises.name} COLLATE NOCASE`;

      const rows = db
        .select()
        .from(exercises)
        .where(
          and(
            filters.muscleGroup && eq(exercises.muscleGroup, filters.muscleGroup),
            filters.equipment && eq(exercises.equipment, filters.equipment),
          ),
        )
        .orderBy(orderName)
        .all();

      const search = normalizeSearch(filters.search ?? '');
      if (search === '') {
        return rows;
      }
      return rows.filter(
        (row) =>
          normalizeSearch(row.name).includes(search) ||
          (row.nameEn !== null && normalizeSearch(row.nameEn).includes(search)),
      );
    },

    getById,

    create(input: ExerciseInput): Exercise {
      return db
        .insert(exercises)
        .values({
          ...input,
          name: cleanName(input.name),
          secondaryMuscleGroups: cleanSecondary(input.muscleGroup, input.secondaryMuscleGroups ?? []),
          isCustom: true,
        })
        .returning()
        .get();
    },

    update(id: number, changes: Partial<ExerciseInput>): Exercise {
      const existing = getCustomOrThrow(id);
      if (Object.keys(changes).length === 0) {
        return existing;
      }
      // Los secundarios se revalidan con el grupo principal resultante, aunque
      // solo cambie uno de los dos.
      const primary = changes.muscleGroup ?? existing.muscleGroup;
      const secondary = cleanSecondary(
        primary,
        changes.secondaryMuscleGroups ?? existing.secondaryMuscleGroups,
      );
      const { name, ...rest } = changes;
      return db
        .update(exercises)
        .set({
          ...rest,
          ...(name !== undefined && { name: cleanName(name) }),
          secondaryMuscleGroups: secondary,
        })
        .where(eq(exercises.id, id))
        .returning()
        .get();
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
        throw new RepositoryError('exercise.inUse', 'El ejercicio se usa en alguna rutina');
      }
      db.delete(exercises).where(eq(exercises.id, id)).run();
    },
  };
}
