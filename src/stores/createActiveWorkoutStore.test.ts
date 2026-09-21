import { createTestDb } from '../db/createTestDb';
import { repositoryErrorCode } from '../repositories/errors';
import { createExercisesRepository } from '../repositories/exercises';
import { createRoutinesRepository } from '../repositories/routines';
import { catchError } from '../repositories/testHelpers';
import { createWorkoutsRepository } from '../repositories/workouts';
import { createActiveWorkoutStore } from './createActiveWorkoutStore';

function setup() {
  const db = createTestDb();
  const exercises = createExercisesRepository(db);
  const repo = createWorkoutsRepository(db);
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
  const routine = createRoutinesRepository(db).create({
    name: 'Día 1',
    exercises: [
      { exerciseId: bench.id, targetSets: 3, targetReps: 8, restSeconds: 120 },
      { exerciseId: squat.id, targetSets: 2, targetReps: 5 },
    ],
  });
  return { repo, store: createActiveWorkoutStore(repo), bench, squat, routine };
}

// El estado del store debe ser siempre idéntico a lo que hay guardado en la base.
function expectInSync(ctx: ReturnType<typeof setup>) {
  const workout = ctx.store.getState().workout;
  expect(workout).not.toBeNull();
  expect(ctx.repo.getById(workout!.id)).toEqual(workout);
}

describe('createActiveWorkoutStore: empezar', () => {
  test('al principio no hay ningún entrenamiento', () => {
    expect(setup().store.getState().workout).toBeNull();
  });

  test('startEmpty crea un entrenamiento y lo guarda en la base', () => {
    const ctx = setup();
    ctx.store.getState().startEmpty('Entrenamiento');
    expect(ctx.store.getState().workout).toMatchObject({ name: 'Entrenamiento', exercises: [] });
    expect(ctx.repo.getActive()).toEqual(ctx.store.getState().workout);
  });

  test('startFromRoutine copia la rutina', () => {
    const ctx = setup();
    ctx.store.getState().startFromRoutine(ctx.routine.id);
    const workout = ctx.store.getState().workout;
    expect(workout).toMatchObject({ name: 'Día 1', routineId: ctx.routine.id });
    expect(workout?.exercises.map((e) => [e.exerciseName, e.sets.length])).toEqual([
      ['Press banca', 3],
      ['Sentadilla', 2],
    ]);
    expectInSync(ctx);
  });

  test('no se puede empezar otro y el estado no cambia', () => {
    const ctx = setup();
    ctx.store.getState().startEmpty('A');
    const before = ctx.store.getState().workout;

    const error = catchError(() => ctx.store.getState().startEmpty('B'));
    expect(repositoryErrorCode(error)).toBe('workout.alreadyActive');
    expect(ctx.store.getState().workout).toBe(before);
  });
});

describe('createActiveWorkoutStore: editar', () => {
  function started() {
    const ctx = setup();
    ctx.store.getState().startEmpty('A');
    return ctx;
  }

  test('addExercise y removeExercise', () => {
    const ctx = started();
    ctx.store.getState().addExercise(ctx.bench.id);
    ctx.store.getState().addExercise(ctx.squat.id, 60);
    expect(ctx.store.getState().workout?.exercises.map((e) => [e.exerciseName, e.restSeconds])).toEqual([
      ['Press banca', 90],
      ['Sentadilla', 60],
    ]);
    expectInSync(ctx);

    ctx.store.getState().removeExercise(ctx.store.getState().workout!.exercises[0].id);
    expect(ctx.store.getState().workout?.exercises.map((e) => e.exerciseName)).toEqual(['Sentadilla']);
    expectInSync(ctx);
  });

  test('addSet y removeSet', () => {
    const ctx = started();
    ctx.store.getState().addExercise(ctx.bench.id);
    const exercise = ctx.store.getState().workout!.exercises[0];

    ctx.store.getState().addSet(exercise.id);
    expect(ctx.store.getState().workout?.exercises[0].sets).toHaveLength(2);
    expectInSync(ctx);

    ctx.store.getState().removeSet(ctx.store.getState().workout!.exercises[0].sets[0].id);
    expect(ctx.store.getState().workout?.exercises[0].sets).toHaveLength(1);
    expectInSync(ctx);
  });

  test('updateSet cambia solo esa serie, en memoria y en la base', () => {
    const ctx = started();
    ctx.store.getState().addExercise(ctx.bench.id);
    ctx.store.getState().addSet(ctx.store.getState().workout!.exercises[0].id);
    const [first, second] = ctx.store.getState().workout!.exercises[0].sets;

    ctx.store.getState().updateSet(first.id, { weight: 80, reps: 6, completed: true });

    const [afterFirst, afterSecond] = ctx.store.getState().workout!.exercises[0].sets;
    expect(afterFirst).toMatchObject({ weight: 80, reps: 6, completed: true });
    expect(afterSecond).toBe(second);
    expectInSync(ctx);
  });

  test('un valor inválido falla y no cambia nada', () => {
    const ctx = started();
    ctx.store.getState().addExercise(ctx.bench.id);
    const before = ctx.store.getState().workout;
    const setId = before!.exercises[0].sets[0].id;

    const error = catchError(() => ctx.store.getState().updateSet(setId, { reps: -1 }));
    expect(repositoryErrorCode(error)).toBe('workout.invalidSetValue');
    expect(ctx.store.getState().workout).toBe(before);
  });

  test('sin entrenamiento en curso, las acciones fallan', () => {
    const ctx = setup();
    const error = catchError(() => ctx.store.getState().addExercise(ctx.bench.id));
    expect(repositoryErrorCode(error)).toBe('workout.notFound');
  });
});

