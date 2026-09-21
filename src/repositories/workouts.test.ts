import { createTestDb } from '../db/createTestDb';
import { exercises as exercisesTable } from '../db/schema';
import { repositoryErrorCode } from './errors';
import { createExercisesRepository } from './exercises';
import { createRoutinesRepository } from './routines';
import { catchError } from './testHelpers';
import { createWorkoutsRepository } from './workouts';

const T0 = new Date('2026-03-01T10:00:00.000Z');

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
  const pushUp = exercises.create({
    name: 'Flexiones',
    muscleGroup: 'chest',
    equipment: 'bodyweight',
    type: 'reps_only',
  });
  const plank = exercises.create({
    name: 'Plancha',
    muscleGroup: 'abs',
    equipment: 'bodyweight',
    type: 'duration',
  });
  return {
    db,
    workouts: createWorkoutsRepository(db),
    routines: createRoutinesRepository(db),
    bench,
    pushUp,
    plank,
  };
}

// Un entrenamiento con un ejercicio de 3 series (vacías) ya empezado.
function startedWithBench() {
  const ctx = setup();
  const started = ctx.workouts.start('Mi entreno');
  const workout = ctx.workouts.addExercise(started.id, ctx.bench.id);
  const exercise = workout.exercises[0];
  return { ...ctx, workout, exercise };
}

describe('workouts.start y consultas', () => {
  test('empieza un entrenamiento vacío y activo', () => {
    const { workouts } = setup();
    const workout = workouts.start('Entrenamiento');
    expect(workout).toMatchObject({
      name: 'Entrenamiento',
      routineId: null,
      startedAt: T0,
      finishedAt: null,
      exercises: [],
    });
    expect(workouts.getActive()).toEqual(workout);
    expect(workouts.getById(workout.id)).toEqual(workout);
  });

  test('getActive y getById devuelven undefined si no hay nada', () => {
    const { workouts } = setup();
    expect(workouts.getActive()).toBeUndefined();
    expect(workouts.getById(999)).toBeUndefined();
  });

  test('solo puede haber uno en curso', () => {
    const { workouts } = setup();
    workouts.start('A');
    expect(repositoryErrorCode(catchError(() => workouts.start('B')))).toBe('workout.alreadyActive');
    expect(workouts.getActive()?.name).toBe('A');
  });

  test('tras terminar uno se puede empezar otro', () => {
    const { workouts, bench } = setup();
    const first = workouts.start('A');
    const withExercise = workouts.addExercise(first.id, bench.id);
    workouts.updateSet(withExercise.exercises[0].sets[0].id, { completed: true });
    workouts.finish(first.id);
    expect(workouts.getActive()).toBeUndefined();
    expect(workouts.start('B').name).toBe('B');
  });

  test('getById incluye el nombre en los dos idiomas y el tipo de cada ejercicio', () => {
    const { db, workouts } = setup();
    const library = db
      .insert(exercisesTable)
      .values({
        slug: 'plank',
        name: 'Plancha',
        nameEn: 'Plank',
        muscleGroup: 'abs',
        equipment: 'bodyweight',
        type: 'duration',
      })
      .returning()
      .get();
    const started = workouts.start('A');
    const workout = workouts.addExercise(started.id, library.id);
    expect(workout.exercises[0]).toMatchObject({
      exerciseName: 'Plancha',
      exerciseNameEn: 'Plank',
      exerciseType: 'duration',
    });
  });
});

describe('workouts.startFromRoutine', () => {
  function withRoutine() {
    const ctx = setup();
    const routine = ctx.routines.create({
      name: 'Día de pecho',
      exercises: [
        { exerciseId: ctx.bench.id, targetSets: 3, targetReps: 8, restSeconds: 120 },
        { exerciseId: ctx.pushUp.id, targetSets: 2, targetReps: 15, restSeconds: 60 },
        { exerciseId: ctx.plank.id, targetSets: 1, targetReps: 30 },
      ],
    });
    return { ...ctx, routine };
  }

  test('copia el nombre, los ejercicios en orden, las series y los descansos', () => {
    const { workouts, routine } = withRoutine();
    const workout = workouts.startFromRoutine(routine.id);

    expect(workout).toMatchObject({ name: 'Día de pecho', routineId: routine.id, finishedAt: null });
    expect(workout.exercises.map((e) => [e.exerciseName, e.position, e.restSeconds, e.sets.length])).toEqual([
      ['Press banca', 0, 120, 3],
      ['Flexiones', 1, 60, 2],
      ['Plancha', 2, 90, 1],
    ]);
  });

  test('las series salen vacías, con las repeticiones objetivo ya rellenas (salvo en duración)', () => {
    const { workouts, routine } = withRoutine();
    const [bench, pushUp, plank] = workouts.startFromRoutine(routine.id).exercises;

    expect(bench.sets.map((s) => [s.position, s.type, s.weight, s.reps, s.completed])).toEqual([
      [0, 'normal', null, 8, false],
      [1, 'normal', null, 8, false],
      [2, 'normal', null, 8, false],
    ]);
    expect(pushUp.sets.map((s) => s.reps)).toEqual([15, 15]);
    expect(plank.sets.map((s) => [s.reps, s.durationSeconds])).toEqual([[null, null]]);
  });

  test('una rutina que no existe falla y no deja nada empezado', () => {
    const { workouts } = setup();
    expect(repositoryErrorCode(catchError(() => workouts.startFromRoutine(999)))).toBe('routine.notFound');
    expect(workouts.getActive()).toBeUndefined();
  });

  test('con uno en curso, no se puede empezar otro', () => {
    const { workouts, routine } = withRoutine();
    workouts.start('A');
    expect(repositoryErrorCode(catchError(() => workouts.startFromRoutine(routine.id)))).toBe(
      'workout.alreadyActive',
    );
  });

  test('es una copia: borrar la rutina no toca el entrenamiento', () => {
    const { workouts, routines, routine } = withRoutine();
    const workout = workouts.startFromRoutine(routine.id);
    routines.remove(routine.id);

    const kept = workouts.getById(workout.id);
    expect(kept?.routineId).toBeNull();
    expect(kept?.exercises).toHaveLength(3);
  });
});

