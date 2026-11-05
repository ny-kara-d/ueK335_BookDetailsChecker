// Von Claude generiert (KI-Einsatz, siehe Technischer Bericht)
import { Tabs } from 'expo-router';
import { BottomNavigation, Icon } from 'react-native-paper';

const ICONS: Record<string, [string, string]> = {
  index: ['home', 'home-outline'],
  books: ['bookshelf', 'bookshelf'],
  profile: ['account', 'account-outline'],
};

// Expo-Router-Tabs, aber mit der Paper-BottomNavigation als Leiste (wie in Figma)
export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={({ state, descriptors, insets, navigateToTab }) => (
        <BottomNavigation.Bar
          navigationState={state}
          safeAreaInsets={insets}
          onTabPress={({ route }) => navigateToTab(route.key)}
          renderIcon={({ route, focused, color }) => <Icon source={ICONS[route.name][focused ? 0 : 1]} size={24} color={color} />}
          getLabelText={({ route }) => descriptors[route.key].options.title}
        />
      )}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="books" options={{ title: 'Bücher' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profil' }} />
    </Tabs>
  );
}