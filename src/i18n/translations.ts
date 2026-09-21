import { repositoryErrorCode } from '../repositories/errors';
import type { MuscleVolume } from '../utils/muscleVolume';
import { formatNumber } from '../utils/format';
import type { Language } from './language';

// Diccionario en español: define qué claves existen. El de inglés se declara
// como Record<TranslationKey, string>, así TypeScript avisa si falta alguna.
const es = {
  'tabs.home': 'Inicio',
  'tabs.routines': 'Rutinas',
  'tabs.profile': 'Perfil',

  'home.thisWeek': 'Esta semana',
  'home.stat.workouts': 'Entrenos',
  'home.stat.time': 'Tiempo',
  'home.stat.volume': 'Volumen',
  'home.recent': 'Recientes',
  'home.empty': 'Aún no has entrenado. Empieza un entrenamiento desde la pestaña Rutinas.',
  'workoutDetail.header': 'Entrenamiento',
  'workoutDetail.notFound': 'Este entrenamiento ya no existe',
  'workoutDetail.delete': 'Borrar entrenamiento',
  'workoutDetail.deleteTitle': 'Borrar entrenamiento',
  'workoutDetail.deleteConfirm': 'Se borrará "{name}" del historial. No se puede deshacer.',
  'workoutDetail.setWeightReps': '{weight} kg × {reps}',
  'workoutDetail.setReps': '{reps} reps',

  'routines.create': 'Crear rutina',
  'routineEditor.header': 'Nueva rutina',
  'routines.empty': 'Aún no tienes rutinas. ¡Crea la primera!',
  'routines.exerciseCount.one': '1 ejercicio',
  'routines.exerciseCount.other': '{count} ejercicios',
  'routines.setCount.one': '1 serie',
  'routines.setCount.other': '{count} series',
  'routineEditor.rpe': 'RPE',
  'routineEditor.rest': 'Descanso',
  'routines.muscleVolume': 'Series por músculo',
  'routines.muscleVolumeHint': 'Grupo principal: 1 por serie · secundario: 0,5 por serie',
  'routines.pickHeader': 'Elegir ejercicio',
  'routineEditor.editHeader': 'Rutina',
  'routineEditor.name': 'Nombre de la rutina',
  'routineEditor.namePlaceholder': 'Por ejemplo: Día de pecho',
  'routineEditor.exercises': 'Ejercicios',
  'routineEditor.noExercises': 'Aún no hay ejercicios en esta rutina',
  'routineEditor.addExercise': 'Añadir ejercicio',
  'routineEditor.sets': 'Series',
  'routineEditor.reps': 'Repeticiones',
  'routineEditor.moveUp': 'Subir',
  'routineEditor.moveDown': 'Bajar',
  'routineEditor.remove': 'Quitar de la rutina',
  'routineEditor.deleteTitle': 'Eliminar rutina',
  'routineEditor.deleteConfirm': '¿Eliminar "{name}"?',

  'profile.placeholder': 'Aquí irán tus estadísticas y ajustes',
  'profile.exerciseLibrary': 'Biblioteca de ejercicios',
  'profile.language': 'Idioma',

  'exercises.header': 'Ejercicios',
  'exercises.newHeader': 'Nuevo ejercicio',
  'exercises.detailHeader': 'Ejercicio',

  'picker.search': 'Buscar ejercicio',
  'picker.allMuscles': 'Todos los músculos',
  'picker.allEquipment': 'Todo el equipo',
  'picker.create': 'Crear ejercicio propio',
  'picker.empty': 'No hay ejercicios con esos filtros',
  'picker.custom': 'Propio',
  'picker.secondary': 'Secundarios: {muscles}',

  'form.readOnlyNote': 'Es un ejercicio de la biblioteca: no se puede modificar ni eliminar.',
  'form.name': 'Nombre',
  'form.namePlaceholder': 'Por ejemplo: Press inclinado',
  'form.primaryMuscle': 'Grupo muscular principal',
  'form.secondaryMuscles': 'Grupos musculares secundarios',
  'form.equipment': 'Equipo',
  'form.type': 'Tipo',
  'form.save': 'Guardar',
  'form.delete': 'Eliminar',
  'form.deleteTitle': 'Eliminar ejercicio',
  'form.deleteConfirm': '¿Eliminar "{name}"?',
  'form.cancel': 'Cancelar',
  'form.cannotDeleteTitle': 'No se puede eliminar',

  'db.errorTitle': 'No se pudo abrir la base de datos',

  'common.errorTitle': 'Error',
  'routines.startEmpty': 'Entrenamiento vacío',
  'routines.start': 'Empezar',
  'workout.header': 'Entrenamiento',
  'workout.defaultName': 'Entrenamiento',
  'workout.inProgress': 'Entrenamiento en curso',
  'workout.finish': 'Terminar',
  'workout.finishTitle': 'Terminar entrenamiento',
  'workout.finishIncomplete': 'Series sin completar: {count}. Se descartarán al guardar.',
  'workout.finishConfirm': 'Terminar y guardar',
  'workout.nothingToSaveTitle': 'Nada que guardar',
  'workout.saved': 'Entrenamiento guardado',
  'workout.discard': 'Descartar entrenamiento',
  'workout.discardTitle': 'Descartar entrenamiento',
  'workout.discardConfirm': 'Se perderá todo lo registrado. ¿Descartar?',
  'workout.alreadyActiveTitle': 'Entrenamiento en curso',
  'workout.continue': 'Continuar',
  'workout.empty': 'Añade un ejercicio para empezar',
  'workout.addExercise': 'Añadir ejercicio',
  'workout.addSet': 'Añadir serie',
  'workout.removeExercise': 'Quitar ejercicio',
  'workout.removeExerciseConfirm': '¿Quitar "{name}" del entrenamiento?',
  'workout.removeSet': 'Quitar serie',
  'workout.setType': 'Cambiar el tipo de serie',
  'workout.setShort.warmup': 'C',
  'workout.setShort.failure': 'F',
  'workout.column.set': 'SERIE',
  'workout.column.weight': 'KG',
  'workout.column.reps': 'REPS',
  'workout.column.time': 'SEG',
  'workout.completeSet': 'Completar serie',
  'workout.rest': 'Descanso',
  'workout.restLess': 'Restar 15 segundos',
  'workout.restMore': 'Sumar 15 segundos',
  'workout.restSkip': 'Saltar',

  'muscle.chest': 'Pecho',
  'muscle.back': 'Espalda',
  'muscle.shoulders': 'Hombros',
  'muscle.biceps': 'Bíceps',
  'muscle.triceps': 'Tríceps',
  'muscle.forearms': 'Antebrazos',
  'muscle.abs': 'Abdomen',
  'muscle.quadriceps': 'Cuádriceps',
  'muscle.hamstrings': 'Isquiotibiales',
  'muscle.glutes': 'Glúteos',
  'muscle.calves': 'Pantorrillas',
  'muscle.full_body': 'Cuerpo completo',
  'muscle.cardio': 'Cardio',

  'equipment.barbell': 'Barra',
  'equipment.dumbbell': 'Mancuernas',
  'equipment.machine': 'Máquina',
  'equipment.cable': 'Polea',
  'equipment.bodyweight': 'Peso corporal',
  'equipment.kettlebell': 'Kettlebell',
  'equipment.band': 'Banda elástica',
  'equipment.other': 'Otro',

  'exerciseType.weight_reps': 'Peso y repeticiones',
  'exerciseType.reps_only': 'Solo repeticiones',
  'exerciseType.duration': 'Duración',

  'error.exercise.nameEmpty': 'El nombre del ejercicio no puede estar vacío',
  'error.exercise.notFound': 'Ejercicio no encontrado',
  'error.exercise.libraryReadOnly': 'Los ejercicios de la biblioteca no se pueden modificar',
  'error.exercise.inUse': 'El ejercicio se usa en alguna rutina o entrenamiento',
  'error.exercise.secondaryIncludesPrimary':
    'El grupo secundario no puede ser el mismo que el principal',
  'error.routine.nameEmpty': 'El nombre de la rutina no puede estar vacío',
  'error.routine.notFound': 'Rutina no encontrada',
  'error.routine.invalidSets': 'Las series objetivo deben ser un entero mayor que 0',
  'error.routine.invalidReps': 'Las repeticiones objetivo deben ser un entero mayor que 0',
  'error.routine.invalidRpe': 'El RPE debe estar entre 1 y 10, en pasos de 0,5',
  'error.routine.invalidRest': 'El descanso debe ser un número entero de segundos entre 0 y 3600',
  'error.workout.notFound': 'Entrenamiento no encontrado',
  'error.workout.alreadyActive': 'Ya tienes un entrenamiento en curso',
  'error.workout.nothingCompleted': 'No hay ninguna serie completada',
  'error.workout.invalidSetValue': 'El valor de la serie no es válido',
  'error.unknown': 'Ocurrió un error inesperado',
};

