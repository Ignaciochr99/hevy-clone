import { createTestDb } from '../db/createTestDb';
import { createSettingsRepository } from '../repositories/settings';
import { createSettingsStore } from './createSettingsStore';

function setup() {
  const repo = createSettingsRepository(createTestDb());
  return { repo, store: createSettingsStore(repo) };
}

describe('createSettingsStore', () => {
  test('el idioma inicial es español', () => {
    expect(setup().store.getState().language).toBe('es');
  });

  test('load recupera el idioma guardado', () => {
    const { repo, store } = setup();
    repo.set('language', 'en');
    store.getState().load();
    expect(store.getState().language).toBe('en');
  });

  test('load usa el idioma por defecto si no hay nada guardado', () => {
    const { store } = setup();
    store.getState().load();
    expect(store.getState().language).toBe('es');
  });

  test('load ignora un valor guardado que no es un idioma válido', () => {
    const { repo, store } = setup();
    repo.set('language', 'fr');
    store.getState().load();
    expect(store.getState().language).toBe('es');
  });

  test('setLanguage cambia el estado y lo guarda en la base', () => {
    const { repo, store } = setup();
    store.getState().setLanguage('en');
    expect(store.getState().language).toBe('en');

    // Una app nueva, sobre la misma base, arranca ya en inglés.
    const reopened = createSettingsStore(repo);
    reopened.getState().load();
    expect(reopened.getState().language).toBe('en');
  });
});
