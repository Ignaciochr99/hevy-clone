import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Button } from '../../components/Button';
import { Screen } from '../../components/Screen';
import { muscleVolumeSummary, routineSummary } from '../../i18n/translations';
import { useTranslation } from '../../i18n/useTranslation';
import type { RoutinesStackParamList } from '../../navigation/types';
import { repositories } from '../../repositories';
import { colors, fontSize, spacing } from '../../theme';
import { useStartWorkout } from '../workout/useStartWorkout';

type Props = NativeStackScreenProps<RoutinesStackParamList, 'Routines'>;

export function RoutinesScreen({ navigation }: Props) {
  const { t, language } = useTranslation();
  const { startEmpty, startFromRoutine } = useStartWorkout();
  const [version, setVersion] = useState(0);

  // Al volver de crear o editar una rutina, la lista se recarga.
  useFocusEffect(
    useCallback(() => {
      setVersion((current) => current + 1);
    }, []),
  );

  const routines = useMemo(
    () => repositories.routines.list(),
    // `version` no se usa dentro, pero cambiarlo fuerza a recalcular.
    [version],
  );

  return (
    <Screen>
      <View style={styles.buttons}>
        <Button title={t('routines.startEmpty')} onPress={startEmpty} />
        <Button
          title={t('routines.create')}
          variant="secondary"
          onPress={() => navigation.navigate('RoutineEditor')}
        />
      </View>

      <FlatList
        style={styles.list}
        data={routines}
        keyExtractor={(item) => String(item.id)}
        ListEmptyComponent={<Text style={styles.empty}>{t('routines.empty')}</Text>}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Pressable
              onPress={() => navigation.navigate('RoutineEditor', { routineId: item.id })}
              style={({ pressed }) => [styles.itemText, pressed && styles.pressed]}
            >
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.meta}>
                {routineSummary(language, item.exerciseCount, item.totalSets)}
              </Text>
              {item.muscleVolume.length > 0 ? (
                <Text style={styles.meta}>{muscleVolumeSummary(language, item.muscleVolume)}</Text>
              ) : null}
            </Pressable>
            <Button title={t('routines.start')} onPress={() => startFromRoutine(item.id)} />
          </View>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  buttons: { gap: spacing.sm },
  list: { marginTop: spacing.md },
  empty: { color: colors.textMuted, fontSize: fontSize.body, marginTop: spacing.lg, textAlign: 'center' },
  item: {
    alignItems: 'center',
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    paddingVertical: spacing.sm + spacing.xs,
  },
  itemText: { flex: 1 },
  pressed: { opacity: 0.6 },
  name: { color: colors.text, fontSize: fontSize.body },
  meta: { color: colors.textMuted, fontSize: fontSize.body - 2, marginTop: spacing.xs },
});
