// Von Claude generiert (KI-Einsatz, siehe Technischer Bericht)
import { View } from 'react-native';
import { Icon, Text, useTheme } from 'react-native-paper';

export default function ErrorBanner({ title, text }: { title?: string; text: string }) {
  const { colors } = useTheme();
  return (
    <View accessibilityRole="alert" style={{ flexDirection: 'row', gap: 12, padding: 16, borderRadius: 12, backgroundColor: colors.errorContainer }}>
      <Icon source="alert-circle-outline" size={22} color={colors.onErrorContainer} />
      <View style={{ flex: 1, gap: 2 }}>
        {title && <Text variant="titleSmall" style={{ color: colors.onErrorContainer }}>{title}</Text>}
        <Text variant="bodyMedium" style={{ color: colors.onErrorContainer }}>{text}</Text>
      </View>
    </View>
  );
}