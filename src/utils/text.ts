const ACCENTS: Record<string, string> = {
  á: 'a',
  é: 'e',
  í: 'i',
  ó: 'o',
  ú: 'u',
  ü: 'u',
  ñ: 'n',
};

// Minúsculas y sin acentos: "elevacion" encuentra "Elevación".
export function normalizeSearch(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[áéíóúüñ]/g, (char) => ACCENTS[char]);
}
