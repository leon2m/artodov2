import React from 'react';
import { Pressable, StyleSheet, Platform } from 'react-native';
import { useSettings } from '@/contexts/SettingsContext';
import { Plus } from 'lucide-react-native';

interface AddTaskButtonProps {
  onPress: () => void;
}

export default function AddTaskButton({ onPress }: AddTaskButtonProps) {
  const { theme } = useSettings();
  return (
    <Pressable
      style={[styles.button, {
        backgroundColor: theme.colors.primary,
        ...Platform.select({
          ios: {
            shadowColor: theme.colors.primary,
          },
          web: {
            boxShadow: `0 4px 4.65px ${theme.colors.primary}4D`,
          },
        }),
      }]}
      onPress={onPress}>
      <Plus size={24} color="#fff" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#0EA5E9',
        shadowOffset: {
          width: 0,
          height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0 4px 4.65px rgba(14, 165, 233, 0.3)',
      },
    }),
  },
});