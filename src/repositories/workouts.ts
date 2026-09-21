import { and, asc, desc, eq, inArray, isNull, notInArray } from 'drizzle-orm';
import { SET_TYPES, type ExerciseType, type SetType } from '../db/enums';
import { exercises, routineExercises, routines, sets, workoutExercises, workouts } from '../db/schema';
import type { Database } from '../db/types';
import { RepositoryError } from './errors';
import { DEFAULT_REST_SECONDS } from './routines';

export type WorkoutSet = {
  id: number;
  position: number;
  type: SetType;
  // Peso en kg, repeticiones o duración en segundos; null hasta que se rellenan.
  weight: number | null;
  reps: number | null;
  durationSeconds: number | null;
  completed: boolean;
};

export type WorkoutExercise = {
  id: number;
  exerciseId: number;
  exerciseName: string;
  exerciseNameEn: string | null;
  exerciseType: ExerciseType;
  position: number;
  restSeconds: number;
  sets: WorkoutSet[];
};

export type Workout = {
  id: number;
  name: string;
  routineId: number | null;
  startedAt: Date;
  // null mientras el entrenamiento está en curso.
  finishedAt: Date | null;
  exercises: WorkoutExercise[];
};

export type SetPatch = Partial<
  Pick<WorkoutSet, 'type' | 'weight' | 'reps' | 'durationSeconds' | 'completed'>
>;

const notFound = () => new RepositoryError('workout.notFound', 'Entrenamiento no encontrado');

function toSet(row: typeof sets.$inferSelect): WorkoutSet {
  return {
    id: row.id,
    position: row.position,
    type: row.type,
    weight: row.weight,
    reps: row.reps,
    durationSeconds: row.durationSeconds,
    completed: row.completed,
  };
}

function hasActive(db: Database): boolean {
  return db.select({ id: workouts.id }).from(workouts).where(isNull(workouts.finishedAt)).get() !== undefined;
}

function renumberExercises(db: Database, workoutId: number): void {
  const rows = db
    .select({ id: workoutExercises.id })
    .from(workoutExercises)
    .where(eq(workoutExercises.workoutId, workoutId))
    .orderBy(asc(workoutExercises.position))
    .all();
  rows.forEach((row, index) => {
    db.update(workoutExercises).set({ position: index }).where(eq(workoutExercises.id, row.id)).run();
  });
}

function renumberSets(db: Database, workoutExerciseId: number): void {
  const rows = db
    .select({ id: sets.id })
    .from(sets)
    .where(eq(sets.workoutExerciseId, workoutExerciseId))
    .orderBy(asc(sets.position))
    .all();
  rows.forEach((row, index) => {
    db.update(sets).set({ position: index }).where(eq(sets.id, row.id)).run();
  });
}

// Los valores de una serie: peso y duración no negativos, repeticiones enteras.
function validatePatch(patch: SetPatch): void {
  const invalid = () =>
    new RepositoryError('workout.invalidSetValue', 'El valor de la serie no es válido');
  if (patch.type !== undefined && !SET_TYPES.includes(patch.type)) {
    throw invalid();
  }
  if (patch.weight != null && !(Number.isFinite(patch.weight) && patch.weight >= 0)) {
    throw invalid();
  }
  if (patch.reps != null && !(Number.isInteger(patch.reps) && patch.reps >= 0)) {
    throw invalid();
  }
  if (
    patch.durationSeconds != null &&
    !(Number.isInteger(patch.durationSeconds) && patch.durationSeconds >= 0)
  ) {
    throw invalid();
  }
}

