import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import { MotiPressable } from 'moti/interactions';
import { Column, Task } from '@/types/task';
import TaskCard from '@/components/TaskCard';
import { ChevronDown, ChevronUp, Plus } from 'lucide-react-native';
import { useSettings } from '@/contexts/SettingsContext';

interface TaskColumnProps {
  column: Column;
  tasks: Task[];
  isExpanded: boolean;
  columnColor: string;
  taskCount: number;
  index: number;
  onToggleExpand: (columnId: string) => void;
  onTaskPress: (taskId: string) => void;
  onTaskDelete: (taskId: string) => void;
  onTaskEdit: (task: Task) => void;
  onTaskStatusToggle: (task: Task, status: 'completed' | 'pending') => void;
  onAddTask: () => void;
}

export function TaskColumn({
  column,
  tasks,
  isExpanded,
  columnColor,
  taskCount,
  index,
  onToggleExpand,
  onTaskPress,
  onTaskDelete,
  onTaskEdit,
  onTaskStatusToggle,
  onAddTask
}: TaskColumnProps) {
  const { theme } = useSettings();

  return (
    <MotiView
      key={column.id}
      from={{ opacity: 0, translateY: 30 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ 
        type: 'spring', 
        damping: 15, 
        stiffness: 120, 
        delay: index * 80 + 100,
        mass: 0.9
      }}
      style={styles.columnContainer}
    >
      <MotiPressable 
        onPress={() => onToggleExpand(column.id)}
        style={styles.columnHeader}
        containerStyle={{
          backgroundColor: columnColor,
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
        }}
        animate={({ pressed }: { pressed: boolean }) => ({
          scale: pressed ? 0.98 : 1,
          opacity: pressed ? 0.9 : 1,
        })}
        transition={{ type: 'spring', damping: 15, stiffness: 200 }}
      >
        <View style={styles.columnHeaderContent}>
          <Text style={styles.columnTitle}>{column.title}</Text>
          <View style={styles.columnHeaderRight}>
            <Text style={styles.taskCount}>{taskCount}</Text>
            <View style={styles.expandIcon}>
              {isExpanded ? (
                <ChevronUp size={20} color="#fff" />
              ) : (
                <ChevronDown size={20} color="#fff" />
              )}
            </View>
          </View>
        </View>
      </MotiPressable>
      
      {isExpanded && (
        <MotiView
          from={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ type: 'spring', damping: 15, stiffness: 120 }}
          style={[
            styles.tasksContainer,
            { backgroundColor: theme.colors.card }
          ]}
          exit={{
            opacity: 0,
            height: 0,
          }}
        >
          {tasks.length > 0 ? (
            tasks.map((task, taskIndex) => (
              <MotiView
                key={task.id}
                from={{ opacity: 0, translateY: 15, scale: 0.95 }}
                animate={{ opacity: 1, translateY: 0, scale: 1 }}
                transition={{ 
                  type: 'spring', 
                  damping: 15, 
                  delay: taskIndex * 50,
                  stiffness: 120
                }}
              >
                <TaskCard
                  task={task}
                  onPress={() => onTaskPress(task.id)}
                  onDelete={() => onTaskDelete(task.id)}
                  onEdit={() => onTaskEdit(task)}
                  onToggleStatus={() => onTaskStatusToggle(task, task.status === 'completed' ? 'pending' : 'completed')}
                  viewMode="normal"
                />
              </MotiView>
            ))
          ) : (
            <View style={styles.emptyColumn}>
              <Text style={[styles.emptyText, { color: theme.colors.secondaryText }]}>
                Bu kolonda hiç görev yok
              </Text>
              <MotiPressable
                onPress={onAddTask}
                style={styles.addTaskButton}
                containerStyle={{
                  backgroundColor: columnColor,
                  borderRadius: 8,
                }}
                animate={({ pressed }: { pressed: boolean }) => ({
                  scale: pressed ? 0.95 : 1,
                  opacity: pressed ? 0.8 : 1,
                })}
              >
                <Plus size={16} color="#fff" />
                <Text style={styles.addTaskText}>Görev Ekle</Text>
              </MotiPressable>
            </View>
          )}
        </MotiView>
      )}
    </MotiView>
  );
}

const styles = StyleSheet.create({
  columnContainer: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  columnHeader: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  columnHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  columnHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  columnTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  taskCount: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  expandIcon: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tasksContainer: {
    padding: 12,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  emptyColumn: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    marginBottom: 12,
  },
  addTaskButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  addTaskText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
    marginLeft: 4,
  },
}); 