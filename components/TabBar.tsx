import React from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { usePathname, useRouter } from 'expo-router';
import { LayoutDashboard, Calendar, ListTodo, Settings } from 'lucide-react-native';
import { useSettings } from '@/contexts/SettingsContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { MotiView } from 'moti';

// Router tarafından kabul edilen rota tipleri
type AppRoute = '/' | '/planning' | '/tasks' | '/settings';

interface TabItem {
  name: string;
  path: AppRoute;
  title: string;
  icon: (props: { size: number; color: string }) => React.ReactNode;
}

const tabs: TabItem[] = [
  {
    name: 'index',
    path: '/' as AppRoute,
    title: 'Anasayfa',
    icon: ({ size, color }) => <LayoutDashboard size={size} color={color} />,
  },
  {
    name: 'planning',
    path: '/planning' as AppRoute,
    title: 'Planlama',
    icon: ({ size, color }) => <Calendar size={size} color={color} />,
  },
  {
    name: 'tasks',
    path: '/tasks' as AppRoute,
    title: 'Görevler',
    icon: ({ size, color }) => <ListTodo size={size} color={color} />,
  },
  {
    name: 'settings',
    path: '/settings' as AppRoute,
    title: 'Ayarlar',
    icon: ({ size, color }) => <Settings size={size} color={color} />,
  },
];

export default function TabBar(props?: BottomTabBarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme, settings } = useSettings();

  // Dark modu kontrolü için isDarkMode değişkeni
  const isDarkMode = settings.isDarkMode;

  const handleNavigation = (path: AppRoute) => {
    try {
      router.push(path);
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  // Dark mode uyumlu renkleri temadan al
  const backgroundColors = {
    container: isDarkMode 
      ? theme.colors.background + 'E6'  // E6 = %90 opaklık
      : 'rgba(255, 255, 255, 0.9)',
    
    tabContainer: isDarkMode 
      ? theme.colors.card + 'D9'  // D9 = %85 opaklık
      : 'rgba(255, 255, 255, 0.7)',
    
    border: isDarkMode 
      ? theme.colors.border + '99'  // 99 = %60 opaklık
      : 'rgba(255, 255, 255, 0.8)',
    
    activeTab: isDarkMode 
      ? theme.colors.card + 'CC'  // CC = %80 opaklık
      : 'rgba(240, 240, 250, 0.7)',
  };

  return (
    <View style={[
      styles.container, 
      { 
        paddingBottom: insets.bottom || 12,
        backgroundColor: backgroundColors.container,
        borderTopColor: backgroundColors.border 
      }
    ]}>
      <View style={[
        styles.tabsContainer,
        {
          backgroundColor: backgroundColors.tabContainer,
          borderColor: backgroundColors.border
        }
      ]}>
        {tabs.map((tab, index) => {
          const isActive = 
            pathname === `/(tabs)${tab.path}` || 
            (tab.name === 'index' && pathname === '/(tabs)') ||
            (tab.name === 'tasks' && pathname.startsWith('/(tabs)/tasks/'));

          return (
            <Pressable
              key={tab.name}
              style={styles.tab}
              onPress={() => handleNavigation(tab.path)}
            >
              <MotiView
                style={[
                  styles.tabIconContainer,
                  isActive && {
                    backgroundColor: isActive 
                      ? backgroundColors.activeTab
                      : 'transparent',
                    borderColor: isActive
                      ? theme.colors.primary + '50'
                      : 'transparent',
                    borderWidth: 1,
                  }
                ]}
                animate={{
                  scale: isActive ? 1 : 0.9,
                }}
                transition={{
                  type: 'spring',
                  stiffness: 300,
                  damping: 20
                }}
              >
                <View style={[
                  styles.activeIconHighlight,
                  { 
                    backgroundColor: isActive 
                      ? theme.colors.primary 
                      : 'transparent' 
                  }
                ]}>
                  {tab.icon({
                    size: 18,
                    color: isActive 
                      ? '#FFFFFF' 
                      : theme.colors.secondaryText,
                  })}
                </View>
              </MotiView>
              
              <Text
                style={[
                  styles.tabText,
                  { color: isActive ? theme.colors.primary : theme.colors.secondaryText },
                  isActive && styles.tabTextActive
                ]}>
                {tab.title}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 12,
    borderRadius: 24,
    padding: 6,
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0,0,0,0.1)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 6,
    position: 'relative',
  },
  tabIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    padding: 0,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 3,
  },
  activeIconHighlight: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabText: {
    fontSize: 10,
    marginTop: 1,
    fontWeight: '500',
    letterSpacing: -0.2,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
        fontWeight: '500',
      },
      android: {
        fontFamily: 'sans-serif-medium',
      },
    }),
  },
  tabTextActive: {
    fontWeight: '600',
    ...Platform.select({
      ios: {
        fontFamily: 'System',
        fontWeight: '600',
      },
      android: {
        fontFamily: 'sans-serif-medium',
      },
    }),
  },
});