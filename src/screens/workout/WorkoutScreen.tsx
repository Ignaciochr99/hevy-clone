import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '../../components/Button';
import { IconButton } from '../../components/IconButton';
import { Screen } from '../../components/Screen';
import { routineSummary, translateError } from '../../i18n/translations';
import { useTranslation } from '../../i18n/useTranslation';
import { useNow } from '../../hooks/useNow';
import type { RootStackParamList } from '../../navigation/types';
import { useActiveWorkout } from '../../stores/activeWorkout';
import { colors, fontSize, spacing } from '../../theme';
import { exerciseDisplayName } from '../../utils/exerciseName';
import { elapsedSeconds, formatDuration } from '../../utils/time';
import { SetRow } from './SetRow';

type Props = NativeStackScreenProps<RootStackParamList, 'Workout'>;

export function WorkoutScreen({ navigation }: Props) {
  const { t, language } = useTranslation();
  const workout = useActiveWorkout((state) => state.workout);
  const now = useNow();

  // Al terminar o descartar, el entrenamiento desaparece del store y el modal se cierra.
  useEffect(() => {
    if (!workout) {
      navigation.goBack();
    }
  }, [workout, navigation]);

  if (!workout) {
    return null;
  }

  // Ejecuta una acción del store y, si una regla falla, muestra el error traducido.
  function run(action: () => void) {
    try {
      action();
    } catch (e) {
      Alert.alert(t('common.errorTitle'), translateError(language, e));
    }
  }

  const store = useActiveWorkout.getState();
  const allSets = workout.exercises.flatMap((exercise) => exercise.sets);
  const completedCount = allSets.filter((set) => set.completed).length;
  const incompleteCount = allSets.length - completedCount;

  function discard() {
    Alert.alert(t('workout.discardTitle'), t('workout.discardConfirm'), [
      { text: t('form.cancel'), style: 'cancel' },
      { text: t('workout.discard'), style: 'destructive', onPress: () => run(() => store.discard()) },
    ]);
  }

  function saveWorkout() {
    run(() => {
      const finished = store.finish();
      const sets = finished.exercises.reduce((total, exercise) => total + exercise.sets.length, 0);
      const seconds = elapsedSeconds(finished.startedAt, (finished.finishedAt ?? new Date()).getTime());
      Alert.alert(
        t('workout.saved'),
        `${routineSummary(language, finished.exercises.length, sets)} · ${formatDuration(seconds)}`,
      );
    });
  }

  function finish() {
    if (completedCount === 0) {
      Alert.alert(t('workout.nothingToSaveTitle'), t('error.workout.nothingCompleted'), [
        { text: t('form.cancel'), style: 'cancel' },
        { text: t('workout.discard'), style: 'destructive', onPress: () => run(() => store.discard()) },
      ]);
      return;
    }
    if (incompleteCount > 0) {
      Alert.alert(t('workout.finishTitle'), t('workout.finishIncomplete', { count: incompleteCount }), [
        { text: t('form.cancel'), style: 'cancel' },
        { text: t('workout.finishConfirm'), onPress: saveWorkout },
      ]);
      return;
    }
    saveWorkout();
  }

  function removeExercise(workoutExerciseId: number, name: string) {
    Alert.alert(t('workout.removeExercise'), t('workout.removeExerciseConfirm', { name }), [
      { text: t('form.cancel'), style: 'cancel' },
      {
        text: t('form.delete'),
        style: 'destructive',
        onPress: () => run(() => store.removeExercise(workoutExerciseId)),
      },
    ]);
  }

  return (
    <Screen>
      <View style={styles.top}>
        <View style={styles.topText}>
          <Text style={styles.name} numberOfLines={1}>
            {workout.name}
          </Text>
          <Text style={styles.elapsed}>{formatDuration(elapsedSeconds(workout.startedAt, now))}</Text>
        </View>
        <Button title={t('workout.finish')} onPress={finish} />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {workout.exercises.length === 0 ? <Text style={styles.empty}>{t('workout.empty')}</Text> : null}

        {workout.exercises.map((exercise) => {
          const name = exerciseDisplayName(
            { name: exercise.exerciseName, nameEn: exercise.exerciseNameEn },
            language,
          );
          let normalCount = 0;

          return (
            <View key={exercise.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.exerciseName}>{name}</Text>
                <IconButton
                  icon="trash-outline"
                  accessibilityLabel={t('workout.removeExercise')}
                  onPress={() => removeExercise(exercise.id, name)}
                />
              </View>

              <View style={styles.columns}>
                <Text style={[styles.column, styles.columnSet]}>{t('workout.column.set')}</Text>
                {exercise.exerciseType === 'weight_reps' ? (
                  <Text style={[styles.column, styles.columnInput]}>{t('workout.column.weight')}</Text>
                ) : null}
                <Text style={[styles.column, styles.columnInput]}>
                  {exercise.exerciseType === 'duration' ? t('workout.column.time') : t('workout.column.reps')}
                </Text>
                <View style={styles.columnActions} />
              </View>

              {exercise.sets.map((set) => (
                <SetRow
                  key={set.id}
                  set={set}
                  number={set.type === 'normal' ? ++normalCount : null}
                  exerciseType={exercise.exerciseType}
                  onChange={(patch) => run(() => store.updateSet(set.id, patch))}
                  onRemove={() => run(() => store.removeSet(set.id))}
                />
              ))}

              <Button
                title={t('workout.addSet')}
                variant="secondary"
                onPress={() => run(() => store.addSet(exercise.id))}
              />
            </View>
          );
        })}

        <View style={styles.actions}>
          <Button title={t('workout.addExercise')} onPress={() => navigation.navigate('WorkoutPickExercise')} />
          <Button title={t('workout.discard')} variant="danger" onPress={discard} />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { alignItems: 'center', flexDirection: 'row', gap: spacing.md, marginBottom: spacing.sm },
  topText: { flex: 1 },
  name: { color: colors.text, fontSize: fontSize.title, fontWeight: '600' },
  elapsed: { color: colors.primary, fontSize: fontSize.body, fontWeight: '600', marginTop: spacing.xs },
  content: { gap: spacing.md, paddingBottom: spacing.lg },
  empty: { color: colors.textMuted, fontSize: fontSize.body, marginTop: spacing.md, textAlign: 'center' },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    gap: spacing.xs,
    padding: spacing.md,
  },
  cardHeader: { alignItems: 'center', flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.xs },
  exerciseName: { color: colors.text, flex: 1, fontSize: fontSize.body, fontWeight: '600' },
  columns: { alignItems: 'center', flexDirection: 'row', gap: spacing.sm },
  column: { color: colors.textMuted, fontSize: fontSize.body - 4, textAlign: 'center' },
  columnSet: { width: 36 },
  columnInput: { flex: 1 },
  // El mismo ancho que el botón de completar y el de quitar, más el hueco entre ellos.
  columnActions: { width: 36 + spacing.sm + 36 },
  actions: { gap: spacing.sm, marginTop: spacing.sm },
});
