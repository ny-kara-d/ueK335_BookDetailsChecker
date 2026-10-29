// Von Claude generiert (KI-Einsatz, siehe Technischer Bericht)
import { useState } from 'react';
import { KeyboardAvoidingView, ScrollView, StyleSheet, View } from 'react-native';
import { Avatar, Button, HelperText, Text, TextInput, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import ErrorBanner from '../components/ErrorBanner';
import { isEmail } from '../validation';

export default function LoginScreen() {
  const { login } = useAuth();
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showErrors, setShowErrors] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const emailError = !isEmail(email) ? 'Bitte gib eine gültige E-Mail-Adresse ein.' : null;
  const passwordError = password === '' ? 'Bitte gib dein Passwort ein.' : null;

  async function submit() {
    setShowErrors(true);
    if (emailError || passwordError) return;
    setLoading(true);
    setError(null);
    try {
      await login(email.trim(), password); // KANN: danach automatisch auf Home (erster Tab)
    } catch (e) {
      setError((e as Error).message);
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.brand}>
            <Avatar.Icon icon="book-open-variant" size={80} style={{ borderRadius: 24 }} />
            <Text variant="headlineLarge">BookCrux</Text>
            <Text variant="bodyLarge" style={{ textAlign: 'center', color: colors.onSurfaceVariant }}>
              Finde dein nächstes Buch – mit allen Details auf einen Blick.
            </Text>
          </View>
          <View style={{ gap: 4 }}>
            {error && <ErrorBanner title="Anmeldung fehlgeschlagen" text={error} />}
            <TextInput
              mode="outlined"
              label="E-Mail"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              error={showErrors && !!emailError}
              disabled={loading}
              style={{ marginTop: error ? 12 : 0 }}
            />
            <HelperText type="error" visible={showErrors && !!emailError}>{emailError}</HelperText>
            <TextInput
              mode="outlined"
              label="Passwort"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              error={showErrors && !!passwordError}
              disabled={loading}
              onSubmitEditing={submit}
            />
            <HelperText type="error" visible={showErrors && !!passwordError}>{passwordError}</HelperText>
          </View>
        </ScrollView>
        {/* Hauptaktion unten in der Daumenzone */}
        <View style={styles.bottom}>
          <Button mode="contained" onPress={submit} loading={loading} disabled={loading} contentStyle={{ height: 48 }}>
            {loading ? 'Anmelden …' : 'Anmelden'}
          </Button>
          <View style={styles.link}>
            <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant }}>Noch kein Konto?</Text>
            <Button mode="text" onPress={() => router.push('/register')} disabled={loading}>Registrieren</Button>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingTop: 48, gap: 32 },
  brand: { alignItems: 'center', gap: 12 },
  bottom: { paddingHorizontal: 16, paddingTop: 12 },
  link: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', minHeight: 48 },
});