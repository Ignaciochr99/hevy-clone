import { repositories } from '../repositories';
import { createActiveWorkoutStore } from './createActiveWorkoutStore';

// El entrenamiento en curso de la app, conectado a la base real. Las pantallas
// lo leen con un selector: `const workout = useActiveWorkout((s) => s.workout)`.
export const useActiveWorkout = createActiveWorkoutStore(repositories.workouts);
