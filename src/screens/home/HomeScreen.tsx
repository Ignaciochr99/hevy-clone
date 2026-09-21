import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../../components/Screen';
import { useTranslation } from '../../i18n/useTranslation';
import type { HomeStackParamList } from '../../navigation/types';
import { repositories } from '../../repositories';
import { colors, fontSize, spacing } from '../../theme';
import { formatVolume } from '../../utils/format';
import { formatDuration } from '../../utils/time';
import { startOfWeek } from '../../utils/week';
import { WorkoutListItem } from './WorkoutListItem';

type Props = NativeStackScreenProps<HomeStackParamList, 'Home'>;

const RECENT_LIMIT = 20;

function load() {
  return {
    summary: repositories.workouts.weeklySummary(startOfWeek(new Date())),
    recent: repositories.workouts.listFinished(RECENT_LIMIT),
  };
}

export function HomeScreen({ navigation }: Props) {
  const { t, language } = useTranslation();
  const [data, setData] = useState(load);

  // El historial cambia al terminar o borrar un entrenamiento, en otras
  // pantallas: se vuelve a leer cada vez que Inicio recupera el foco.
  useFocusEffect(
    useCallback(() => {
      setData(load());
    }, []),
  );

  const { summary, recent } = data;

  return (
    <Screen>
      <FlatList
        data={recent}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{t('home.thisWeek')}</Text>
              <View style={styles.stats}>
                <Stat label={t('home.stat.workouts')} value={String(summary.workoutCount)} />
                <Stat label={t('home.stat.time')} value={formatDuration(summary.durationSeconds)} />
                <Stat label={t('home.stat.volume')} value={formatVolume(summary.volume, language)} />
              </View>
            </View>
            {recent.length > 0 ? <Text style={styles.sectionTitle}>{t('home.recent')}</Text> : null}
          </View>
        }
        ListEmptyComponent={<Text style={styles.empty}>{t('home.empty')}</Text>}
        renderItem={({ item }) => (
          <WorkoutListItem
            item={item}
            onPress={() => navigation.navigate('WorkoutDetail', { workoutId: item.id })}
          />
        )}
      />
    </Screen>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing.sm, paddingBottom: spacing.lg },
  header: { gap: spacing.md, marginBottom: spacing.xs },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.md,
  },
  cardTitle: { color: colors.textMuted, fontSize: fontSize.body, fontWeight: '600' },
  stats: { flexDirection: 'row', gap: spacing.sm },
  stat: { flex: 1 },
  statValue: { color: colors.text, fontSize: fontSize.title, fontWeight: '700' },
  statLabel: { color: colors.textMuted, fontSize: fontSize.body - 4, marginTop: spacing.xs },
  sectionTitle: { color: colors.textMuted, fontSize: fontSize.body, fontWeight: '600' },
  empty: { color: colors.textMuted, fontSize: fontSize.body, marginTop: spacing.md, textAlign: 'center' },
});
