import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from '../i18n/useTranslation';
import { ExerciseFormScreen } from '../screens/exercises/ExerciseFormScreen';
import { PickExerciseScreen } from '../screens/routines/PickExerciseScreen';
import { RoutineEditorScreen } from '../screens/routines/RoutineEditorScreen';
import { RoutinesScreen } from '../screens/routines/RoutinesScreen';
import type { RoutinesStackParamList } from './types';

const Stack = createNativeStackNavigator<RoutinesStackParamList>();

export function RoutinesStack() {
  const { t } = useTranslation();

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Routines"
        component={RoutinesScreen}
        options={{ title: t('tabs.routines') }}
      />
      <Stack.Screen
        name="RoutineEditor"
        component={RoutineEditorScreen}
        options={({ route }) => ({
          title:
            route.params?.routineId === undefined
              ? t('routineEditor.header')
              : t('routineEditor.editHeader'),
        })}
      />
      <Stack.Screen
        name="PickExercise"
        component={PickExerciseScreen}
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
  );
}
