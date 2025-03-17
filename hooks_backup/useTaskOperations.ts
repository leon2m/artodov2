import { useState, useCallback } from 'react';
import { Task, TaskStatus } from '@/types/task';
import { useTasks } from '@/contexts/TaskContext';
import { useRouter } from 'expo-router';

export function useTaskOperations() {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { addTask, updateTask, deleteTask } = useTasks();
  const router = useRouter();

  // Görev ekleme işlevi
  const handleAddTask = useCallback((newTask: Partial<Task>) => {
    if (!newTask.title) return;
    
    addTask({
      title: newTask.title,
      description: newTask.description || '',
      priority: newTask.priority || 'medium',
      status: 'todo' as TaskStatus,
      date: new Date().toISOString(),
    });
    
    setIsModalVisible(false);
  }, [addTask]);

  // Görev güncelleme işlevi
  const handleUpdateTask = useCallback((updatedTask: Partial<Task>) => {
    if (!selectedTask) return;
    
    updateTask(selectedTask.id, updatedTask);
    setSelectedTask(null);
    setIsModalVisible(false);
  }, [selectedTask, updateTask]);

  // Görev durum güncellemesi
  const handleTaskStatusUpdate = useCallback((task: Task, newStatus: TaskStatus) => {
    updateTask(task.id, { status: newStatus });
  }, [updateTask]);

  // Görev silme işlevi
  const handleDeleteTask = useCallback((taskId: string) => {
    deleteTask(taskId);
  }, [deleteTask]);

  // Görev detayına yönlendirme
  const handleTaskPress = useCallback((taskId: string) => {
    router.push(`/tasks/${taskId}`);
  }, [router]);

  // Modalı açma işlevi
  const openAddTaskModal = useCallback(() => {
    setSelectedTask(null);
    setIsModalVisible(true);
  }, []);

  // Modalı düzenleme modu ile açma işlevi 
  const openEditTaskModal = useCallback((task: Task) => {
    setSelectedTask(task);
    setIsModalVisible(true);
  }, []);

  // Modalı kapatma işlevi
  const closeTaskModal = useCallback(() => {
    setIsModalVisible(false);
    setSelectedTask(null);
  }, []);

  return {
    selectedTask,
    isModalVisible,
    handleAddTask,
    handleUpdateTask,
    handleTaskStatusUpdate,
    handleDeleteTask,
    handleTaskPress,
    openAddTaskModal,
    openEditTaskModal,
    closeTaskModal
  };
} 