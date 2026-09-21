import { exerciseDisplayName } from './exerciseName';

const library = { name: 'Aperturas con mancuernas', nameEn: 'Dumbbell Fly' };
const custom = { name: 'Mi ejercicio', nameEn: null };

describe('exerciseDisplayName', () => {
  test('en español usa siempre el nombre en español', () => {
    expect(exerciseDisplayName(library, 'es')).toBe('Aperturas con mancuernas');
    expect(exerciseDisplayName(custom, 'es')).toBe('Mi ejercicio');
  });

  test('en inglés usa el nombre en inglés si existe', () => {
    expect(exerciseDisplayName(library, 'en')).toBe('Dumbbell Fly');
  });

  test('en inglés, sin nombre en inglés, usa el nombre que tiene', () => {
    expect(exerciseDisplayName(custom, 'en')).toBe('Mi ejercicio');
  });
});
