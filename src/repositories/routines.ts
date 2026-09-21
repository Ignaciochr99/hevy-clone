import { asc, count, desc, eq } from 'drizzle-orm';
import { exercises, routineExercises, routines } from '../db/schema';
import type { Database } from '../db/types';
import { RepositoryError } from './errors';

export type RoutineExerciseInput = {
  exerciseId: number;
  targetSets: number;
  targetReps: number;
};

export type RoutineInput = {
  name: string;
  exercises: RoutineExerciseInput[];
};

export type RoutineExercise = {
  id: number;
  exerciseId: number;
  exerciseName: string;
  exerciseNameEn: string | null;
  position: number;
  targetSets: number;
  targetReps: number;
};

export type Routine = {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  exercises: RoutineExercise[];
};

export type RoutineSummary = {
  id: number;
  name: string;
  updatedAt: Date;
  exerciseCount: number;
};

// Devuelve el nombre ya limpio.
function validate(input: RoutineInput): string {
  const name = input.name.trim();
  if (name === '') {
    throw new RepositoryError('routine.nameEmpty', 'El nombre de la rutina no puede estar vacío');
  }
  for (const item of input.exercises) {
    if (!Number.isInteger(item.targetSets) || item.targetSets < 1) {
      throw new RepositoryError('routine.invalidSets', 'Las series objetivo deben ser un entero mayor que 0');
    }
    if (!Number.isInteger(item.targetReps) || item.targetReps < 1) {
      throw new RepositoryError('routine.invalidReps', 'Las repeticiones objetivo deben ser un entero mayor que 0');
    }
  }
  return name;
}

// La posición de cada ejercicio es su índice en la lista recibida.
function insertExercises(db: Database, routineId: number, items: RoutineExerciseInput[]): void {
  if (items.length === 0) {
    return;
  }
  db.insert(routineExercises)
    .values(
      items.map((item, position) => ({
        routineId,
        exerciseId: item.exerciseId,
        position,
        targetSets: item.targetSets,
        targetReps: item.targetReps,
      })),
    )
    .run();
}

export function createRoutinesRepository(db: Database) {
  function getById(id: number): Routine | undefined {
    const routine = db.select().from(routines).where(eq(routines.id, id)).get();
    if (!routine) {
      return undefined;
    }
    const items = db
      .select({
        id: routineExercises.id,
        exerciseId: routineExercises.exerciseId,
        exerciseName: exercises.name,
        exerciseNameEn: exercises.nameEn,
        position: routineExercises.position,
        targetSets: routineExercises.targetSets,
        targetReps: routineExercises.targetReps,
      })
      .from(routineExercises)
      .innerJoin(exercises, eq(routineExercises.exerciseId, exercises.id))
      .where(eq(routineExercises.routineId, id))
      .orderBy(asc(routineExercises.position))
      .all();
    return { ...routine, exercises: items };
  }

  function getByIdOrThrow(id: number): Routine {
    const routine = getById(id);
    if (!routine) {
      throw new RepositoryError('routine.notFound', 'Rutina no encontrada');
    }
    return routine;
  }

  return {
    list(): RoutineSummary[] {
      return db
        .select({
          id: routines.id,
          name: routines.name,
          updatedAt: routines.updatedAt,
          exerciseCount: count(routineExercises.id),
        })
        .from(routines)
        .leftJoin(routineExercises, eq(routineExercises.routineId, routines.id))
        .groupBy(routines.id)
        .orderBy(desc(routines.updatedAt), desc(routines.id))
        .all();
    },

    getById,

    // Todo o nada: si algo falla, la transacción se revierte.
    create(input: RoutineInput): Routine {
      const name = validate(input);
      const id = db.transaction((tx) => {
        const now = new Date();
        const created = tx
          .insert(routines)
          .values({ name, createdAt: now, updatedAt: now })
          .returning({ id: routines.id })
          .get();
        insertExercises(tx, created.id, input.exercises);
        return created.id;
      });
      return getByIdOrThrow(id);
    },

    // Reemplaza la lista de ejercicios completa.
    update(id: number, input: RoutineInput): Routine {
      const name = validate(input);
      db.transaction((tx) => {
        const updated = tx
          .update(routines)
          .set({ name, updatedAt: new Date() })
          .where(eq(routines.id, id))
          .returning({ id: routines.id })
          .get();
        if (!updated) {
          throw new RepositoryError('routine.notFound', 'Rutina no encontrada');
        }
        tx.delete(routineExercises).where(eq(routineExercises.routineId, id)).run();
        insertExercises(tx, id, input.exercises);
      });
      return getByIdOrThrow(id);
    },

    // Los ejercicios de la rutina se borran solos (ON DELETE CASCADE).
    remove(id: number): void {
      const deleted = db
        .delete(routines)
        .where(eq(routines.id, id))
        .returning({ id: routines.id })
        .get();
      if (!deleted) {
        throw new RepositoryError('routine.notFound', 'Rutina no encontrada');
      }
    },
  };
}
