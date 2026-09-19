import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ExercisePicker } from '../../components/ExercisePicker';
import { Screen } from '../../components/Screen';
import type { ProfileStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<ProfileStackParamList, 'ExerciseLibrary'>;

export function ExerciseLibraryScreen({ navigation }: Props) {
  return (
    <Screen>
      <ExercisePicker
        onSelect={(exercise) => navigation.navigate('ExerciseForm', { exerciseId: exercise.id })}
        onCreate={() => navigation.navigate('ExerciseForm', {})}
      />
    </Screen>
  );
}
