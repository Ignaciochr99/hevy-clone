import { DEFAULT_REST_SECONDS, type Routine, type RoutineInput } from '../repositories/routines';

export { DEFAULT_REST_SECONDS };

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
  // RPE objetivo (1 a 10, de 0,5 en 0,5) o null si no se fija.
  targetRpe: number | null;
  // Descanso entre series, en segundos.
  restSeconds: number;
};

export const DEFAULT_SETS = 3;
export const DEFAULT_REPS = 10;

// Límites de los contadores de la pantalla (el repositorio admite más).
const RPE_MIN = 5;
const RPE_MAX = 10;
const RPE_START = 8;
const REST_STEP = 15;
const REST_MAX = 600;

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
      targetRpe: null,
      restSeconds: DEFAULT_REST_SECONDS,
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

// Siguiente valor del RPE al pulsar + (1) o − (-1). Sin RPE, + empieza en 8;
// bajar de 5 lo quita; nunca pasa de 10.
export function stepRpe(current: number | null, direction: -1 | 1): number | null {
  if (current === null) {
    return direction === 1 ? RPE_START : null;
  }
  const next = current + direction * 0.5;
  return next < RPE_MIN ? null : Math.min(next, RPE_MAX);
}

// Siguiente descanso al pulsar + o −: de 15 en 15 segundos, entre 0 y 10 minutos.
export function stepRest(seconds: number, direction: -1 | 1): number {
  return Math.min(REST_MAX, Math.max(0, seconds + direction * REST_STEP));
}

export function setRpe(items: readonly DraftItem[], key: string, rpe: number | null): DraftItem[] {
  return items.map((item) => (item.key === key ? { ...item, targetRpe: rpe } : item));
}

export function setRest(items: readonly DraftItem[], key: string, seconds: number): DraftItem[] {
  return items.map((item) => (item.key === key ? { ...item, restSeconds: seconds } : item));
}

// Resumen de la rutina: cuántos ejercicios y cuántas series en total.
export function summarize(items: readonly DraftItem[]): { exercises: number; sets: number } {
  return {
    exercises: items.length,
    sets: items.reduce((total, item) => total + item.targetSets, 0),
  };
}

export function fromRoutine(routine: Routine, nextKey: () => string): DraftItem[] {
  return routine.exercises.map((item) => ({
    key: nextKey(),
    exerciseId: item.exerciseId,
    exerciseName: item.exerciseName,
    exerciseNameEn: item.exerciseNameEn,
    targetSets: item.targetSets,
    targetReps: item.targetReps,
    targetRpe: item.targetRpe,
    restSeconds: item.restSeconds,
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
      targetRpe: item.targetRpe,
      restSeconds: item.restSeconds,
    })),
  };
}
