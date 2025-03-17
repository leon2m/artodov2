import React, { createContext, useState, useEffect, useContext, ReactNode, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';
import { CustomTheme, lightTheme, darkTheme, ThemeColors, customThemePresets } from '@/theme/theme';

interface Settings {
  isDarkMode: boolean;
  notifications: boolean;
  compactView: boolean;
  accentColor: string;
  sortOrder: 'priority' | 'dueDate' | 'created';
  themePreset: 'light' | 'dark' | 'ocean' | 'forest' | 'sunset' | 'hearts' | 'emoji' | 'darkOcean' | 'custom' | 'summer' | 'winter' | 'darkChocolate';
  customColors?: ThemeColors;
  themeEmoji?: string;
  useSystemTheme: boolean;
  hapticFeedback: boolean;
  privacyMode: boolean;
  language: 'tr' | 'en';
  showEmojiBg: boolean;
}

interface SettingsContextType {
  settings: Settings;
  theme: CustomTheme;
  updateSettings: (newSettings: Partial<Settings>) => Promise<void>;
  toggleDarkMode: () => Promise<void>;
  toggleTheme: () => Promise<void>;
  toggleNotifications: () => Promise<void>;
  toggleCompactView: () => Promise<void>;
  setSortOrder: (order: Settings['sortOrder']) => Promise<void>;
  setAccentColor: (color: string) => Promise<void>;
  setThemeEmoji: (emoji: string) => Promise<void>;
  toggleSystemTheme: () => Promise<void>;
  resetSettings: () => Promise<void>;
  exportData: () => Promise<string>;
  importData: (data: string) => Promise<void>;
  notificationsEnabled: boolean;
  setNotificationsEnabled: (enabled: boolean) => Promise<void>;
  hapticFeedbackEnabled: boolean;
  setHapticFeedbackEnabled: (enabled: boolean) => Promise<void>;
  language: string;
  setLanguage: (lang: 'tr' | 'en') => Promise<void>;
  privacyMode: boolean;
  setPrivacyMode: (enabled: boolean) => Promise<void>;
  toggleShowEmojiBg: () => Promise<void>;
}

const defaultSettings: Settings = {
  isDarkMode: false,
  notifications: true,
  compactView: false,
  accentColor: '#0EA5E9',
  sortOrder: 'created',
  themePreset: 'light',
  themeEmoji: '📝',
  useSystemTheme: true,
  hapticFeedback: true,
  privacyMode: false,
  language: 'tr',
  showEmojiBg: true
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

interface SettingsProviderProps {
  children: ReactNode;
}

const SETTINGS_STORAGE_KEY = '@ar_todo_settings';

// Emoji tema renkleri
const EMOJI_COLORS: Record<string, string> = {
  '📝': '#3B82F6', // Mavi
  '🎯': '#F43F5E', // Kırmızı
  '✅': '#10B981', // Yeşil
  '🚀': '#8B5CF6', // Mor
  '⭐': '#F59E0B', // Turuncu
  '🌟': '#FBBF24', // Sarı
  '🔥': '#EF4444', // Kırmızı
  '💫': '#6366F1', // İndigo
  '🎨': '#EC4899', // Pembe
  '💡': '#F97316', // Turuncu
  '🎉': '#D946EF', // Fuşya
  '🎈': '#F87171', // Kırmızımsı
  '🎁': '#A855F7', // Morumsu
  '💪': '#84CC16', // Lime
  '👍': '#14B8A6', // Teal
  '👏': '#F59E0B', // Amber
  '😊': '#FBBF24', // Sarı
  '😃': '#FBBF24', // Sarı
  '😄': '#FBBF24', // Sarı
  '😎': '#3B82F6', // Mavi
  '🤩': '#D946EF', // Fuşya
  '🌈': '#6366F1', // İndigo
  '☀️': '#F59E0B', // Amber
  '🌙': '#8B5CF6', // Mor
  '⛅': '#60A5FA', // Mavi
  '🌊': '#0EA5E9', // Açık mavi
  '🌲': '#22C55E', // Yeşil
  '🌴': '#15803D', // Koyu yeşil
  '🌵': '#84CC16', // Açık yeşil
  '🌸': '#EC4899', // Pembe
  '🌺': '#F472B6', // Açık pembe
  '🌻': '#FBBF24', // Sarı
  '🍀': '#22C55E', // Yeşil
  '🌿': '#15803D', // Koyu yeşil
  '🍁': '#F97316', // Turuncu
  '🍂': '#B45309', // Kahverengi
  '🌱': '#22C55E', // Yeşil
};

export const SettingsProvider = ({ children }: SettingsProviderProps) => {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      if (settings.useSystemTheme) {
        const isDarkMode = colorScheme === 'dark';
        updateSettings({ isDarkMode });
      }
    });

    return () => {
      subscription.remove();
    };
  }, [settings.useSystemTheme]);

  const theme = useMemo(() => {
    try {
      let newTheme: CustomTheme;
      const systemColorScheme = Appearance.getColorScheme();
      const isDark = settings.useSystemTheme ? systemColorScheme === 'dark' : settings.isDarkMode;
      
      const baseTheme = isDark ? darkTheme : lightTheme;
      
      // Emoji'ye göre renk belirleme
      let accentColor = settings.accentColor;
      if (settings.themeEmoji && EMOJI_COLORS[settings.themeEmoji]) {
        accentColor = EMOJI_COLORS[settings.themeEmoji];
      }

      // Önce temel tema renklerini ayarla
      const baseColors = {
        ...baseTheme.colors,
        primary: accentColor,
        accent: accentColor,
        switchThumbTrue: accentColor,
        switchTrackTrue: isDark ? `${accentColor}80` : `${accentColor}40`,
      };

      // Tema presetine göre renkleri ayarla
      if (settings.themePreset === 'custom' && settings.customColors) {
        Object.assign(baseColors, isDark ? {
          ...darkTheme.colors,
          primary: settings.customColors.primary,
          accent: settings.customColors.accent,
          success: settings.customColors.success,
          warning: settings.customColors.warning,
          error: settings.customColors.error,
        } : settings.customColors);
      } else if (settings.themePreset in customThemePresets) {
        const preset = customThemePresets[settings.themePreset as keyof typeof customThemePresets];
        if (preset) {
          Object.assign(baseColors, isDark ? {
            ...darkTheme.colors,
            primary: preset.colors.primary,
            accent: preset.colors.accent,
            success: preset.colors.success,
            warning: preset.colors.warning,
            error: preset.colors.error,
          } : preset.colors);
        }
      }

      // Dark mode için temel renkleri zorla
      if (isDark) {
        Object.assign(baseColors, {
          background: darkTheme.colors.background,
          card: darkTheme.colors.card,
          text: darkTheme.colors.text,
          border: darkTheme.colors.border,
          secondaryText: darkTheme.colors.secondaryText,
          taskCardBackground: darkTheme.colors.taskCardBackground,
          taskCardBorder: darkTheme.colors.taskCardBorder,
          switchTrackFalse: darkTheme.colors.switchTrackFalse,
          switchThumbFalse: darkTheme.colors.switchThumbFalse,
        });
      }

      // Navigation ve sistem UI renkleri için özel ayarlar
      const navigationColors = {
        background: baseColors.background,
        card: baseColors.card,
        text: baseColors.text,
        border: baseColors.border,
        notification: baseColors.error,
      };

      newTheme = {
        dark: isDark,
        colors: {
          ...baseColors,
          ...navigationColors,
        },
      };

      // Emoji arka planını ayarla - showEmojiBg true ise
      if (settings.themeEmoji && settings.showEmojiBg) {
        newTheme.emoji = settings.themeEmoji;
        newTheme.emojiBackground = {
          pattern: settings.themeEmoji,
          opacity: isDark ? 0.05 : 0.07,
          size: 28,
          spacing: 80
        };
      } else {
        // Emoji ayarı active değilse emoji özelliklerini null yap
        newTheme.emoji = undefined;
        newTheme.emojiBackground = undefined;
      }

      return newTheme;
    } catch (error) {
      console.error('Error applying theme:', error);
      return settings.isDarkMode ? darkTheme : lightTheme;
    }
  }, [settings.isDarkMode, settings.accentColor, settings.themePreset, settings.customColors, settings.themeEmoji, settings.useSystemTheme, settings.showEmojiBg]);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const storedSettings = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
      
      if (storedSettings) {
        const parsedSettings = JSON.parse(storedSettings);
        const systemColorScheme = Appearance.getColorScheme();
        const isDarkMode = parsedSettings.useSystemTheme ? systemColorScheme === 'dark' : parsedSettings.isDarkMode;
        setSettings({ ...parsedSettings, isDarkMode });
      } else {
        const systemColorScheme = Appearance.getColorScheme();
        const initialSettings = {
          ...defaultSettings,
          isDarkMode: systemColorScheme === 'dark',
          useSystemTheme: true
        };
        await saveSettings(initialSettings);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async (newSettings: Settings) => {
    try {
      await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const updateSettings = async (newSettings: Partial<Settings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    await saveSettings(updatedSettings);
  };

  const toggleDarkMode = async () => {
    const useSystemTheme = false;
    const isDarkMode = !settings.isDarkMode;
    await updateSettings({ isDarkMode, useSystemTheme });
  };

  const toggleSystemTheme = async () => {
    const useSystemTheme = !settings.useSystemTheme;
    if (useSystemTheme) {
      const systemColorScheme = Appearance.getColorScheme();
      const isDarkMode = systemColorScheme === 'dark';
      await updateSettings({ useSystemTheme, isDarkMode });
    } else {
      await updateSettings({ useSystemTheme });
    }
  };

  const toggleNotifications = async () => {
    await updateSettings({ notifications: !settings.notifications });
  };

  const toggleCompactView = async () => {
    await updateSettings({ compactView: !settings.compactView });
  };

  const setSortOrder = async (order: Settings['sortOrder']) => {
    await updateSettings({ sortOrder: order });
  };

  const setAccentColor = async (color: string) => {
    await updateSettings({ accentColor: color });
  };

  const setThemeEmoji = async (emoji: string) => {
    console.log('setThemeEmoji çağrıldı:', emoji);
    await updateSettings({ themeEmoji: emoji });
  };

  const resetSettings = async () => {
    const systemColorScheme = Appearance.getColorScheme();
    const initialSettings = {
      ...defaultSettings,
      isDarkMode: systemColorScheme === 'dark',
      useSystemTheme: true
    };
    await saveSettings(initialSettings);
  };

  const exportData = async () => {
    try {
      const tasks = await AsyncStorage.getItem('@ar_todo_tasks');
      const board = await AsyncStorage.getItem('@ar_todo_board');
      const settings = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
      
      const exportData = {
        tasks: tasks ? JSON.parse(tasks) : [],
        board: board ? JSON.parse(board) : null,
        settings: settings ? JSON.parse(settings) : defaultSettings
      };
      
      return JSON.stringify(exportData);
    } catch (error) {
      console.error('Error exporting data:', error);
      throw new Error('Failed to export data');
    }
  };

  const importData = async (data: string) => {
    try {
      const importedData = JSON.parse(data);
      
      if (importedData.tasks) {
        await AsyncStorage.setItem('@ar_todo_tasks', JSON.stringify(importedData.tasks));
      }
      if (importedData.board) {
        await AsyncStorage.setItem('@ar_todo_board', JSON.stringify(importedData.board));
      }
      if (importedData.settings) {
        await saveSettings(importedData.settings);
      }
    } catch (error) {
      console.error('Error importing data:', error);
      throw new Error('Failed to import data');
    }
  };

  const toggleTheme = async () => {
    return toggleDarkMode();
  };

  const notificationsEnabled = settings.notifications;
  
  const setNotificationsEnabled = async (enabled: boolean) => {
    await updateSettings({ notifications: enabled });
  };
  
  const hapticFeedbackEnabled = settings.hapticFeedback;
  
  const setHapticFeedbackEnabled = async (enabled: boolean) => {
    await updateSettings({ hapticFeedback: enabled });
  };
  
  const language = settings.language;
  
  const setLanguage = async (lang: 'tr' | 'en') => {
    await updateSettings({ language: lang });
  };
  
  const privacyMode = settings.privacyMode;
  
  const setPrivacyMode = async (enabled: boolean) => {
    await updateSettings({ privacyMode: enabled });
  };

  const toggleShowEmojiBg = async () => {
    console.log('toggleShowEmojiBg çağrıldı, şu anki değer:', settings.showEmojiBg);
    await updateSettings({ showEmojiBg: !settings.showEmojiBg });
    console.log('toggleShowEmojiBg sonrası değer:', !settings.showEmojiBg);
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        theme,
        updateSettings,
        toggleDarkMode,
        toggleTheme,
        toggleNotifications,
        toggleCompactView,
        setSortOrder,
        setAccentColor,
        setThemeEmoji,
        toggleSystemTheme,
        resetSettings,
        exportData,
        importData,
        notificationsEnabled,
        setNotificationsEnabled,
        hapticFeedbackEnabled,
        setHapticFeedbackEnabled,
        language,
        setLanguage,
        privacyMode,
        setPrivacyMode,
        toggleShowEmojiBg
      }}
    >
      {!isLoading && children}
    </SettingsContext.Provider>
  );
};