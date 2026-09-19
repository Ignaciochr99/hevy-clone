import { createTestDb } from '../db/createTestDb';
import { seedExercises } from '../db/seed';
import { createExercisesRepository, type ExerciseInput } from './exercises';

const pressBanca: ExerciseInput = {
  name: 'Press banca',
  muscleGroup: 'chest',
  equipment: 'barbell',
  type: 'weight_reps',
};

function setup() {
  const db = createTestDb();
  return { db, exercises: createExercisesRepository(db) };
}

describe('exercises.create', () => {
  test('crea un ejercicio propio y lo devuelve con su id', () => {
    const { exercises } = setup();
    const created = exercises.create(pressBanca);
    expect(created.id).toEqual(expect.any(Number));
    expect(created).toMatchObject({ ...pressBanca, isCustom: true, slug: null });
  });

  test('quita los espacios sobrantes del nombre', () => {
    const { exercises } = setup();
    expect(exercises.create({ ...pressBanca, name: '  Press banca  ' }).name).toBe('Press banca');
  });

  test('rechaza un nombre vacío o en blanco', () => {
    const { exercises } = setup();
    expect(() => exercises.create({ ...pressBanca, name: '   ' })).toThrow('nombre');
  });
});

describe('exercises.getById y list', () => {
  test('getById devuelve undefined si no existe', () => {
    const { exercises } = setup();
    expect(exercises.getById(999)).toBeUndefined();
  });

  test('getById devuelve el ejercicio guardado', () => {
    const { exercises } = setup();
    const created = exercises.create(pressBanca);
    expect(exercises.getById(created.id)).toEqual(created);
  });

  test('list ordena por nombre sin distinguir mayúsculas', () => {
    const { exercises } = setup();
    exercises.create({ ...pressBanca, name: 'zancadas' });
    exercises.create({ ...pressBanca, name: 'Aperturas' });
    exercises.create({ ...pressBanca, name: 'banca' });
    expect(exercises.list().map((e) => e.name)).toEqual(['Aperturas', 'banca', 'zancadas']);
  });

  test('list incluye los ejercicios precargados junto a los propios', () => {
    const { db, exercises } = setup();
    seedExercises(db);
    const before = exercises.list().length;
    exercises.create(pressBanca);
    expect(exercises.list()).toHaveLength(before + 1);
  });
});

describe('exercises.update', () => {
  test('cambia solo los campos indicados', () => {
    const { exercises } = setup();
    const created = exercises.create(pressBanca);
    const updated = exercises.update(created.id, { name: 'Press plano', equipment: 'dumbbell' });
    expect(updated).toEqual({ ...created, name: 'Press plano', equipment: 'dumbbell' });
    expect(exercises.getById(created.id)).toEqual(updated);
  });

  test('sin cambios devuelve el ejercicio tal cual', () => {
    const { exercises } = setup();
    const created = exercises.create(pressBanca);
    expect(exercises.update(created.id, {})).toEqual(created);
  });

  test('rechaza un nombre en blanco', () => {
    const { exercises } = setup();
    const created = exercises.create(pressBanca);
    expect(() => exercises.update(created.id, { name: ' ' })).toThrow('nombre');
  });

  test('rechaza modificar un ejercicio de la biblioteca', () => {
    const { db, exercises } = setup();
    seedExercises(db);
    const [library] = exercises.list();
    expect(() => exercises.update(library.id, { name: 'Otro' })).toThrow('biblioteca');
  });

  test('falla si el ejercicio no existe', () => {
    const { exercises } = setup();
    expect(() => exercises.update(999, { name: 'Otro' })).toThrow('no encontrado');
  });
});

describe('exercises.remove', () => {
  test('borra un ejercicio propio', () => {
    const { exercises } = setup();
    const created = exercises.create(pressBanca);
    exercises.remove(created.id);
    expect(exercises.getById(created.id)).toBeUndefined();
  });

  test('rechaza borrar un ejercicio de la biblioteca', () => {
    const { db, exercises } = setup();
    seedExercises(db);
    const [library] = exercises.list();
    expect(() => exercises.remove(library.id)).toThrow('biblioteca');
    expect(exercises.getById(library.id)).toBeDefined();
  });

  test('falla si el ejercicio no existe', () => {
    const { exercises } = setup();
    expect(() => exercises.remove(999)).toThrow('no encontrado');
  });
});
