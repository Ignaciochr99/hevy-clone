import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '../../components/Button';
import { IconButton } from '../../components/IconButton';
import { Screen } from '../../components/Screen';
import { Stepper } from '../../components/Stepper';
import { TextField } from '../../components/TextField';
import { translateError } from '../../i18n/translations';
import { useTranslation } from '../../i18n/useTranslation';
import type { RoutinesStackParamList } from '../../navigation/types';
import { repositories } from '../../repositories';
import { colors, fontSize, spacing } from '../../theme';
import { exerciseDisplayName } from '../../utils/exerciseName';
import {
  addItem,
  fromRoutine,
  moveItem,
  removeItem,
  setTarget,
  toRoutineInput,
  type DraftItem,
} from '../../utils/routineDraft';

type Props = NativeStackScreenProps<RoutinesStackParamList, 'RoutineEditor'>;

export function RoutineEditorScreen({ navigation, route }: Props) {
  const { t, language } = useTranslation();
  const routineId = route.params?.routineId;
  const pickedExerciseId = route.params?.pickedExerciseId;

  // Cada fila del borrador necesita una clave única para React.
  const keyCounter = useRef(0);
  const nextKey = useCallback(() => String(keyCounter.current++), []);

  const existing = useMemo(
    () => (routineId === undefined ? undefined : repositories.routines.getById(routineId)),
    [routineId],
  );

  // El borrador vive aquí, en estado local: nada se guarda hasta pulsar "Guardar".
  const [name, setName] = useState(existing?.name ?? '');
  const [items, setItems] = useState<DraftItem[]>(() =>
    existing ? fromRoutine(existing, nextKey) : [],
  );
  const [error, setError] = useState<string>();

  // Al elegir un ejercicio en el selector se vuelve aquí con `pickedExerciseId`.
  // Lo añadimos al borrador y limpiamos el parámetro para no añadirlo otra vez.
  useEffect(() => {
    if (pickedExerciseId === undefined) {
      return;
    }
    const exercise = repositories.exercises.getById(pickedExerciseId);
    if (exercise) {
      setItems((current) => addItem(current, exercise, nextKey()));
    }
    navigation.setParams({ pickedExerciseId: undefined });
  }, [pickedExerciseId, navigation, nextKey]);

  function save() {
    try {
      const input = toRoutineInput(name, items);
      if (existing) {
        repositories.routines.update(existing.id, input);
      } else {
        repositories.routines.create(input);
      }
      navigation.goBack();
    } catch (e) {
      setError(translateError(language, e));
    }
  }

  function confirmRemove() {
    if (!existing) {
      return;
    }
    Alert.alert(t('routineEditor.deleteTitle'), t('routineEditor.deleteConfirm', { name: existing.name }), [
      { text: t('form.cancel'), style: 'cancel' },
      {
        text: t('form.delete'),
        style: 'destructive',
        onPress: () => {
          try {
            repositories.routines.remove(existing.id);
            navigation.goBack();
          } catch (e) {
            Alert.alert(t('form.cannotDeleteTitle'), translateError(language, e));
          }
        },
      },
    ]);
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>{t('routineEditor.name')}</Text>
        <TextField
          value={name}
          onChangeText={(text) => {
            setName(text);
            setError(undefined);
          }}
          placeholder={t('routineEditor.namePlaceholder')}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Text style={styles.label}>{t('routineEditor.exercises')}</Text>
        {items.length === 0 ? <Text style={styles.empty}>{t('routineEditor.noExercises')}</Text> : null}

        {items.map((item, index) => (
          <View key={item.key} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.exerciseName}>
                {exerciseDisplayName({ name: item.exerciseName, nameEn: item.exerciseNameEn }, language)}
              </Text>
              <IconButton
                icon="arrow-up"
                accessibilityLabel={t('routineEditor.moveUp')}
                disabled={index === 0}
                onPress={() => setItems((current) => moveItem(current, item.key, -1))}
              />
              <IconButton
                icon="arrow-down"
                accessibilityLabel={t('routineEditor.moveDown')}
                disabled={index === items.length - 1}
                onPress={() => setItems((current) => moveItem(current, item.key, 1))}
              />
              <IconButton
                icon="close"
                accessibilityLabel={t('routineEditor.remove')}
                onPress={() => setItems((current) => removeItem(current, item.key))}
              />
            </View>
            <Stepper
              label={t('routineEditor.sets')}
              value={item.targetSets}
              onChange={(value) => setItems((current) => setTarget(current, item.key, 'targetSets', value))}
            />
            <Stepper
              label={t('routineEditor.reps')}
              value={item.targetReps}
              onChange={(value) => setItems((current) => setTarget(current, item.key, 'targetReps', value))}
            />
          </View>
        ))}

        <View style={styles.actions}>
          <Button title={t('routineEditor.addExercise')} onPress={() => navigation.navigate('PickExercise')} />
          <Button title={t('form.save')} onPress={save} />
          {existing ? <Button title={t('form.delete')} variant="danger" onPress={confirmRemove} /> : null}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: spacing.lg },
  label: {
    color: colors.textMuted,
    fontSize: fontSize.body,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  error: { color: colors.danger, fontSize: fontSize.body, marginTop: spacing.sm },
  empty: { color: colors.textMuted, fontSize: fontSize.body },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    gap: spacing.sm,
    marginTop: spacing.sm,
    padding: spacing.md,
  },
  cardHeader: { alignItems: 'center', flexDirection: 'row', gap: spacing.sm },
  exerciseName: { color: colors.text, flex: 1, fontSize: fontSize.body, fontWeight: '600' },
  actions: { gap: spacing.sm, marginTop: spacing.lg },
});
