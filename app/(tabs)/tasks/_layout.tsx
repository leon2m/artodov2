import { Stack } from 'expo-router';
import { useSettings } from '@/contexts/SettingsContext';

/**
 * Tasks sayfaları için layout
 */
export default function TasksLayout() {
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
          title: 'Görevler',
          headerShown: false,
        }}
      />
      
      <Stack.Screen
        name="[id]"
        options={{
          title: 'Görev Detayları',
          presentation: 'modal',
        }}
      />
    </Stack>
  );
} 