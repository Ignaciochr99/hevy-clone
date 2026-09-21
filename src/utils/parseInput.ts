// Interpreta lo que el usuario escribe en un campo numérico. Un campo vacío es
// un valor válido (null: "sin rellenar"); lo que no se entiende es inválido y
// quien llama decide qué hacer (normalmente, no guardarlo).
export type Parsed = { valid: true; value: number | null } | { valid: false };

// Número con decimales no negativo. Acepta coma o punto ("82,5" y "82.5") y un
// punto al final mientras se está escribiendo ("5.").
export function parseDecimal(text: string): Parsed {
  const trimmed = text.trim();
  if (trimmed === '') {
    return { valid: true, value: null };
  }
  if (!/^\d*[.,]?\d*$/.test(trimmed) || !/\d/.test(trimmed)) {
    return { valid: false };
  }
  return { valid: true, value: parseFloat(trimmed.replace(',', '.')) };
}

// Entero no negativo.
export function parseInteger(text: string): Parsed {
  const trimmed = text.trim();
  if (trimmed === '') {
    return { valid: true, value: null };
  }
  if (!/^\d+$/.test(trimmed)) {
    return { valid: false };
  }
  return { valid: true, value: parseInt(trimmed, 10) };
}
