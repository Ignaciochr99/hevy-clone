import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '../../components/Button';
import { Screen } from '../../components/Screen';
import { useTranslation } from '../../i18n/useTranslation';
import type { HomeStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<HomeStackParamList, 'Home'>;

export function HomeScreen({ navigation }: Props) {
  const { t } = useTranslation();

  return (
    <Screen title={t('home.placeholder')}>
      <Button
        title={t('home.sampleWorkout')}
        onPress={() => navigation.navigate('WorkoutDetail', { workoutId: 1 })}
      />
    </Screen>
  );
}
