import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { Screen } from '../../components/Screen';
import { repositories } from '../../repositories';
import { colors, fontSize } from '../../theme';

export function ExerciseLibraryScreen() {
  const [count] = useState(() => repositories.exercises.list().length);

  return (
    <Screen title="Aquí irá la biblioteca de ejercicios">
      <Text style={styles.count}>{count} ejercicios en la base de datos</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  count: { color: colors.textMuted, fontSize: fontSize.body },
});
