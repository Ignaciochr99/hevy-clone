import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ExerciseFormScreen } from '../screens/exercises/ExerciseFormScreen';
import { ExerciseLibraryScreen } from '../screens/profile/ExerciseLibraryScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import type { ProfileStackParamList } from './types';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export function ProfileStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Perfil' }} />
      <Stack.Screen
        name="ExerciseLibrary"
        component={ExerciseLibraryScreen}
        options={{ title: 'Ejercicios' }}
      />
      <Stack.Screen
        name="ExerciseForm"
        component={ExerciseFormScreen}
        options={({ route }) => ({
          title: route.params.exerciseId === undefined ? 'Nuevo ejercicio' : 'Ejercicio',
        })}
      />
    </Stack.Navigator>
  );
}
