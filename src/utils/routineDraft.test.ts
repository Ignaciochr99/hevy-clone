import type { Routine } from '../repositories/routines';
import {
  addItem,
  DEFAULT_REPS,
  DEFAULT_REST_SECONDS,
  DEFAULT_SETS,
  fromRoutine,
  moveItem,
  removeItem,
  setRest,
  setRpe,
  setTarget,
  stepRest,
  stepRpe,
  summarize,
  toRoutineInput,
  type DraftItem,
} from './routineDraft';

const bench = { id: 1, name: 'Press banca', nameEn: 'Bench Press' };
const squat = { id: 2, name: 'Sentadilla', nameEn: null };

// Tres filas: banca (a), sentadilla (b) y banca otra vez (c).
function threeItems(): DraftItem[] {
  return addItem(addItem(addItem([], bench, 'a'), squat, 'b'), bench, 'c');
}

const keys = (items: DraftItem[]) => items.map((item) => item.key);

describe('addItem', () => {
  test('añade al final con los valores por defecto', () => {
    const items = addItem([], bench, 'a');
    expect(items).toEqual([
      {
        key: 'a',
        exerciseId: 1,
        exerciseName: 'Press banca',
        exerciseNameEn: 'Bench Press',
        targetSets: DEFAULT_SETS,
        targetReps: DEFAULT_REPS,
        targetRpe: null,
        restSeconds: DEFAULT_REST_SECONDS,
      },
    ]);
    expect([DEFAULT_SETS, DEFAULT_REPS, DEFAULT_REST_SECONDS]).toEqual([3, 10, 90]);
  });

  test('el mismo ejercicio puede estar dos veces, con claves distintas', () => {
    const items = threeItems();
    expect(keys(items)).toEqual(['a', 'b', 'c']);
    expect(items.map((item) => item.exerciseId)).toEqual([1, 2, 1]);
  });
});

describe('removeItem', () => {
  test('quita solo la fila indicada', () => {
    expect(keys(removeItem(threeItems(), 'b'))).toEqual(['a', 'c']);
  });

  test('una clave que no existe no cambia nada', () => {
    expect(keys(removeItem(threeItems(), 'zzz'))).toEqual(['a', 'b', 'c']);
  });
});

describe('moveItem', () => {
  test('sube una posición', () => {
    expect(keys(moveItem(threeItems(), 'b', -1))).toEqual(['b', 'a', 'c']);
  });

  test('baja una posición', () => {
    expect(keys(moveItem(threeItems(), 'b', 1))).toEqual(['a', 'c', 'b']);
  });

  test('la primera fila no puede subir ni la última bajar', () => {
    expect(keys(moveItem(threeItems(), 'a', -1))).toEqual(['a', 'b', 'c']);
    expect(keys(moveItem(threeItems(), 'c', 1))).toEqual(['a', 'b', 'c']);
  });

  test('una clave que no existe no cambia nada', () => {
    expect(keys(moveItem(threeItems(), 'zzz', 1))).toEqual(['a', 'b', 'c']);
  });
});

describe('setTarget', () => {
  test('cambia solo la fila y el campo indicados', () => {
    const items = setTarget(threeItems(), 'b', 'targetSets', 5);
    expect(items.map((item) => item.targetSets)).toEqual([3, 5, 3]);
    expect(items.map((item) => item.targetReps)).toEqual([10, 10, 10]);
  });

  test('redondea a un entero', () => {
    expect(setTarget(threeItems(), 'a', 'targetReps', 8.6)[0].targetReps).toBe(9);
  });

  test('nunca baja de 1', () => {
    expect(setTarget(threeItems(), 'a', 'targetSets', 0)[0].targetSets).toBe(1);
    expect(setTarget(threeItems(), 'a', 'targetSets', -4)[0].targetSets).toBe(1);
    expect(setTarget(threeItems(), 'a', 'targetSets', Number.NaN)[0].targetSets).toBe(1);
  });
});

describe('stepRpe', () => {
  test('sin RPE, + empieza en 8 y − lo deja vacío', () => {
    expect(stepRpe(null, 1)).toBe(8);
    expect(stepRpe(null, -1)).toBeNull();
  });

  test('sube y baja de medio en medio', () => {
    expect(stepRpe(8, 1)).toBe(8.5);
    expect(stepRpe(8, -1)).toBe(7.5);
  });

  test('no pasa de 10', () => {
    expect(stepRpe(10, 1)).toBe(10);
    expect(stepRpe(9.5, 1)).toBe(10);
  });

  test('al bajar de 5 se quita el RPE', () => {
    expect(stepRpe(5.5, -1)).toBe(5);
    expect(stepRpe(5, -1)).toBeNull();
  });
});

