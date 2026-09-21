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

// El volumen (kg) con como máximo un decimal y los miles separados: "12.500 kg"
// en español y "12,500 kg" en inglés. Cuando llegue la conversión a lb (Fase 9)
// esta función recibirá el número ya convertido y la unidad.
export function formatVolume(kg: number, language: Language): string {
  const [integer, decimal] = String(Math.round(kg * 10) / 10).split('.');
  const thousands = language === 'es' ? '.' : ',';
  const grouped = integer.replace(/\B(?=(\d{3})+(?!\d))/g, thousands);
  return `${decimal === undefined ? grouped : `${grouped}${language === 'es' ? ',' : '.'}${decimal}`} kg`;
}
