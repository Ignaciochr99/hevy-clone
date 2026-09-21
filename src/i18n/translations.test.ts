import { EQUIPMENT, EXERCISE_TYPES, MUSCLE_GROUPS } from '../db/enums';
import { REPOSITORY_ERROR_CODES, RepositoryError } from '../repositories/errors';
import { translate, translateError, translations, type TranslationKey } from './translations';

const placeholders = (text: string) => (text.match(/\{\w+\}/g) ?? []).sort();

describe('translate', () => {
  test('devuelve el texto en cada idioma', () => {
    expect(translate('es', 'tabs.home')).toBe('Inicio');
    expect(translate('en', 'tabs.home')).toBe('Home');
  });

  test('sustituye los marcadores por los datos', () => {
    expect(translate('es', 'workoutDetail.title', { id: 7 })).toBe('Entrenamiento #7');
    expect(translate('en', 'form.deleteConfirm', { name: 'Mi press' })).toBe('Delete "Mi press"?');
  });

  test('deja el marcador tal cual si falta el dato', () => {
    expect(translate('en', 'workoutDetail.title')).toBe('Workout #{id}');
    expect(translate('en', 'workoutDetail.title', { other: 1 })).toBe('Workout #{id}');
  });
});

describe('diccionarios', () => {
  const keys = Object.keys(translations.es) as TranslationKey[];

  test('tienen exactamente las mismas claves', () => {
    expect(Object.keys(translations.en).sort()).toEqual([...keys].sort());
  });

  test('ningún texto está vacío', () => {
    for (const language of ['es', 'en'] as const) {
      for (const key of keys) {
        expect(translations[language][key].trim()).not.toBe('');
      }
    }
  });

  test('los marcadores son los mismos en los dos idiomas', () => {
    for (const key of keys) {
      expect(placeholders(translations.en[key])).toEqual(placeholders(translations.es[key]));
    }
  });

  test('hay etiqueta para cada grupo muscular, equipo y tipo de ejercicio', () => {
    for (const group of MUSCLE_GROUPS) expect(keys).toContain(`muscle.${group}`);
    for (const equipment of EQUIPMENT) expect(keys).toContain(`equipment.${equipment}`);
    for (const type of EXERCISE_TYPES) expect(keys).toContain(`exerciseType.${type}`);
  });

  test('hay traducción para cada código de error de los repositorios', () => {
    for (const code of REPOSITORY_ERROR_CODES) expect(keys).toContain(`error.${code}`);
  });
});

describe('translateError', () => {
  test('traduce un error con código', () => {
    const error = new RepositoryError('exercise.notFound', 'Ejercicio no encontrado');
    expect(translateError('en', error)).toBe('Exercise not found');
    expect(translateError('es', error)).toBe('Ejercicio no encontrado');
  });

  test('un error sin código da el mensaje genérico', () => {
    expect(translateError('en', new Error('algo raro'))).toBe(translate('en', 'error.unknown'));
    expect(translateError('es', 'texto')).toBe(translate('es', 'error.unknown'));
  });
});
