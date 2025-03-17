import { DefaultTheme } from '@react-navigation/native';

export interface ThemeColors {
  primary: string;
  background: string;
  card: string;
  text: string;
  border: string;
  notification: string;
  accent: string;
  secondaryText: string;
  success: string;
  warning: string;
  error: string;
  taskCardBackground: string;
  taskCardBorder: string;
  switchTrackFalse: string;
  switchTrackTrue: string;
  switchThumbFalse: string;
  switchThumbTrue: string;
}

export interface EmojiBackground {
  pattern: string;
  opacity: number;
  size: number;
  spacing: number;
}

export interface CustomTheme {
  dark: boolean;
  colors: ThemeColors;
  emoji?: string;
  emojiBackground?: EmojiBackground;
}

export const lightTheme: CustomTheme = {
  dark: false,
  colors: {
    primary: '#0EA5E9',
    background: '#FFFFFF',
    card: '#F9FAFB',
    text: '#1F2937',
    border: '#E5E7EB',
    notification: '#EF4444',
    accent: '#0EA5E9',
    secondaryText: '#4B5563',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    taskCardBackground: '#FFFFFF',
    taskCardBorder: '#E5E7EB',
    switchTrackFalse: '#D1D5DB',
    switchTrackTrue: '#93C5FD',
    switchThumbFalse: '#F3F4F6',
    switchThumbTrue: '#0EA5E9'
  }
};

export const darkTheme: CustomTheme = {
  dark: true,
  colors: {
    primary: '#38BDF8',
    background: '#0F172A',
    card: '#1E293B',
    text: '#F8FAFC',
    border: '#334155',
    notification: '#EF4444',
    accent: '#38BDF8',
    secondaryText: '#94A3B8',
    success: '#34D399',
    warning: '#FBBF24',
    error: '#F87171',
    taskCardBackground: '#1E293B',
    taskCardBorder: '#334155',
    switchTrackFalse: '#475569',
    switchTrackTrue: '#60A5FA',
    switchThumbFalse: '#94A3B8',
    switchThumbTrue: '#38BDF8'
  }
};

