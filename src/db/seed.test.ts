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
