import { RepositoryError, repositoryErrorCode } from './errors';

describe('repositoryErrorCode', () => {
  test('devuelve el código de un RepositoryError', () => {
    const error = new RepositoryError('exercise.notFound', 'Ejercicio no encontrado');
    expect(repositoryErrorCode(error)).toBe('exercise.notFound');
    expect(error.message).toBe('Ejercicio no encontrado');
  });

  test('devuelve undefined para un error corriente', () => {
    expect(repositoryErrorCode(new Error('otro'))).toBeUndefined();
  });

  test('devuelve undefined para valores que no son errores', () => {
    expect(repositoryErrorCode(null)).toBeUndefined();
    expect(repositoryErrorCode(undefined)).toBeUndefined();
    expect(repositoryErrorCode('exercise.notFound')).toBeUndefined();
  });

  test('ignora un code que no está en la lista', () => {
    expect(repositoryErrorCode({ code: 'algo.raro' })).toBeUndefined();
    expect(repositoryErrorCode({ code: 42 })).toBeUndefined();
  });

  test('reconoce el error por su forma, no por su clase', () => {
    expect(repositoryErrorCode({ code: 'routine.notFound' })).toBe('routine.notFound');
  });
});
