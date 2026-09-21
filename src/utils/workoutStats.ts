import type { SetType } from '../db/enums';

// Lo mínimo que hace falta de una serie: sirve tanto para las de un
// entrenamiento guardado como para las que se estén editando.
type StatsSet = {
  type: SetType;
  weight: number | null;
  reps: number | null;
  completed: boolean;
};

// El volumen de una serie: peso (kg) × repeticiones. Solo cuentan las series
// completadas y no de calentamiento; sin peso o sin repeticiones (ejercicios de
// solo repeticiones o de duración) aporta 0.
export function setVolume(set: StatsSet): number {
  if (!set.completed || set.type === 'warmup' || set.weight === null || set.reps === null) {
    return 0;
  }
  return set.weight * set.reps;
}

export function workoutVolume(workout: { exercises: { sets: StatsSet[] }[] }): number {
  return workout.exercises.reduce(
    (total, exercise) => total + exercise.sets.reduce((sum, set) => sum + setVolume(set), 0),
    0,
  );
}
