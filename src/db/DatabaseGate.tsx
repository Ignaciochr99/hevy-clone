import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { useEffect, useState, type ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import migrations from '../../drizzle/migrations';
import { useTranslation } from '../i18n/useTranslation';
import { useSettings } from '../stores/settings';
import { colors, fontSize, spacing } from '../theme';
import { db } from './client';
import { seedExercises } from './seed';

type Props = { children: ReactNode };

// Bloquea la app hasta que la base está lista: primero aplica las migraciones
// pendientes y luego precarga los ejercicios. Así ninguna pantalla consulta
// tablas que todavía no existen.
export function DatabaseGate({ children }: Props) {
  const { t } = useTranslation();
  const { success, error } = useMigrations(db, migrations);
  const [seeded, setSeeded] = useState(false);
  const [seedError, setSeedError] = useState<Error>();

  useEffect(() => {
    if (!success) {
      return;
    }
    try {
      seedExercises(db);
      // Los ajustes (idioma) se leen antes de mostrar la app, para que la
      // primera pantalla ya salga en el idioma elegido.
      useSettings.getState().load();
      setSeeded(true);
    } catch (e) {
      setSeedError(e instanceof Error ? e : new Error(String(e)));
    }
  }, [success]);

  const failure = error ?? seedError;
  if (failure) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{t('db.errorTitle')}</Text>
        <Text style={styles.message}>{failure.message}</Text>
      </View>
    );
  }

  if (!success || !seeded) {
    return (
      <View style={styles.container}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  title: { color: colors.text, fontSize: fontSize.title, marginBottom: spacing.sm },
  message: { color: colors.textMuted, fontSize: fontSize.body, textAlign: 'center' },
});
