import { repositories } from '../repositories';
import { createSettingsStore } from './createSettingsStore';

// El store de ajustes de la app, conectado a la base real. Las pantallas lo
// leen con un selector: `const language = useSettings((s) => s.language)`.
export const useSettings = createSettingsStore(repositories.settings);
