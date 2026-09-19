import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../../components/Screen';
import type { HomeStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<HomeStackParamList, 'WorkoutDetail'>;

export function WorkoutDetailScreen({ route }: Props) {
  return <Screen title={`Entrenamiento #${route.params.workoutId}`} />;
}
