// Cada regla de negocio que un repositorio puede violar tiene un código estable.
// El `message` sigue en español (para registros y tests); la interfaz traduce
// según el `code` (ver src/i18n).
export const REPOSITORY_ERROR_CODES = [
  'exercise.nameEmpty',
  'exercise.notFound',
  'exercise.libraryReadOnly',
  'exercise.inUse',
  'exercise.secondaryIncludesPrimary',
  'routine.nameEmpty',
  'routine.notFound',
  'routine.invalidSets',
  'routine.invalidReps',
  'routine.invalidRpe',
  'routine.invalidRest',
] as const;

export type RepositoryErrorCode = (typeof REPOSITORY_ERROR_CODES)[number];

export class RepositoryError extends Error {
  readonly code: RepositoryErrorCode;

  constructor(code: RepositoryErrorCode, message: string) {
    super(message);
    this.name = 'RepositoryError';
    this.code = code;
  }
}

const KNOWN_CODES: ReadonlySet<string> = new Set(REPOSITORY_ERROR_CODES);

// Reconoce el error por su forma (tiene un `code` válido) y no con instanceof:
// así no dependemos de cómo el motor de JavaScript trate las subclases de Error.
export function repositoryErrorCode(error: unknown): RepositoryErrorCode | undefined {
  if (typeof error !== 'object' || error === null || !('code' in error)) {
    return undefined;
  }
  const { code } = error;
  return typeof code === 'string' && KNOWN_CODES.has(code) ? (code as RepositoryErrorCode) : undefined;
}
