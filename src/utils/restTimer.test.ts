import { REST_ADJUST_SECONDS, adjustRestEnd, isRestFinished, restRemainingSeconds } from './restTimer';

describe('restRemainingSeconds', () => {
  const now = 1_000_000;

  test('redondea hacia arriba: con 0,2 s por delante aún se ve 1', () => {
    expect(restRemainingSeconds(now + 90_000, now)).toBe(90);
    expect(restRemainingSeconds(now + 89_200, now)).toBe(90);
    expect(restRemainingSeconds(now + 200, now)).toBe(1);
  });

  test('nunca es negativo', () => {
    expect(restRemainingSeconds(now, now)).toBe(0);
    expect(restRemainingSeconds(now - 5_000, now)).toBe(0);
  });
});

describe('isRestFinished', () => {
  test('termina cuando la hora llega al final', () => {
    expect(isRestFinished(1_000, 999)).toBe(false);
    expect(isRestFinished(1_000, 1_000)).toBe(true);
    expect(isRestFinished(1_000, 2_000)).toBe(true);
  });
});

describe('adjustRestEnd', () => {
  const now = 1_000_000;

  test('suma o resta segundos al final del descanso', () => {
    expect(adjustRestEnd(now + 60_000, REST_ADJUST_SECONDS, now)).toBe(now + 75_000);
    expect(adjustRestEnd(now + 60_000, -REST_ADJUST_SECONDS, now)).toBe(now + 45_000);
  });

  test('restar de más lo deja terminado (en "ahora"), no en el pasado', () => {
    expect(adjustRestEnd(now + 10_000, -REST_ADJUST_SECONDS, now)).toBe(now);
  });
});
