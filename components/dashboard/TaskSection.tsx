import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Task } from '@/types/task';
import TaskCard from '@/components/TaskCard';
import { MotiView } from 'moti';
import { useSettings } from '@/contexts/SettingsContext';
import { AlertCircle } from 'lucide-react-native';

interface TaskSectionProps {
  title: string;
  tasks: Task[];
  onTaskPress: (task: Task) => void;
  onToggleStatus: (taskId: string, currentStatus: string) => void;
  onDelete: (taskId: string) => void;
  onEdit: (task: Task) => void;
  onSeeAll?: () => void;
  emptyMessage?: string;
}

export function TaskSection({
  title,
  tasks,
  onTaskPress,
  onToggleStatus,
  onDelete,
  onEdit,
  onSeeAll,
  emptyMessage = 'Görev bulunamadı'
}: TaskSectionProps) {
  const { theme } = useSettings();

  return (
    <View style={styles.section}>
      <MotiView 
        from={{ opacity: 0, translateX: -10 }}
        animate={{ opacity: 1, translateX: 0 }}
        transition={{ type: 'timing', duration: 500 }}
        style={styles.sectionHeader}
      >
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          {title}
        </Text>
        {onSeeAll && tasks.length > 0 && (
          <TouchableOpacity 
            onPress={onSeeAll}
            style={[
              styles.seeAllButton, 
              { backgroundColor: theme.colors.primary + '10' }
            ]}
          >
            <Text style={[styles.seeAllText, { color: theme.colors.primary }]}>
              Tümünü Gör
            </Text>
          </TouchableOpacity>
        )}
      </MotiView>

      {tasks.length > 0 ? (
        <View style={styles.taskList}>
          {tasks.map((task, index) => (
            <MotiView
              key={task.id}
              from={{ opacity: 0, translateY: 10 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'timing', duration: 400, delay: index * 50 }}
              style={styles.taskCard}
            >
              <TaskCard
                task={task}
                onPress={() => onTaskPress(task)}
                onToggleStatus={() => onToggleStatus(task.id, task.status)}
                onDelete={() => onDelete(task.id)}
                onEdit={() => onEdit(task)}
              />
            </MotiView>
          ))}
        </View>
      ) : (
        <MotiView 
          from={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', dampingRatio: 0.8 }}
          style={[
            styles.emptyContainer, 
            { 
              backgroundColor: theme.dark ? theme.colors.card : 'rgba(0,0,0,0.03)',
              borderColor: theme.colors.border
            }
          ]}
        >
          <AlertCircle size={18} color={theme.colors.secondaryText} style={styles.emptyIcon} />
          <Text style={[styles.emptyText, { color: theme.colors.secondaryText }]}>
            {emptyMessage}
          </Text>
        </MotiView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  seeAllButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '500',
  },
  taskList: {
    marginTop: 4,
  },
  taskCard: {
    marginBottom: 8,
  },
  emptyContainer: {
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    flexDirection: 'row',
    borderWidth: 1,
  },
  emptyIcon: {
    marginRight: 6,
  },
  emptyText: {
    fontSize: 13,
  },
}); 