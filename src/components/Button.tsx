import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, fontSize, spacing } from '../theme';

type Props = { title: string; onPress: () => void; variant?: 'primary' | 'danger' };

export function Button({ title, onPress, variant = 'primary' }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        variant === 'danger' && styles.danger,
        pressed && styles.pressed,
      ]}
    >
      <Text style={styles.label}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: spacing.sm + spacing.xs,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
  },
  danger: { backgroundColor: colors.danger },
  pressed: { opacity: 0.7 },
  label: { color: colors.onPrimary, fontSize: fontSize.body, fontWeight: '600' },
});
