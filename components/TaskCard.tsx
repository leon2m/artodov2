import React from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { useSettings } from '@/contexts/SettingsContext';
import { Task } from '@/types/task';
import { CircleCheck as CheckCircle2, Circle, Clock, CircleAlert as AlertCircle, CreditCard as Edit2, Trash2 } from 'lucide-react-native';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { MotiView } from 'moti';

interface TaskCardProps {
  task: Task;
  onPress: () => void;
  onToggleStatus?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  viewMode?: 'compact' | 'normal' | 'large' | 'list';
}

export default function TaskCard({ task, onPress, onToggleStatus, onEdit, onDelete, viewMode = 'normal' }: TaskCardProps) {
  const { theme, settings } = useSettings();
  
  // Renk temalandırması için task önceliğine göre renk belirle
  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high':
        return theme.colors.error;
      case 'medium':
        return theme.colors.warning;
      case 'low':
        return theme.colors.success;
      default:
        return theme.colors.secondaryText;
    }
  };
  
  // Animasyonlu kart içeriği
  const CardContent = () => (
    <>
      {viewMode !== 'compact' && (
        <Pressable onPress={onToggleStatus} style={styles.checkbox}>
          {task.status === 'completed' ? (
            <View style={[styles.checkboxContainer, { backgroundColor: theme.colors.success + '20' }]}>
              <CheckCircle2 size={viewMode === 'large' ? 24 : 20} color={theme.colors.success} />
            </View>
          ) : (
            <View style={[styles.checkboxContainer, { backgroundColor: theme.colors.secondaryText + '10' }]}>
              <Circle size={viewMode === 'large' ? 24 : 20} color={theme.colors.secondaryText} />
            </View>
          )}
        </Pressable>
      )}
      
      <View style={[styles.content, viewMode === 'compact' && styles.compactContent]}>
        <View style={styles.header}>
          <Text
            style={[{
              ...styles.title,
              color: theme.colors.text
            },
              task.status === 'completed' && styles.completedTitle,
              viewMode === 'compact' && styles.compactTitle,
              viewMode === 'list' && styles.listTitle,
              viewMode === 'large' && styles.largeTitle
            ]}
            numberOfLines={viewMode === 'compact' ? 1 : viewMode === 'list' ? 3 : 2}>
            {task.title}
          </Text>
          {viewMode !== 'compact' && (
            <View style={styles.actions}>
              {onEdit && (
                <Pressable
                  style={[styles.actionButton, { backgroundColor: theme.colors.card }]}
                  onPress={(e) => {
                    e.stopPropagation();
                    onEdit();
                  }}>
                  <Edit2 size={viewMode === 'large' ? 20 : 16} color={theme.colors.secondaryText} />
                </Pressable>
              )}
              {onDelete && (
                <Pressable
                  style={[styles.actionButton, { backgroundColor: theme.colors.card }]}
                  onPress={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}>
                  <Trash2 size={viewMode === 'large' ? 20 : 16} color={theme.colors.error} />
                </Pressable>
              )}
              <View
                style={[
                  styles.priorityBadge,
                  { backgroundColor: getPriorityColor(task.priority) },
                  viewMode === 'large' && { width: 24, height: 24 }
                ]}>
                <AlertCircle size={viewMode === 'large' ? 14 : 10} color="white" />
              </View>
            </View>
          )}
        </View>

        {viewMode !== 'compact' && task.description && (
          <Text
            style={[{
              ...styles.description,
              color: theme.colors.secondaryText
            },
              task.status === 'completed' && styles.completedText,
              viewMode === 'list' && styles.listDescription,
              viewMode === 'large' && styles.largeDescription,
            ]}
            numberOfLines={viewMode === 'list' ? 3 : viewMode === 'large' ? 4 : 2}>
            {task.description}
          </Text>
        )}

        {viewMode !== 'compact' && task.dueDate && (
          <View style={styles.dueDate}>
            <View style={[styles.dueDateIconContainer, { backgroundColor: theme.colors.secondaryText + '10' }]}>
              <Clock size={viewMode === 'large' ? 14 : 10} color={theme.colors.secondaryText} />
            </View>
            <Text style={[styles.dueDateText, { color: theme.colors.secondaryText }, viewMode === 'large' && { fontSize: 13 }]}>
              {format(task.dueDate, 'dd MMMM yyyy', { locale: tr })}
            </Text>
          </View>
        )}
      </View>
    </>
  );

  return (
    <MotiView
      from={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', damping: 18, stiffness: 120 }}
    >
      <Pressable
        style={({ pressed }) => [
          {
            ...styles.container,
            backgroundColor: theme.colors.taskCardBackground,
            borderColor: theme.colors.taskCardBorder,
            transform: [{ scale: pressed ? 0.98 : 1 }]
          },
          task.status === 'completed' && styles.completedTask,
          viewMode === 'large' && { padding: 18, borderRadius: 26 },
          viewMode === 'list' && { paddingVertical: 18 }
        ]}
        onPress={onPress}>
        <CardContent />
      </Pressable>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 24,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  completedTask: {
    opacity: 0.7,
  },
  checkbox: {
    marginRight: 14,
    justifyContent: 'center',
  },
  checkboxContainer: {
    padding: 6,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  compactContent: {
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
    letterSpacing: -0.4,
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
  completedTitle: {
    textDecorationLine: 'line-through',
    opacity: 0.7,
  },
  completedText: {
    textDecorationLine: 'line-through',
    opacity: 0.7,
  },
  compactTitle: {
    fontSize: 14,
  },
  listTitle: {
    fontSize: 17,
  },
  largeTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  description: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
        fontWeight: '400',
      },
      android: {
        fontFamily: 'sans-serif',
      },
    }),
  },
  listDescription: {
    fontSize: 15,
  },
  largeDescription: {
    fontSize: 16,
    lineHeight: 22,
  },
  dueDate: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dueDateIconContainer: {
    padding: 6,
    borderRadius: 12,
    marginRight: 6,
  },
  dueDateText: {
    fontSize: 12,
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
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 14,
  },
  priorityBadge: {
    width: 22,
    height: 22,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});