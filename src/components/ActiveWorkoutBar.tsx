import { Ionicons } from '@expo/vector-icons';
import { useNavigation, type NavigationProp } from '@react-navigation/native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNow } from '../hooks/useNow';
import { useTranslation } from '../i18n/useTranslation';
import type { RootStackParamList } from '../navigation/types';
import { useActiveWorkout } from '../stores/activeWorkout';
import { colors, fontSize, spacing } from '../theme';
import { restRemainingSeconds } from '../utils/restTimer';
import { elapsedSeconds, formatDuration } from '../utils/time';

// La barra que se ve sobre las pestañas mientras hay un entrenamiento en curso.
// Es un componente aparte del que lleva el cronómetro para que solo haya un
// temporizador funcionando cuando de verdad hay un entrenamiento.
export function ActiveWorkoutBar() {
  const startedAt = useActiveWorkout((state) => state.workout?.startedAt);
  const name = useActiveWorkout((state) => state.workout?.name);

  if (!startedAt || name === undefined) {
    return null;
  }
  return <BarContent name={name} startedAt={startedAt} />;
}

function BarContent({ name, startedAt }: { name: string; startedAt: Date }) {
  const { t } = useTranslation();
  const now = useNow();
  const restEndsAt = useActiveWorkout((state) => state.rest?.endsAt);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => navigation.navigate('Workout')}
      style={({ pressed }) => [styles.bar, pressed && styles.pressed]}
    >
      <Ionicons name="barbell" size={22} color={colors.primary} />
      <View style={styles.text}>
        <Text style={styles.title}>{t('workout.inProgress')}</Text>
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>
      </View>
      {restEndsAt !== undefined ? (
        // Durante el descanso, la barra enseña lo que falta en lugar del cronómetro.
        <View style={styles.rest}>
          <Text style={styles.restLabel}>{t('workout.rest')}</Text>
          <Text style={styles.time}>{formatDuration(restRemainingSeconds(restEndsAt, now))}</Text>
        </View>
      ) : (
        <Text style={styles.time}>{formatDuration(elapsedSeconds(startedAt, now))}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bar: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderTopColor: colors.primary,
    borderTopWidth: 2,
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  pressed: { opacity: 0.7 },
  text: { flex: 1 },
  title: { color: colors.text, fontSize: fontSize.body, fontWeight: '600' },
  name: { color: colors.textMuted, fontSize: fontSize.body - 2 },
  rest: { alignItems: 'flex-end' },
  restLabel: { color: colors.textMuted, fontSize: fontSize.body - 4 },
  time: { color: colors.primary, fontSize: fontSize.title, fontWeight: '600' },
});