describe('workouts: ejercicios y series', () => {
  test('addExercise añade al final con una serie vacía y el descanso indicado', () => {
    const { workouts, bench, pushUp } = setup();
    const started = workouts.start('A');
    workouts.addExercise(started.id, bench.id);
    const workout = workouts.addExercise(started.id, pushUp.id, 45);

    expect(workout.exercises.map((e) => [e.exerciseName, e.position, e.restSeconds])).toEqual([
      ['Press banca', 0, 90],
      ['Flexiones', 1, 45],
    ]);
    expect(workout.exercises[1].sets).toEqual([
      expect.objectContaining({ position: 0, type: 'normal', weight: null, reps: null, completed: false }),
    ]);
  });

  test('addExercise en un entrenamiento que no existe falla', () => {
    const { workouts, bench } = setup();
    expect(repositoryErrorCode(catchError(() => workouts.addExercise(999, bench.id)))).toBe('workout.notFound');
  });

  test('removeExercise quita el ejercicio con sus series y renumera los demás', () => {
    const { workouts, bench, pushUp, plank } = setup();
    const started = workouts.start('A');
    workouts.addExercise(started.id, bench.id);
    workouts.addExercise(started.id, pushUp.id);
    const three = workouts.addExercise(started.id, plank.id);

    const workout = workouts.removeExercise(three.exercises[0].id);
    expect(workout.exercises.map((e) => [e.exerciseName, e.position])).toEqual([
      ['Flexiones', 0],
      ['Plancha', 1],
    ]);
  });

  test('addSet copia el peso y las repeticiones de la serie anterior, como serie normal sin completar', () => {
    const { workouts, exercise } = startedWithBench();
    workouts.updateSet(exercise.sets[0].id, { weight: 80, reps: 8, type: 'warmup', completed: true });

    const workout = workouts.addSet(exercise.id);
    expect(workout.exercises[0].sets.map((s) => [s.position, s.type, s.weight, s.reps, s.completed])).toEqual([
      [0, 'warmup', 80, 8, true],
      [1, 'normal', 80, 8, false],
    ]);
  });

  test('removeSet quita la serie y renumera las demás', () => {
    const { workouts, exercise } = startedWithBench();
    workouts.addSet(exercise.id);
    const three = workouts.addSet(exercise.id);
    const [first, second, third] = three.exercises[0].sets;

    workouts.updateSet(second.id, { reps: 5 });
    const workout = workouts.removeSet(first.id);
    expect(workout.exercises[0].sets.map((s) => [s.id, s.position])).toEqual([
      [second.id, 0],
      [third.id, 1],
    ]);
  });

  test('operar con un ejercicio o una serie que no existen falla', () => {
    const { workouts } = setup();
    expect(repositoryErrorCode(catchError(() => workouts.removeExercise(999)))).toBe('workout.notFound');
    expect(repositoryErrorCode(catchError(() => workouts.addSet(999)))).toBe('workout.notFound');
    expect(repositoryErrorCode(catchError(() => workouts.removeSet(999)))).toBe('workout.notFound');
  });
});

