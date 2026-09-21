import type { Language } from '../i18n/language';

// Un número con el decimal como se escribe en cada idioma: coma en español
// (4,5) y punto en inglés (4.5). Los enteros salen sin decimales.
export function formatNumber(value: number, language: Language): string {
  const text = String(value);
  return language === 'es' ? text.replace('.', ',') : text;
}

// El RPE tal como se muestra: "—" si no hay.
export function formatRpe(rpe: number | null, language: Language): string {
  return rpe === null ? '—' : formatNumber(rpe, language);
}
