import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '../../components/Button';
import { ChipGroup } from '../../components/ChipGroup';
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
import type { ProfileStackParamList } from '../../navigation/types';
import { repositories } from '../../repositories';
import { colors, fontSize, spacing } from '../../theme';
import { EQUIPMENT_LABELS, EXERCISE_TYPE_LABELS, MUSCLE_GROUP_LABELS } from '../../utils/labels';

type Props = NativeStackScreenProps<ProfileStackParamList, 'ExerciseForm'>;

function messageOf(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export function ExerciseFormScreen({ navigation, route }: Props) {
  const exerciseId = route.params.exerciseId;
  const existing = useMemo(
    () => (exerciseId === undefined ? undefined : repositories.exercises.getById(exerciseId)),
    [exerciseId],
  );
  const readOnly = existing !== undefined && !existing.isCustom;

  const [name, setName] = useState(existing?.name ?? '');
  const [muscleGroup, setMuscleGroup] = useState<MuscleGroup>(existing?.muscleGroup ?? 'chest');
  const [equipment, setEquipment] = useState<Equipment>(existing?.equipment ?? 'barbell');
  const [type, setType] = useState<ExerciseType>(existing?.type ?? 'weight_reps');
  const [error, setError] = useState<string>();

  function save() {
    try {
      const input = { name, muscleGroup, equipment, type };
      if (existing) {
        repositories.exercises.update(existing.id, input);
      } else {
        repositories.exercises.create(input);
      }
      navigation.goBack();
    } catch (e) {
      setError(messageOf(e, 'No se pudo guardar el ejercicio'));
    }
  }

  function confirmRemove() {
    if (!existing) {
      return;
    }
    Alert.alert('Eliminar ejercicio', `¿Eliminar "${existing.name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => {
          try {
            repositories.exercises.remove(existing.id);
            navigation.goBack();
          } catch (e) {
            Alert.alert('No se puede eliminar', messageOf(e, 'Error desconocido'));
          }
        },
      },
    ]);
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {readOnly ? (
          <Text style={styles.note}>
            Es un ejercicio de la biblioteca: no se puede modificar ni eliminar.
          </Text>
        ) : null}

        <Text style={styles.label}>Nombre</Text>
        <TextField
          value={name}
          onChangeText={(text) => {
            setName(text);
            setError(undefined);
          }}
          placeholder="Por ejemplo: Press inclinado"
          editable={!readOnly}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Text style={styles.label}>Grupo muscular</Text>
        <ChipGroup
          options={MUSCLE_GROUPS}
          labels={MUSCLE_GROUP_LABELS}
          value={muscleGroup}
          onChange={setMuscleGroup}
          disabled={readOnly}
        />

        <Text style={styles.label}>Equipo</Text>
        <ChipGroup
          options={EQUIPMENT}
          labels={EQUIPMENT_LABELS}
          value={equipment}
          onChange={setEquipment}
          disabled={readOnly}
        />

        <Text style={styles.label}>Tipo</Text>
        <ChipGroup
          options={EXERCISE_TYPES}
          labels={EXERCISE_TYPE_LABELS}
          value={type}
          onChange={setType}
          disabled={readOnly}
        />

        {readOnly ? null : (
          <View style={styles.actions}>
            <Button title="Guardar" onPress={save} />
            {existing ? <Button title="Eliminar" variant="danger" onPress={confirmRemove} /> : null}
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
