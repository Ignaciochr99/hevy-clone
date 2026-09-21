import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RestTimerWatcher } from '../components/RestTimerWatcher';
import { useTranslation } from '../i18n/useTranslation';
import { ExerciseFormScreen } from '../screens/exercises/ExerciseFormScreen';
import { WorkoutPickExerciseScreen } from '../screens/workout/WorkoutPickExerciseScreen';
import { WorkoutScreen } from '../screens/workout/WorkoutScreen';
import { RootTabs } from './RootTabs';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

// Las pestañas, y encima de ellas el entrenamiento en curso como modal. Al
// cerrar el modal (o al salir de la app) el entrenamiento sigue en curso: la
// barra sobre las pestañas permite volver a él.
export function RootStack() {
  const { t } = useTranslation();

  return (
    <>
      <RestTimerWatcher />
      <Stack.Navigator>
        <Stack.Screen name="Tabs" component={RootTabs} options={{ headerShown: false }} />
        <Stack.Screen
          name="Workout"
          component={WorkoutScreen}
          options={{ presentation: 'modal', title: t('workout.header') }}
        />
        <Stack.Screen
          name="WorkoutPickExercise"
          component={WorkoutPickExerciseScreen}
          options={{ title: t('routines.pickHeader') }}
        />
        <Stack.Screen
          name="ExerciseForm"
          component={ExerciseFormScreen}
          options={({ route }) => ({
            title:
              route.params.exerciseId === undefined
                ? t('exercises.newHeader')
                : t('exercises.detailHeader'),
          })}
        />
      </Stack.Navigator>
    </>
  );
}
