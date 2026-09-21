import { createTestDb } from '../db/createTestDb';
import { exercises as exercisesTable } from '../db/schema';
import { seedExercises } from '../db/seed';
import { repositoryErrorCode } from './errors';
import { createExercisesRepository, type ExerciseInput } from './exercises';
import { catchError } from './testHelpers';

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

describe('exercises.list con filtros', () => {
  function setupFiltered() {
    const { exercises } = setup();
    exercises.create({ name: 'Press banca', muscleGroup: 'chest', equipment: 'barbell', type: 'weight_reps' });
    exercises.create({ name: 'Aperturas', muscleGroup: 'chest', equipment: 'dumbbell', type: 'weight_reps' });
    exercises.create({ name: 'Elevación de talones', muscleGroup: 'calves', equipment: 'machine', type: 'weight_reps' });
    return exercises;
  }

  const names = (list: { name: string }[]) => list.map((e) => e.name);

  test('filtra por grupo muscular', () => {
    expect(names(setupFiltered().list({ muscleGroup: 'chest' }))).toEqual(['Aperturas', 'Press banca']);
  });

  test('filtra por equipo', () => {
    expect(names(setupFiltered().list({ equipment: 'machine' }))).toEqual(['Elevación de talones']);
  });

  test('combina grupo muscular y equipo', () => {
    const exercises = setupFiltered();
    expect(names(exercises.list({ muscleGroup: 'chest', equipment: 'dumbbell' }))).toEqual(['Aperturas']);
    expect(exercises.list({ muscleGroup: 'chest', equipment: 'machine' })).toEqual([]);
  });

  test('busca sin distinguir mayúsculas ni acentos', () => {
    const exercises = setupFiltered();
    expect(names(exercises.list({ search: 'ELEVACION' }))).toEqual(['Elevación de talones']);
    expect(names(exercises.list({ search: 'banca' }))).toEqual(['Press banca']);
  });

  test('busca por cualquier parte del nombre', () => {
    expect(names(setupFiltered().list({ search: 'per' }))).toEqual(['Aperturas']);
  });

  test('combina la búsqueda con los filtros', () => {
    const exercises = setupFiltered();
    expect(names(exercises.list({ search: 'a' }))).toHaveLength(3);
    expect(names(exercises.list({ search: 'a', muscleGroup: 'chest' }))).toEqual(['Aperturas', 'Press banca']);
  });

  test('una búsqueda vacía o en blanco devuelve todos', () => {
    const exercises = setupFiltered();
    expect(exercises.list({ search: '' })).toHaveLength(3);
    expect(exercises.list({ search: '   ' })).toHaveLength(3);
  });

  test('sin coincidencias devuelve una lista vacía', () => {
    expect(setupFiltered().list({ search: 'zzz' })).toEqual([]);
  });
});

describe('exercises: errores con código', () => {
  test('nombre vacío', () => {
    const { exercises } = setup();
    expect(repositoryErrorCode(catchError(() => exercises.create({ ...pressBanca, name: ' ' })))).toBe(
      'exercise.nameEmpty',
    );
  });

  test('ejercicio inexistente', () => {
    const { exercises } = setup();
    expect(repositoryErrorCode(catchError(() => exercises.update(999, { name: 'X' })))).toBe('exercise.notFound');
    expect(repositoryErrorCode(catchError(() => exercises.remove(999)))).toBe('exercise.notFound');
  });

  test('ejercicio de la biblioteca', () => {
    const { db, exercises } = setup();
    seedExercises(db);
    const [library] = exercises.list();
    expect(repositoryErrorCode(catchError(() => exercises.update(library.id, { name: 'X' })))).toBe(
      'exercise.libraryReadOnly',
    );
    expect(repositoryErrorCode(catchError(() => exercises.remove(library.id)))).toBe('exercise.libraryReadOnly');
  });
});