describe('createActiveWorkoutStore: terminar y descartar', () => {
  function withCompletedSet() {
    const ctx = setup();
    ctx.store.getState().startFromRoutine(ctx.routine.id);
    const setId = ctx.store.getState().workout!.exercises[0].sets[0].id;
    ctx.store.getState().updateSet(setId, { weight: 70, completed: true });
    return ctx;
  }

  test('finish guarda el entrenamiento y vacía el store', () => {
    const ctx = withCompletedSet();
    const id = ctx.store.getState().workout!.id;

    const finished = ctx.store.getState().finish();

    expect(finished.finishedAt).not.toBeNull();
    expect(finished.exercises).toHaveLength(1);
    expect(ctx.store.getState().workout).toBeNull();
    expect(ctx.repo.getActive()).toBeUndefined();
    expect(ctx.repo.getById(id)).toEqual(finished);
  });

  test('finish sin ninguna serie completada falla y el entrenamiento sigue en curso', () => {
    const ctx = setup();
    ctx.store.getState().startFromRoutine(ctx.routine.id);
    const before = ctx.store.getState().workout;

    expect(repositoryErrorCode(catchError(() => ctx.store.getState().finish()))).toBe('workout.nothingCompleted');
    expect(ctx.store.getState().workout).toBe(before);
  });

  test('discard borra el entrenamiento y vacía el store', () => {
    const ctx = withCompletedSet();
    const id = ctx.store.getState().workout!.id;

    ctx.store.getState().discard();

    expect(ctx.store.getState().workout).toBeNull();
    expect(ctx.repo.getById(id)).toBeUndefined();
  });

  test('tras terminar o descartar se puede empezar otro', () => {
    const ctx = withCompletedSet();
    ctx.store.getState().finish();
    ctx.store.getState().startEmpty('Otro');
    expect(ctx.store.getState().workout?.name).toBe('Otro');

    ctx.store.getState().discard();
    ctx.store.getState().startEmpty('Y otro más');
    expect(ctx.store.getState().workout?.name).toBe('Y otro más');
  });
});

describe('createActiveWorkoutStore: recuperación tras cerrar la app', () => {
  test('un store nuevo sobre la misma base recupera el entrenamiento a medias', () => {
    const ctx = setup();
    ctx.store.getState().startFromRoutine(ctx.routine.id);
    ctx.store.getState().addExercise(ctx.bench.id, 45);
    const setId = ctx.store.getState().workout!.exercises[0].sets[1].id;
    ctx.store.getState().updateSet(setId, { weight: 82.5, reps: 5, type: 'warmup', completed: true });

    // "Se cierra la app": todo lo que hay en memoria se pierde.
    const reopened = createActiveWorkoutStore(ctx.repo);
    expect(reopened.getState().workout).toBeNull();

    reopened.getState().load();
    expect(reopened.getState().workout).toEqual(ctx.store.getState().workout);
    expect(reopened.getState().workout?.exercises[0].sets[1]).toMatchObject({
      weight: 82.5,
      reps: 5,
      type: 'warmup',
      completed: true,
    });
  });

  test('si el entrenamiento ya se terminó, no hay nada que recuperar', () => {
    const ctx = setup();
    ctx.store.getState().startFromRoutine(ctx.routine.id);
    ctx.store
      .getState()
      .updateSet(ctx.store.getState().workout!.exercises[0].sets[0].id, { completed: true });
    ctx.store.getState().finish();

    const reopened = createActiveWorkoutStore(ctx.repo);
    reopened.getState().load();
    expect(reopened.getState().workout).toBeNull();
  });

  test('tras recuperarlo se puede seguir editando', () => {
    const ctx = setup();
    ctx.store.getState().startFromRoutine(ctx.routine.id);

    const reopened = createActiveWorkoutStore(ctx.repo);
    reopened.getState().load();
    reopened.getState().addExercise(ctx.squat.id);
    expect(reopened.getState().workout?.exercises).toHaveLength(3);
    expect(ctx.repo.getActive()).toEqual(reopened.getState().workout);
  });
});

