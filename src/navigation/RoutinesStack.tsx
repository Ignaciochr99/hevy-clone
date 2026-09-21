import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from '../i18n/useTranslation';
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
        options={{ title: t('routineEditor.header') }}
      />
    </Stack.Navigator>
  );
}