describe('exercises: grupos secundarios', () => {
  test('sin indicarlos, la lista queda vacía', () => {
    const { exercises } = setup();
    expect(exercises.create(pressBanca).secondaryMuscleGroups).toEqual([]);
  });

  test('se guardan y se leen como lista', () => {
    const { exercises } = setup();
    const created = exercises.create({ ...pressBanca, secondaryMuscleGroups: ['triceps', 'shoulders'] });
    expect(created.secondaryMuscleGroups).toEqual(['triceps', 'shoulders']);
    expect(exercises.getById(created.id)?.secondaryMuscleGroups).toEqual(['triceps', 'shoulders']);
  });

  test('se eliminan los repetidos', () => {
    const { exercises } = setup();
    const created = exercises.create({
      ...pressBanca,
      secondaryMuscleGroups: ['triceps', 'triceps', 'shoulders'],
    });
    expect(created.secondaryMuscleGroups).toEqual(['triceps', 'shoulders']);
  });

  test('rechaza un grupo secundario igual al principal', () => {
    const { exercises } = setup();
    const error = catchError(() => exercises.create({ ...pressBanca, secondaryMuscleGroups: ['chest'] }));
    expect(repositoryErrorCode(error)).toBe('exercise.secondaryIncludesPrimary');
  });

  test('update puede cambiar solo los secundarios', () => {
    const { exercises } = setup();
    const created = exercises.create(pressBanca);
    const updated = exercises.update(created.id, { secondaryMuscleGroups: ['triceps'] });
    expect(updated.secondaryMuscleGroups).toEqual(['triceps']);
    expect(updated.name).toBe('Press banca');
  });

  test('update rechaza pasar a principal un grupo que ya es secundario', () => {
    const { exercises } = setup();
    const created = exercises.create({ ...pressBanca, secondaryMuscleGroups: ['triceps'] });
    const error = catchError(() => exercises.update(created.id, { muscleGroup: 'triceps' }));
    expect(repositoryErrorCode(error)).toBe('exercise.secondaryIncludesPrimary');
  });

  test('update permite cambiar el principal y los secundarios a la vez', () => {
    const { exercises } = setup();
    const created = exercises.create({ ...pressBanca, secondaryMuscleGroups: ['triceps'] });
    const updated = exercises.update(created.id, { muscleGroup: 'triceps', secondaryMuscleGroups: [] });
    expect(updated).toMatchObject({ muscleGroup: 'triceps', secondaryMuscleGroups: [] });
  });
});

describe('exercises: nombre en inglés', () => {
  function insertLibrary(db: ReturnType<typeof setup>['db'], name: string, nameEn: string, slug: string) {
    db.insert(exercisesTable)
      .values({ slug, name, nameEn, muscleGroup: 'chest', equipment: 'barbell', type: 'weight_reps' })
      .run();
  }

  test('la búsqueda encuentra por el nombre en español o en inglés', () => {
    const { db, exercises } = setup();
    insertLibrary(db, 'Aperturas con mancuernas', 'Dumbbell Fly', 'fly');
    expect(exercises.list({ search: 'aperturas' })).toHaveLength(1);
    expect(exercises.list({ search: 'DUMBBELL' })).toHaveLength(1);
    expect(exercises.list({ search: 'zzz' })).toHaveLength(0);
  });

  test('con language "en" se ordena por el nombre en inglés', () => {
    const { db, exercises } = setup();
    insertLibrary(db, 'Sentadilla', 'Squat', 'squat');
    insertLibrary(db, 'Zancada', 'Lunge', 'lunge');
    insertLibrary(db, 'Abdominales', 'Crunch', 'crunch');
    expect(exercises.list().map((e) => e.name)).toEqual(['Abdominales', 'Sentadilla', 'Zancada']);
    expect(exercises.list({ language: 'en' }).map((e) => e.name)).toEqual([
      'Abdominales',
      'Zancada',
      'Sentadilla',
    ]);
  });

  test('un ejercicio propio, sin nombre en inglés, se ordena por su nombre', () => {
    const { db, exercises } = setup();
    insertLibrary(db, 'Sentadilla', 'Squat', 'squat');
    exercises.create({ ...pressBanca, name: 'Mi ejercicio' });
    expect(exercises.list({ language: 'en' }).map((e) => e.name)).toEqual(['Mi ejercicio', 'Sentadilla']);
  });
});
