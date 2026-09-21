import { createTestDb } from '../db/createTestDb';
import { exercises as exercisesTable, routineExercises } from '../db/schema';
import { repositoryErrorCode } from './errors';
import { createExercisesRepository } from './exercises';
import { createRoutinesRepository } from './routines';
import { catchError } from './testHelpers';

const T0 = new Date('2026-01-01T10:00:00.000Z');

beforeEach(() => {
  jest.useFakeTimers({ now: T0 });
});

afterEach(() => {
  jest.useRealTimers();
});

function setup() {
  const db = createTestDb();
  const exercises = createExercisesRepository(db);
  const bench = exercises.create({
    name: 'Press banca',
    muscleGroup: 'chest',
    equipment: 'barbell',
    type: 'weight_reps',
  });
  const squat = exercises.create({
    name: 'Sentadilla',
    muscleGroup: 'quadriceps',
    equipment: 'barbell',
    type: 'weight_reps',
  });
  return { db, exercises, routines: createRoutinesRepository(db), bench, squat };
}

describe('routines.create', () => {
  test('guarda la rutina con sus ejercicios en el orden dado', () => {
    const { routines, bench, squat } = setup();
    const routine = routines.create({
      name: 'Día 1',
      exercises: [
        { exerciseId: squat.id, targetSets: 4, targetReps: 5 },
        { exerciseId: bench.id, targetSets: 3, targetReps: 10 },
      ],
    });

    expect(routine).toMatchObject({ name: 'Día 1', createdAt: T0, updatedAt: T0 });
    expect(routine.exercises).toEqual([
      expect.objectContaining({ exerciseId: squat.id, exerciseName: 'Sentadilla', position: 0, targetSets: 4, targetReps: 5 }),
      expect.objectContaining({ exerciseId: bench.id, exerciseName: 'Press banca', position: 1, targetSets: 3, targetReps: 10 }),
    ]);
    expect(routines.getById(routine.id)).toEqual(routine);
  });

  test('permite una rutina sin ejercicios', () => {
    const { routines } = setup();
    expect(routines.create({ name: 'Vacía', exercises: [] }).exercises).toEqual([]);
  });

  test('permite el mismo ejercicio más de una vez', () => {
    const { routines, bench } = setup();
    const routine = routines.create({
      name: 'Doble',
      exercises: [
        { exerciseId: bench.id, targetSets: 3, targetReps: 10 },
        { exerciseId: bench.id, targetSets: 2, targetReps: 15 },
      ],
    });
    expect(routine.exercises.map((e) => e.position)).toEqual([0, 1]);
  });

  test('quita los espacios sobrantes del nombre y rechaza uno en blanco', () => {
    const { routines } = setup();
    expect(routines.create({ name: '  Día 1 ', exercises: [] }).name).toBe('Día 1');
    expect(() => routines.create({ name: '  ', exercises: [] })).toThrow('nombre');
  });

  test.each([
    { targetSets: 0, targetReps: 10, message: 'series' },
    { targetSets: 2.5, targetReps: 10, message: 'series' },
    { targetSets: 3, targetReps: 0, message: 'repeticiones' },
    { targetSets: 3, targetReps: -1, message: 'repeticiones' },
  ])('rechaza series/reps inválidas: $targetSets x $targetReps', ({ message, ...target }) => {
    const { routines, bench } = setup();
    expect(() =>
      routines.create({ name: 'Mala', exercises: [{ exerciseId: bench.id, ...target }] }),
    ).toThrow(message);
  });

  test('si un ejercicio no existe falla y no deja nada guardado', () => {
    const { routines, bench } = setup();
    expect(() =>
      routines.create({
        name: 'Rota',
        exercises: [
          { exerciseId: bench.id, targetSets: 3, targetReps: 10 },
          { exerciseId: 999, targetSets: 3, targetReps: 10 },
        ],
      }),
    ).toThrow();
    expect(routines.list()).toEqual([]);
  });

  test('no hay límite de rutinas', () => {
    const { routines } = setup();
    for (let i = 1; i <= 100; i++) {
      routines.create({ name: `Rutina ${i}`, exercises: [] });
    }
    expect(routines.list()).toHaveLength(100);
  });
});

describe('routines.getById y list', () => {
  test('getById devuelve undefined si no existe', () => {
    const { routines } = setup();
    expect(routines.getById(999)).toBeUndefined();
  });

  test('list devuelve resúmenes con el número de ejercicios, la más reciente primero', () => {
    const { routines, bench, squat } = setup();
    const a = routines.create({
      name: 'A',
      exercises: [
        { exerciseId: bench.id, targetSets: 3, targetReps: 10 },
        { exerciseId: squat.id, targetSets: 3, targetReps: 10 },
      ],
    });
    jest.setSystemTime(new Date('2026-01-01T10:01:00.000Z'));
    const b = routines.create({ name: 'B', exercises: [] });

    expect(routines.list()).toEqual([
      { id: b.id, name: 'B', updatedAt: b.updatedAt, exerciseCount: 0, totalSets: 0 },
      { id: a.id, name: 'A', updatedAt: a.updatedAt, exerciseCount: 2, totalSets: 6 },
    ]);

    jest.setSystemTime(new Date('2026-01-01T10:02:00.000Z'));
    routines.update(a.id, { name: 'A', exercises: [] });
    expect(routines.list().map((r) => r.name)).toEqual(['A', 'B']);
  });
});

