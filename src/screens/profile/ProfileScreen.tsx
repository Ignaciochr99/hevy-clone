import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '../../components/Button';
import { Screen } from '../../components/Screen';
import type { ProfileStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<ProfileStackParamList, 'Profile'>;

export function ProfileScreen({ navigation }: Props) {
  return (
    <Screen title="Aquí irán tus estadísticas y ajustes">
      <Button
        title="Biblioteca de ejercicios"
        onPress={() => navigation.navigate('ExerciseLibrary')}
      />
    </Screen>
  );
}
