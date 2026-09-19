export type HomeStackParamList = {
  Home: undefined;
  WorkoutDetail: { workoutId: number };
};

export type RoutinesStackParamList = {
  Routines: undefined;
  RoutineEditor: undefined;
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
