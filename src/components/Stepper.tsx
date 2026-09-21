import { StyleSheet, Text, View } from 'react-native';
import { colors, fontSize, spacing } from '../theme';
import { IconButton } from './IconButton';

type Props = {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
};

// Un contador con los botones − y +. No baja de `min`.
export function Stepper({ label, value, onChange, min = 1 }: Props) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.controls}>
        <IconButton
          icon="remove"
          accessibilityLabel={`${label} −`}
          disabled={value <= min}
          onPress={() => onChange(value - 1)}
        />
        <Text style={styles.value}>{value}</Text>
        <IconButton icon="add" accessibilityLabel={`${label} +`} onPress={() => onChange(value + 1)} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  label: { color: colors.textMuted, fontSize: fontSize.body },
  controls: { alignItems: 'center', flexDirection: 'row', gap: spacing.sm },
  value: {
    color: colors.text,
    fontSize: fontSize.body,
    fontWeight: '600',
    minWidth: 32,
    textAlign: 'center',
  },
});
