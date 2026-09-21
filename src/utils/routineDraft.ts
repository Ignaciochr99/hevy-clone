import type { Routine, RoutineInput } from '../repositories/routines';

// El borrador de una rutina mientras se edita en pantalla. Solo se guarda en la
// base al pulsar "Guardar". Son funciones puras: cada una devuelve una lista
// NUEVA y no modifica la que recibe, que es lo que React necesita para saber
// que algo cambió.

export type DraftItem = {
  // Identifica la fila en pantalla; el mismo ejercicio puede estar dos veces.
  key: string;
  exerciseId: number;
  exerciseName: string;
  exerciseNameEn: string | null;
  targetSets: number;
  targetReps: number;
};

export const DEFAULT_SETS = 3;
export const DEFAULT_REPS = 10;

export function addItem(
  items: readonly DraftItem[],
  exercise: { id: number; name: string; nameEn: string | null },
  key: string,
): DraftItem[] {
  return [
    ...items,
    {
      key,
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      exerciseNameEn: exercise.nameEn,
      targetSets: DEFAULT_SETS,
      targetReps: DEFAULT_REPS,
    },
  ];
}

export function removeItem(items: readonly DraftItem[], key: string): DraftItem[] {
  return items.filter((item) => item.key !== key);
}

// Sube (-1) o baja (1) una posición. En los extremos no cambia nada.
export function moveItem(items: readonly DraftItem[], key: string, direction: -1 | 1): DraftItem[] {
  const index = items.findIndex((item) => item.key === key);
  const target = index + direction;
  const next = [...items];
  if (index === -1 || target < 0 || target >= items.length) {
    return next;
  }
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

// Cambia las series o las repeticiones de una fila: siempre un entero, mínimo 1.
export function setTarget(
  items: readonly DraftItem[],
  key: string,
  field: 'targetSets' | 'targetReps',
  value: number,
): DraftItem[] {
  const clean = Number.isFinite(value) ? Math.max(1, Math.round(value)) : 1;
  return items.map((item) => (item.key === key ? { ...item, [field]: clean } : item));
}

export function fromRoutine(routine: Routine, nextKey: () => string): DraftItem[] {
  return routine.exercises.map((item) => ({
    key: nextKey(),
    exerciseId: item.exerciseId,
    exerciseName: item.exerciseName,
    exerciseNameEn: item.exerciseNameEn,
    targetSets: item.targetSets,
    targetReps: item.targetReps,
  }));
}

// El orden de la lista es la posición de cada ejercicio en la rutina.
export function toRoutineInput(name: string, items: readonly DraftItem[]): RoutineInput {
  return {
    name: name.trim(),
    exercises: items.map((item) => ({
      exerciseId: item.exerciseId,
      targetSets: item.targetSets,
      targetReps: item.targetReps,
    })),
  };
}
