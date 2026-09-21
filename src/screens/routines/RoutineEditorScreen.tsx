import { Screen } from '../../components/Screen';
import { useTranslation } from '../../i18n/useTranslation';

export function RoutineEditorScreen() {
  const { t } = useTranslation();

  return <Screen title={t('routineEditor.placeholder')} />;
}
