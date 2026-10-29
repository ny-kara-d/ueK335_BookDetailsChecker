// Von Claude generiert (KI-Einsatz, siehe Technischer Bericht)
import { useState } from 'react';
import { KeyboardAvoidingView, ScrollView, StyleSheet, View } from 'react-native';
import { Appbar, Button, HelperText, Text, TextInput, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import ErrorBanner from '../components/ErrorBanner';
import { isEmail, isOptionalNumber, MIN_PASSWORD } from '../validation';

export default function RegisterScreen() {
  const { register } = useAuth();
  const { colors } = useTheme();
  const [form, setForm] = useState({ firstname: '', lastname: '', age: '', email: '', password: '' });
  const [showErrors, setShowErrors] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = (key: keyof typeof form) => (value: string) => setForm({ ...form, [key]: value });

  const errors = {
    age: isOptionalNumber(form.age, 1, 120) ? null : 'Bitte gib ein Alter zwischen 1 und 120 ein.',
    email: isEmail(form.email) ? null : 'Bitte gib eine gültige E-Mail-Adresse ein.',
    password: form.password.length >= MIN_PASSWORD ? null : `Das Passwort braucht mindestens ${MIN_PASSWORD} Zeichen.`,
  };
  const show = (key: keyof typeof errors) => showErrors && !!errors[key];

  async function submit() {
    setShowErrors(true);
    if (Object.values(errors).some(Boolean)) return;
    setLoading(true);
    setError(null);
    try {
      await register({
        email: form.email.trim(),
        password: form.password,
        firstname: form.firstname.trim() || undefined,
        lastname: form.lastname.trim() || undefined,
        age: form.age ? Number(form.age) : undefined,
      });
    } catch (e) {
      setError((e as Error).message);
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Konto erstellen" />
      </Appbar.Header>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant, marginBottom: 8 }}>
            Pflicht sind nur E-Mail und Passwort.
          </Text>
          {error && <ErrorBanner text={error} />}
          <View style={styles.row}>
            <TextInput mode="outlined" label="Vorname" value={form.firstname} onChangeText={set('firstname')} disabled={loading} style={{ flex: 1 }} />
            <TextInput mode="outlined" label="Nachname" value={form.lastname} onChangeText={set('lastname')} disabled={loading} style={{ flex: 1 }} />
          </View>
          <View style={{ height: 12 }} />
          <TextInput mode="outlined" label="Alter" value={form.age} onChangeText={set('age')} keyboardType="number-pad" error={show('age')} disabled={loading} />
          <HelperText type="error" visible={show('age')}>{errors.age}</HelperText>
          <TextInput mode="outlined" label="E-Mail *" value={form.email} onChangeText={set('email')} keyboardType="email-address" autoCapitalize="none" error={show('email')} disabled={loading} />
          <HelperText type="error" visible={show('email')}>{errors.email}</HelperText>
          <TextInput mode="outlined" label="Passwort *" value={form.password} onChangeText={set('password')} secureTextEntry error={show('password')} disabled={loading} />
          <HelperText type={show('password') ? 'error' : 'info'} visible>
            {show('password') ? errors.password : `* Pflichtfeld · Passwort mindestens ${MIN_PASSWORD} Zeichen`}
          </HelperText>
        </ScrollView>
        <View style={styles.bottom}>
          <Button mode="contained" onPress={submit} loading={loading} disabled={loading} contentStyle={{ height: 48 }}>
            Konto erstellen
          </Button>
          <View style={styles.link}>
            <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant }}>Schon ein Konto?</Text>
            <Button mode="text" onPress={() => router.back()} disabled={loading}>Anmelden</Button>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingTop: 4 },
  row: { flexDirection: 'row', gap: 12 },
  bottom: { paddingHorizontal: 16, paddingTop: 12 },
  link: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', minHeight: 48 },
});