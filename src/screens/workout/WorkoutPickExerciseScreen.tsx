import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Alert } from 'react-native';
import { ExercisePicker } from '../../components/ExercisePicker';
import { Screen } from '../../components/Screen';
import { translateError } from '../../i18n/translations';
import { useTranslation } from '../../i18n/useTranslation';
import type { RootStackParamList } from '../../navigation/types';
import { useActiveWorkout } from '../../stores/activeWorkout';

type Props = NativeStackScreenProps<RootStackParamList, 'WorkoutPickExercise'>;

// El mismo selector de la biblioteca, para añadir un ejercicio al entrenamiento
// en curso: al elegir uno se añade y se vuelve al entrenamiento.
export function WorkoutPickExerciseScreen({ navigation }: Props) {
  const { t, language } = useTranslation();

  return (
    <Screen>
      <ExercisePicker
        onSelect={(exercise) => {
          try {
            useActiveWorkout.getState().addExercise(exercise.id);
            navigation.goBack();
          } catch (e) {
            Alert.alert(t('common.errorTitle'), translateError(language, e));
          }
        }}
        onCreate={() => navigation.navigate('ExerciseForm', {})}
      />
    </Screen>
  );
}
