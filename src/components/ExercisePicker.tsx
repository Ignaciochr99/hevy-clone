import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { EQUIPMENT, MUSCLE_GROUPS, type Equipment, type MuscleGroup } from '../db/enums';
import { repositories } from '../repositories';
import type { Exercise } from '../repositories/exercises';
import { colors, fontSize, spacing } from '../theme';
import { EQUIPMENT_LABELS, MUSCLE_GROUP_LABELS } from '../utils/labels';
import { Button } from './Button';
import { Chip } from './Chip';
import { TextField } from './TextField';

type Props = {
  onSelect: (exercise: Exercise) => void;
  onCreate: () => void;
};

type FilterRowProps<T extends string> = {
  options: readonly T[];
  labels: Record<T, string>;
  allLabel: string;
  value: T | undefined;
  onChange: (value: T | undefined) => void;
};

// Fila de filtros con desplazamiento horizontal. Tocar el chip activo lo quita.
function FilterRow<T extends string>({ options, labels, allLabel, value, onChange }: FilterRowProps<T>) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.row}
      contentContainerStyle={styles.chips}
    >
      <Chip label={allLabel} selected={value === undefined} onPress={() => onChange(undefined)} />
      {options.map((option) => (
        <Chip
          key={option}
          label={labels[option]}
          selected={value === option}
          onPress={() => onChange(value === option ? undefined : option)}
        />
      ))}
    </ScrollView>
  );
}

export function ExercisePicker({ onSelect, onCreate }: Props) {
  const [search, setSearch] = useState('');
  const [muscleGroup, setMuscleGroup] = useState<MuscleGroup>();
  const [equipment, setEquipment] = useState<Equipment>();
  const [version, setVersion] = useState(0);

  // Al volver a esta pantalla (por ejemplo tras crear un ejercicio) se recarga la lista.
  useFocusEffect(
    useCallback(() => {
      setVersion((current) => current + 1);
    }, []),
  );

  const exercises = useMemo(
    () => repositories.exercises.list({ search, muscleGroup, equipment }),
    // `version` no se usa dentro, pero cambiarlo fuerza a recalcular.
    [search, muscleGroup, equipment, version],
  );

  return (
    <View style={styles.container}>
      <TextField
        value={search}
        onChangeText={setSearch}
        placeholder="Buscar ejercicio"
        autoCorrect={false}
      />
      <FilterRow
        options={MUSCLE_GROUPS}
        labels={MUSCLE_GROUP_LABELS}
        allLabel="Todos los músculos"
        value={muscleGroup}
        onChange={setMuscleGroup}
      />
      <FilterRow
        options={EQUIPMENT}
        labels={EQUIPMENT_LABELS}
        allLabel="Todo el equipo"
        value={equipment}
        onChange={setEquipment}
      />
      <Button title="Crear ejercicio propio" onPress={onCreate} />

      <FlatList
        data={exercises}
        keyExtractor={(item) => String(item.id)}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={<Text style={styles.empty}>No hay ejercicios con esos filtros</Text>}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => onSelect(item)}
            style={({ pressed }) => [styles.item, pressed && styles.pressed]}
          >
            <View style={styles.itemText}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemMeta}>
                {MUSCLE_GROUP_LABELS[item.muscleGroup]} · {EQUIPMENT_LABELS[item.equipment]}
              </Text>
            </View>
            {item.isCustom ? <Text style={styles.badge}>Propio</Text> : null}
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, gap: spacing.sm },
  row: { flexGrow: 0 },
  chips: { gap: spacing.sm },
  empty: { color: colors.textMuted, fontSize: fontSize.body, marginTop: spacing.lg, textAlign: 'center' },
  item: {
    alignItems: 'center',
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    paddingVertical: spacing.sm + spacing.xs,
  },
  pressed: { opacity: 0.6 },
  itemText: { flex: 1 },
  itemName: { color: colors.text, fontSize: fontSize.body },
  itemMeta: { color: colors.textMuted, fontSize: fontSize.body - 2, marginTop: spacing.xs },
  badge: { color: colors.primary, fontSize: fontSize.body - 2, fontWeight: '600' },
});
