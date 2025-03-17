import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle, StyleProp, Text, TextStyle } from 'react-native';
import { useSettings } from '@/contexts/SettingsContext';
import { MotiView } from 'moti';

interface GlassCardProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  backgroundColor?: string;
  title?: string;
  titleStyle?: StyleProp<TextStyle>;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  animate?: boolean;
}

const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  backgroundColor,
  title,
  titleStyle,
  iconLeft,
  iconRight,
  animate = true
}) => {
  const { theme, settings } = useSettings();
  const isDarkMode = settings.isDarkMode;

  // Karanlık mod için tema uyumlu renkler
  const defaultBgColor = isDarkMode 
    ? theme.colors.card + 'CC'  // CC = %80 opaklık
    : 'rgba(255, 255, 255, 0.8)';
  
  const borderColor = isDarkMode
    ? theme.colors.border + 'BF'  // BF = %75 opaklık
    : 'rgba(255, 255, 255, 0.8)';

  const bgColor = backgroundColor || defaultBgColor;

  const cardContent = () => (
    <View style={[
      styles.container, 
      { 
        backgroundColor: bgColor,
        borderColor: borderColor
      },
      style
    ]}>
      {title && (
        <View style={styles.header}>
          {iconLeft && <View style={styles.iconLeft}>{iconLeft}</View>}
          <Text style={[styles.title, { color: theme.colors.text }, titleStyle]}>
            {title}
          </Text>
          {iconRight && <View style={styles.iconRight}>{iconRight}</View>}
        </View>
      )}
      <View style={styles.content}>{children}</View>
    </View>
  );

  if (animate) {
    return (
      <MotiView
        from={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', damping: 15, stiffness: 120 }}
      >
        {cardContent()}
      </MotiView>
    );
  }

  return cardContent();
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    shadowColor: 'rgba(0,0,0,0.15)',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 5,
    marginVertical: 8,
    padding: 16
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  content: {
    flex: 1,
  },
  iconLeft: {
    marginRight: 12,
  },
  iconRight: {
    marginLeft: 12,
  },
});

export default GlassCard; 