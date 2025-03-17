import { Stack } from 'expo-router';
import { useSettings } from '@/contexts/SettingsContext';

/**
 * Ayarlar sayfaları için layout
 */
export default function SettingsLayout() {
  const { theme } = useSettings();
  
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.card,
        },
        headerTintColor: theme.colors.text,
        headerShadowVisible: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Ayarlar',
          headerShown: false,
        }}
      />
    </Stack>
  );
} 