// Ejecuta una función que debe lanzar y devuelve lo que lanzó (para comprobar
// el código del error, no solo su mensaje).
export function catchError(fn: () => unknown): unknown {
  try {
    fn();
  } catch (error) {
    return error;
  }
  throw new Error('Se esperaba que la función lanzara un error');
}
