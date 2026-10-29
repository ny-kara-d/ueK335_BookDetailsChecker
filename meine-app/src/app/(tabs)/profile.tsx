// Von Claude generiert (KI-Einsatz, siehe Technischer Bericht)
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Avatar, Button, Dialog, List, Portal, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { colors } = useTheme();
  const [confirm, setConfirm] = useState(false);
  if (!user) return null;

  const name = [user.firstname, user.lastname].filter(Boolean).join(' ');
  const initials = ((user.firstname?.[0] ?? '') + (user.lastname?.[0] ?? '')).toUpperCase() || user.email[0].toUpperCase();
  const rows: [string, string, string | number | undefined][] = [
    ['account-outline', 'Vorname', user.firstname],
    ['account-outline', 'Nachname', user.lastname],
    ['cake-variant-outline', 'Alter', user.age],
    ['email-outline', 'E-Mail', user.email],
  ];

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text variant="headlineLarge">Profil</Text>
        <View style={styles.head}>
          <Avatar.Text label={initials} size={88} />
          {name !== '' && <Text variant="titleLarge">{name}</Text>}
          <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant }}>{user.email}</Text>
        </View>
        <List.Section>
          <List.Subheader style={{ color: colors.primary }}>Persönliche Angaben</List.Subheader>
          {rows.map(([icon, label, value]) => (
            <List.Item
              key={label}
              title={value ?? 'nicht angegeben'}
              titleStyle={value == null ? { color: colors.onSurfaceVariant, fontStyle: 'italic' } : undefined}
              description={label}
              left={(props) => <List.Icon {...props} icon={icon} />}
            />
          ))}
        </List.Section>
        <Button mode="outlined" textColor={colors.error} onPress={() => setConfirm(true)} contentStyle={{ height: 48 }}>
          Abmelden
        </Button>
        <Text variant="bodySmall" style={{ textAlign: 'center', color: colors.onSurfaceVariant }}>BookCrux Library · Version 1.0</Text>
      </ScrollView>

      <Portal>
        <Dialog visible={confirm} onDismiss={() => setConfirm(false)}>
          <Dialog.Title>Abmelden?</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">Du wirst abgemeldet und zur Anmeldung weitergeleitet.</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setConfirm(false)}>Abbrechen</Button>
            <Button textColor={colors.error} onPress={logout}>Abmelden</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingTop: 8, gap: 24 },
  head: { alignItems: 'center', gap: 6 },
});