describe('stepRest', () => {
  test('sube y baja de 15 en 15 segundos', () => {
    expect(stepRest(90, 1)).toBe(105);
    expect(stepRest(90, -1)).toBe(75);
  });

  test('no baja de 0 ni pasa de 10 minutos', () => {
    expect(stepRest(10, -1)).toBe(0);
    expect(stepRest(0, -1)).toBe(0);
    expect(stepRest(595, 1)).toBe(600);
    expect(stepRest(600, 1)).toBe(600);
  });
});

describe('setRpe y setRest', () => {
  test('cambian solo la fila indicada', () => {
    const withRpe = setRpe(threeItems(), 'b', 8.5);
    expect(withRpe.map((item) => item.targetRpe)).toEqual([null, 8.5, null]);
    expect(setRpe(withRpe, 'b', null)[1].targetRpe).toBeNull();

    const withRest = setRest(threeItems(), 'c', 120);
    expect(withRest.map((item) => item.restSeconds)).toEqual([90, 90, 120]);
  });
});

describe('summarize', () => {
  test('cuenta los ejercicios y suma las series', () => {
    const items = setTarget(threeItems(), 'b', 'targetSets', 5);
    expect(summarize(items)).toEqual({ exercises: 3, sets: 3 + 5 + 3 });
  });

  test('una lista vacía suma cero', () => {
    expect(summarize([])).toEqual({ exercises: 0, sets: 0 });
  });
});

describe('inmutabilidad', () => {
  test('ninguna función modifica la lista que recibe', () => {
    const items = threeItems();
    const snapshot = JSON.parse(JSON.stringify(items));

    addItem(items, squat, 'd');
    removeItem(items, 'a');
    moveItem(items, 'a', 1);
    setTarget(items, 'a', 'targetSets', 9);
    setRpe(items, 'a', 9);
    setRest(items, 'a', 30);
    summarize(items);

    expect(items).toEqual(snapshot);
  });
});

describe('toRoutineInput y fromRoutine', () => {
  test('toRoutineInput conserva el orden y recorta el nombre', () => {
    const input = toRoutineInput(
      '  Día 1 ',
      setRest(setRpe(setTarget(threeItems(), 'b', 'targetSets', 4), 'b', 9), 'b', 150),
    );
    expect(input).toEqual({
      name: 'Día 1',
      exercises: [
        { exerciseId: 1, targetSets: 3, targetReps: 10, targetRpe: null, restSeconds: 90 },
        { exerciseId: 2, targetSets: 4, targetReps: 10, targetRpe: 9, restSeconds: 150 },
        { exerciseId: 1, targetSets: 3, targetReps: 10, targetRpe: null, restSeconds: 90 },
      ],
    });
  });

  test('fromRoutine convierte una rutina guardada con claves distintas por fila', () => {
    const routine: Routine = {
      id: 7,
      name: 'Piernas',
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-01'),
      exercises: [
        { id: 10, exerciseId: 2, exerciseName: 'Sentadilla', exerciseNameEn: null, muscleGroup: 'quadriceps', secondaryMuscleGroups: ['glutes'], position: 0, targetSets: 5, targetReps: 5, targetRpe: null, restSeconds: 90 },
        { id: 11, exerciseId: 1, exerciseName: 'Press banca', exerciseNameEn: 'Bench Press', muscleGroup: 'chest', secondaryMuscleGroups: ['triceps', 'shoulders'], position: 1, targetSets: 3, targetReps: 8, targetRpe: 8, restSeconds: 120 },
      ],
    };
    let counter = 0;
    const items = fromRoutine(routine, () => `k${counter++}`);

    expect(keys(items)).toEqual(['k0', 'k1']);
    expect(items[0]).toEqual({
      key: 'k0',
      exerciseId: 2,
      exerciseName: 'Sentadilla',
      exerciseNameEn: null,
      targetSets: 5,
      targetReps: 5,
      targetRpe: null,
      restSeconds: 90,
    });
    expect(toRoutineInput(routine.name, items).exercises).toEqual([
      { exerciseId: 2, targetSets: 5, targetReps: 5, targetRpe: null, restSeconds: 90 },
      { exerciseId: 1, targetSets: 3, targetReps: 8, targetRpe: 8, restSeconds: 120 },
    ]);
  });
});
