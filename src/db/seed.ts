import type { Equipment, ExerciseType, MuscleGroup } from './enums';
import { exercises } from './schema';
import type { Database } from './types';

export type LibraryExercise = {
  slug: string;
  name: string;
  muscleGroup: MuscleGroup;
  equipment: Equipment;
  type: ExerciseType;
};

const weight = 'weight_reps' as const;
const reps = 'reps_only' as const;
const time = 'duration' as const;

export const LIBRARY_EXERCISES: readonly LibraryExercise[] = [
  // Pecho
  { slug: 'bench-press-barbell', name: 'Press de banca con barra', muscleGroup: 'chest', equipment: 'barbell', type: weight },
  { slug: 'incline-bench-press-barbell', name: 'Press inclinado con barra', muscleGroup: 'chest', equipment: 'barbell', type: weight },
  { slug: 'bench-press-dumbbell', name: 'Press de banca con mancuernas', muscleGroup: 'chest', equipment: 'dumbbell', type: weight },
  { slug: 'incline-bench-press-dumbbell', name: 'Press inclinado con mancuernas', muscleGroup: 'chest', equipment: 'dumbbell', type: weight },
  { slug: 'chest-fly-dumbbell', name: 'Aperturas con mancuernas', muscleGroup: 'chest', equipment: 'dumbbell', type: weight },
  { slug: 'cable-crossover', name: 'Cruce de poleas', muscleGroup: 'chest', equipment: 'cable', type: weight },
  { slug: 'chest-press-machine', name: 'Press de pecho en máquina', muscleGroup: 'chest', equipment: 'machine', type: weight },
  { slug: 'push-up', name: 'Flexiones', muscleGroup: 'chest', equipment: 'bodyweight', type: reps },
  // Espalda
  { slug: 'deadlift-barbell', name: 'Peso muerto', muscleGroup: 'back', equipment: 'barbell', type: weight },
  { slug: 'pull-up', name: 'Dominadas', muscleGroup: 'back', equipment: 'bodyweight', type: reps },
  { slug: 'chin-up', name: 'Dominadas supinas', muscleGroup: 'back', equipment: 'bodyweight', type: reps },
  { slug: 'lat-pulldown', name: 'Jalón al pecho', muscleGroup: 'back', equipment: 'cable', type: weight },
  { slug: 'barbell-row', name: 'Remo con barra', muscleGroup: 'back', equipment: 'barbell', type: weight },
  { slug: 'dumbbell-row', name: 'Remo con mancuerna', muscleGroup: 'back', equipment: 'dumbbell', type: weight },
  { slug: 'seated-cable-row', name: 'Remo sentado en polea', muscleGroup: 'back', equipment: 'cable', type: weight },
  { slug: 'back-extension', name: 'Extensión lumbar', muscleGroup: 'back', equipment: 'bodyweight', type: reps },
  // Hombros
  { slug: 'overhead-press-barbell', name: 'Press militar con barra', muscleGroup: 'shoulders', equipment: 'barbell', type: weight },
  { slug: 'overhead-press-dumbbell', name: 'Press militar con mancuernas', muscleGroup: 'shoulders', equipment: 'dumbbell', type: weight },
  { slug: 'lateral-raise-dumbbell', name: 'Elevaciones laterales', muscleGroup: 'shoulders', equipment: 'dumbbell', type: weight },
  { slug: 'front-raise-dumbbell', name: 'Elevaciones frontales', muscleGroup: 'shoulders', equipment: 'dumbbell', type: weight },
  { slug: 'rear-delt-fly-dumbbell', name: 'Pájaros con mancuernas', muscleGroup: 'shoulders', equipment: 'dumbbell', type: weight },
  { slug: 'shoulder-press-machine', name: 'Press de hombros en máquina', muscleGroup: 'shoulders', equipment: 'machine', type: weight },
  { slug: 'face-pull', name: 'Face pull', muscleGroup: 'shoulders', equipment: 'cable', type: weight },
  { slug: 'upright-row', name: 'Remo al mentón', muscleGroup: 'shoulders', equipment: 'barbell', type: weight },
  { slug: 'shrug-dumbbell', name: 'Encogimientos con mancuernas', muscleGroup: 'shoulders', equipment: 'dumbbell', type: weight },
  // Bíceps
  { slug: 'barbell-curl', name: 'Curl con barra', muscleGroup: 'biceps', equipment: 'barbell', type: weight },
  { slug: 'dumbbell-curl', name: 'Curl con mancuernas', muscleGroup: 'biceps', equipment: 'dumbbell', type: weight },
  { slug: 'hammer-curl', name: 'Curl martillo', muscleGroup: 'biceps', equipment: 'dumbbell', type: weight },
  { slug: 'preacher-curl', name: 'Curl predicador', muscleGroup: 'biceps', equipment: 'barbell', type: weight },
  { slug: 'cable-curl', name: 'Curl en polea', muscleGroup: 'biceps', equipment: 'cable', type: weight },
  { slug: 'incline-dumbbell-curl', name: 'Curl inclinado con mancuernas', muscleGroup: 'biceps', equipment: 'dumbbell', type: weight },
  // Tríceps
  { slug: 'triceps-pushdown', name: 'Extensión de tríceps en polea', muscleGroup: 'triceps', equipment: 'cable', type: weight },
  { slug: 'skull-crusher', name: 'Press francés', muscleGroup: 'triceps', equipment: 'barbell', type: weight },
  { slug: 'overhead-triceps-extension', name: 'Extensión de tríceps sobre la cabeza', muscleGroup: 'triceps', equipment: 'dumbbell', type: weight },
  { slug: 'close-grip-bench-press', name: 'Press de banca agarre cerrado', muscleGroup: 'triceps', equipment: 'barbell', type: weight },
  { slug: 'bench-dip', name: 'Fondos en banco', muscleGroup: 'triceps', equipment: 'bodyweight', type: reps },
  { slug: 'dip', name: 'Fondos en paralelas', muscleGroup: 'triceps', equipment: 'bodyweight', type: reps },
  // Antebrazos
  { slug: 'wrist-curl', name: 'Curl de muñeca', muscleGroup: 'forearms', equipment: 'barbell', type: weight },
  { slug: 'reverse-curl', name: 'Curl inverso', muscleGroup: 'forearms', equipment: 'barbell', type: weight },
  // Abdomen
  { slug: 'crunch', name: 'Abdominales', muscleGroup: 'abs', equipment: 'bodyweight', type: reps },
  { slug: 'plank', name: 'Plancha', muscleGroup: 'abs', equipment: 'bodyweight', type: time },
  { slug: 'side-plank', name: 'Plancha lateral', muscleGroup: 'abs', equipment: 'bodyweight', type: time },
  { slug: 'hanging-leg-raise', name: 'Elevación de piernas colgado', muscleGroup: 'abs', equipment: 'bodyweight', type: reps },
  { slug: 'cable-crunch', name: 'Crunch en polea', muscleGroup: 'abs', equipment: 'cable', type: weight },
  { slug: 'russian-twist', name: 'Giro ruso', muscleGroup: 'abs', equipment: 'bodyweight', type: reps },
  { slug: 'ab-wheel', name: 'Rueda abdominal', muscleGroup: 'abs', equipment: 'other', type: reps },
  // Cuádriceps
  { slug: 'squat-barbell', name: 'Sentadilla con barra', muscleGroup: 'quadriceps', equipment: 'barbell', type: weight },
  { slug: 'front-squat', name: 'Sentadilla frontal', muscleGroup: 'quadriceps', equipment: 'barbell', type: weight },
  { slug: 'leg-press', name: 'Prensa de piernas', muscleGroup: 'quadriceps', equipment: 'machine', type: weight },
  { slug: 'leg-extension', name: 'Extensión de piernas', muscleGroup: 'quadriceps', equipment: 'machine', type: weight },
  { slug: 'goblet-squat', name: 'Sentadilla goblet', muscleGroup: 'quadriceps', equipment: 'kettlebell', type: weight },
  { slug: 'lunge-dumbbell', name: 'Zancadas con mancuernas', muscleGroup: 'quadriceps', equipment: 'dumbbell', type: weight },
  { slug: 'bulgarian-split-squat', name: 'Sentadilla búlgara', muscleGroup: 'quadriceps', equipment: 'dumbbell', type: weight },
  { slug: 'hack-squat', name: 'Sentadilla hack', muscleGroup: 'quadriceps', equipment: 'machine', type: weight },
  // Isquiotibiales
  { slug: 'romanian-deadlift', name: 'Peso muerto rumano', muscleGroup: 'hamstrings', equipment: 'barbell', type: weight },
  { slug: 'romanian-deadlift-dumbbell', name: 'Peso muerto rumano con mancuernas', muscleGroup: 'hamstrings', equipment: 'dumbbell', type: weight },
  { slug: 'leg-curl-lying', name: 'Curl femoral tumbado', muscleGroup: 'hamstrings', equipment: 'machine', type: weight },
  { slug: 'leg-curl-seated', name: 'Curl femoral sentado', muscleGroup: 'hamstrings', equipment: 'machine', type: weight },
  // Glúteos
  { slug: 'hip-thrust', name: 'Empuje de cadera', muscleGroup: 'glutes', equipment: 'barbell', type: weight },
  { slug: 'glute-bridge', name: 'Puente de glúteos', muscleGroup: 'glutes', equipment: 'bodyweight', type: reps },
  { slug: 'cable-kickback', name: 'Patada de glúteo en polea', muscleGroup: 'glutes', equipment: 'cable', type: weight },
  { slug: 'hip-abduction-machine', name: 'Abducción de cadera en máquina', muscleGroup: 'glutes', equipment: 'machine', type: weight },
  // Pantorrillas
  { slug: 'standing-calf-raise', name: 'Elevación de talones de pie', muscleGroup: 'calves', equipment: 'machine', type: weight },
  { slug: 'seated-calf-raise', name: 'Elevación de talones sentado', muscleGroup: 'calves', equipment: 'machine', type: weight },
  { slug: 'bodyweight-calf-raise', name: 'Elevación de talones sin peso', muscleGroup: 'calves', equipment: 'bodyweight', type: reps },
  // Cuerpo completo
  { slug: 'burpee', name: 'Burpees', muscleGroup: 'full_body', equipment: 'bodyweight', type: reps },
  { slug: 'kettlebell-swing', name: 'Swing con kettlebell', muscleGroup: 'full_body', equipment: 'kettlebell', type: weight },
  { slug: 'thruster', name: 'Thruster con barra', muscleGroup: 'full_body', equipment: 'barbell', type: weight },
  { slug: 'clean-and-press', name: 'Cargada y press', muscleGroup: 'full_body', equipment: 'barbell', type: weight },
  // Cardio
  { slug: 'running', name: 'Correr', muscleGroup: 'cardio', equipment: 'other', type: time },
  { slug: 'walking', name: 'Caminar', muscleGroup: 'cardio', equipment: 'other', type: time },
  { slug: 'cycling', name: 'Bicicleta', muscleGroup: 'cardio', equipment: 'machine', type: time },
  { slug: 'rowing-machine', name: 'Remo en máquina', muscleGroup: 'cardio', equipment: 'machine', type: time },
  { slug: 'elliptical', name: 'Elíptica', muscleGroup: 'cardio', equipment: 'machine', type: time },
  { slug: 'stair-climber', name: 'Escaladora', muscleGroup: 'cardio', equipment: 'machine', type: time },
  { slug: 'jump-rope', name: 'Saltar la cuerda', muscleGroup: 'cardio', equipment: 'other', type: time },
];

// Inserta la biblioteca. Es seguro llamarla en cada arranque: los ejercicios
// que ya existen (mismo slug) se omiten, y los propios del usuario no se tocan.
export function seedExercises(db: Database): void {
  db.insert(exercises)
    .values(LIBRARY_EXERCISES.map((exercise) => ({ ...exercise, isCustom: false })))
    .onConflictDoNothing({ target: exercises.slug })
    .run();
}
