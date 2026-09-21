import { eq } from 'drizzle-orm';
import { createTestDb } from './createTestDb';
import { MUSCLE_GROUPS } from './enums';
import { exercises } from './schema';
import { LIBRARY_EXERCISES, seedExercises } from './seed';

describe('LIBRARY_EXERCISES', () => {
  test('los slugs son únicos', () => {
    const slugs = LIBRARY_EXERCISES.map((e) => e.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  test('los nombres son únicos, sin distinguir mayúsculas', () => {
    const names = LIBRARY_EXERCISES.map((e) => e.name.toLowerCase());
    expect(new Set(names).size).toBe(names.length);
  });

  test.each(MUSCLE_GROUPS)('hay al menos 2 ejercicios de %s', (group) => {
    const count = LIBRARY_EXERCISES.filter((e) => e.muscleGroup === group).length;
    expect(count).toBeGreaterThanOrEqual(2);
  });
});

describe('seedExercises', () => {
  test('inserta toda la biblioteca como ejercicios no propios', () => {
    const db = createTestDb();
    seedExercises(db);
    const rows = db.select().from(exercises).all();
    expect(rows).toHaveLength(LIBRARY_EXERCISES.length);
    expect(rows.every((row) => row.isCustom === false)).toBe(true);
  });

  test('es idempotente: llamarla otra vez no duplica nada', () => {
    const db = createTestDb();
    seedExercises(db);
    seedExercises(db);
    expect(db.select().from(exercises).all()).toHaveLength(LIBRARY_EXERCISES.length);
  });

  test('no toca los ejercicios propios del usuario', () => {
    const db = createTestDb();
    db.insert(exercises)
      .values({
        name: 'Mi ejercicio',
        muscleGroup: 'chest',
        equipment: 'other',
        type: 'reps_only',
        isCustom: true,
      })
      .run();
    seedExercises(db);
    const rows = db.select().from(exercises).all();
    expect(rows).toHaveLength(LIBRARY_EXERCISES.length + 1);
    expect(rows.filter((row) => row.isCustom)).toHaveLength(1);
  });
});

describe('LIBRARY_EXERCISES: nombre en inglés y grupos secundarios', () => {
  test('todos tienen nombre en inglés, único sin distinguir mayúsculas', () => {
    const names = LIBRARY_EXERCISES.map((e) => e.nameEn.trim().toLowerCase());
    expect(names.every((name) => name !== '')).toBe(true);
    expect(new Set(names).size).toBe(names.length);
  });

  test('los grupos secundarios son válidos, sin repetir y sin incluir al principal', () => {
    for (const exercise of LIBRARY_EXERCISES) {
      const secondary = exercise.secondaryMuscleGroups;
      expect(new Set(secondary).size).toBe(secondary.length);
      expect(secondary).not.toContain(exercise.muscleGroup);
      for (const group of secondary) {
        expect(MUSCLE_GROUPS).toContain(group);
      }
    }
  });

  test('la mayoría de los ejercicios tienen grupos secundarios', () => {
    const withSecondary = LIBRARY_EXERCISES.filter((e) => e.secondaryMuscleGroups.length > 0);
    expect(withSecondary.length).toBeGreaterThan(LIBRARY_EXERCISES.length / 2);
  });
});

describe('seedExercises: datos nuevos', () => {
  test('guarda el nombre en inglés y los grupos secundarios', () => {
    const db = createTestDb();
    seedExercises(db);
    const bench = db.select().from(exercises).where(eq(exercises.slug, 'bench-press-barbell')).get();
    expect(bench).toMatchObject({
      name: 'Press de banca con barra',
      nameEn: 'Barbell Bench Press',
      secondaryMuscleGroups: ['triceps', 'shoulders'],
    });
  });

  test('actualiza un ejercicio que ya existía con datos antiguos', () => {
    const db = createTestDb();
    db.insert(exercises)
      .values({
        slug: 'bench-press-barbell',
        name: 'Nombre viejo',
        muscleGroup: 'back',
        equipment: 'other',
        type: 'duration',
        isCustom: false,
      })
      .run();

    seedExercises(db);

    const rows = db.select().from(exercises).where(eq(exercises.slug, 'bench-press-barbell')).all();
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      name: 'Press de banca con barra',
      nameEn: 'Barbell Bench Press',
      muscleGroup: 'chest',
      equipment: 'barbell',
      type: 'weight_reps',
      secondaryMuscleGroups: ['triceps', 'shoulders'],
      isCustom: false,
    });
  });
});
