import { formatShortDate } from './dateText';

describe('formatShortDate', () => {
  // Lunes 21 de septiembre de 2026, hora local.
  const monday = new Date(2026, 8, 21, 18, 5);

  test('en español: día de la semana, número y mes abreviados', () => {
    expect(formatShortDate(monday, 'es')).toBe('lun 21 sep');
  });

  test('en inglés: día de la semana, mes y número', () => {
    expect(formatShortDate(monday, 'en')).toBe('Mon, Sep 21');
  });

  test('recorre todos los días y meses', () => {
    // Domingo 3 de enero de 2027 y sábado 12 de diciembre de 2026.
    expect(formatShortDate(new Date(2027, 0, 3), 'es')).toBe('dom 3 ene');
    expect(formatShortDate(new Date(2026, 11, 12), 'en')).toBe('Sat, Dec 12');
  });
});
