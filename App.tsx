import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { WeightChart } from './src/spike/WeightChart';

export default function App() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Prueba de gráfica</Text>
        <WeightChart />
      </View>
      <StatusBar style="light" />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f1115', justifyContent: 'center', padding: 16 },
  card: { backgroundColor: '#181b22', borderRadius: 12, padding: 16 },
  title: { color: '#fff', fontSize: 18, marginBottom: 12 },
});
