import { useMemo } from 'react';
import { Task } from '@/types/task';
import { ChartData } from '@/types/chart';
import { useSettings } from '@/contexts/SettingsContext';

export function useDashboardStats(tasks: Task[]) {
  const { theme } = useSettings();

  // Görevlerin durumu
  const taskStats = useMemo(() => {
    if (!tasks) return { pending: 0, completed: 0, total: 0, progress: 0 };
    
    const pending = tasks.filter(task => task.status !== 'completed').length;
    const completed = tasks.filter(task => task.status === 'completed').length;
    const total = tasks.length;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return { pending, completed, total, progress };
  }, [tasks]);

  // Kategori bazlı görev dağılımı
  const categoryData = useMemo(() => {
    if (!tasks || tasks.length === 0) return [];
    
    const categories: Record<string, number> = {};
    
    tasks.forEach(task => {
      const status = task.status || 'other';
      categories[status] = (categories[status] || 0) + 1;
    });
    
    return Object.entries(categories).map(([name, count]) => ({
      name,
      count,
      color: getStatusColor(name, theme.colors)
    }));
  }, [tasks, theme.colors]);

  // Öncelik bazlı görev dağılımı
  const priorityData = useMemo(() => {
    if (!tasks || tasks.length === 0) return [];
    
    const priorities: Record<string, number> = {};
    
    tasks.forEach(task => {
      const priority = task.priority || 'medium';
      priorities[priority] = (priorities[priority] || 0) + 1;
    });
    
    return Object.entries(priorities).map(([name, count]) => ({
      name,
      count,
      color: getPriorityColor(name, theme.colors)
    }));
  }, [tasks, theme.colors]);

  // Genel istatistikler için grafik verisi
  const chartData: ChartData = useMemo(() => {
    return {
      categories: categoryData,
      priorities: priorityData
    };
  }, [categoryData, priorityData]);

  // Bugün ve bu hafta tamamlanması gereken görevler
  const todayTasks = useMemo(() => {
    if (!tasks) return [];
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return tasks.filter(task => {
      if (!task.date) return false;
      
      const taskDate = new Date(task.date);
      taskDate.setHours(0, 0, 0, 0);
      
      return taskDate.getTime() === today.getTime();
    }).sort((a, b) => {
      if (a.status === 'completed' && b.status !== 'completed') return 1;
      if (a.status !== 'completed' && b.status === 'completed') return -1;
      return 0;
    });
  }, [tasks]);

  // Bu hafta tamamlanması gereken görevler
  const thisWeekTasks = useMemo(() => {
    if (!tasks) return [];
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    
    const endOfWeek = new Date(today);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    return tasks.filter(task => {
      if (!task.date) return false;
      
      const taskDate = new Date(task.date);
      taskDate.setHours(0, 0, 0, 0);
      
      return taskDate >= startOfWeek && taskDate <= endOfWeek;
    }).sort((a, b) => {
      if (a.status === 'completed' && b.status !== 'completed') return 1;
      if (a.status !== 'completed' && b.status === 'completed') return -1;
      
      const dateA = new Date(a.date || 0);
      const dateB = new Date(b.date || 0);
      return dateA.getTime() - dateB.getTime();
    });
  }, [tasks]);

  return {
    taskStats,
    chartData,
    todayTasks,
    thisWeekTasks
  };
}

// Yardımcı fonksiyonlar
function getStatusColor(status: string, colors: any) {
  switch (status) {
    case 'todo':
      return colors.blue || '#93C5FD';
    case 'in_progress':
      return colors.yellow || '#FCD34D';
    case 'review':
      return colors.pink || '#F9A8D4';
    case 'completed':
      return colors.green || '#86EFAC';
    case 'backlog':
      return colors.gray || '#E5E7EB';
    default:
      return colors.gray || '#E5E7EB';
  }
}

function getPriorityColor(priority: string, colors: any) {
  switch (priority) {
    case 'high':
      return colors.red || '#F87171';
    case 'medium':
      return colors.yellow || '#FCD34D';
    case 'low':
      return colors.blue || '#93C5FD';
    default:
      return colors.gray || '#E5E7EB';
  }
} 