import { create } from 'zustand';
import { RepositoryError } from '../repositories/errors';
import type { SetPatch, Workout, WorkoutsRepository } from '../repositories/workouts';
import { adjustRestEnd } from '../utils/restTimer';

// El descanso en marcha: la hora (ms) a la que termina.
export type Rest = { endsAt: number };

type ActiveWorkoutState = {
  // El entrenamiento en curso, o null si no hay ninguno.
  workout: Workout | null;
  // El descanso en marcha tras completar una serie, o null.
  rest: Rest | null;
  // Recupera de la base el entrenamiento en curso (se llama una vez al arrancar).
  load: () => void;
  startEmpty: (name: string) => void;
  startFromRoutine: (routineId: number) => void;
  addExercise: (exerciseId: number, restSeconds?: number) => void;
  removeExercise: (workoutExerciseId: number) => void;
  addSet: (workoutExerciseId: number) => void;
  removeSet: (setId: number) => void;
  updateSet: (setId: number, patch: SetPatch) => void;
  // Quita el descanso (al saltarlo o cuando termina).
  skipRest: () => void;
  // Suma o resta segundos al descanso en marcha; sin descanso, no hace nada.
  adjustRest: (deltaSeconds: number) => void;
  // Guarda el entrenamiento y devuelve el ya terminado.
  finish: () => Workout;
  discard: () => void;
};

// El store guarda el entrenamiento en memoria para que las pantallas se
// redibujen, pero la base de datos es la fuente de verdad: cada acción escribe
// primero en ella (a través del repositorio) y solo si sale bien actualiza el
// estado. Si el repositorio lanza un error, el estado no cambia.
//
// El descanso solo vive en memoria (no se guarda): si se cierra la app se pierde,
// que es lo esperable para un temporizador de unos minutos. `now` es el reloj;
// los tests pasan uno propio para no depender de la hora real.
export function createActiveWorkoutStore(repo: WorkoutsRepository, now: () => number = Date.now) {
  return create<ActiveWorkoutState>()((set, get) => {
    function current(): Workout {
      const workout = get().workout;
      if (!workout) {
        throw new RepositoryError('workout.notFound', 'Entrenamiento no encontrado');
      }
      return workout;
    }

    return {
      workout: null,
      rest: null,

      load: () => set({ workout: repo.getActive() ?? null }),

      startEmpty: (name) => set({ workout: repo.start(name) }),

      startFromRoutine: (routineId) => set({ workout: repo.startFromRoutine(routineId) }),

      addExercise: (exerciseId, restSeconds) =>
        set({ workout: repo.addExercise(current().id, exerciseId, restSeconds) }),

      removeExercise: (workoutExerciseId) => set({ workout: repo.removeExercise(workoutExerciseId) }),

      addSet: (workoutExerciseId) => set({ workout: repo.addSet(workoutExerciseId) }),

      removeSet: (setId) => set({ workout: repo.removeSet(setId) }),

      // Al teclear se llama muchas veces: solo se sustituye esa serie, sin
      // volver a leer todo el entrenamiento.
      updateSet: (setId, patch) => {
        const workout = current();
        const exercise = workout.exercises.find((item) => item.sets.some((s) => s.id === setId));
        const previous = exercise?.sets.find((s) => s.id === setId);
        const updated = repo.updateSet(setId, patch);

        // El descanso arranca solo al pasar de no completada a completada, y
        // solo si el ejercicio tiene descanso.
        const restSeconds = exercise?.restSeconds ?? 0;
        const startsRest = previous?.completed === false && updated.completed && restSeconds > 0;

        set({
          rest: startsRest ? { endsAt: now() + restSeconds * 1000 } : get().rest,
          workout: {
            ...workout,
            exercises: workout.exercises.map((exercise) => ({
              ...exercise,
              sets: exercise.sets.map((existing) => (existing.id === setId ? updated : existing)),
            })),
          },
        });
      },

      skipRest: () => set({ rest: null }),

      adjustRest: (deltaSeconds) => {
        const rest = get().rest;
        if (rest) {
          set({ rest: { endsAt: adjustRestEnd(rest.endsAt, deltaSeconds, now()) } });
        }
      },

      finish: () => {
        const finished = repo.finish(current().id);
        set({ workout: null, rest: null });
        return finished;
      },

      discard: () => {
        repo.discard(current().id);
        set({ workout: null, rest: null });
      },
    };
  });
}
