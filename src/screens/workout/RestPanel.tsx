import { StyleSheet, Text, View } from 'react-native';
import { Button } from '../../components/Button';
import { useNow } from '../../hooks/useNow';
import { useTranslation } from '../../i18n/useTranslation';
import { useActiveWorkout } from '../../stores/activeWorkout';
import { colors, fontSize, spacing } from '../../theme';
import { REST_ADJUST_SECONDS, restRemainingSeconds } from '../../utils/restTimer';
import { formatDuration } from '../../utils/time';

// El panel del descanso: aparece bajo la cabecera mientras hay un descanso en
// marcha. Es un componente aparte del que cuenta el tiempo para que solo haya
// un temporizador de pantalla funcionando cuando de verdad hay descanso.
export function RestPanel() {
  const endsAt = useActiveWorkout((state) => state.rest?.endsAt);
  if (endsAt === undefined) {
    return null;
  }
  return <PanelContent endsAt={endsAt} />;
}

function PanelContent({ endsAt }: { endsAt: number }) {
  const { t } = useTranslation();
  const now = useNow(250);
  const store = useActiveWorkout.getState();

  return (
    <View style={styles.panel}>
      <View style={styles.header}>
        <Text style={styles.label}>{t('workout.rest')}</Text>
        <Text style={styles.time}>{formatDuration(restRemainingSeconds(endsAt, now))}</Text>
      </View>
      <View style={styles.buttons}>
        <View style={styles.button}>
          <Button
            title={`−${REST_ADJUST_SECONDS}`}
            variant="secondary"
            onPress={() => store.adjustRest(-REST_ADJUST_SECONDS)}
          />
        </View>
        <View style={styles.button}>
          <Button
            title={`+${REST_ADJUST_SECONDS}`}
            variant="secondary"
            onPress={() => store.adjustRest(REST_ADJUST_SECONDS)}
          />
        </View>
        <View style={styles.button}>
          <Button title={t('workout.restSkip')} onPress={() => store.skipRest()} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: colors.surface,
    borderColor: colors.primary,
    borderRadius: 12,
    borderWidth: 1,
    gap: spacing.sm,
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  label: { color: colors.textMuted, fontSize: fontSize.body, fontWeight: '600' },
  time: { color: colors.primary, fontSize: fontSize.title, fontWeight: '700' },
  buttons: { flexDirection: 'row', gap: spacing.sm },
  button: { flex: 1 },
});
