import { formatNumber, formatRpe, formatVolume } from './format';

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

describe('formatVolume', () => {
  test('cero y enteros pequeños', () => {
    expect(formatVolume(0, 'es')).toBe('0 kg');
    expect(formatVolume(400, 'en')).toBe('400 kg');
  });

  test('un decimal como máximo, con coma en español y punto en inglés', () => {
    expect(formatVolume(412.5, 'es')).toBe('412,5 kg');
    expect(formatVolume(412.5, 'en')).toBe('412.5 kg');
    expect(formatVolume(1234.56, 'en')).toBe('1,234.6 kg');
  });

  test('los miles se separan con punto en español y con coma en inglés', () => {
    expect(formatVolume(12500, 'es')).toBe('12.500 kg');
    expect(formatVolume(12500, 'en')).toBe('12,500 kg');
    expect(formatVolume(1234567, 'es')).toBe('1.234.567 kg');
  });

  test('un decimal .0 tras redondear no se muestra', () => {
    expect(formatVolume(99.96, 'es')).toBe('100 kg');
  });
});
