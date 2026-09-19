import { StyleSheet, View } from 'react-native';
import { spacing } from '../theme';
import { Chip } from './Chip';

type Props<T extends string> = {
  options: readonly T[];
  labels: Record<T, string>;
  value: T;
  onChange: (value: T) => void;
  disabled?: boolean;
};

export function ChipGroup<T extends string>({
  options,
  labels,
  value,
  onChange,
  disabled,
}: Props<T>) {
  return (
    <View style={styles.group}>
      {options.map((option) => (
        <Chip
          key={option}
          label={labels[option]}
          selected={option === value}
          disabled={disabled}
          onPress={() => onChange(option)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  group: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
