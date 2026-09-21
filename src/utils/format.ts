import type { Language } from '../i18n/language';

// El RPE tal como se muestra: "—" si no hay, y el decimal con coma en español
// y con punto en inglés (8,5 / 8.5).
export function formatRpe(rpe: number | null, language: Language): string {
  if (rpe === null) {
    return '—';
  }
  const text = String(rpe);
  return language === 'es' ? text.replace('.', ',') : text;
}
