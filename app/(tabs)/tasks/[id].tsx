import React, { useState, useRef, useCallback } from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable, Platform, Animated, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { ArrowLeft, Calendar, Tag, AlertCircle, Folder, CheckCircle2, Circle } from 'lucide-react-native';
import TaskModal from '@/components/TaskModal';
import { MotiView } from 'moti';
import { useTasks } from '@/contexts/TaskContext';
import { useSettings } from '@/contexts/SettingsContext';
import { Task } from '@/types/task';

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { tasks, categories, labels, updateTask, deleteTask } = useTasks();
  const { theme } = useSettings();
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;
  
  const task = tasks.find(t => t.id === id);
  
  if (!task) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.colors.background }]}>
        <Text style={{ color: theme.colors.error }}>Görev bulunamadı</Text>
      </View>
    );
  }
  
  const category = categories.find(c => c.id === task.categoryId);
  const taskLabels = labels.filter(l => task.labels?.includes(l.id));
  
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
  
  const handleStatusToggle = () => {
    updateTask(task.id, {
      status: task.status === 'completed' ? 'todo' : 'completed'
    });
  };
  
  const handleUpdateTask = (updatedTask: Partial<Task>) => {
    updateTask(task.id, updatedTask);
    setIsEditModalVisible(false);
  };
  
  const handleDeleteTask = () => {
    deleteTask(task.id);
    router.back();
  };

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });
  
  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollY.setValue(event.nativeEvent.contentOffset.y);
  }, [scrollY]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Animated.View 
          style={[
            styles.headerLeft, 
            { opacity: headerOpacity }
          ]}
        >
          <Pressable
            style={[styles.backButton, { backgroundColor: theme.colors.card }]}
            onPress={() => router.back()}>
            <ArrowLeft size={24} color={theme.colors.text} />
          </Pressable>
          
          <Animated.Text 
            style={[
              styles.headerTitle, 
              { color: theme.colors.text, opacity: headerOpacity }
            ]}
            numberOfLines={1}
          >
            {task.title}
          </Animated.Text>
        </Animated.View>
      </View>

      <Animated.ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <MotiView
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', duration: 700, delay: 200 }}
          style={styles.detailsContainer}
        >
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 500, delay: 300 }}
            style={[styles.titleContainer, { backgroundColor: theme.colors.card }]}
          >
            <Pressable
              style={styles.checkbox}
              onPress={handleStatusToggle}>
              {task.status === 'completed' ? (
                <CheckCircle2 size={32} color={theme.colors.success} />
              ) : (
                <Circle size={32} color={theme.colors.secondaryText} />
              )}
            </Pressable>
            <Text
              style={[
                styles.title,
                { color: theme.colors.text },
                task.status === 'completed' && styles.completedTitle
              ]}>
              {task.title}
            </Text>
          </MotiView>

          {task.description && (
            <MotiView
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'timing', duration: 500, delay: 400 }}
            >
              <Text
                style={[
                  styles.description,
                  { color: theme.colors.secondaryText },
                  task.status === 'completed' && styles.completedText
                ]}>
                {task.description}
              </Text>
            </MotiView>
          )}

          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 500, delay: 500 }}
            style={styles.metaContainer}
          >
            {task.dueDate && (
              <View style={[styles.metaItem, { backgroundColor: theme.colors.card }]}>
                <Calendar size={20} color={theme.colors.secondaryText} />
                <Text style={[styles.metaText, { color: theme.colors.text }]}>
                  {format(new Date(task.dueDate), 'dd MMMM yyyy', { locale: tr })}
                </Text>
              </View>
            )}

            <View
              style={[
                styles.metaItem,
                { backgroundColor: getPriorityColor(task.priority) }
              ]}>
              <AlertCircle size={20} color="#FFF" />
              <Text style={[styles.metaText, { color: '#FFF' }]}>
                {task.priority === 'high' ? 'Yüksek' : task.priority === 'medium' ? 'Orta' : 'Düşük'}
              </Text>
            </View>

            {category && (
              <View style={[styles.metaItem, { backgroundColor: category.color }]}>
                <Folder size={20} color="#FFF" />
                <Text style={[styles.metaText, { color: '#FFF' }]}>{category.name}</Text>
              </View>
            )}
          </MotiView>

          {taskLabels.length > 0 && (
            <MotiView
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'timing', duration: 500, delay: 600 }}
              style={styles.labelsContainer}
            >
              {taskLabels.map(label => (
                <View
                  key={label.id}
                  style={[styles.label, { backgroundColor: label.color }]}>
                  <Tag size={16} color="#FFF" />
                  <Text style={styles.labelText}>{label.name}</Text>
                </View>
              ))}
            </MotiView>
          )}

          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 500, delay: 700 }}
          >
            <View style={[styles.infoContainer, { backgroundColor: theme.colors.card }]}>
              <Text style={[styles.infoLabel, { color: theme.colors.secondaryText }]}>Oluşturulma</Text>
              <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                {format(new Date(task.createdAt), 'dd MMMM yyyy HH:mm', { locale: tr })}
              </Text>
              
              <Text style={[styles.infoLabel, { color: theme.colors.secondaryText }]}>Son Güncelleme</Text>
              <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                {format(new Date(task.updatedAt), 'dd MMMM yyyy HH:mm', { locale: tr })}
              </Text>
            </View>

            <View style={styles.actionContainer}>
              <MotiView
                from={{ opacity: 0, translateX: -20 }}
                animate={{ opacity: 1, translateX: 0 }}
                transition={{ type: 'timing', duration: 500, delay: 800 }}
                style={{ flex: 1 }}
              >
                <Pressable
                  style={[styles.actionButton, { backgroundColor: theme.colors.card }]}
                  onPress={() => setIsEditModalVisible(true)}>
                  <Text style={[styles.actionButtonText, { color: theme.colors.text }]}>Düzenle</Text>
                </Pressable>
              </MotiView>
              
              <MotiView
                from={{ opacity: 0, translateX: 20 }}
                animate={{ opacity: 1, translateX: 0 }}
                transition={{ type: 'timing', duration: 500, delay: 800 }}
                style={{ flex: 1 }}
              >
                <Pressable
                  style={[styles.actionButton, { backgroundColor: theme.colors.error }]}
                  onPress={handleDeleteTask}>
                  <Text style={styles.actionButtonText}>Sil</Text>
                </Pressable>
              </MotiView>
            </View>
          </MotiView>
        </MotiView>
      </Animated.ScrollView>

      <TaskModal
        visible={isEditModalVisible}
        onClose={() => setIsEditModalVisible(false)}
        onSubmit={handleUpdateTask}
        initialValues={task}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 45 : 15,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginLeft: 16,
    flex: 1,
  },
  backButton: {
    padding: 12,
    borderRadius: 12,
  },
  content: {
    flex: 1,
  },
  detailsContainer: {
    padding: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  checkbox: {
    marginRight: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    flex: 1,
  },
  completedTitle: {
    textDecorationLine: 'line-through',
    opacity: 0.7,
  },
  description: {
    fontSize: 16,
    marginBottom: 24,
    lineHeight: 24,
  },
  completedText: {
    opacity: 0.7,
  },
  metaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    gap: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    gap: 8,
  },
  metaText: {
    fontSize: 14,
    fontWeight: '500',
  },
  labelsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
    gap: 8,
  },
  label: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    gap: 8,
  },
  labelText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  infoContainer: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  infoLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 16,
  },
  actionContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16,
  },
});