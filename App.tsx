import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { DatabaseGate } from './src/db/DatabaseGate';
import { RootTabs } from './src/navigation/RootTabs';
import { colors } from './src/theme';
import { navigationTheme } from './src/theme/navigationTheme';

export default function App() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <DatabaseGate>
        <NavigationContainer theme={navigationTheme}>
          <RootTabs />
        </NavigationContainer>
      </DatabaseGate>
      <StatusBar style="light" />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
});
