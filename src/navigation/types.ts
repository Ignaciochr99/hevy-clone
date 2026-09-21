export type HomeStackParamList = {
  Home: undefined;
  WorkoutDetail: { workoutId: number };
};

export type RoutinesStackParamList = {
  Routines: undefined;
  // Sin routineId se crea una rutina; con routineId se edita. `pickedExerciseId`
  // lo rellena el selector de ejercicios al volver al editor.
  RoutineEditor: { routineId?: number; pickedExerciseId?: number } | undefined;
  PickExercise: undefined;
  ExerciseForm: { exerciseId?: number };
};

export type ProfileStackParamList = {
  Profile: undefined;
  ExerciseLibrary: undefined;
  ExerciseForm: { exerciseId?: number };
};

export type RootTabParamList = {
  HomeTab: undefined;
  RoutinesTab: undefined;
  ProfileTab: undefined;
};

// El stack raíz: las pestañas y, encima de ellas, el entrenamiento en curso
// (como modal), el selector de ejercicios para añadir y el formulario de ejercicio.
export type RootStackParamList = {
  Tabs: undefined;
  Workout: undefined;
  WorkoutPickExercise: undefined;
  ExerciseForm: { exerciseId?: number };
};
