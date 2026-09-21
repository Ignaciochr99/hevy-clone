import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '../../components/Button';
import { ChipGroup } from '../../components/ChipGroup';
import { MultiChipGroup } from '../../components/MultiChipGroup';
import { Screen } from '../../components/Screen';
import { TextField } from '../../components/TextField';
import {
  EQUIPMENT,
  EXERCISE_TYPES,
  MUSCLE_GROUPS,
  type Equipment,
  type ExerciseType,
  type MuscleGroup,
} from '../../db/enums';
import { translateError } from '../../i18n/translations';
import { useTranslation } from '../../i18n/useTranslation';
import type { ProfileStackParamList } from '../../navigation/types';
import { repositories } from '../../repositories';
import { colors, fontSize, spacing } from '../../theme';
import { exerciseDisplayName } from '../../utils/exerciseName';

type Props = NativeStackScreenProps<ProfileStackParamList, 'ExerciseForm'>;

export function ExerciseFormScreen({ navigation, route }: Props) {
  const { t, language } = useTranslation();
  const exerciseId = route.params.exerciseId;
  const existing = useMemo(
    () => (exerciseId === undefined ? undefined : repositories.exercises.getById(exerciseId)),
    [exerciseId],
  );
  const readOnly = existing !== undefined && !existing.isCustom;

  const [name, setName] = useState(existing ? exerciseDisplayName(existing, language) : '');
  const [muscleGroup, setMuscleGroup] = useState<MuscleGroup>(existing?.muscleGroup ?? 'chest');
  const [secondary, setSecondary] = useState<MuscleGroup[]>(existing?.secondaryMuscleGroups ?? []);
  const [equipment, setEquipment] = useState<Equipment>(existing?.equipment ?? 'barbell');
  const [type, setType] = useState<ExerciseType>(existing?.type ?? 'weight_reps');
  const [error, setError] = useState<string>();

  // Un grupo no puede ser a la vez principal y secundario: al elegirlo como
  // principal, se quita de los secundarios.
  function changeMuscleGroup(group: MuscleGroup) {
    setMuscleGroup(group);
    setSecondary((current) => current.filter((item) => item !== group));
  }

  function save() {
    try {
      const input = { name, muscleGroup, secondaryMuscleGroups: secondary, equipment, type };
      if (existing) {
        repositories.exercises.update(existing.id, input);
      } else {
        repositories.exercises.create(input);
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
    Alert.alert(t('form.deleteTitle'), t('form.deleteConfirm', { name: existing.name }), [
      { text: t('form.cancel'), style: 'cancel' },
      {
        text: t('form.delete'),
        style: 'destructive',
        onPress: () => {
          try {
            repositories.exercises.remove(existing.id);
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
        {readOnly ? <Text style={styles.note}>{t('form.readOnlyNote')}</Text> : null}

        <Text style={styles.label}>{t('form.name')}</Text>
        <TextField
          value={name}
          onChangeText={(text) => {
            setName(text);
            setError(undefined);
          }}
          placeholder={t('form.namePlaceholder')}
          editable={!readOnly}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Text style={styles.label}>{t('form.primaryMuscle')}</Text>
        <ChipGroup
          options={MUSCLE_GROUPS}
          getLabel={(group) => t(`muscle.${group}`)}
          value={muscleGroup}
          onChange={changeMuscleGroup}
          disabled={readOnly}
        />

        <Text style={styles.label}>{t('form.secondaryMuscles')}</Text>
        <MultiChipGroup
          options={MUSCLE_GROUPS.filter((group) => group !== muscleGroup)}
          getLabel={(group) => t(`muscle.${group}`)}
          values={secondary}
          onChange={setSecondary}
          disabled={readOnly}
        />

        <Text style={styles.label}>{t('form.equipment')}</Text>
        <ChipGroup
          options={EQUIPMENT}
          getLabel={(item) => t(`equipment.${item}`)}
          value={equipment}
          onChange={setEquipment}
          disabled={readOnly}
        />

        <Text style={styles.label}>{t('form.type')}</Text>
        <ChipGroup
          options={EXERCISE_TYPES}
          getLabel={(item) => t(`exerciseType.${item}`)}
          value={type}
          onChange={setType}
          disabled={readOnly}
        />

        {readOnly ? null : (
          <View style={styles.actions}>
            <Button title={t('form.save')} onPress={save} />
            {existing ? (
              <Button title={t('form.delete')} variant="danger" onPress={confirmRemove} />
            ) : null}
          </View>
        )}
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
  note: { color: colors.textMuted, fontSize: fontSize.body },
  error: { color: colors.danger, fontSize: fontSize.body, marginTop: spacing.sm },
  actions: { gap: spacing.sm, marginTop: spacing.lg },
});
