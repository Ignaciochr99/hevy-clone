import type { BaseSQLiteDatabase } from 'drizzle-orm/sqlite-core';
import type * as schema from './schema';

// Tipo común que aceptan los repositorios. Lo cumplen tanto la base real
// (expo-sqlite, en la app) como la de tests (better-sqlite3, en memoria).
export type Database = BaseSQLiteDatabase<'sync', unknown, typeof schema>;
