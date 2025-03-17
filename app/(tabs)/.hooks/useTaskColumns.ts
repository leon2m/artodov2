import { useState, useCallback, useMemo } from 'react';
import { Column, Task } from '@/types/task';
import { useTasks } from '@/contexts/TaskContext';
import { useSettings } from '@/contexts/SettingsContext';
import * as Haptics from 'expo-haptics';

export function useTaskColumns() {
  const [expandedColumns, setExpandedColumns] = useState<string[]>([]);
  const { tasks, board } = useTasks();
  const { theme, settings } = useSettings();

  // Tüm görevleri kategorilerine göre gruplandır
  const columnTasksMap = useMemo(() => {
    if (!tasks || !board) return {};
    
    const result: Record<string, Task[]> = {};
    
    board.columns.forEach(column => {
      result[column.id] = tasks.filter(task => task.status === column.status);
    });
    
    return result;
  }, [tasks, board]);

  // Kolon genişletme/daraltma işlevi
  const toggleColumnExpand = useCallback((columnId: string) => {
    if (settings.hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        .catch(err => console.log('Haptic error', err));
    }
    
    setExpandedColumns(prev => 
      prev.includes(columnId)
        ? prev.filter(id => id !== columnId)
        : [...prev, columnId]
    );
  }, [settings.hapticFeedback]);

  // Kolon görevlerini alma fonksiyonu
  const getColumnTasks = useCallback((columnId: string) => {
    const column = board.columns.find(col => col.id === columnId);
    if (!column) return [];
    
    return tasks.filter(task => task.status === column.status);
  }, [board.columns, tasks]);
  
  // Kolon görev sayısını alma fonksiyonu
  const getTaskCount = useCallback((column: Column) => {
    return getColumnTasks(column.id).length;
  }, [getColumnTasks]);

  // Kolon başlık rengi belirleme
  const getColumnColor = useCallback((column: Column) => {
    return column.color || theme.colors.primary;
  }, [theme.colors.primary]);

  // Tüm kolonları sıfırlama
  const resetExpandedColumns = useCallback(() => {
    setExpandedColumns([]);
  }, []);

  return {
    expandedColumns,
    columnTasksMap,
    toggleColumnExpand,
    getColumnTasks,
    getTaskCount,
    getColumnColor,
    resetExpandedColumns
  };
} 