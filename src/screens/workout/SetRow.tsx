import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { IconButton } from '../../components/IconButton';
import { TextField } from '../../components/TextField';
import type { ExerciseType, SetType } from '../../db/enums';
import { useTranslation } from '../../i18n/useTranslation';
import type { SetPatch, WorkoutSet } from '../../repositories/workouts';
import { colors, fontSize, spacing } from '../../theme';
import { parseDecimal, parseInteger } from '../../utils/parseInput';

type Props = {
  set: WorkoutSet;
  // Número de la serie entre las normales (1, 2, 3...); null si es de calentamiento o al fallo.
  number: number | null;
  exerciseType: ExerciseType;
  onChange: (patch: SetPatch) => void;
  onRemove: () => void;
};

// Al tocar la etiqueta de la serie, el tipo cambia: normal → calentamiento → fallo.
const NEXT_TYPE: Record<SetType, SetType> = { normal: 'warmup', warmup: 'failure', failure: 'normal' };

function toText(value: number | null): string {
  return value === null ? '' : String(value);
}

export function SetRow({ set, number, exerciseType, onChange, onRemove }: Props) {
  const { t } = useTranslation();

  // Lo que se ve en cada campo vive aquí mientras se teclea; cada valor válido se
  // guarda al momento (guardado continuo) y uno a medias, como "5.", solo se muestra.
  const [weightText, setWeightText] = useState(toText(set.weight));
  const [repsText, setRepsText] = useState(toText(set.reps));
  const [durationText, setDurationText] = useState(toText(set.durationSeconds));

  const label =
    set.type === 'normal'
      ? String(number)
      : set.type === 'warmup'
        ? t('workout.setShort.warmup')
        : t('workout.setShort.failure');

  return (
    <View style={[styles.row, set.completed && styles.completedRow]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('workout.setType')}
        onPress={() => onChange({ type: NEXT_TYPE[set.type] })}
        style={styles.label}
      >
        <Text style={[styles.labelText, set.type !== 'normal' && styles.labelSpecial]}>{label}</Text>
      </Pressable>

      {exerciseType === 'weight_reps' ? (
        <TextField
          style={styles.input}
          value={weightText}
          keyboardType="decimal-pad"
          selectTextOnFocus
          onChangeText={(text) => {
            setWeightText(text);
            const parsed = parseDecimal(text);
            if (parsed.valid) onChange({ weight: parsed.value });
          }}
        />
      ) : null}

      {exerciseType === 'duration' ? (
        <TextField
          style={styles.input}
          value={durationText}
          keyboardType="number-pad"
          selectTextOnFocus
          onChangeText={(text) => {
            setDurationText(text);
            const parsed = parseInteger(text);
            if (parsed.valid) onChange({ durationSeconds: parsed.value });
          }}
        />
      ) : (
        <TextField
          style={styles.input}
          value={repsText}
          keyboardType="number-pad"
          selectTextOnFocus
          onChangeText={(text) => {
            setRepsText(text);
            const parsed = parseInteger(text);
            if (parsed.valid) onChange({ reps: parsed.value });
          }}
        />
      )}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('workout.completeSet')}
        accessibilityState={{ selected: set.completed }}
        onPress={() => onChange({ completed: !set.completed })}
        style={[styles.check, set.completed && styles.checkDone]}
      >
        <Ionicons
          name="checkmark"
          size={22}
          color={set.completed ? colors.onPrimary : colors.textMuted}
        />
      </Pressable>

      <IconButton icon="close" accessibilityLabel={t('workout.removeSet')} onPress={onRemove} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    borderRadius: 8,
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  // El color primario con transparencia (#RRGGBBAA): un tinte suave.
  completedRow: { backgroundColor: `${colors.primary}22` },
  label: { alignItems: 'center', justifyContent: 'center', width: 36 },
  labelText: { color: colors.textMuted, fontSize: fontSize.body, fontWeight: '600' },
  labelSpecial: { color: colors.primary },
  input: { flex: 1, paddingVertical: spacing.xs + 2, textAlign: 'center' },
  check: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  checkDone: { backgroundColor: colors.primary, borderColor: colors.primary },
});
