import { is, sql } from 'drizzle-orm';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { getTableConfig, SQLiteTable } from 'drizzle-orm/sqlite-core';
import { createTestDb } from './createTestDb';
import * as schema from './schema';

describe('migraciones', () => {
  test('cada tabla del esquema existe con exactamente las mismas columnas', () => {
    const db = createTestDb();
    const exported: unknown[] = Object.values(schema);
    const tables = exported.filter((value): value is SQLiteTable => is(value, SQLiteTable));
    expect(tables).toHaveLength(4);

    for (const table of tables) {
      const config = getTableConfig(table);
      const rows = db.all<{ name: string }>(sql.raw(`PRAGMA table_info(\`${config.name}\`)`));
      expect(rows.map((row) => row.name).sort()).toEqual(
        config.columns.map((column) => column.name).sort(),
      );
    }
  });

  test('se pueden aplicar dos veces (la app las ejecuta en cada arranque)', () => {
    const db = createTestDb();
    expect(() => migrate(db, { migrationsFolder: './drizzle' })).not.toThrow();
  });

  test('las claves foráneas están activadas', () => {
    const db = createTestDb();
    const [row] = db.all<{ foreign_keys: number }>(sql.raw('PRAGMA foreign_keys'));
    expect(row.foreign_keys).toBe(1);
  });
});
