import type { Language } from '../i18n/language';

// Los nombres van escritos a mano (no con Intl) para que el resultado sea el
// mismo en el teléfono y en los tests, sin depender de los datos de idioma del
// motor de JavaScript. Empiezan en domingo, como getDay().
const WEEKDAYS: Record<Language, string[]> = {
  es: ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'],
  en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
};

const MONTHS: Record<Language, string[]> = {
  es: ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'],
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
};

// "lun 21 sep" en español y "Mon, Sep 21" en inglés, en hora local.
export function formatShortDate(date: Date, language: Language): string {
  const weekday = WEEKDAYS[language][date.getDay()];
  const month = MONTHS[language][date.getMonth()];
  const day = date.getDate();
  return language === 'es' ? `${weekday} ${day} ${month}` : `${weekday}, ${month} ${day}`;
}