export type TranslationKey = keyof typeof es;

const en: Record<TranslationKey, string> = {
  'tabs.home': 'Home',
  'tabs.routines': 'Routines',
  'tabs.profile': 'Profile',

  'home.thisWeek': 'This week',
  'home.stat.workouts': 'Workouts',
  'home.stat.time': 'Time',
  'home.stat.volume': 'Volume',
  'home.recent': 'Recent',
  'home.empty': "You haven't trained yet. Start a workout from the Routines tab.",
  'workoutDetail.header': 'Workout',
  'workoutDetail.notFound': 'This workout no longer exists',
  'workoutDetail.delete': 'Delete workout',
  'workoutDetail.deleteTitle': 'Delete workout',
  'workoutDetail.deleteConfirm': '"{name}" will be deleted from your history. This cannot be undone.',
  'workoutDetail.setWeightReps': '{weight} kg × {reps}',
  'workoutDetail.setReps': '{reps} reps',

  'routines.create': 'Create routine',
  'routineEditor.header': 'New routine',
  'routines.empty': "You don't have any routines yet. Create your first one!",
  'routines.exerciseCount.one': '1 exercise',
  'routines.exerciseCount.other': '{count} exercises',
  'routines.setCount.one': '1 set',
  'routines.setCount.other': '{count} sets',
  'routineEditor.rpe': 'RPE',
  'routineEditor.rest': 'Rest',
  'routines.muscleVolume': 'Sets per muscle',
  'routines.muscleVolumeHint': 'Primary muscle: 1 per set · secondary: 0.5 per set',
  'routines.pickHeader': 'Choose exercise',
  'routineEditor.editHeader': 'Routine',
  'routineEditor.name': 'Routine name',
  'routineEditor.namePlaceholder': 'For example: Chest day',
  'routineEditor.exercises': 'Exercises',
  'routineEditor.noExercises': 'No exercises in this routine yet',
  'routineEditor.addExercise': 'Add exercise',
  'routineEditor.sets': 'Sets',
  'routineEditor.reps': 'Reps',
  'routineEditor.moveUp': 'Move up',
  'routineEditor.moveDown': 'Move down',
  'routineEditor.remove': 'Remove from routine',
  'routineEditor.deleteTitle': 'Delete routine',
  'routineEditor.deleteConfirm': 'Delete "{name}"?',

  'profile.placeholder': 'Your stats and settings will go here',
  'profile.exerciseLibrary': 'Exercise library',
  'profile.language': 'Language',

  'exercises.header': 'Exercises',
  'exercises.newHeader': 'New exercise',
  'exercises.detailHeader': 'Exercise',

  'picker.search': 'Search exercises',
  'picker.allMuscles': 'All muscles',
  'picker.allEquipment': 'All equipment',
  'picker.create': 'Create custom exercise',
  'picker.empty': 'No exercises match these filters',
  'picker.custom': 'Custom',
  'picker.secondary': 'Secondary: {muscles}',

  'form.readOnlyNote': 'This is a library exercise: it cannot be edited or deleted.',
  'form.name': 'Name',
  'form.namePlaceholder': 'For example: Incline press',
  'form.primaryMuscle': 'Primary muscle group',
  'form.secondaryMuscles': 'Secondary muscle groups',
  'form.equipment': 'Equipment',
  'form.type': 'Type',
  'form.save': 'Save',
  'form.delete': 'Delete',
  'form.deleteTitle': 'Delete exercise',
  'form.deleteConfirm': 'Delete "{name}"?',
  'form.cancel': 'Cancel',
  'form.cannotDeleteTitle': "Can't delete",

  'db.errorTitle': 'Could not open the database',

  'common.errorTitle': 'Error',
  'routines.startEmpty': 'Empty workout',
  'routines.start': 'Start',
  'workout.header': 'Workout',
  'workout.defaultName': 'Workout',
  'workout.inProgress': 'Workout in progress',
  'workout.finish': 'Finish',
  'workout.finishTitle': 'Finish workout',
  'workout.finishIncomplete': 'Incomplete sets: {count}. They will be discarded when saving.',
  'workout.finishConfirm': 'Finish and save',
  'workout.nothingToSaveTitle': 'Nothing to save',
  'workout.saved': 'Workout saved',
  'workout.discard': 'Discard workout',
  'workout.discardTitle': 'Discard workout',
  'workout.discardConfirm': 'Everything you logged will be lost. Discard?',
  'workout.alreadyActiveTitle': 'Workout in progress',
  'workout.continue': 'Continue',
  'workout.empty': 'Add an exercise to get started',
  'workout.addExercise': 'Add exercise',
  'workout.addSet': 'Add set',
  'workout.removeExercise': 'Remove exercise',
  'workout.removeExerciseConfirm': 'Remove "{name}" from the workout?',
  'workout.removeSet': 'Remove set',
  'workout.setType': 'Change set type',
  'workout.setShort.warmup': 'W',
  'workout.setShort.failure': 'F',
  'workout.column.set': 'SET',
  'workout.column.weight': 'KG',
  'workout.column.reps': 'REPS',
  'workout.column.time': 'SEC',
  'workout.completeSet': 'Complete set',
  'workout.rest': 'Rest',
  'workout.restLess': 'Subtract 15 seconds',
  'workout.restMore': 'Add 15 seconds',
  'workout.restSkip': 'Skip',

  'muscle.chest': 'Chest',
  'muscle.back': 'Back',
  'muscle.shoulders': 'Shoulders',
  'muscle.biceps': 'Biceps',
  'muscle.triceps': 'Triceps',
  'muscle.forearms': 'Forearms',
  'muscle.abs': 'Abs',
  'muscle.quadriceps': 'Quadriceps',
  'muscle.hamstrings': 'Hamstrings',
  'muscle.glutes': 'Glutes',
  'muscle.calves': 'Calves',
  'muscle.full_body': 'Full body',
  'muscle.cardio': 'Cardio',

  'equipment.barbell': 'Barbell',
  'equipment.dumbbell': 'Dumbbell',
  'equipment.machine': 'Machine',
  'equipment.cable': 'Cable',
  'equipment.bodyweight': 'Bodyweight',
  'equipment.kettlebell': 'Kettlebell',
  'equipment.band': 'Resistance band',
  'equipment.other': 'Other',

  'exerciseType.weight_reps': 'Weight & reps',
  'exerciseType.reps_only': 'Reps only',
  'exerciseType.duration': 'Duration',

  'error.exercise.nameEmpty': 'The exercise name cannot be empty',
  'error.exercise.notFound': 'Exercise not found',
  'error.exercise.libraryReadOnly': 'Library exercises cannot be modified',
  'error.exercise.inUse': 'This exercise is used in a routine or workout',
  'error.exercise.secondaryIncludesPrimary':
    'A secondary muscle group cannot be the same as the primary one',
  'error.routine.nameEmpty': 'The routine name cannot be empty',
  'error.routine.notFound': 'Routine not found',
  'error.routine.invalidSets': 'Target sets must be a whole number greater than 0',
  'error.routine.invalidReps': 'Target reps must be a whole number greater than 0',
  'error.routine.invalidRpe': 'RPE must be between 1 and 10, in steps of 0.5',
  'error.routine.invalidRest': 'Rest must be a whole number of seconds between 0 and 3600',
  'error.workout.notFound': 'Workout not found',
  'error.workout.alreadyActive': 'You already have a workout in progress',
  'error.workout.nothingCompleted': 'No sets have been completed',
  'error.workout.invalidSetValue': 'The set value is not valid',
  'error.unknown': 'An unexpected error occurred',
};

