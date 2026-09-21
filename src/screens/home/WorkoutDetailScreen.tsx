import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../../components/Screen';
import { useTranslation } from '../../i18n/useTranslation';
import type { HomeStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<HomeStackParamList, 'WorkoutDetail'>;

export function WorkoutDetailScreen({ route }: Props) {
  const { t } = useTranslation();

  return <Screen title={t('workoutDetail.title', { id: route.params.workoutId })} />;
}
