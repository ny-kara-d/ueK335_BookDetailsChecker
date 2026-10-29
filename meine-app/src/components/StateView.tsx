// Von Claude generiert (KI-Einsatz, siehe Technischer Bericht)
import { View } from 'react-native';
import { Avatar, Button, Text, useTheme } from 'react-native-paper';

// Leer-, Fehler- und Keine-Treffer-Zustand: was ist passiert + nächster Schritt
type Props = { icon: string; title: string; text: string; action: string; onPress: () => void; mode?: 'contained' | 'outlined'; highlight?: boolean };

export default function StateView({ icon, title, text, action, onPress, mode = 'contained', highlight }: Props) {
  const { colors } = useTheme();
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12 }}>
      <Avatar.Icon
        icon={icon}
        size={80}
        color={highlight ? colors.onPrimaryContainer : colors.onSurfaceVariant}
        style={{ backgroundColor: highlight ? colors.primaryContainer : colors.surfaceVariant }}
      />
      <Text variant="titleLarge" style={{ textAlign: 'center' }}>{title}</Text>
      <Text variant="bodyMedium" style={{ textAlign: 'center', color: colors.onSurfaceVariant }}>{text}</Text>
      <Button mode={mode} onPress={onPress} style={{ marginTop: 4 }}>{action}</Button>
    </View>
  );
}