import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { EQUIPMENT, EXERCISE_TYPES, MUSCLE_GROUPS, type MuscleGroup } from './enums';

export const exercises = sqliteTable('exercises', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  // Identificador estable de los ejercicios precargados; null en los propios.
  slug: text('slug').unique(),
  // Nombre en español (o el que escribió el usuario en un ejercicio propio).
  name: text('name').notNull(),
  // Nombre en inglés; solo los precargados lo tienen.
  nameEn: text('name_en'),
  muscleGroup: text('muscle_group', { enum: MUSCLE_GROUPS }).notNull(),
  // Lista de grupos secundarios, guardada como JSON: '["triceps","shoulders"]'.
  secondaryMuscleGroups: text('secondary_muscle_groups', { mode: 'json' })
    .$type<MuscleGroup[]>()
    .notNull()
    .default([]),
  equipment: text('equipment', { enum: EQUIPMENT }).notNull(),
  type: text('type', { enum: EXERCISE_TYPES }).notNull(),
  isCustom: integer('is_custom', { mode: 'boolean' }).notNull().default(false),
});

export const routines = sqliteTable('routines', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
});

export const routineExercises = sqliteTable(
  'routine_exercises',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    routineId: integer('routine_id')
      .notNull()
      .references(() => routines.id, { onDelete: 'cascade' }),
    exerciseId: integer('exercise_id')
      .notNull()
      .references(() => exercises.id, { onDelete: 'restrict' }),
    position: integer('position').notNull(),
    targetSets: integer('target_sets').notNull(),
    targetReps: integer('target_reps').notNull(),
  },
  (table) => [index('routine_exercises_routine_idx').on(table.routineId)],
);

// Ajustes de la app en formato clave-valor (idioma ahora; unidades en la Fase 9).
export const settings = sqliteTable('settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
});
