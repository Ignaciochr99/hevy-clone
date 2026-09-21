import { setVolume, workoutVolume } from './workoutStats';

type TestSet = Parameters<typeof setVolume>[0];

const done = (overrides: Partial<TestSet> = {}): TestSet => ({
  type: 'normal',
  weight: 80,
  reps: 5,
  completed: true,
  ...overrides,
});

describe('setVolume', () => {
  test('una serie completada suma peso × repeticiones', () => {
    expect(setVolume(done())).toBe(400);
    expect(setVolume(done({ weight: 82.5, reps: 4 }))).toBe(330);
  });

  test('las series de fallo cuentan', () => {
    expect(setVolume(done({ type: 'failure' }))).toBe(400);
  });

  test('el calentamiento no cuenta', () => {
    expect(setVolume(done({ type: 'warmup' }))).toBe(0);
  });

  test('una serie sin completar no cuenta', () => {
    expect(setVolume(done({ completed: false }))).toBe(0);
  });

  test('sin peso o sin repeticiones (solo repeticiones, duración) aporta 0', () => {
    expect(setVolume(done({ weight: null }))).toBe(0);
    expect(setVolume(done({ reps: null }))).toBe(0);
  });
});

describe('workoutVolume', () => {
  test('suma las series de todos los ejercicios', () => {
    const workout = {
      exercises: [
        { sets: [done({ type: 'warmup', weight: 40 }), done(), done({ weight: 82.5 })] },
        { sets: [done({ weight: 100, reps: 3 }), done({ completed: false })] },
      ],
    };
    expect(workoutVolume(workout)).toBe(400 + 412.5 + 300);
  });

  test('un entrenamiento sin ejercicios vale 0', () => {
    expect(workoutVolume({ exercises: [] })).toBe(0);
  });
});
