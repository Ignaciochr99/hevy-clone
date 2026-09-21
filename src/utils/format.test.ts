import { formatNumber, formatRpe } from './format';

describe('formatNumber', () => {
  test('un entero se escribe sin decimales', () => {
    expect(formatNumber(9, 'es')).toBe('9');
    expect(formatNumber(0, 'en')).toBe('0');
  });

  test('en español el decimal lleva coma y en inglés punto', () => {
    expect(formatNumber(4.5, 'es')).toBe('4,5');
    expect(formatNumber(4.5, 'en')).toBe('4.5');
  });
});

describe('formatRpe', () => {
  test('sin RPE muestra un guion', () => {
    expect(formatRpe(null, 'es')).toBe('—');
    expect(formatRpe(null, 'en')).toBe('—');
  });

  test('un entero se escribe sin decimales', () => {
    expect(formatRpe(8, 'es')).toBe('8');
    expect(formatRpe(10, 'en')).toBe('10');
  });

  test('en español el decimal lleva coma y en inglés punto', () => {
    expect(formatRpe(8.5, 'es')).toBe('8,5');
    expect(formatRpe(8.5, 'en')).toBe('8.5');
  });
});
