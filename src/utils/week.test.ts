import { startOfNextWeek, startOfWeek } from './week';

// Las fechas se construyen con el constructor local (año, mes, día...), igual
// que las lee `startOfWeek`: así los tests dan lo mismo en cualquier zona horaria.
describe('startOfWeek', () => {
  test('cualquier día de la semana devuelve el lunes a las 00:00', () => {
    // Del lunes 21 al domingo 27 de septiembre de 2026.
    for (let day = 21; day <= 27; day++) {
      expect(startOfWeek(new Date(2026, 8, day, 15, 30, 45))).toEqual(new Date(2026, 8, 21));
    }
  });

  test('el lunes a las 00:00 es su propio inicio, y un segundo antes es la semana anterior', () => {
    expect(startOfWeek(new Date(2026, 8, 21, 0, 0, 0))).toEqual(new Date(2026, 8, 21));
    expect(startOfWeek(new Date(2026, 8, 20, 23, 59, 59))).toEqual(new Date(2026, 8, 14));
  });

  test('cruza el cambio de mes y de año', () => {
    // Domingo 1 de marzo de 2026 → lunes 23 de febrero.
    expect(startOfWeek(new Date(2026, 2, 1, 12))).toEqual(new Date(2026, 1, 23));
    // Viernes 1 de enero de 2027 → lunes 28 de diciembre de 2026.
    expect(startOfWeek(new Date(2027, 0, 1, 12))).toEqual(new Date(2026, 11, 28));
  });

  test('no modifica la fecha que recibe', () => {
    const date = new Date(2026, 8, 24, 10);
    startOfWeek(date);
    expect(date).toEqual(new Date(2026, 8, 24, 10));
  });
});

describe('startOfNextWeek', () => {
  test('es el lunes siguiente a las 00:00', () => {
    expect(startOfNextWeek(new Date(2026, 8, 24, 10))).toEqual(new Date(2026, 8, 28));
    expect(startOfNextWeek(new Date(2026, 8, 28))).toEqual(new Date(2026, 9, 5));
  });

  test('cruza el fin de mes y de año', () => {
    expect(startOfNextWeek(new Date(2026, 11, 30))).toEqual(new Date(2027, 0, 4));
  });
});