describe('createActiveWorkoutStore: descanso', () => {
  // Un reloj inyectado: el test decide qué hora es.
  function withClock() {
    const ctx = setup();
    let time = 1_000_000;
    const store = createActiveWorkoutStore(ctx.repo, () => time);
    store.getState().startFromRoutine(ctx.routine.id);
    const [bench, squat] = store.getState().workout!.exercises;
    return { ...ctx, store, bench, squat, advance: (ms: number) => (time += ms), now: () => time };
  }

  test('al empezar no hay descanso', () => {
    expect(withClock().store.getState().rest).toBeNull();
  });

  test('completar una serie arranca el descanso de su ejercicio', () => {
    const ctx = withClock();
    ctx.store.getState().updateSet(ctx.bench.sets[0].id, { weight: 80, completed: true });
    expect(ctx.store.getState().rest).toEqual({ endsAt: ctx.now() + 120_000 });

    // Otro ejercicio, otro descanso (el de Sentadilla es el de por defecto, 90 s).
    ctx.advance(10_000);
    ctx.store.getState().updateSet(ctx.squat.sets[0].id, { completed: true });
    expect(ctx.store.getState().rest).toEqual({ endsAt: ctx.now() + 90_000 });
  });

  test('editar el peso de una serie sin completarla no arranca nada', () => {
    const ctx = withClock();
    ctx.store.getState().updateSet(ctx.bench.sets[0].id, { weight: 80, reps: 8 });
    expect(ctx.store.getState().rest).toBeNull();
  });

  test('solo arranca al pasar de no completada a completada', () => {
    const ctx = withClock();
    const setId = ctx.bench.sets[0].id;
    ctx.store.getState().updateSet(setId, { completed: true });
    const started = ctx.store.getState().rest;

    // Editar una serie que ya estaba completada no reinicia el descanso.
    ctx.advance(30_000);
    ctx.store.getState().updateSet(setId, { weight: 85 });
    expect(ctx.store.getState().rest).toBe(started);

    // Descompletarla tampoco lo arranca (ni lo quita).
    ctx.store.getState().updateSet(setId, { completed: false });
    expect(ctx.store.getState().rest).toBe(started);

    // Y volver a completarla sí empieza uno nuevo.
    ctx.store.getState().updateSet(setId, { completed: true });
    expect(ctx.store.getState().rest).toEqual({ endsAt: ctx.now() + 120_000 });
  });

  test('con descanso 0 no arranca', () => {
    const ctx = withClock();
    ctx.store.getState().addExercise(ctx.bench.exerciseId, 0);
    const added = ctx.store.getState().workout!.exercises[2];
    ctx.store.getState().updateSet(added.sets[0].id, { completed: true });
    expect(ctx.store.getState().rest).toBeNull();
  });

  test('si falla la escritura, no arranca el descanso', () => {
    const ctx = withClock();
    expect(() => ctx.store.getState().updateSet(ctx.bench.sets[0].id, { reps: -1, completed: true })).toThrow();
    expect(ctx.store.getState().rest).toBeNull();
  });

  test('skipRest lo quita', () => {
    const ctx = withClock();
    ctx.store.getState().updateSet(ctx.bench.sets[0].id, { completed: true });
    ctx.store.getState().skipRest();
    expect(ctx.store.getState().rest).toBeNull();
  });

  test('adjustRest suma o resta segundos; sin descanso no hace nada', () => {
    const ctx = withClock();
    ctx.store.getState().adjustRest(15);
    expect(ctx.store.getState().rest).toBeNull();

    ctx.store.getState().updateSet(ctx.bench.sets[0].id, { completed: true });
    ctx.store.getState().adjustRest(15);
    expect(ctx.store.getState().rest).toEqual({ endsAt: ctx.now() + 135_000 });
    ctx.store.getState().adjustRest(-15);
    ctx.store.getState().adjustRest(-15);
    expect(ctx.store.getState().rest).toEqual({ endsAt: ctx.now() + 105_000 });
  });

  test('finish y discard cancelan el descanso', () => {
    const finishing = withClock();
    finishing.store.getState().updateSet(finishing.bench.sets[0].id, { completed: true });
    finishing.store.getState().finish();
    expect(finishing.store.getState().rest).toBeNull();

    const discarding = withClock();
    discarding.store.getState().updateSet(discarding.bench.sets[0].id, { completed: true });
    discarding.store.getState().discard();
    expect(discarding.store.getState().rest).toBeNull();
  });
});
