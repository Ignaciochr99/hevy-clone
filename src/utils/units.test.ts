import { kgToLb, lbToKg } from './units';

describe('lbToKg', () => {
  it('converts 100 lb to about 45.36 kg', () => {
    expect(lbToKg(100)).toBeCloseTo(45.36, 2);
  });
});

describe('kgToLb', () => {
  it('converts 100 kg to about 220.46 lb', () => {
    expect(kgToLb(100)).toBeCloseTo(220.46, 2);
  });
});
