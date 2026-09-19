import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, fontSize, spacing } from '../theme';

type Props = {
  label: string;
  selected: boolean;
  onPress: () => void;
  disabled?: boolean;
};

export function Chip({ label, selected, onPress, disabled = false }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[styles.chip, selected && styles.selected, disabled && !selected && styles.dimmed]}
    >
      <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
  },
  selected: { backgroundColor: colors.primary, borderColor: colors.primary },
  dimmed: { opacity: 0.4 },
  label: { color: colors.textMuted, fontSize: fontSize.body - 2 },
  labelSelected: { color: colors.onPrimary, fontWeight: '600' },
});
