import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { ComponentProps } from 'react';
import { colors } from '../theme';
import { HomeStack } from './HomeStack';
import { ProfileStack } from './ProfileStack';
import { RoutinesStack } from './RoutinesStack';
import type { RootTabParamList } from './types';

type IconName = ComponentProps<typeof Ionicons>['name'];

const icons: Record<keyof RootTabParamList, { active: IconName; inactive: IconName }> = {
  HomeTab: { active: 'home', inactive: 'home-outline' },
  RoutinesTab: { active: 'barbell', inactive: 'barbell-outline' },
  ProfileTab: { active: 'person', inactive: 'person-outline' },
};

const Tab = createBottomTabNavigator<RootTabParamList>();

export function RootTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarIcon: ({ focused, color, size }) => (
          <Ionicons
            name={focused ? icons[route.name].active : icons[route.name].inactive}
            size={size}
            color={color}
          />
        ),
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeStack} options={{ title: 'Inicio' }} />
      <Tab.Screen name="RoutinesTab" component={RoutinesStack} options={{ title: 'Rutinas' }} />
      <Tab.Screen name="ProfileTab" component={ProfileStack} options={{ title: 'Perfil' }} />
    </Tab.Navigator>
  );
}
