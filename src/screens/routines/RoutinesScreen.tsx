import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '../../components/Button';
import { Screen } from '../../components/Screen';
import { useTranslation } from '../../i18n/useTranslation';
import type { RoutinesStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RoutinesStackParamList, 'Routines'>;

export function RoutinesScreen({ navigation }: Props) {
  const { t } = useTranslation();

  return (
    <Screen title={t('routines.placeholder')}>
      <Button title={t('routines.create')} onPress={() => navigation.navigate('RoutineEditor')} />
    </Screen>
  );
}
