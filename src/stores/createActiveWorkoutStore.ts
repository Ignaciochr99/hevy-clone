import { create } from 'zustand';
import { RepositoryError } from '../repositories/errors';
import type { SetPatch, Workout, WorkoutsRepository } from '../repositories/workouts';

type ActiveWorkoutState = {
  // El entrenamiento en curso, o null si no hay ninguno.
  workout: Workout | null;
  // Recupera de la base el entrenamiento en curso (se llama una vez al arrancar).
  load: () => void;
  startEmpty: (name: string) => void;
  startFromRoutine: (routineId: number) => void;
  addExercise: (exerciseId: number, restSeconds?: number) => void;
  removeExercise: (workoutExerciseId: number) => void;
  addSet: (workoutExerciseId: number) => void;
  removeSet: (setId: number) => void;
  updateSet: (setId: number, patch: SetPatch) => void;
  // Guarda el entrenamiento y devuelve el ya terminado.
  finish: () => Workout;
  discard: () => void;
};

// El store guarda el entrenamiento en memoria para que las pantallas se
// redibujen, pero la base de datos es la fuente de verdad: cada acción escribe
// primero en ella (a través del repositorio) y solo si sale bien actualiza el
// estado. Si el repositorio lanza un error, el estado no cambia.
export function createActiveWorkoutStore(repo: WorkoutsRepository) {
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
        const updated = repo.updateSet(setId, patch);
        set({
          workout: {
            ...workout,
            exercises: workout.exercises.map((exercise) => ({
              ...exercise,
              sets: exercise.sets.map((existing) => (existing.id === setId ? updated : existing)),
            })),
          },
        });
      },

      finish: () => {
        const finished = repo.finish(current().id);
        set({ workout: null });
        return finished;
      },

      discard: () => {
        repo.discard(current().id);
        set({ workout: null });
      },
    };
  });
}
