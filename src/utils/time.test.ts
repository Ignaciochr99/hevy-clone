import { formatDuration } from './time';

describe('formatDuration', () => {
  test.each([
    [0, '0:00'],
    [5, '0:05'],
    [45, '0:45'],
    [60, '1:00'],
    [90, '1:30'],
    [600, '10:00'],
    [3599, '59:59'],
  ])('%p segundos se escriben %p', (seconds, expected) => {
    expect(formatDuration(seconds)).toBe(expected);
  });

  test('con horas usa h:mm:ss', () => {
    expect(formatDuration(3600)).toBe('1:00:00');
    expect(formatDuration(3661)).toBe('1:01:01');
  });

  test('redondea hacia abajo los decimales', () => {
    expect(formatDuration(89.9)).toBe('1:29');
  });

  test('un valor negativo o inválido se trata como cero', () => {
    expect(formatDuration(-5)).toBe('0:00');
    expect(formatDuration(Number.NaN)).toBe('0:00');
  });
});
