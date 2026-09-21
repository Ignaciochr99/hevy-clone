import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from '../i18n/useTranslation';
import { HomeScreen } from '../screens/home/HomeScreen';
import { WorkoutDetailScreen } from '../screens/home/WorkoutDetailScreen';
import type { HomeStackParamList } from './types';

const Stack = createNativeStackNavigator<HomeStackParamList>();

export function HomeStack() {
  const { t } = useTranslation();

  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={HomeScreen} options={{ title: t('tabs.home') }} />
      <Stack.Screen
        name="WorkoutDetail"
        component={WorkoutDetailScreen}
        options={{ title: t('workoutDetail.header') }}
      />
    </Stack.Navigator>
  );
}
