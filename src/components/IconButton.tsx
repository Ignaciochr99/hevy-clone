import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { colors, spacing } from '../theme';

type Props = {
  icon: ComponentProps<typeof Ionicons>['name'];
  onPress: () => void;
  // Lo lee el lector de pantalla, ya que el botón solo tiene un icono.
  accessibilityLabel: string;
  disabled?: boolean;
};

export function IconButton({ icon, onPress, accessibilityLabel, disabled = false }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      disabled={disabled}
      hitSlop={spacing.xs}
      onPress={onPress}
      style={({ pressed }) => [styles.button, disabled && styles.disabled, pressed && styles.pressed]}
    >
      <Ionicons name={icon} size={22} color={colors.text} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  disabled: { opacity: 0.3 },
  pressed: { opacity: 0.6 },
});
