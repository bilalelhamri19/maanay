import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import Ionicons from '@expo/vector-icons/Ionicons';
import { StoreProvider, useStore } from './lib/store';
import { RootStack } from './lib/nav';
import MainScreen from './screens/MainScreen';
import CategoryScreen from './screens/CategoryScreen';
import ReaderScreen from './screens/ReaderScreen';
import AddQuoteScreen from './screens/AddQuoteScreen';
import SettingsScreen from './screens/SettingsScreen';

const Stack = createNativeStackNavigator<RootStack>();

function Root() {
  const { theme } = useStore();
  const base = theme.dark ? DarkTheme : DefaultTheme;
  return (
    <NavigationContainer
      theme={{ ...base, colors: { ...base.colors, background: theme.bg, card: theme.card, text: theme.text, primary: theme.primary, border: theme.border } }}
    >
      <StatusBar style={theme.dark ? 'light' : 'dark'} />
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_left', contentStyle: { backgroundColor: theme.bg } }}>
        <Stack.Screen name="Main" component={MainScreen} />
        <Stack.Screen name="Category" component={CategoryScreen} />
        <Stack.Screen name="Reader" component={ReaderScreen} options={{ animation: 'fade' }} />
        <Stack.Screen name="AddQuote" component={AddQuoteScreen} options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="Settings" component={SettingsScreen} options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({ ...Ionicons.font });
  if (!fontsLoaded) return null;
  return (
    <SafeAreaProvider>
      <StoreProvider>
        <Root />
      </StoreProvider>
    </SafeAreaProvider>
  );
}
