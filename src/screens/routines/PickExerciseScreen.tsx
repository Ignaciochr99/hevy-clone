import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ExercisePicker } from '../../components/ExercisePicker';
import { Screen } from '../../components/Screen';
import type { RoutinesStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RoutinesStackParamList, 'PickExercise'>;

// El mismo selector de la biblioteca, pero al elegir un ejercicio se vuelve al
// editor de la rutina (que sigue montado debajo, con su borrador intacto) y se
// le pasa el ejercicio como parámetro.
export function PickExerciseScreen({ navigation }: Props) {
  return (
    <Screen>
      <ExercisePicker
        onSelect={(exercise) =>
          navigation.popTo('RoutineEditor', { pickedExerciseId: exercise.id }, { merge: true })
        }
        onCreate={() => navigation.navigate('ExerciseForm', {})}
      />
    </Screen>
  );
}
