// Von Claude generiert (KI-Einsatz, siehe Technischer Bericht)
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider } from 'react-native-paper';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { SnackbarProvider } from '../context/SnackbarContext';
import { theme } from '../theme';

function RootStack() {
  const { user, loading } = useAuth();
  if (loading) return null;

  // Ohne Login nur Login/Registrieren, mit Login nur die App (MUSS: Logout führt zurück zum Login)
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.colors.background } }}>
      <Stack.Protected guard={!!user}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="book/[id]" />
        <Stack.Screen name="book/form" options={{ presentation: 'modal' }} />
      </Stack.Protected>
      <Stack.Protected guard={!user}>
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <PaperProvider theme={theme}>
      <AuthProvider>
        <SnackbarProvider>
          <StatusBar style="dark" />
          <RootStack />
        </SnackbarProvider>
      </AuthProvider>
    </PaperProvider>
  );
}