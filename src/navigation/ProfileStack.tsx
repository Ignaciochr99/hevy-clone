import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from '../i18n/useTranslation';
import { ExerciseFormScreen } from '../screens/exercises/ExerciseFormScreen';
import { ExerciseLibraryScreen } from '../screens/exercises/ExerciseLibraryScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import type { ProfileStackParamList } from './types';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export function ProfileStack() {
  const { t } = useTranslation();

  return (
    <Stack.Navigator>
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: t('tabs.profile') }} />
      <Stack.Screen
        name="ExerciseLibrary"
        component={ExerciseLibraryScreen}
        options={{ title: t('exercises.header') }}
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
