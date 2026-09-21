import { eq } from 'drizzle-orm';
import { settings } from '../db/schema';
import type { Database } from '../db/types';

export function createSettingsRepository(db: Database) {
  return {
    get(key: string): string | undefined {
      return db.select({ value: settings.value }).from(settings).where(eq(settings.key, key)).get()
        ?.value;
    },

    // Si la clave ya existe, reemplaza el valor.
    set(key: string, value: string): void {
      db.insert(settings)
        .values({ key, value })
        .onConflictDoUpdate({ target: settings.key, set: { value } })
        .run();
    },
  };
}

export type SettingsRepository = ReturnType<typeof createSettingsRepository>;
