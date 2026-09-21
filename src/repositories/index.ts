import { db } from '../db/client';
import { createExercisesRepository } from './exercises';
import { createRoutinesRepository } from './routines';
import { createSettingsRepository } from './settings';
import { createWorkoutsRepository } from './workouts';

// Los repositorios de la app, conectados a la base real. Las pantallas y los
// stores importan este objeto; los tests crean sus propios repositorios sobre
// una base en memoria.
export const repositories = {
  exercises: createExercisesRepository(db),
  routines: createRoutinesRepository(db),
  settings: createSettingsRepository(db),
  workouts: createWorkoutsRepository(db),
};