describe('routines.update', () => {
  test('reemplaza nombre y ejercicios, y actualiza updatedAt pero no createdAt', () => {
    const { routines, bench, squat } = setup();
    const created = routines.create({
      name: 'Día 1',
      exercises: [{ exerciseId: bench.id, targetSets: 3, targetReps: 10 }],
    });

    const later = new Date('2026-02-01T08:00:00.000Z');
    jest.setSystemTime(later);
    const updated = routines.update(created.id, {
      name: 'Día 1 (nueva)',
      exercises: [
        { exerciseId: squat.id, targetSets: 5, targetReps: 5 },
        { exerciseId: bench.id, targetSets: 4, targetReps: 8 },
      ],
    });

    expect(updated).toMatchObject({ id: created.id, name: 'Día 1 (nueva)', createdAt: T0, updatedAt: later });
    expect(updated.exercises.map((e) => [e.exerciseName, e.position, e.targetSets, e.targetReps])).toEqual([
      ['Sentadilla', 0, 5, 5],
      ['Press banca', 1, 4, 8],
    ]);
    expect(routines.getById(created.id)).toEqual(updated);
  });

  test('falla si la rutina no existe', () => {
    const { routines } = setup();
    expect(() => routines.update(999, { name: 'X', exercises: [] })).toThrow('no encontrada');
  });

  test('si algo falla, la rutina queda como estaba', () => {
    const { routines, bench } = setup();
    const created = routines.create({
      name: 'Original',
      exercises: [{ exerciseId: bench.id, targetSets: 3, targetReps: 10 }],
    });

    expect(() =>
      routines.update(created.id, {
        name: 'Cambiada',
        exercises: [{ exerciseId: 999, targetSets: 3, targetReps: 10 }],
      }),
    ).toThrow();

    expect(routines.getById(created.id)).toEqual(created);
  });
});

describe('un ejercicio usado por una rutina', () => {
  test('no se puede borrar hasta que se borra la rutina', () => {
    const { exercises, routines, bench } = setup();
    const routine = routines.create({
      name: 'Pecho',
      exercises: [{ exerciseId: bench.id, targetSets: 3, targetReps: 10 }],
    });

    expect(() => exercises.remove(bench.id)).toThrow('rutina');
    expect(exercises.getById(bench.id)).toBeDefined();

    routines.remove(routine.id);
    exercises.remove(bench.id);
    expect(exercises.getById(bench.id)).toBeUndefined();
  });
});

describe('routines.remove', () => {
  test('borra la rutina y sus ejercicios, pero no los ejercicios de la biblioteca', () => {
    const { db, exercises, routines, bench } = setup();
    const created = routines.create({
      name: 'Día 1',
      exercises: [{ exerciseId: bench.id, targetSets: 3, targetReps: 10 }],
    });

    routines.remove(created.id);

    expect(routines.getById(created.id)).toBeUndefined();
    expect(db.select().from(routineExercises).all()).toEqual([]);
    expect(exercises.getById(bench.id)).toBeDefined();
  });

  test('falla si la rutina no existe', () => {
    const { routines } = setup();
    expect(() => routines.remove(999)).toThrow('no encontrada');
  });
});

describe('routines: errores con código', () => {
  test('nombre vacío', () => {
    const { routines } = setup();
    expect(repositoryErrorCode(catchError(() => routines.create({ name: ' ', exercises: [] })))).toBe(
      'routine.nameEmpty',
    );
  });

  test('series y repeticiones inválidas', () => {
    const { routines, bench } = setup();
    const withTarget = (targetSets: number, targetReps: number) => () =>
      routines.create({ name: 'X', exercises: [{ exerciseId: bench.id, targetSets, targetReps }] });
    expect(repositoryErrorCode(catchError(withTarget(0, 10)))).toBe('routine.invalidSets');
    expect(repositoryErrorCode(catchError(withTarget(3, 0)))).toBe('routine.invalidReps');
  });

  test('rutina inexistente', () => {
    const { routines } = setup();
    expect(repositoryErrorCode(catchError(() => routines.update(999, { name: 'X', exercises: [] })))).toBe(
      'routine.notFound',
    );
    expect(repositoryErrorCode(catchError(() => routines.remove(999)))).toBe('routine.notFound');
  });

  test('ejercicio usado por una rutina', () => {
    const { exercises, routines, bench } = setup();
    routines.create({ name: 'Pecho', exercises: [{ exerciseId: bench.id, targetSets: 3, targetReps: 10 }] });
    expect(repositoryErrorCode(catchError(() => exercises.remove(bench.id)))).toBe('exercise.inUse');
  });
});

