import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '../../components/Button';
import { Screen } from '../../components/Screen';
import type { ExerciseType } from '../../db/enums';
import { routineSummary, translateError } from '../../i18n/translations';
import { useTranslation } from '../../i18n/useTranslation';
import type { HomeStackParamList } from '../../navigation/types';
import { repositories } from '../../repositories';
import type { WorkoutSet } from '../../repositories/workouts';
import { colors, fontSize, spacing } from '../../theme';
import { formatShortDate } from '../../utils/dateText';
import { exerciseDisplayName } from '../../utils/exerciseName';
import { formatNumber, formatVolume } from '../../utils/format';
import { elapsedSeconds, formatDuration } from '../../utils/time';
import { workoutVolume } from '../../utils/workoutStats';

type Props = NativeStackScreenProps<HomeStackParamList, 'WorkoutDetail'>;

export function WorkoutDetailScreen({ navigation, route }: Props) {
  const { t, language } = useTranslation();
  // Un entrenamiento terminado no cambia mientras se mira: se lee una sola vez.
  const [workout] = useState(() => repositories.workouts.getById(route.params.workoutId));

  if (!workout || workout.finishedAt === null) {
    return (
      <Screen>
        <Text style={styles.empty}>{t('workoutDetail.notFound')}</Text>
      </Screen>
    );
  }
  const { id, name, startedAt, finishedAt, exercises } = workout;

  function setText(set: WorkoutSet, type: ExerciseType): string {
    if (type === 'duration') {
      return formatDuration(set.durationSeconds ?? 0);
    }
    if (type === 'reps_only') {
      return t('workoutDetail.setReps', { reps: set.reps ?? 0 });
    }
    return t('workoutDetail.setWeightReps', {
      weight: formatNumber(set.weight ?? 0, language),
      reps: set.reps ?? 0,
    });
  }

  function confirmDelete() {
    Alert.alert(t('workoutDetail.deleteTitle'), t('workoutDetail.deleteConfirm', { name }), [
      { text: t('form.cancel'), style: 'cancel' },
      {
        text: t('form.delete'),
        style: 'destructive',
        onPress: () => {
          try {
            repositories.workouts.deleteFinished(id);
            navigation.goBack();
          } catch (e) {
            Alert.alert(t('common.errorTitle'), translateError(language, e));
          }
        },
      },
    ]);
  }

  const totalSets = exercises.reduce((total, exercise) => total + exercise.sets.length, 0);

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <View>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.meta}>
            {formatShortDate(startedAt, language)} ·{' '}
            {formatDuration(elapsedSeconds(startedAt, finishedAt.getTime()))} ·{' '}
            {formatVolume(workoutVolume(workout), language)}
          </Text>
          <Text style={styles.meta}>{routineSummary(language, exercises.length, totalSets)}</Text>
        </View>

        {exercises.map((exercise) => {
          let normalCount = 0;
          return (
            <View key={exercise.id} style={styles.card}>
              <Text style={styles.exerciseName}>
                {exerciseDisplayName(
                  { name: exercise.exerciseName, nameEn: exercise.exerciseNameEn },
                  language,
                )}
              </Text>
              {exercise.sets.map((set) => (
                <View key={set.id} style={styles.setRow}>
                  <Text style={styles.setLabel}>
                    {set.type === 'normal'
                      ? ++normalCount
                      : set.type === 'warmup'
                        ? t('workout.setShort.warmup')
                        : t('workout.setShort.failure')}
                  </Text>
                  <Text style={styles.setValue}>{setText(set, exercise.exerciseType)}</Text>
                </View>
              ))}
            </View>
          );
        })}

        <Button title={t('workoutDetail.delete')} variant="danger" onPress={confirmDelete} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing.md, paddingBottom: spacing.lg },
  empty: { color: colors.textMuted, fontSize: fontSize.body, marginTop: spacing.md, textAlign: 'center' },
  name: { color: colors.text, fontSize: fontSize.title, fontWeight: '600' },
  meta: { color: colors.textMuted, fontSize: fontSize.body - 2, marginTop: spacing.xs },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    gap: spacing.xs,
    padding: spacing.md,
  },
  exerciseName: { color: colors.text, fontSize: fontSize.body, fontWeight: '600', marginBottom: spacing.xs },
  setRow: { flexDirection: 'row', gap: spacing.md },
  setLabel: { color: colors.textMuted, fontSize: fontSize.body, textAlign: 'center', width: 28 },
  setValue: { color: colors.text, fontSize: fontSize.body },
});
