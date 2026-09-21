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
