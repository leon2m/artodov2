import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSettings } from '@/contexts/SettingsContext';
import { MotiPressable } from 'moti/interactions';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';

interface QuickActionsProps {
  onAddTask: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ onAddTask }) => {
  const { theme, settings } = useSettings();
  
  const handleAddTaskPress = () => {
    if (settings?.hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onAddTask();
  };
  
  const handleTasksPress = () => {
    if (settings?.hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push('/tasks');
  };
  
  return (
    <View style={styles.actionContainer}>
      <MotiPressable
        onPress={handleAddTaskPress}
        style={styles.actionButton}
        containerStyle={{
          backgroundColor: theme.colors.primary,
          borderRadius: 12,
        }}
        animate={({ pressed }) => ({
          scale: pressed ? 0.97 : 1,
          opacity: pressed ? 0.9 : 1,
        })}
      >
        <Ionicons name="add-outline" size={24} color="#fff" />
        <Text style={styles.actionText}>Görev Ekle</Text>
      </MotiPressable>

      <MotiPressable
        onPress={handleTasksPress}
        style={styles.actionButton}
        containerStyle={{
          backgroundColor: theme.colors.card,
          borderRadius: 12,
        }}
        animate={({ pressed }) => ({
          scale: pressed ? 0.97 : 1,
          opacity: pressed ? 0.9 : 1,
        })}
      >
        <Ionicons name="list-outline" size={24} color={theme.colors.text} />
        <Text style={[styles.actionText, { color: theme.colors.text }]}>Görevlerim</Text>
      </MotiPressable>
    </View>
  );
};

const styles = StyleSheet.create({
  actionContainer: {
    flexDirection: 'row',
    marginVertical: 16,
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    marginHorizontal: 4,
    borderRadius: 12,
  },
  actionText: {
    marginLeft: 8,
    fontWeight: '500',
    fontSize: 15,
    color: '#fff',
  },
}); 