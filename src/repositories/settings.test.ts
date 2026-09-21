import { createTestDb } from '../db/createTestDb';
import { createSettingsRepository } from './settings';

function setup() {
  return createSettingsRepository(createTestDb());
}

describe('settings', () => {
  test('get devuelve undefined si la clave no existe', () => {
    expect(setup().get('language')).toBeUndefined();
  });

  test('set guarda un valor y get lo devuelve', () => {
    const settings = setup();
    settings.set('language', 'en');
    expect(settings.get('language')).toBe('en');
  });

  test('set sobrescribe el valor si la clave ya existe', () => {
    const settings = setup();
    settings.set('language', 'en');
    settings.set('language', 'es');
    expect(settings.get('language')).toBe('es');
  });

  test('las claves son independientes', () => {
    const settings = setup();
    settings.set('language', 'en');
    settings.set('units', 'kg');
    expect(settings.get('language')).toBe('en');
    expect(settings.get('units')).toBe('kg');
  });
});
