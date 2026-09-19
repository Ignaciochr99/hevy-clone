import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '../../components/Button';
import { Screen } from '../../components/Screen';
import type { RoutinesStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RoutinesStackParamList, 'Routines'>;

export function RoutinesScreen({ navigation }: Props) {
  return (
    <Screen title="Aquí irán tus rutinas">
      <Button title="Crear rutina" onPress={() => navigation.navigate('RoutineEditor')} />
    </Screen>
  );
}
