import { normalizeSearch } from './text';

describe('normalizeSearch', () => {
  test('pasa a minúsculas', () => {
    expect(normalizeSearch('Press BANCA')).toBe('press banca');
  });

  test('quita los acentos y la diéresis', () => {
    expect(normalizeSearch('Elevación pájaros pingüino')).toBe('elevacion pajaros pinguino');
  });

  test('cambia la ñ por n', () => {
    expect(normalizeSearch('Año')).toBe('ano');
  });

  test('cambia también las mayúsculas acentuadas', () => {
    expect(normalizeSearch('ÁÉÍÓÚÜÑ')).toBe('aeiouun');
  });

  test('quita los espacios de los extremos', () => {
    expect(normalizeSearch('  banca ')).toBe('banca');
  });

  test('deja igual un texto que ya está normalizado', () => {
    expect(normalizeSearch('sentadilla')).toBe('sentadilla');
  });
});
