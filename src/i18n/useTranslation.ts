import { useCallback } from 'react';
import { useSettings } from '../stores/settings';
import { translate, type TranslationKey, type TranslationParams } from './translations';

// Devuelve `t` (traduce una clave) y el idioma activo. Al cambiar el idioma en
// Perfil, el store avisa y todas las pantallas que usan este hook se redibujan.
export function useTranslation() {
  const language = useSettings((state) => state.language);
  const t = useCallback(
    (key: TranslationKey, params?: TranslationParams) => translate(language, key, params),
    [language],
  );
  return { t, language };
}
