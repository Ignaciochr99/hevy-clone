import { StyleSheet, Text, View } from 'react-native';
import { colors, fontSize, spacing } from '../theme';
import { IconButton } from './IconButton';

type Props = {
  label: string;
  // El valor ya formateado: "3", "8,5", "—", "1:30"...
  valueText: string;
  onDecrease: () => void;
  onIncrease: () => void;
  decreaseDisabled?: boolean;
  increaseDisabled?: boolean;
};

// Un contador con los botones − y +. No sabe qué representa el valor: quien lo
// usa decide cómo se escribe y cuándo se agota cada botón.
export function Stepper({
  label,
  valueText,
  onDecrease,
  onIncrease,
  decreaseDisabled,
  increaseDisabled,
}: Props) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.controls}>
        <IconButton
          icon="remove"
          accessibilityLabel={`${label} −`}
          disabled={decreaseDisabled}
          onPress={onDecrease}
        />
        <Text style={styles.value}>{valueText}</Text>
        <IconButton
          icon="add"
          accessibilityLabel={`${label} +`}
          disabled={increaseDisabled}
          onPress={onIncrease}
        />
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
    minWidth: 48,
    textAlign: 'center',
  },
});
