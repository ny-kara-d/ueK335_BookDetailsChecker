// Von Claude generiert (KI-Einsatz, siehe Technischer Bericht)
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Avatar, Button, Dialog, HelperText, IconButton, List, Portal, Text, TextInput, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { getInitials } from '../../utils';
import { isOptionalNumber } from '../../validation';

/** Zeigt das Profil der eingeloggten Person; Angaben lassen sich bearbeiten, Logout mit Bestätigung. */
export default function ProfileScreen() {
  const { user, logout, updateProfile } = useAuth();
  const { colors } = useTheme();
  const [confirm, setConfirm] = useState(false);
  const [edit, setEdit] = useState<{ firstname: string; lastname: string; age: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  if (!user) return null;

  const name = [user.firstname, user.lastname].filter(Boolean).join(' ');
  const initials = getInitials(user);
  const rows: [string, string, string | number | undefined][] = [
    ['account-outline', 'Vorname', user.firstname],
    ['account-outline', 'Nachname', user.lastname],
    ['cake-variant-outline', 'Alter', user.age],
    ['email-outline', 'E-Mail', user.email],
  ];

  const ageError = edit && !isOptionalNumber(edit.age, 1, 120) ? 'Bitte gib ein Alter zwischen 1 und 120 ein.' : null;

  /** Speichert die im Dialog bearbeiteten Angaben über `updateProfile`. */
  async function save() {
    if (!edit || ageError) return;
    setSaving(true);
    setError(null);
    try {
      await updateProfile({
        firstname: edit.firstname.trim() || undefined,
        lastname: edit.lastname.trim() || undefined,
        age: edit.age ? Number(edit.age) : undefined,
      });
      setEdit(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.titleRow}>
          <Text variant="headlineLarge">Profil</Text>
          <IconButton
            icon="pencil-outline"
            accessibilityLabel="Angaben bearbeiten"
            onPress={() => setEdit({ firstname: user.firstname ?? '', lastname: user.lastname ?? '', age: user.age != null ? String(user.age) : '' })}
          />
        </View>
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

        <Dialog visible={!!edit} onDismiss={() => !saving && setEdit(null)}>
          <Dialog.Title>Angaben bearbeiten</Dialog.Title>
          <Dialog.Content style={{ gap: 4 }}>
            {error && <Text style={{ color: colors.error, marginBottom: 8 }}>{error}</Text>}
            <TextInput
              mode="outlined"
              label="Vorname"
              value={edit?.firstname ?? ''}
              onChangeText={(v) => setEdit((e) => (e ? { ...e, firstname: v } : e))}
              disabled={saving}
            />
            <TextInput
              mode="outlined"
              label="Nachname"
              value={edit?.lastname ?? ''}
              onChangeText={(v) => setEdit((e) => (e ? { ...e, lastname: v } : e))}
              disabled={saving}
              style={{ marginTop: 8 }}
            />
            <TextInput
              mode="outlined"
              label="Alter"
              value={edit?.age ?? ''}
              onChangeText={(v) => setEdit((e) => (e ? { ...e, age: v } : e))}
              keyboardType="number-pad"
              error={!!ageError}
              disabled={saving}
              style={{ marginTop: 8 }}
            />
            <HelperText type="error" visible={!!ageError}>{ageError}</HelperText>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setEdit(null)} disabled={saving}>Abbrechen</Button>
            <Button onPress={save} loading={saving} disabled={saving || !!ageError}>Speichern</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingTop: 8, gap: 24 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  head: { alignItems: 'center', gap: 6 },
});