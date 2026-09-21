import { muscleVolume, PRIMARY_WEIGHT, SECONDARY_WEIGHT } from './muscleVolume';

const bench = { muscleGroup: 'chest', secondaryMuscleGroups: ['triceps', 'shoulders'], targetSets: 3 } as const;
const dip = { muscleGroup: 'triceps', secondaryMuscleGroups: ['chest', 'shoulders'], targetSets: 4 } as const;
const curl = { muscleGroup: 'biceps', secondaryMuscleGroups: [], targetSets: 3 } as const;

describe('muscleVolume', () => {
  test('el grupo principal suma 1 por serie y cada secundario 0,5', () => {
    expect([PRIMARY_WEIGHT, SECONDARY_WEIGHT]).toEqual([1, 0.5]);
    expect(muscleVolume([bench])).toEqual([
      { muscleGroup: 'chest', sets: 3 },
      { muscleGroup: 'shoulders', sets: 1.5 },
      { muscleGroup: 'triceps', sets: 1.5 },
    ]);
  });

  test('los ejercicios se acumulan, incluso un grupo que es principal en uno y secundario en otro', () => {
    // pecho: 3 (principal) + 4 × 0,5 (secundario) = 5
    // tríceps: 3 × 0,5 + 4 (principal) = 5,5
    // hombros: 3 × 0,5 + 4 × 0,5 = 3,5
    expect(muscleVolume([bench, dip])).toEqual([
      { muscleGroup: 'triceps', sets: 5.5 },
      { muscleGroup: 'chest', sets: 5 },
      { muscleGroup: 'shoulders', sets: 3.5 },
    ]);
  });

  test('el mismo ejercicio dos veces suma las series de ambas filas', () => {
    expect(muscleVolume([curl, curl])).toEqual([{ muscleGroup: 'biceps', sets: 6 }]);
  });

  test('ordena de más a menos series, y en empate por el orden habitual de los grupos', () => {
    const result = muscleVolume([curl, { ...curl, muscleGroup: 'back' }]);
    expect(result.map((item) => item.muscleGroup)).toEqual(['back', 'biceps']);
  });

  test('una lista vacía no da ningún músculo', () => {
    expect(muscleVolume([])).toEqual([]);
  });

  test('un ejercicio con 0 series no suma nada', () => {
    expect(muscleVolume([{ ...bench, targetSets: 0 }])).toEqual([]);
  });

  test('no modifica lo que recibe', () => {
    const input = [{ ...bench, secondaryMuscleGroups: [...bench.secondaryMuscleGroups] }];
    const snapshot = JSON.parse(JSON.stringify(input));
    muscleVolume(input);
    expect(input).toEqual(snapshot);
  });
});
