import { Pressable, StyleSheet, Text, View } from 'react-native';
import { routineSummary } from '../../i18n/translations';
import { useTranslation } from '../../i18n/useTranslation';
import type { WorkoutSummary } from '../../repositories/workouts';
import { colors, fontSize, spacing } from '../../theme';
import { formatShortDate } from '../../utils/dateText';
import { formatVolume } from '../../utils/format';
import { formatDuration } from '../../utils/time';

type Props = { item: WorkoutSummary; onPress: () => void };

// Una fila de la lista de entrenamientos recientes.
export function WorkoutListItem({ item, onPress }: Props) {
  const { language } = useTranslation();

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.item, pressed && styles.pressed]}
    >
      <View style={styles.header}>
        <Text style={styles.name} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.date}>{formatShortDate(item.startedAt, language)}</Text>
      </View>
      <Text style={styles.meta}>
        {routineSummary(language, item.exerciseCount, item.setCount)} ·{' '}
        {formatDuration(item.durationSeconds)} · {formatVolume(item.volume, language)}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  item: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    gap: spacing.xs,
    padding: spacing.md,
  },
  pressed: { opacity: 0.6 },
  header: { alignItems: 'center', flexDirection: 'row', gap: spacing.sm },
  name: { color: colors.text, flex: 1, fontSize: fontSize.body, fontWeight: '600' },
  date: { color: colors.textMuted, fontSize: fontSize.body - 2 },
  meta: { color: colors.textMuted, fontSize: fontSize.body - 2 },
});
