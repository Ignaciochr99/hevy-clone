import { sql } from 'drizzle-orm';
import type { Equipment, ExerciseType, MuscleGroup } from './enums';
import { exercises } from './schema';
import type { Database } from './types';

export type LibraryExercise = {
  slug: string;
  name: string;
  nameEn: string;
  muscleGroup: MuscleGroup;
  secondaryMuscleGroups: MuscleGroup[];
  equipment: Equipment;
  type: ExerciseType;
};

const weight = 'weight_reps' as const;
const reps = 'reps_only' as const;
const time = 'duration' as const;

export const LIBRARY_EXERCISES: readonly LibraryExercise[] = [
  // Pecho
  { slug: 'bench-press-barbell', name: 'Press de banca con barra', nameEn: 'Barbell Bench Press', muscleGroup: 'chest', secondaryMuscleGroups: ['triceps', 'shoulders'], equipment: 'barbell', type: weight },
  { slug: 'incline-bench-press-barbell', name: 'Press inclinado con barra', nameEn: 'Barbell Incline Bench Press', muscleGroup: 'chest', secondaryMuscleGroups: ['shoulders', 'triceps'], equipment: 'barbell', type: weight },
  { slug: 'bench-press-dumbbell', name: 'Press de banca con mancuernas', nameEn: 'Dumbbell Bench Press', muscleGroup: 'chest', secondaryMuscleGroups: ['triceps', 'shoulders'], equipment: 'dumbbell', type: weight },
  { slug: 'incline-bench-press-dumbbell', name: 'Press inclinado con mancuernas', nameEn: 'Dumbbell Incline Bench Press', muscleGroup: 'chest', secondaryMuscleGroups: ['shoulders', 'triceps'], equipment: 'dumbbell', type: weight },
  { slug: 'chest-fly-dumbbell', name: 'Aperturas con mancuernas', nameEn: 'Dumbbell Fly', muscleGroup: 'chest', secondaryMuscleGroups: ['shoulders'], equipment: 'dumbbell', type: weight },
  { slug: 'cable-crossover', name: 'Cruce de poleas', nameEn: 'Cable Crossover', muscleGroup: 'chest', secondaryMuscleGroups: ['shoulders'], equipment: 'cable', type: weight },
  { slug: 'chest-press-machine', name: 'Press de pecho en máquina', nameEn: 'Machine Chest Press', muscleGroup: 'chest', secondaryMuscleGroups: ['triceps', 'shoulders'], equipment: 'machine', type: weight },
  { slug: 'push-up', name: 'Flexiones', nameEn: 'Push-Up', muscleGroup: 'chest', secondaryMuscleGroups: ['triceps', 'shoulders', 'abs'], equipment: 'bodyweight', type: reps },
  // Espalda
  { slug: 'deadlift-barbell', name: 'Peso muerto', nameEn: 'Deadlift', muscleGroup: 'back', secondaryMuscleGroups: ['hamstrings', 'glutes', 'forearms'], equipment: 'barbell', type: weight },
  { slug: 'pull-up', name: 'Dominadas', nameEn: 'Pull-Up', muscleGroup: 'back', secondaryMuscleGroups: ['biceps', 'forearms'], equipment: 'bodyweight', type: reps },
  { slug: 'chin-up', name: 'Dominadas supinas', nameEn: 'Chin-Up', muscleGroup: 'back', secondaryMuscleGroups: ['biceps', 'forearms'], equipment: 'bodyweight', type: reps },
  { slug: 'lat-pulldown', name: 'Jalón al pecho', nameEn: 'Lat Pulldown', muscleGroup: 'back', secondaryMuscleGroups: ['biceps', 'forearms'], equipment: 'cable', type: weight },
  { slug: 'barbell-row', name: 'Remo con barra', nameEn: 'Barbell Row', muscleGroup: 'back', secondaryMuscleGroups: ['biceps', 'shoulders'], equipment: 'barbell', type: weight },
  { slug: 'dumbbell-row', name: 'Remo con mancuerna', nameEn: 'Dumbbell Row', muscleGroup: 'back', secondaryMuscleGroups: ['biceps', 'shoulders'], equipment: 'dumbbell', type: weight },
  { slug: 'seated-cable-row', name: 'Remo sentado en polea', nameEn: 'Seated Cable Row', muscleGroup: 'back', secondaryMuscleGroups: ['biceps', 'shoulders'], equipment: 'cable', type: weight },
  { slug: 'back-extension', name: 'Extensión lumbar', nameEn: 'Back Extension', muscleGroup: 'back', secondaryMuscleGroups: ['glutes', 'hamstrings'], equipment: 'bodyweight', type: reps },
  // Hombros
  { slug: 'overhead-press-barbell', name: 'Press militar con barra', nameEn: 'Barbell Overhead Press', muscleGroup: 'shoulders', secondaryMuscleGroups: ['triceps'], equipment: 'barbell', type: weight },
  { slug: 'overhead-press-dumbbell', name: 'Press militar con mancuernas', nameEn: 'Dumbbell Overhead Press', muscleGroup: 'shoulders', secondaryMuscleGroups: ['triceps'], equipment: 'dumbbell', type: weight },
  { slug: 'lateral-raise-dumbbell', name: 'Elevaciones laterales', nameEn: 'Dumbbell Lateral Raise', muscleGroup: 'shoulders', secondaryMuscleGroups: [], equipment: 'dumbbell', type: weight },
  { slug: 'front-raise-dumbbell', name: 'Elevaciones frontales', nameEn: 'Dumbbell Front Raise', muscleGroup: 'shoulders', secondaryMuscleGroups: ['chest'], equipment: 'dumbbell', type: weight },
  { slug: 'rear-delt-fly-dumbbell', name: 'Pájaros con mancuernas', nameEn: 'Dumbbell Rear Delt Fly', muscleGroup: 'shoulders', secondaryMuscleGroups: ['back'], equipment: 'dumbbell', type: weight },
  { slug: 'shoulder-press-machine', name: 'Press de hombros en máquina', nameEn: 'Machine Shoulder Press', muscleGroup: 'shoulders', secondaryMuscleGroups: ['triceps'], equipment: 'machine', type: weight },
  { slug: 'face-pull', name: 'Face pull', nameEn: 'Face Pull', muscleGroup: 'shoulders', secondaryMuscleGroups: ['back'], equipment: 'cable', type: weight },
  { slug: 'upright-row', name: 'Remo al mentón', nameEn: 'Upright Row', muscleGroup: 'shoulders', secondaryMuscleGroups: ['back'], equipment: 'barbell', type: weight },
  { slug: 'shrug-dumbbell', name: 'Encogimientos con mancuernas', nameEn: 'Dumbbell Shrug', muscleGroup: 'shoulders', secondaryMuscleGroups: ['forearms'], equipment: 'dumbbell', type: weight },
  // Bíceps
  { slug: 'barbell-curl', name: 'Curl con barra', nameEn: 'Barbell Curl', muscleGroup: 'biceps', secondaryMuscleGroups: ['forearms'], equipment: 'barbell', type: weight },
  { slug: 'dumbbell-curl', name: 'Curl con mancuernas', nameEn: 'Dumbbell Curl', muscleGroup: 'biceps', secondaryMuscleGroups: ['forearms'], equipment: 'dumbbell', type: weight },
  { slug: 'hammer-curl', name: 'Curl martillo', nameEn: 'Hammer Curl', muscleGroup: 'biceps', secondaryMuscleGroups: ['forearms'], equipment: 'dumbbell', type: weight },
  { slug: 'preacher-curl', name: 'Curl predicador', nameEn: 'Preacher Curl', muscleGroup: 'biceps', secondaryMuscleGroups: ['forearms'], equipment: 'barbell', type: weight },
  { slug: 'cable-curl', name: 'Curl en polea', nameEn: 'Cable Curl', muscleGroup: 'biceps', secondaryMuscleGroups: ['forearms'], equipment: 'cable', type: weight },
  { slug: 'incline-dumbbell-curl', name: 'Curl inclinado con mancuernas', nameEn: 'Incline Dumbbell Curl', muscleGroup: 'biceps', secondaryMuscleGroups: ['forearms'], equipment: 'dumbbell', type: weight },
  // Tríceps
  { slug: 'triceps-pushdown', name: 'Extensión de tríceps en polea', nameEn: 'Triceps Pushdown', muscleGroup: 'triceps', secondaryMuscleGroups: [], equipment: 'cable', type: weight },
  { slug: 'skull-crusher', name: 'Press francés', nameEn: 'Skull Crusher', muscleGroup: 'triceps', secondaryMuscleGroups: [], equipment: 'barbell', type: weight },
  { slug: 'overhead-triceps-extension', name: 'Extensión de tríceps sobre la cabeza', nameEn: 'Overhead Triceps Extension', muscleGroup: 'triceps', secondaryMuscleGroups: [], equipment: 'dumbbell', type: weight },
  { slug: 'close-grip-bench-press', name: 'Press de banca agarre cerrado', nameEn: 'Close-Grip Bench Press', muscleGroup: 'triceps', secondaryMuscleGroups: ['chest', 'shoulders'], equipment: 'barbell', type: weight },
  { slug: 'bench-dip', name: 'Fondos en banco', nameEn: 'Bench Dip', muscleGroup: 'triceps', secondaryMuscleGroups: ['chest', 'shoulders'], equipment: 'bodyweight', type: reps },
  { slug: 'dip', name: 'Fondos en paralelas', nameEn: 'Dip', muscleGroup: 'triceps', secondaryMuscleGroups: ['chest', 'shoulders'], equipment: 'bodyweight', type: reps },
  // Antebrazos
  { slug: 'wrist-curl', name: 'Curl de muñeca', nameEn: 'Wrist Curl', muscleGroup: 'forearms', secondaryMuscleGroups: [], equipment: 'barbell', type: weight },
  { slug: 'reverse-curl', name: 'Curl inverso', nameEn: 'Reverse Curl', muscleGroup: 'forearms', secondaryMuscleGroups: ['biceps'], equipment: 'barbell', type: weight },
  // Abdomen
  { slug: 'crunch', name: 'Abdominales', nameEn: 'Crunch', muscleGroup: 'abs', secondaryMuscleGroups: [], equipment: 'bodyweight', type: reps },
  { slug: 'plank', name: 'Plancha', nameEn: 'Plank', muscleGroup: 'abs', secondaryMuscleGroups: ['shoulders', 'glutes'], equipment: 'bodyweight', type: time },
  { slug: 'side-plank', name: 'Plancha lateral', nameEn: 'Side Plank', muscleGroup: 'abs', secondaryMuscleGroups: ['shoulders', 'glutes'], equipment: 'bodyweight', type: time },
  { slug: 'hanging-leg-raise', name: 'Elevación de piernas colgado', nameEn: 'Hanging Leg Raise', muscleGroup: 'abs', secondaryMuscleGroups: ['forearms'], equipment: 'bodyweight', type: reps },
  { slug: 'cable-crunch', name: 'Crunch en polea', nameEn: 'Cable Crunch', muscleGroup: 'abs', secondaryMuscleGroups: [], equipment: 'cable', type: weight },
  { slug: 'russian-twist', name: 'Giro ruso', nameEn: 'Russian Twist', muscleGroup: 'abs', secondaryMuscleGroups: [], equipment: 'bodyweight', type: reps },
  { slug: 'ab-wheel', name: 'Rueda abdominal', nameEn: 'Ab Wheel Rollout', muscleGroup: 'abs', secondaryMuscleGroups: ['shoulders', 'back'], equipment: 'other', type: reps },
  // Cuádriceps
  { slug: 'squat-barbell', name: 'Sentadilla con barra', nameEn: 'Barbell Squat', muscleGroup: 'quadriceps', secondaryMuscleGroups: ['glutes', 'hamstrings'], equipment: 'barbell', type: weight },
  { slug: 'front-squat', name: 'Sentadilla frontal', nameEn: 'Front Squat', muscleGroup: 'quadriceps', secondaryMuscleGroups: ['glutes', 'abs'], equipment: 'barbell', type: weight },
  { slug: 'leg-press', name: 'Prensa de piernas', nameEn: 'Leg Press', muscleGroup: 'quadriceps', secondaryMuscleGroups: ['glutes', 'hamstrings'], equipment: 'machine', type: weight },
  { slug: 'leg-extension', name: 'Extensión de piernas', nameEn: 'Leg Extension', muscleGroup: 'quadriceps', secondaryMuscleGroups: [], equipment: 'machine', type: weight },
  { slug: 'goblet-squat', name: 'Sentadilla goblet', nameEn: 'Goblet Squat', muscleGroup: 'quadriceps', secondaryMuscleGroups: ['glutes'], equipment: 'kettlebell', type: weight },
  { slug: 'lunge-dumbbell', name: 'Zancadas con mancuernas', nameEn: 'Dumbbell Lunge', muscleGroup: 'quadriceps', secondaryMuscleGroups: ['glutes', 'hamstrings'], equipment: 'dumbbell', type: weight },
  { slug: 'bulgarian-split-squat', name: 'Sentadilla búlgara', nameEn: 'Bulgarian Split Squat', muscleGroup: 'quadriceps', secondaryMuscleGroups: ['glutes', 'hamstrings'], equipment: 'dumbbell', type: weight },
  { slug: 'hack-squat', name: 'Sentadilla hack', nameEn: 'Hack Squat', muscleGroup: 'quadriceps', secondaryMuscleGroups: ['glutes'], equipment: 'machine', type: weight },
  // Isquiotibiales
  { slug: 'romanian-deadlift', name: 'Peso muerto rumano', nameEn: 'Romanian Deadlift', muscleGroup: 'hamstrings', secondaryMuscleGroups: ['glutes', 'back'], equipment: 'barbell', type: weight },
  { slug: 'romanian-deadlift-dumbbell', name: 'Peso muerto rumano con mancuernas', nameEn: 'Dumbbell Romanian Deadlift', muscleGroup: 'hamstrings', secondaryMuscleGroups: ['glutes', 'back'], equipment: 'dumbbell', type: weight },
  { slug: 'leg-curl-lying', name: 'Curl femoral tumbado', nameEn: 'Lying Leg Curl', muscleGroup: 'hamstrings', secondaryMuscleGroups: ['calves'], equipment: 'machine', type: weight },
  { slug: 'leg-curl-seated', name: 'Curl femoral sentado', nameEn: 'Seated Leg Curl', muscleGroup: 'hamstrings', secondaryMuscleGroups: ['calves'], equipment: 'machine', type: weight },
  // Glúteos
  { slug: 'hip-thrust', name: 'Empuje de cadera', nameEn: 'Hip Thrust', muscleGroup: 'glutes', secondaryMuscleGroups: ['hamstrings'], equipment: 'barbell', type: weight },
  { slug: 'glute-bridge', name: 'Puente de glúteos', nameEn: 'Glute Bridge', muscleGroup: 'glutes', secondaryMuscleGroups: ['hamstrings'], equipment: 'bodyweight', type: reps },
  { slug: 'cable-kickback', name: 'Patada de glúteo en polea', nameEn: 'Cable Glute Kickback', muscleGroup: 'glutes', secondaryMuscleGroups: ['hamstrings'], equipment: 'cable', type: weight },
  { slug: 'hip-abduction-machine', name: 'Abducción de cadera en máquina', nameEn: 'Machine Hip Abduction', muscleGroup: 'glutes', secondaryMuscleGroups: [], equipment: 'machine', type: weight },
  // Pantorrillas
  { slug: 'standing-calf-raise', name: 'Elevación de talones de pie', nameEn: 'Standing Calf Raise', muscleGroup: 'calves', secondaryMuscleGroups: [], equipment: 'machine', type: weight },
  { slug: 'seated-calf-raise', name: 'Elevación de talones sentado', nameEn: 'Seated Calf Raise', muscleGroup: 'calves', secondaryMuscleGroups: [], equipment: 'machine', type: weight },
  { slug: 'bodyweight-calf-raise', name: 'Elevación de talones sin peso', nameEn: 'Bodyweight Calf Raise', muscleGroup: 'calves', secondaryMuscleGroups: [], equipment: 'bodyweight', type: reps },
  // Cuerpo completo
  { slug: 'burpee', name: 'Burpees', nameEn: 'Burpee', muscleGroup: 'full_body', secondaryMuscleGroups: ['chest', 'quadriceps', 'shoulders'], equipment: 'bodyweight', type: reps },
  { slug: 'kettlebell-swing', name: 'Swing con kettlebell', nameEn: 'Kettlebell Swing', muscleGroup: 'full_body', secondaryMuscleGroups: ['glutes', 'hamstrings', 'shoulders'], equipment: 'kettlebell', type: weight },
  { slug: 'thruster', name: 'Thruster con barra', nameEn: 'Barbell Thruster', muscleGroup: 'full_body', secondaryMuscleGroups: ['quadriceps', 'shoulders'], equipment: 'barbell', type: weight },
  { slug: 'clean-and-press', name: 'Cargada y press', nameEn: 'Clean and Press', muscleGroup: 'full_body', secondaryMuscleGroups: ['back', 'shoulders'], equipment: 'barbell', type: weight },
  // Cardio
  { slug: 'running', name: 'Correr', nameEn: 'Running', muscleGroup: 'cardio', secondaryMuscleGroups: ['calves', 'hamstrings'], equipment: 'other', type: time },
  { slug: 'walking', name: 'Caminar', nameEn: 'Walking', muscleGroup: 'cardio', secondaryMuscleGroups: ['calves'], equipment: 'other', type: time },
  { slug: 'cycling', name: 'Bicicleta', nameEn: 'Cycling', muscleGroup: 'cardio', secondaryMuscleGroups: ['quadriceps', 'calves'], equipment: 'machine', type: time },
  { slug: 'rowing-machine', name: 'Remo en máquina', nameEn: 'Rowing Machine', muscleGroup: 'cardio', secondaryMuscleGroups: ['back', 'quadriceps'], equipment: 'machine', type: time },
  { slug: 'elliptical', name: 'Elíptica', nameEn: 'Elliptical', muscleGroup: 'cardio', secondaryMuscleGroups: ['quadriceps', 'glutes'], equipment: 'machine', type: time },
  { slug: 'stair-climber', name: 'Escaladora', nameEn: 'Stair Climber', muscleGroup: 'cardio', secondaryMuscleGroups: ['glutes', 'calves'], equipment: 'machine', type: time },
  { slug: 'jump-rope', name: 'Saltar la cuerda', nameEn: 'Jump Rope', muscleGroup: 'cardio', secondaryMuscleGroups: ['calves'], equipment: 'other', type: time },
];

// Inserta la biblioteca, y si un ejercicio ya existe (mismo slug) lo ACTUALIZA
// con los datos de esta versión de la app: así los celulares que ya tenían la
// biblioteca reciben los nombres en inglés y los grupos secundarios. Es seguro
// llamarla en cada arranque, y nunca toca `is_custom` ni los ejercicios propios.
//
// Ojo: es una sola sentencia con 8 valores por ejercicio, y SQLite antiguo
// admite 999 variables por sentencia. Con ~120 ejercicios habría que
// insertar por lotes.
export function seedExercises(db: Database): void {
  db.insert(exercises)
    .values(LIBRARY_EXERCISES.map((exercise) => ({ ...exercise, isCustom: false })))
    .onConflictDoUpdate({
      target: exercises.slug,
      set: {
        name: sql`excluded.name`,
        nameEn: sql`excluded.name_en`,
        muscleGroup: sql`excluded.muscle_group`,
        secondaryMuscleGroups: sql`excluded.secondary_muscle_groups`,
        equipment: sql`excluded.equipment`,
        type: sql`excluded.type`,
      },
    })
    .run();
}
