import { parseDecimal, parseInteger } from './parseInput';

describe('parseDecimal', () => {
  test.each([
    ['', null],
    ['   ', null],
    ['80', 80],
    ['82.5', 82.5],
    ['82,5', 82.5],
    ['.5', 0.5],
    ['5.', 5],
    [' 7 ', 7],
    ['0', 0],
  ])('%p se interpreta como %p', (text, value) => {
    expect(parseDecimal(text)).toEqual({ valid: true, value });
  });

  test.each(['-3', 'abc', '1.2.3', '.', ',', '8 0', '1e3', '+5'])('%p no es válido', (text) => {
    expect(parseDecimal(text)).toEqual({ valid: false });
  });
});

describe('parseInteger', () => {
  test.each([
    ['', null],
    ['  ', null],
    ['12', 12],
    [' 7 ', 7],
    ['0', 0],
    ['007', 7],
  ])('%p se interpreta como %p', (text, value) => {
    expect(parseInteger(text)).toEqual({ valid: true, value });
  });

  test.each(['1.5', '1,5', '-1', 'abc', '1 2', '+3'])('%p no es válido', (text) => {
    expect(parseInteger(text)).toEqual({ valid: false });
  });
});
