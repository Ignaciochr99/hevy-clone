import { MUSCLE_GROUPS, type MuscleGroup } from '../db/enums';

// Cuánto suma cada serie a un músculo: 1 si es el grupo principal del ejercicio
// y 0,5 si es uno de sus grupos secundarios.
export const PRIMARY_WEIGHT = 1;
export const SECONDARY_WEIGHT = 0.5;

export type MuscleVolume = { muscleGroup: MuscleGroup; sets: number };

type ExerciseSets = {
  muscleGroup: MuscleGroup;
  secondaryMuscleGroups: readonly MuscleGroup[];
  targetSets: number;
};

// Suma las series por músculo de todos los ejercicios de una rutina. Devuelve
// solo los músculos con series, de más a menos; en empate, en el orden habitual
// de los grupos (pecho, espalda, hombros...).
export function muscleVolume(exercises: readonly ExerciseSets[]): MuscleVolume[] {
  const totals = new Map<MuscleGroup, number>();
  const add = (group: MuscleGroup, sets: number) => {
    totals.set(group, (totals.get(group) ?? 0) + sets);
  };

  for (const exercise of exercises) {
    add(exercise.muscleGroup, exercise.targetSets * PRIMARY_WEIGHT);
    for (const group of exercise.secondaryMuscleGroups) {
      add(group, exercise.targetSets * SECONDARY_WEIGHT);
    }
  }

  return MUSCLE_GROUPS.map((group) => ({ muscleGroup: group, sets: totals.get(group) ?? 0 }))
    .filter((item) => item.sets > 0)
    .sort(
      (a, b) =>
        b.sets - a.sets || MUSCLE_GROUPS.indexOf(a.muscleGroup) - MUSCLE_GROUPS.indexOf(b.muscleGroup),
    );
}
