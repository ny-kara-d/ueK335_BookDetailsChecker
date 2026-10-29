// Claude für Effizienz und Konsistenz
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AppTabParamList, BooksStackParamList } from './types';
import HomeScreen from '../screens/HomeScreen';
import BooksListScreen from '../screens/BooksListScreen';
import BookFormScreen from '../screens/BookFormScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator<AppTabParamList>();
const BooksStack = createNativeStackNavigator<BooksStackParamList>();

function BooksStackNavigator() {
  return (
    <BooksStack.Navigator>
      <BooksStack.Screen name="BooksList" component={BooksListScreen} options={{ title: 'Bücher' }} />
      <BooksStack.Screen name="BookForm" component={BookFormScreen} options={{ title: 'Buch' }} />
    </BooksStack.Navigator>
  );
}

export default function AppNavigator() {
  return (
    // KANN: switch to initialRouteName="Home" to land there after login instead of Books
    <Tab.Navigator initialRouteName="Books">
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Books" component={BooksStackNavigator} options={{ headerShown: false }} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}