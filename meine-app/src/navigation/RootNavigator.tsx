// Von Claude für Konsistenz und Zeitersparnissen
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import AuthNavigator from './AuthNavigator';
import AppNavigator from './AppNavigator';

export default function RootNavigator() {
  const { email, loading } = useAuth();
  if (loading) return null; // or a splash screen

  return (
    <NavigationContainer>
      {email ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}
