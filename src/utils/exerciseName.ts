import type { Language } from '../i18n/language';

// Los ejercicios precargados tienen nombre en español y en inglés; los propios
// solo el que escribió el usuario, que se muestra en cualquier idioma.
export function exerciseDisplayName(
  exercise: { name: string; nameEn: string | null },
  language: Language,
): string {
  return language === 'en' && exercise.nameEn ? exercise.nameEn : exercise.name;
}