export function createWorkoutsRepository(db: Database) {
  function getById(id: number): Workout | undefined {
    const workout = db.select().from(workouts).where(eq(workouts.id, id)).get();
    if (!workout) {
      return undefined;
    }

    const exerciseRows = db
      .select({
        id: workoutExercises.id,
        exerciseId: workoutExercises.exerciseId,
        exerciseName: exercises.name,
        exerciseNameEn: exercises.nameEn,
        exerciseType: exercises.type,
        position: workoutExercises.position,
        restSeconds: workoutExercises.restSeconds,
      })
      .from(workoutExercises)
      .innerJoin(exercises, eq(workoutExercises.exerciseId, exercises.id))
      .where(eq(workoutExercises.workoutId, id))
      .orderBy(asc(workoutExercises.position))
      .all();

    const ids = exerciseRows.map((row) => row.id);
    const setRows =
      ids.length === 0
        ? []
        : db
            .select()
            .from(sets)
            .where(inArray(sets.workoutExerciseId, ids))
            .orderBy(asc(sets.position))
            .all();

    return {
      ...workout,
      exercises: exerciseRows.map((row) => ({
        ...row,
        sets: setRows.filter((set) => set.workoutExerciseId === row.id).map(toSet),
      })),
    };
  }

  function getByIdOrThrow(id: number): Workout {
    const workout = getById(id);
    if (!workout) {
      throw notFound();
    }
    return workout;
  }

  function workoutIdOfExercise(workoutExerciseId: number): number {
    const row = db
      .select({ workoutId: workoutExercises.workoutId })
      .from(workoutExercises)
      .where(eq(workoutExercises.id, workoutExerciseId))
      .get();
    if (!row) {
      throw notFound();
    }
    return row.workoutId;
  }

  return {
    // El entrenamiento en curso (el que no tiene hora de fin), si lo hay.
    getActive(): Workout | undefined {
      const row = db
        .select({ id: workouts.id })
        .from(workouts)
        .where(isNull(workouts.finishedAt))
        .get();
      return row ? getById(row.id) : undefined;
    },

    getById,

    // Entrenamiento vacío. Solo puede haber uno en curso.
    start(name: string): Workout {
      const id = db.transaction((tx) => {
        if (hasActive(tx)) {
          throw new RepositoryError('workout.alreadyActive', 'Ya hay un entrenamiento en curso');
        }
        return tx
          .insert(workouts)
          .values({ name, startedAt: new Date() })
          .returning({ id: workouts.id })
          .get().id;
      });
      return getByIdOrThrow(id);
    },

    // Copia la rutina: sus ejercicios en orden, sus series (con las repeticiones
    // objetivo ya rellenas, salvo en los de duración) y sus descansos.
    startFromRoutine(routineId: number): Workout {
      const routine = db.select().from(routines).where(eq(routines.id, routineId)).get();
      if (!routine) {
        throw new RepositoryError('routine.notFound', 'Rutina no encontrada');
      }
      const items = db
        .select({
          exerciseId: routineExercises.exerciseId,
          targetSets: routineExercises.targetSets,
          targetReps: routineExercises.targetReps,
          restSeconds: routineExercises.restSeconds,
          exerciseType: exercises.type,
        })
        .from(routineExercises)
        .innerJoin(exercises, eq(routineExercises.exerciseId, exercises.id))
        .where(eq(routineExercises.routineId, routineId))
        .orderBy(asc(routineExercises.position))
        .all();

      const id = db.transaction((tx) => {
        if (hasActive(tx)) {
          throw new RepositoryError('workout.alreadyActive', 'Ya hay un entrenamiento en curso');
        }
        const created = tx
          .insert(workouts)
          .values({ name: routine.name, routineId, startedAt: new Date() })
          .returning({ id: workouts.id })
          .get();

        items.forEach((item, position) => {
          const workoutExercise = tx
            .insert(workoutExercises)
            .values({
              workoutId: created.id,
              exerciseId: item.exerciseId,
              position,
              restSeconds: item.restSeconds,
            })
            .returning({ id: workoutExercises.id })
            .get();
          if (item.targetSets > 0) {
            tx.insert(sets)
              .values(
                Array.from({ length: item.targetSets }, (_, setPosition) => ({
                  workoutExerciseId: workoutExercise.id,
                  position: setPosition,
                  reps: item.exerciseType === 'duration' ? null : item.targetReps,
                })),
              )
              .run();
          }
        });
        return created.id;
      });
      return getByIdOrThrow(id);
    },

    // Añade el ejercicio al final, con una serie vacía.
    addExercise(workoutId: number, exerciseId: number, restSeconds = DEFAULT_REST_SECONDS): Workout {
      db.transaction((tx) => {
        if (!tx.select({ id: workouts.id }).from(workouts).where(eq(workouts.id, workoutId)).get()) {
          throw notFound();
        }
        const last = tx
          .select({ position: workoutExercises.position })
          .from(workoutExercises)
          .where(eq(workoutExercises.workoutId, workoutId))
          .orderBy(desc(workoutExercises.position))
          .get();
        const created = tx
          .insert(workoutExercises)
          .values({
            workoutId,
            exerciseId,
            position: (last?.position ?? -1) + 1,
            restSeconds,
          })
          .returning({ id: workoutExercises.id })
          .get();
        tx.insert(sets).values({ workoutExerciseId: created.id, position: 0 }).run();
      });
      return getByIdOrThrow(workoutId);
    },

    removeExercise(workoutExerciseId: number): Workout {
      const workoutId = workoutIdOfExercise(workoutExerciseId);
      db.transaction((tx) => {
        tx.delete(workoutExercises).where(eq(workoutExercises.id, workoutExerciseId)).run();
        renumberExercises(tx, workoutId);
      });
      return getByIdOrThrow(workoutId);
    },

    // Añade una serie al final, copiando el peso y las repeticiones de la anterior.
    addSet(workoutExerciseId: number): Workout {
      const workoutId = workoutIdOfExercise(workoutExerciseId);
      const last = db
        .select()
        .from(sets)
        .where(eq(sets.workoutExerciseId, workoutExerciseId))
        .orderBy(desc(sets.position))
        .get();
      db.insert(sets)
        .values({
          workoutExerciseId,
          position: (last?.position ?? -1) + 1,
          weight: last?.weight ?? null,
          reps: last?.reps ?? null,
          durationSeconds: last?.durationSeconds ?? null,
        })
        .run();
      return getByIdOrThrow(workoutId);
    },

    removeSet(setId: number): Workout {
      const row = db
        .select({ workoutExerciseId: sets.workoutExerciseId, workoutId: workoutExercises.workoutId })
        .from(sets)
        .innerJoin(workoutExercises, eq(sets.workoutExerciseId, workoutExercises.id))
        .where(eq(sets.id, setId))
        .get();
      if (!row) {
        throw notFound();
      }
      db.transaction((tx) => {
        tx.delete(sets).where(eq(sets.id, setId)).run();
        renumberSets(tx, row.workoutExerciseId);
      });
      return getByIdOrThrow(row.workoutId);
    },

    // Cambia los campos indicados de una serie y la devuelve ya actualizada.
    updateSet(setId: number, patch: SetPatch): WorkoutSet {
      const existing = db.select().from(sets).where(eq(sets.id, setId)).get();
      if (!existing) {
        throw notFound();
      }
      validatePatch(patch);

      const values: SetPatch = {};
      if (patch.type !== undefined) values.type = patch.type;
      if (patch.weight !== undefined) values.weight = patch.weight;
      if (patch.reps !== undefined) values.reps = patch.reps;
      if (patch.durationSeconds !== undefined) values.durationSeconds = patch.durationSeconds;
      if (patch.completed !== undefined) values.completed = patch.completed;
      if (Object.keys(values).length === 0) {
        return toSet(existing);
      }
      return toSet(db.update(sets).set(values).where(eq(sets.id, setId)).returning().get());
    },

    // Guarda el entrenamiento: descarta las series sin completar y los ejercicios
    // que se quedan sin series, y fija la hora de fin. Sin ninguna serie completada
    // no se guarda. Terminar uno ya terminado no cambia nada.
    finish(workoutId: number): Workout {
      const workout = getByIdOrThrow(workoutId);
      if (workout.finishedAt !== null) {
        return workout;
      }

      db.transaction((tx) => {
        const exerciseIds = () =>
          tx
            .select({ id: workoutExercises.id })
            .from(workoutExercises)
            .where(eq(workoutExercises.workoutId, workoutId));

        const completed = tx
          .select({ id: sets.id })
          .from(sets)
          .where(and(inArray(sets.workoutExerciseId, exerciseIds()), eq(sets.completed, true)))
          .all();
        if (completed.length === 0) {
          throw new RepositoryError('workout.nothingCompleted', 'No hay ninguna serie completada');
        }

        tx.delete(sets)
          .where(and(inArray(sets.workoutExerciseId, exerciseIds()), eq(sets.completed, false)))
          .run();
        tx.delete(workoutExercises)
          .where(
            and(
              eq(workoutExercises.workoutId, workoutId),
              notInArray(
                workoutExercises.id,
                tx.select({ id: sets.workoutExerciseId }).from(sets),
              ),
            ),
          )
          .run();

        renumberExercises(tx, workoutId);
        for (const remaining of exerciseIds().all()) {
          renumberSets(tx, remaining.id);
        }
        tx.update(workouts).set({ finishedAt: new Date() }).where(eq(workouts.id, workoutId)).run();
      });
      return getByIdOrThrow(workoutId);
    },

    // Borra el entrenamiento con todos sus ejercicios y series.
    discard(workoutId: number): void {
      const deleted = db
        .delete(workouts)
        .where(eq(workouts.id, workoutId))
        .returning({ id: workouts.id })
        .get();
      if (!deleted) {
        throw notFound();
      }
    },
  };
}

export type WorkoutsRepository = ReturnType<typeof createWorkoutsRepository>;