describe('routines: nombre del ejercicio en inglés', () => {
  test('un ejercicio de la biblioteca devuelve su nombre en español y en inglés', () => {
    const { db, routines } = setup();
    const library = db
      .insert(exercisesTable)
      .values({
        slug: 'squat-barbell',
        name: 'Sentadilla con barra',
        nameEn: 'Barbell Squat',
        muscleGroup: 'quadriceps',
        equipment: 'barbell',
        type: 'weight_reps',
      })
      .returning()
      .get();

    const routine = routines.create({
      name: 'Piernas',
      exercises: [{ exerciseId: library.id, targetSets: 4, targetReps: 6 }],
    });

    expect(routine.exercises[0]).toMatchObject({
      exerciseName: 'Sentadilla con barra',
      exerciseNameEn: 'Barbell Squat',
    });
  });

  test('un ejercicio propio no tiene nombre en inglés', () => {
    const { routines, bench } = setup();
    const routine = routines.create({
      name: 'Pecho',
      exercises: [{ exerciseId: bench.id, targetSets: 3, targetReps: 10 }],
    });
    expect(routine.exercises[0].exerciseNameEn).toBeNull();
  });
});

describe('routines: RPE, descanso y total de series', () => {
  test('sin indicarlos, el RPE queda vacío y el descanso es de 90 segundos', () => {
    const { routines, bench } = setup();
    const routine = routines.create({
      name: 'A',
      exercises: [{ exerciseId: bench.id, targetSets: 3, targetReps: 10 }],
    });
    expect(routine.exercises[0]).toMatchObject({ targetRpe: null, restSeconds: 90 });
  });

  test('se guardan y se leen', () => {
    const { routines, bench, squat } = setup();
    const routine = routines.create({
      name: 'A',
      exercises: [
        { exerciseId: bench.id, targetSets: 3, targetReps: 10, targetRpe: 8.5, restSeconds: 120 },
        { exerciseId: squat.id, targetSets: 5, targetReps: 5, targetRpe: null, restSeconds: 0 },
      ],
    });
    expect(routines.getById(routine.id)?.exercises.map((e) => [e.targetRpe, e.restSeconds])).toEqual([
      [8.5, 120],
      [null, 0],
    ]);
  });

  test('update los reemplaza', () => {
    const { routines, bench } = setup();
    const created = routines.create({
      name: 'A',
      exercises: [{ exerciseId: bench.id, targetSets: 3, targetReps: 10, targetRpe: 7, restSeconds: 60 }],
    });
    const updated = routines.update(created.id, {
      name: 'A',
      exercises: [{ exerciseId: bench.id, targetSets: 3, targetReps: 10, targetRpe: 9, restSeconds: 180 }],
    });
    expect(updated.exercises[0]).toMatchObject({ targetRpe: 9, restSeconds: 180 });
  });

  test.each([0, 0.5, 10.5, 11, 8.25, -1, Number.NaN])('rechaza el RPE %p', (targetRpe) => {
    const { routines, bench } = setup();
    const error = catchError(() =>
      routines.create({
        name: 'A',
        exercises: [{ exerciseId: bench.id, targetSets: 3, targetReps: 10, targetRpe }],
      }),
    );
    expect(repositoryErrorCode(error)).toBe('routine.invalidRpe');
  });

  test.each([1, 5.5, 6.5, 7, 8, 9.5, 10])('acepta el RPE %p', (targetRpe) => {
    const { routines, bench } = setup();
    const routine = routines.create({
      name: 'A',
      exercises: [{ exerciseId: bench.id, targetSets: 3, targetReps: 10, targetRpe }],
    });
    expect(routine.exercises[0].targetRpe).toBe(targetRpe);
  });

  test.each([-1, 1.5, 3601, Number.NaN])('rechaza el descanso %p', (restSeconds) => {
    const { routines, bench } = setup();
    const error = catchError(() =>
      routines.create({
        name: 'A',
        exercises: [{ exerciseId: bench.id, targetSets: 3, targetReps: 10, restSeconds }],
      }),
    );
    expect(repositoryErrorCode(error)).toBe('routine.invalidRest');
  });

  test('list suma las series objetivo de cada rutina', () => {
    const { routines, bench, squat } = setup();
    routines.create({
      name: 'A',
      exercises: [
        { exerciseId: bench.id, targetSets: 4, targetReps: 8 },
        { exerciseId: squat.id, targetSets: 5, targetReps: 5 },
        { exerciseId: bench.id, targetSets: 2, targetReps: 12 },
      ],
    });
    routines.create({ name: 'B', exercises: [] });
    const totals = Object.fromEntries(routines.list().map((r) => [r.name, r.totalSets]));
    expect(totals).toEqual({ A: 11, B: 0 });
  });
});
