export const LANGUAGES = ['es', 'en'] as const;
export type Language = (typeof LANGUAGES)[number];

export const DEFAULT_LANGUAGE: Language = 'es';

// Cada idioma se muestra siempre con su propio nombre, sin traducir.
export const LANGUAGE_NAMES: Record<Language, string> = { es: 'Español', en: 'English' };

export function isLanguage(value: unknown): value is Language {
  return typeof value === 'string' && (LANGUAGES as readonly string[]).includes(value);
}
