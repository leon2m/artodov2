import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { MotiPressable } from 'moti/interactions';
import { useSettings } from '@/contexts/SettingsContext';

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: React.ReactNode;
  color: string;
  type: 'pending' | 'completed' | 'total' | 'progress';
  onPress?: () => void;
  style?: ViewStyle;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  color,
  type,
  onPress,
  style
}: StatCardProps) {
  const { theme } = useSettings();
  
  // Değer metni için formatlama
  const formattedValue = typeof value === 'number' && value > 999 
    ? '999+' 
    : type === 'progress' 
      ? `${value}%` 
      : value;
  
  return (
    <MotiPressable
      onPress={onPress}
      style={[
        styles.container, 
        { 
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border,
          borderWidth: theme.dark ? 0 : 1
        },
        style
      ]}
      animate={({ pressed }) => ({
        scale: pressed ? 0.98 : 1,
      })}
    >
      <View style={styles.content}>
        {/* İkon */}
        <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
          {icon}
        </View>
        
        {/* Değer */}
        <Text style={[styles.value, { color: theme.colors.text }]}>
          {formattedValue}
        </Text>
        
        {/* Başlık */}
        <Text style={[styles.title, { color: theme.colors.secondaryText }]}>
          {title}
        </Text>
      </View>
    </MotiPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 130,
    height: 120,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  value: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 3,
  },
  title: {
    fontSize: 13,
    textAlign: 'center',
  }
}); 