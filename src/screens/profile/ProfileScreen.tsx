import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text } from 'react-native';
import { Button } from '../../components/Button';
import { ChipGroup } from '../../components/ChipGroup';
import { Screen } from '../../components/Screen';
import { LANGUAGE_NAMES, LANGUAGES } from '../../i18n/language';
import { useTranslation } from '../../i18n/useTranslation';
import type { ProfileStackParamList } from '../../navigation/types';
import { useSettings } from '../../stores/settings';
import { colors, fontSize, spacing } from '../../theme';

type Props = NativeStackScreenProps<ProfileStackParamList, 'Profile'>;

export function ProfileScreen({ navigation }: Props) {
  const { t, language } = useTranslation();
  const setLanguage = useSettings((state) => state.setLanguage);

  return (
    <Screen title={t('profile.placeholder')}>
      <Button
        title={t('profile.exerciseLibrary')}
        onPress={() => navigation.navigate('ExerciseLibrary')}
      />

      <Text style={styles.label}>{t('profile.language')}</Text>
      <ChipGroup
        options={LANGUAGES}
        getLabel={(item) => LANGUAGE_NAMES[item]}
        value={language}
        onChange={setLanguage}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: {
    color: colors.textMuted,
    fontSize: fontSize.body,
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
  },
});