export const translations: Record<Language, Record<TranslationKey, string>> = { es, en };

export type TranslationParams = Record<string, string | number>;

// Devuelve el texto de `key` en `language`, sustituyendo los marcadores {nombre}
// por los datos de `params`. Si falta un dato, el marcador se deja tal cual.
export function translate(
  language: Language,
  key: TranslationKey,
  params?: TranslationParams,
): string {
  const text = translations[language][key];
  if (!params) {
    return text;
  }
  return text.replace(/\{(\w+)\}/g, (placeholder, name: string) =>
    name in params ? String(params[name]) : placeholder,
  );
}

// Traduce el error de un repositorio según su código; cualquier otro error
// muestra el mensaje genérico.
export function translateError(language: Language, error: unknown): string {
  const code = repositoryErrorCode(error);
  return translate(language, code ? `error.${code}` : 'error.unknown');
}

// "4 ejercicios · 14 series" (con singular y plural en cada idioma).
export function routineSummary(language: Language, exercises: number, sets: number): string {
  const exerciseText = translate(
    language,
    exercises === 1 ? 'routines.exerciseCount.one' : 'routines.exerciseCount.other',
    { count: exercises },
  );
  const setText = translate(
    language,
    sets === 1 ? 'routines.setCount.one' : 'routines.setCount.other',
    { count: sets },
  );
  return `${exerciseText} · ${setText}`;
}

// "Pecho 9 · Tríceps 4,5": las series de cada músculo, de más a menos.
export function muscleVolumeSummary(language: Language, volume: readonly MuscleVolume[]): string {
  return volume
    .map(
      (item) =>
        `${translate(language, `muscle.${item.muscleGroup}`)} ${formatNumber(item.sets, language)}`,
    )
    .join(' · ');
}