export const customThemePresets = {
  ocean: {
    name: 'Ocean',
    dark: false,
    emoji: '🌊',
    colors: {
      primary: '#0EA5E9',
      background: '#F0F9FF',
      card: '#E0F2FE',
      text: '#0C4A6E',
      border: '#BAE6FD',
      notification: '#EF4444',
      accent: '#0EA5E9',
      secondaryText: '#3B82F6',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      taskCardBackground: '#E0F2FE',
      taskCardBorder: '#BAE6FD',
      switchTrackFalse: '#BAE6FD',
      switchTrackTrue: '#60A5FA',
      switchThumbFalse: '#E0F2FE',
      switchThumbTrue: '#0EA5E9'
    }
  },
  forest: {
    name: 'Forest',
    dark: false,
    emoji: '🌲',
    colors: {
      primary: '#059669',
      background: '#F0FDF4',
      card: '#DCFCE7',
      text: '#064E3B',
      border: '#A7F3D0',
      notification: '#EF4444',
      accent: '#059669',
      secondaryText: '#10B981',
      success: '#059669',
      warning: '#F59E0B',
      error: '#EF4444',
      taskCardBackground: '#DCFCE7',
      taskCardBorder: '#A7F3D0',
      switchTrackFalse: '#A7F3D0',
      switchTrackTrue: '#34D399',
      switchThumbFalse: '#DCFCE7',
      switchThumbTrue: '#059669'
    }
  },
  sunset: {
    name: 'Sunset',
    dark: false,
    emoji: '🌅',
    colors: {
      primary: '#D97706',
      background: '#FFFBEB',
      card: '#FEF3C7',
      text: '#78350F',
      border: '#FDE68A',
      notification: '#EF4444',
      accent: '#D97706',
      secondaryText: '#F59E0B',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      taskCardBackground: '#FEF3C7',
      taskCardBorder: '#FDE68A',
      switchTrackFalse: '#FDE68A',
      switchTrackTrue: '#FBBF24',
      switchThumbFalse: '#FEF3C7',
      switchThumbTrue: '#D97706'
    }
  },
  hearts: {
    name: 'Hearts',
    dark: false,
    emoji: '❤️',
    colors: {
      primary: '#EC4899',
      background: '#FDF2F8',
      card: '#FCE7F3',
      text: '#831843',
      border: '#FBCFE8',
      notification: '#EF4444',
      accent: '#EC4899',
      secondaryText: '#F472B6',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      taskCardBackground: '#FCE7F3',
      taskCardBorder: '#FBCFE8',
      switchTrackFalse: '#FBCFE8',
      switchTrackTrue: '#F472B6',
      switchThumbFalse: '#FCE7F3',
      switchThumbTrue: '#EC4899'
    }
  },
  emoji: {
    name: 'Emoji Fun',
    dark: false,
    emoji: '😊',
    colors: {
      primary: '#EAB308',
      background: '#FEFCE8',
      card: '#FEF9C3',
      text: '#713F12',
      border: '#FDE047',
      notification: '#EF4444',
      accent: '#EAB308',
      secondaryText: '#CA8A04',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      taskCardBackground: '#FEF9C3',
      taskCardBorder: '#FDE047',
      switchTrackFalse: '#FDE047',
      switchTrackTrue: '#FACC15',
      switchThumbFalse: '#FEF9C3',
      switchThumbTrue: '#EAB308'
    }
  },
  darkOcean: {
    name: 'Dark Ocean',
    dark: true,
    emoji: '🌃',
    colors: {
      primary: '#38BDF8',
      background: '#0C4A6E',
      card: '#075985',
      text: '#E0F2FE',
      border: '#0284C7',
      notification: '#F87171',
      accent: '#38BDF8',
      secondaryText: '#7DD3FC',
      success: '#34D399',
      warning: '#FBBF24',
      error: '#F87171',
      taskCardBackground: '#075985',
      taskCardBorder: '#0284C7',
      switchTrackFalse: '#0284C7',
      switchTrackTrue: '#38BDF8',
      switchThumbFalse: '#075985',
      switchThumbTrue: '#38BDF8'
    }
  },
  summer: {
    name: 'Summer',
    dark: false,
    emoji: '🏖️',
    colors: {
      primary: '#F97316',
      background: '#FFF7ED',
      card: '#FFEDD5',
      text: '#7C2D12',
      border: '#FED7AA',
      notification: '#EF4444',
      accent: '#F97316',
      secondaryText: '#F97316',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      taskCardBackground: '#FFEDD5',
      taskCardBorder: '#FED7AA',
      switchTrackFalse: '#FED7AA',
      switchTrackTrue: '#FB923C',
      switchThumbFalse: '#FFEDD5',
      switchThumbTrue: '#F97316'
    }
  },
  winter: {
    name: 'Winter',
    dark: false,
    emoji: '❄️',
    colors: {
      primary: '#2563EB',
      background: '#EFF6FF',
      card: '#DBEAFE',
      text: '#1E3A8A',
      border: '#BFDBFE',
      notification: '#EF4444',
      accent: '#2563EB',
      secondaryText: '#3B82F6',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      taskCardBackground: '#DBEAFE',
      taskCardBorder: '#BFDBFE',
      switchTrackFalse: '#BFDBFE',
      switchTrackTrue: '#93C5FD',
      switchThumbFalse: '#DBEAFE',
      switchThumbTrue: '#2563EB'
    }
  },
  darkChocolate: {
    name: 'Dark Chocolate',
    dark: true,
    emoji: '🍫',
    colors: {
      primary: '#B45309',
      background: '#44403C',
      card: '#292524',
      text: '#F5F5F4',
      border: '#57534E',
      notification: '#F87171',
      accent: '#B45309',
      secondaryText: '#D6D3D1',
      success: '#34D399',
      warning: '#FBBF24',
      error: '#F87171',
      taskCardBackground: '#292524',
      taskCardBorder: '#57534E',
      switchTrackFalse: '#57534E',
      switchTrackTrue: '#92400E',
      switchThumbFalse: '#292524',
      switchThumbTrue: '#B45309'
    }
  },
  greenMint: {
    name: 'Yeşil Mint',
    dark: false,
    emoji: '🌿',
    colors: {
      primary: '#10B981',
      background: '#ecfdf5',
      card: '#d1fae5',
      text: '#065f46',
      border: '#a7f3d0',
      notification: '#EF4444',
      accent: '#10B981',
      secondaryText: '#047857',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      taskCardBackground: '#ffffff',
      taskCardBorder: '#a7f3d0',
      switchTrackFalse: '#d1fae5',
      switchTrackTrue: '#6ee7b7',
      switchThumbFalse: '#ecfdf5',
      switchThumbTrue: '#10B981'
    },
    emojiBackground: {
      pattern: '🌿',
      opacity: 0.05,
      size: 32,
      spacing: 60
    }
  },
  lushGreen: {
    name: 'Parlak Yeşil',
    dark: false,
    emoji: '🌱',
    colors: {
      primary: '#0dba6e',
      background: '#ffffff',
      card: '#f0fdf9',
      text: '#064e3b',
      border: '#ccfbf1',
      notification: '#EF4444',
      accent: '#0dba6e',
      secondaryText: '#059669',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      taskCardBackground: '#ffffff',
      taskCardBorder: '#d1fae5',
      switchTrackFalse: '#d1fae5',
      switchTrackTrue: '#34d399',
      switchThumbFalse: '#f0fdf9',
      switchThumbTrue: '#0dba6e'
    }
  },
  glassGreen: {
    name: 'Cam Yeşil',
    dark: false,
    emoji: '✨',
    colors: {
      primary: '#15c173',
      background: '#e9f7ed',
      card: 'rgba(255, 255, 255, 0.7)',
      text: '#0b4a3f',
      border: 'rgba(255, 255, 255, 0.5)',
      notification: '#EF4444',
      accent: '#15c173',
      secondaryText: '#167259',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      taskCardBackground: 'rgba(255, 255, 255, 0.8)',
      taskCardBorder: 'rgba(255, 255, 255, 0.6)',
      switchTrackFalse: 'rgba(255, 255, 255, 0.6)',
      switchTrackTrue: 'rgba(21, 193, 115, 0.4)',
      switchThumbFalse: '#ffffff',
      switchThumbTrue: '#15c173'
    },
    emojiBackground: {
      pattern: '✨',
      opacity: 0.03,
      size: 28,
      spacing: 80
    }
  },
  neomorphGreen: {
    name: 'Neon Yeşil',
    dark: false,
    emoji: '🔮',
    colors: {
      primary: '#0bda81',
      background: '#e5f4e9',
      card: '#f2fcf5',
      text: '#084c33',
      border: '#cef0d8',
      notification: '#EF4444',
      accent: '#0bda81',
      secondaryText: '#159c5f',
      success: '#0bda81',
      warning: '#F59E0B',
      error: '#EF4444',
      taskCardBackground: '#ffffff',
      taskCardBorder: 'transparent',
      switchTrackFalse: '#e1f2e5',
      switchTrackTrue: '#a8efc5',
      switchThumbFalse: '#ffffff',
      switchThumbTrue: '#0bda81'
    }
  }
};

export const getTheme = (settings: { isDarkMode: boolean; accentColor: string; themePreset: string; customColors?: any }): CustomTheme => {
  let baseTheme = settings.isDarkMode ? darkTheme : lightTheme;

  if (settings.themePreset === 'custom' && settings.customColors) {
    const customBase = settings.isDarkMode ? darkTheme : lightTheme;
    baseTheme = {
      ...customBase,
      colors: {
        ...customBase.colors,
        ...settings.customColors,
        accent: settings.accentColor,
        primary: settings.accentColor
      }
    };
  } else if (settings.themePreset !== 'light' && settings.themePreset !== 'dark') {
    const preset = customThemePresets[settings.themePreset as keyof typeof customThemePresets];
    if (preset) {
      baseTheme = {
        ...baseTheme,
        colors: {
          ...baseTheme.colors,
          ...preset,
          accent: settings.accentColor,
          primary: settings.accentColor
        }
      };
    }
  }

  return {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      accent: settings.accentColor,
      primary: settings.accentColor,
      switchThumbTrue: settings.accentColor,
      switchTrackTrue: settings.isDarkMode ? `${settings.accentColor}80` : `${settings.accentColor}40`
    }
  };
};