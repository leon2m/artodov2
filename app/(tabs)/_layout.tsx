import React from 'react';
import { Tabs } from 'expo-router';
import { useColorScheme } from 'react-native';
import TabBar from '@/components/TabBar';
import { Home, ListTodo, Settings, Calendar } from 'lucide-react-native';
import { useSettings } from '@/contexts/SettingsContext';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';
import EmojiBackground from '@/components/EmojiBackground';

/**
 * Tab düzenlemeleri
 */
export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { theme } = useSettings();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar style={theme.dark ? 'light' : 'dark'} />
      
      {/* Emoji arkaplan */}
      {theme.emojiBackground && (
        <EmojiBackground 
          emoji={theme.emoji}
          opacity={theme.emojiBackground.opacity}
          size={theme.emojiBackground.size}
          spacing={theme.emojiBackground.spacing}
        />
      )}
      
      <Tabs
        screenOptions={{
          tabBarStyle: {
            display: 'none', // TabBar'ı gizle, biz kendi custom tab bar'ımızı kullanacağız
          },
          headerShown: false,
        }}
        tabBar={(props) => <TabBar {...props} />}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Anasayfa',
            tabBarIcon: ({ color }) => <Home size={24} color={color} />,
          }}
        />
        
        <Tabs.Screen
          name="planning"
          options={{
            title: 'Planlama',
            tabBarIcon: ({ color }) => <Calendar size={24} color={color} />,
          }}
        />
        
        <Tabs.Screen
          name="tasks"
          options={{
            title: 'Görevler',
            tabBarIcon: ({ color }) => <ListTodo size={24} color={color} />,
          }}
        />
        
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Ayarlar',
            tabBarIcon: ({ color }) => <Settings size={24} color={color} />,
          }}
        />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  }
});