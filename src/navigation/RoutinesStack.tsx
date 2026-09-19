import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RoutineEditorScreen } from '../screens/routines/RoutineEditorScreen';
import { RoutinesScreen } from '../screens/routines/RoutinesScreen';
import type { RoutinesStackParamList } from './types';

const Stack = createNativeStackNavigator<RoutinesStackParamList>();

export function RoutinesStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Routines" component={RoutinesScreen} options={{ title: 'Rutinas' }} />
      <Stack.Screen
        name="RoutineEditor"
        component={RoutineEditorScreen}
        options={{ title: 'Nueva rutina' }}
      />
    </Stack.Navigator>
  );
}
