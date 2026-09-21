import { useNavigation, type NavigationProp } from '@react-navigation/native';
import { Alert } from 'react-native';
import { translateError } from '../../i18n/translations';
import { useTranslation } from '../../i18n/useTranslation';
import type { RootStackParamList } from '../../navigation/types';
import { useActiveWorkout } from '../../stores/activeWorkout';

// Empezar un entrenamiento desde cualquier pantalla: vacío o desde una rutina.
// Si ya hay uno en curso, no se empieza otro: se ofrece continuar el que hay.
export function useStartWorkout() {
  const { t, language } = useTranslation();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  function begin(start: () => void) {
    if (useActiveWorkout.getState().workout) {
      Alert.alert(t('workout.alreadyActiveTitle'), t('error.workout.alreadyActive'), [
        { text: t('form.cancel'), style: 'cancel' },
        { text: t('workout.continue'), onPress: () => navigation.navigate('Workout') },
      ]);
      return;
    }
    try {
      start();
      navigation.navigate('Workout');
    } catch (e) {
      Alert.alert(t('common.errorTitle'), translateError(language, e));
    }
  }

  return {
    startEmpty: () => begin(() => useActiveWorkout.getState().startEmpty(t('workout.defaultName'))),
    startFromRoutine: (routineId: number) =>
      begin(() => useActiveWorkout.getState().startFromRoutine(routineId)),
  };
}
