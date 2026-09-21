import { StyleSheet, View } from 'react-native';
import { spacing } from '../theme';
import { Chip } from './Chip';

type Props<T extends string> = {
  options: readonly T[];
  getLabel: (option: T) => string;
  values: readonly T[];
  onChange: (values: T[]) => void;
  disabled?: boolean;
};

// Como ChipGroup, pero se pueden marcar varios: tocar un chip lo añade o lo quita.
export function MultiChipGroup<T extends string>({
  options,
  getLabel,
  values,
  onChange,
  disabled,
}: Props<T>) {
  function toggle(option: T) {
    onChange(values.includes(option) ? values.filter((v) => v !== option) : [...values, option]);
  }

  return (
    <View style={styles.group}>
      {options.map((option) => (
        <Chip
          key={option}
          label={getLabel(option)}
          selected={values.includes(option)}
          disabled={disabled}
          onPress={() => toggle(option)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  group: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
