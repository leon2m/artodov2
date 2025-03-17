import { useEffect } from 'react';
import { StyleSheet, View, useColorScheme } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { TaskProvider } from '@/contexts/TaskContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export function useFrameworkReady() {
  const [fontsLoaded] = useFonts({
    // Inter_400Regular,
    // Inter_500Medium,
    // Inter_600SemiBold,
    // Inter_700Bold,
  });

  useEffect(() => {
    const prepare = async () => {
      try {
        await SplashScreen.preventAutoHideAsync();
      } catch (e) {
        console.warn(e);
      }
    };

    prepare();
  }, []);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  return fontsLoaded;
}

export const unstable_settings = {
  // Avoid treating the hook files as routes
  initialRouteName: 'index',
  disableRootErrorBoundary: true,
  // Burada hook'lar yok sayılır
  excludeRoute: (route: string) => {
    return route.includes('/hooks/') || route.endsWith('.ts');
  }
};

export default function RootLayout() {
  useFrameworkReady();
  
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SettingsProvider>
          <TaskProvider>
            <View style={styles.container}>
              <StatusBar style="auto" />
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              </Stack>
            </View>
          </TaskProvider>
        </SettingsProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});