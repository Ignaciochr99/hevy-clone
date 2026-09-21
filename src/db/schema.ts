import { index, integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { EQUIPMENT, EXERCISE_TYPES, MUSCLE_GROUPS, SET_TYPES, type MuscleGroup } from './enums';

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
    // RPE objetivo (1 a 10, en pasos de 0,5); null si no se fija.
    targetRpe: real('target_rpe'),
    // Descanso entre series, en segundos. 90 debe coincidir con DEFAULT_REST_SECONDS.
    restSeconds: integer('rest_seconds').notNull().default(90),
  },
  (table) => [index('routine_exercises_routine_idx').on(table.routineId)],
);

// Ajustes de la app en formato clave-valor (idioma ahora; unidades en la Fase 9).
export const settings = sqliteTable('settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
});

// Un entrenamiento. Mientras no tiene `finished_at` es el entrenamiento en
// curso (como mucho hay uno). Es una COPIA de la rutina de la que salió: si la
// rutina se borra, `routine_id` pasa a null y el entrenamiento se conserva.
export const workouts = sqliteTable('workouts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  routineId: integer('routine_id').references(() => routines.id, { onDelete: 'set null' }),
  startedAt: integer('started_at', { mode: 'timestamp_ms' }).notNull(),
  finishedAt: integer('finished_at', { mode: 'timestamp_ms' }),
});

export const workoutExercises = sqliteTable(
  'workout_exercises',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    workoutId: integer('workout_id')
      .notNull()
      .references(() => workouts.id, { onDelete: 'cascade' }),
    exerciseId: integer('exercise_id')
      .notNull()
      .references(() => exercises.id, { onDelete: 'restrict' }),
    position: integer('position').notNull(),
    // Descanso entre series de este ejercicio, copiado de la rutina (segundos).
    restSeconds: integer('rest_seconds').notNull().default(90),
  },
  (table) => [index('workout_exercises_workout_idx').on(table.workoutId)],
);

export const sets = sqliteTable(
  'sets',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    workoutExerciseId: integer('workout_exercise_id')
      .notNull()
      .references(() => workoutExercises.id, { onDelete: 'cascade' }),
    position: integer('position').notNull(),
    type: text('type', { enum: SET_TYPES }).notNull().default('normal'),
    // Peso en kg (la conversión a lb llega en la Fase 9), repeticiones o duración
    // en segundos, según el tipo del ejercicio. Vacíos hasta que se rellenan.
    weight: real('weight'),
    reps: integer('reps'),
    durationSeconds: integer('duration_seconds'),
    completed: integer('completed', { mode: 'boolean' }).notNull().default(false),
  },
  (table) => [index('sets_workout_exercise_idx').on(table.workoutExerciseId)],
);
