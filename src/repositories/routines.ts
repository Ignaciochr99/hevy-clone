import { asc, count, desc, eq, sql } from 'drizzle-orm';
import { exercises, routineExercises, routines } from '../db/schema';
import type { MuscleGroup } from '../db/enums';
import type { Database } from '../db/types';
import { muscleVolume, type MuscleVolume } from '../utils/muscleVolume';
import { RepositoryError } from './errors';

// Descanso por defecto entre series (debe coincidir con el DEFAULT de la columna).
export const DEFAULT_REST_SECONDS = 90;
export const MAX_REST_SECONDS = 3600;

export type RoutineExerciseInput = {
  exerciseId: number;
  targetSets: number;
  targetReps: number;
  // RPE objetivo: de 1 a 10 en pasos de 0,5, o null si no se fija.
  targetRpe?: number | null;
  // Descanso entre series, en segundos (por defecto 90).
  restSeconds?: number;
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
  muscleGroup: MuscleGroup;
  secondaryMuscleGroups: MuscleGroup[];
  position: number;
  targetSets: number;
  targetReps: number;
  targetRpe: number | null;
  restSeconds: number;
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
  // Suma de las series objetivo de todos sus ejercicios.
  totalSets: number;
  // Series por músculo: 1 por serie al grupo principal y 0,5 a cada secundario.
  muscleVolume: MuscleVolume[];
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
    const rpe = item.targetRpe ?? null;
    if (rpe !== null && !(rpe >= 1 && rpe <= 10 && Number.isInteger(rpe * 2))) {
      throw new RepositoryError('routine.invalidRpe', 'El RPE debe estar entre 1 y 10, en pasos de 0,5');
    }
    const rest = item.restSeconds ?? DEFAULT_REST_SECONDS;
    if (!Number.isInteger(rest) || rest < 0 || rest > MAX_REST_SECONDS) {
      throw new RepositoryError('routine.invalidRest', 'El descanso debe ser un número entero de segundos entre 0 y 3600');
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
        targetRpe: item.targetRpe ?? null,
        restSeconds: item.restSeconds ?? DEFAULT_REST_SECONDS,
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
        muscleGroup: exercises.muscleGroup,
        secondaryMuscleGroups: exercises.secondaryMuscleGroups,
        position: routineExercises.position,
        targetSets: routineExercises.targetSets,
        targetReps: routineExercises.targetReps,
        targetRpe: routineExercises.targetRpe,
        restSeconds: routineExercises.restSeconds,
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
      const summaries = db
        .select({
          id: routines.id,
          name: routines.name,
          updatedAt: routines.updatedAt,
          exerciseCount: count(routineExercises.id),
          totalSets: sql<number>`coalesce(sum(${routineExercises.targetSets}), 0)`.mapWith(Number),
        })
        .from(routines)
        .leftJoin(routineExercises, eq(routineExercises.routineId, routines.id))
        .groupBy(routines.id)
        .orderBy(desc(routines.updatedAt), desc(routines.id))
        .all();

      // Una sola consulta para los músculos de todas las rutinas; se agrupan
      // por rutina en TypeScript y se calcula el volumen de cada una.
      const rows = db
        .select({
          routineId: routineExercises.routineId,
          muscleGroup: exercises.muscleGroup,
          secondaryMuscleGroups: exercises.secondaryMuscleGroups,
          targetSets: routineExercises.targetSets,
        })
        .from(routineExercises)
        .innerJoin(exercises, eq(routineExercises.exerciseId, exercises.id))
        .all();

      const byRoutine = new Map<number, typeof rows>();
      for (const row of rows) {
        byRoutine.set(row.routineId, [...(byRoutine.get(row.routineId) ?? []), row]);
      }

      return summaries.map((summary) => ({
        ...summary,
        muscleVolume: muscleVolume(byRoutine.get(summary.id) ?? []),
      }));
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
