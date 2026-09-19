import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '../../components/Button';
import { Screen } from '../../components/Screen';
import type { HomeStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<HomeStackParamList, 'Home'>;

export function HomeScreen({ navigation }: Props) {
  return (
    <Screen title="Aquí irá tu resumen semanal">
      <Button
        title="Ver entrenamiento de ejemplo"
        onPress={() => navigation.navigate('WorkoutDetail', { workoutId: 1 })}
      />
    </Screen>
  );
}