describe('workouts.updateSet', () => {
  test('cambia los campos indicados, devuelve la serie y queda guardado', () => {
    const { workouts, workout, exercise } = startedWithBench();
    const setId = exercise.sets[0].id;

    const updated = workouts.updateSet(setId, { weight: 82.5, reps: 6, type: 'failure', completed: true });
    expect(updated).toEqual({
      id: setId,
      position: 0,
      type: 'failure',
      weight: 82.5,
      reps: 6,
      durationSeconds: null,
      completed: true,
    });
    expect(workouts.getById(workout.id)?.exercises[0].sets[0]).toEqual(updated);
  });

  test('una duración se guarda en segundos', () => {
    const { workouts, exercise } = startedWithBench();
    expect(workouts.updateSet(exercise.sets[0].id, { durationSeconds: 45 }).durationSeconds).toBe(45);
  });

  test('un valor null vacía el campo', () => {
    const { workouts, exercise } = startedWithBench();
    const setId = exercise.sets[0].id;
    workouts.updateSet(setId, { weight: 50, reps: 10 });
    expect(workouts.updateSet(setId, { weight: null, reps: null })).toMatchObject({ weight: null, reps: null });
  });

  test('sin cambios devuelve la serie tal cual', () => {
    const { workouts, exercise } = startedWithBench();
    expect(workouts.updateSet(exercise.sets[0].id, {})).toEqual(exercise.sets[0]);
  });

  test.each([
    { weight: -1 },
    { weight: Number.NaN },
    { weight: Number.POSITIVE_INFINITY },
    { reps: 1.5 },
    { reps: -3 },
    { durationSeconds: -5 },
    { durationSeconds: 2.5 },
    { type: 'otro' },
  ])('rechaza el valor inválido %p', (patch) => {
    const { workouts, exercise } = startedWithBench();
    const error = catchError(() => workouts.updateSet(exercise.sets[0].id, patch as never));
    expect(repositoryErrorCode(error)).toBe('workout.invalidSetValue');
  });

  test('una serie que no existe falla', () => {
    const { workouts } = setup();
    expect(repositoryErrorCode(catchError(() => workouts.updateSet(999, { reps: 5 })))).toBe('workout.notFound');
  });
});

describe('workouts.finish y discard', () => {
  test('finish guarda solo lo completado, quita los ejercicios vacíos y renumera', () => {
    const { workouts, bench, pushUp, plank } = setup();
    const started = workouts.start('A');
    workouts.addExercise(started.id, bench.id);
    workouts.addExercise(started.id, pushUp.id);
    const built = workouts.addExercise(started.id, plank.id);
    const [benchEx, pushEx] = built.exercises;

    // Press banca: 3 series, completadas la 1.ª y la 3.ª. Flexiones: ninguna completada.
    workouts.addSet(benchEx.id);
    const withSets = workouts.addSet(benchEx.id);
    const [s0, , s2] = withSets.exercises[0].sets;
    workouts.updateSet(s0.id, { weight: 60, reps: 10, completed: true });
    workouts.updateSet(s2.id, { weight: 65, reps: 8, completed: true });
    workouts.updateSet(pushEx.sets[0].id, { reps: 20 });
    // Plancha: una serie completada.
    workouts.updateSet(built.exercises[2].sets[0].id, { durationSeconds: 60, completed: true });

    jest.setSystemTime(new Date('2026-03-01T11:00:00.000Z'));
    const finished = workouts.finish(started.id);

    expect(finished.finishedAt).toEqual(new Date('2026-03-01T11:00:00.000Z'));
    expect(finished.exercises.map((e) => [e.exerciseName, e.position])).toEqual([
      ['Press banca', 0],
      ['Plancha', 1],
    ]);
    expect(finished.exercises[0].sets.map((s) => [s.position, s.weight, s.reps, s.completed])).toEqual([
      [0, 60, 10, true],
      [1, 65, 8, true],
    ]);
    expect(workouts.getActive()).toBeUndefined();
    expect(workouts.getById(started.id)).toEqual(finished);
  });

  test('sin ninguna serie completada no se guarda y el entrenamiento sigue en curso', () => {
    const { workouts, workout } = startedWithBench();
    expect(repositoryErrorCode(catchError(() => workouts.finish(workout.id)))).toBe('workout.nothingCompleted');
    expect(workouts.getActive()).toEqual(workout);
  });

  test('terminar dos veces conserva la primera hora de fin', () => {
    const { workouts, workout, exercise } = startedWithBench();
    workouts.updateSet(exercise.sets[0].id, { reps: 5, completed: true });
    const first = workouts.finish(workout.id);
    jest.setSystemTime(new Date('2026-03-02T00:00:00.000Z'));
    expect(workouts.finish(workout.id).finishedAt).toEqual(first.finishedAt);
  });

  test('finish de un entrenamiento que no existe falla', () => {
    const { workouts } = setup();
    expect(repositoryErrorCode(catchError(() => workouts.finish(999)))).toBe('workout.notFound');
  });

  test('discard borra el entrenamiento con todo lo que tiene', () => {
    const { workouts, workout } = startedWithBench();
    workouts.discard(workout.id);
    expect(workouts.getById(workout.id)).toBeUndefined();
    expect(workouts.getActive()).toBeUndefined();
  });

  test('discard de un entrenamiento que no existe falla', () => {
    const { workouts } = setup();
    expect(repositoryErrorCode(catchError(() => workouts.discard(999)))).toBe('workout.notFound');
  });
});
