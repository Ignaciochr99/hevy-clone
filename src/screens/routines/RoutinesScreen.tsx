import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text } from 'react-native';
import { Button } from '../../components/Button';
import { Screen } from '../../components/Screen';
import { routineSummary } from '../../i18n/translations';
import { useTranslation } from '../../i18n/useTranslation';
import type { RoutinesStackParamList } from '../../navigation/types';
import { repositories } from '../../repositories';
import { colors, fontSize, spacing } from '../../theme';

type Props = NativeStackScreenProps<RoutinesStackParamList, 'Routines'>;

export function RoutinesScreen({ navigation }: Props) {
  const { t, language } = useTranslation();
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
      <Button title={t('routines.create')} onPress={() => navigation.navigate('RoutineEditor')} />

      <FlatList
        style={styles.list}
        data={routines}
        keyExtractor={(item) => String(item.id)}
        ListEmptyComponent={<Text style={styles.empty}>{t('routines.empty')}</Text>}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => navigation.navigate('RoutineEditor', { routineId: item.id })}
            style={({ pressed }) => [styles.item, pressed && styles.pressed]}
          >
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.meta}>
              {routineSummary(language, item.exerciseCount, item.totalSets)}
            </Text>
          </Pressable>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { marginTop: spacing.md },
  empty: { color: colors.textMuted, fontSize: fontSize.body, marginTop: spacing.lg, textAlign: 'center' },
  item: {
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    paddingVertical: spacing.sm + spacing.xs,
  },
  pressed: { opacity: 0.6 },
  name: { color: colors.text, fontSize: fontSize.body },
  meta: { color: colors.textMuted, fontSize: fontSize.body - 2, marginTop: spacing.xs },
});
