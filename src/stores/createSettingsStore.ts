import { create } from 'zustand';
import { DEFAULT_LANGUAGE, isLanguage, type Language } from '../i18n/language';
import type { SettingsRepository } from '../repositories/settings';

export const LANGUAGE_KEY = 'language';

type SettingsState = {
  language: Language;
  // Lee los ajustes guardados en la base (se llama una vez, al arrancar).
  load: () => void;
  setLanguage: (language: Language) => void;
};

// Fábrica: recibe el repositorio, así los tests usan una base en memoria y la
// app la real (ver settings.ts).
export function createSettingsStore(repo: SettingsRepository) {
  return create<SettingsState>()((set) => ({
    language: DEFAULT_LANGUAGE,

    load: () => {
      const stored = repo.get(LANGUAGE_KEY);
      set({ language: isLanguage(stored) ? stored : DEFAULT_LANGUAGE });
    },

    setLanguage: (language) => {
      repo.set(LANGUAGE_KEY, language);
      set({ language });
    },
  }));
}
