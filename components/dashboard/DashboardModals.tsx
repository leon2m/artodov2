import React from 'react';
import { Task } from '@/types/task';
import TaskViewModal from '@/components/TaskViewModal';
import AddTaskModal from '@/components/AddTaskModal';
import TaskModal from '@/components/modals/task';
import { Ionicons } from '@expo/vector-icons';
import { StatCardDetail } from '@/components/dashboard/StatCardDetail';

// Geçici tip tanımlamaları - mevcut yapıyla uyumlu
interface TaskStats {
  pending: number;
  completed: number;
  total: number;
  progress: number;
}

interface ChartData {
  categoriesData: any[];
  prioritiesData: any[];
}

// ChartModal için geçici tanımlama (import hatası giderimi için)
const ChartModal = (props: any) => null;

// İstatistik kartları renkleri
const COLORS = {
  blue: '#3B82F6',
  green: '#10B981',
  purple: '#8B5CF6',
  pink: '#EC4899',
  red: '#EF4444',
  yellow: '#F59E0B',
};

interface DashboardModalsProps {
  // Chart Modal
  chartVisible: boolean;
  chartType: 'categories' | 'priorities' | null;
  chartData: any;
  onCloseChart: () => void;
  
  // Task Detail Modal
  taskDetailVisible: boolean;
  selectedTask: Task | null;
  onCloseTaskDetail: () => void;
  onUpdateTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  
  // Edit Task Modal
  editTaskVisible?: boolean;
  onCloseEditTask?: () => void;
  onSaveEditTask?: (task: any) => void;
  
  // Add Task Modal
  addTaskVisible: boolean;
  onCloseAddTask: () => void;
  onAddTask: (task: any) => void;
  
  // Stats Detail
  activeDetailCard: string | null;
  onCloseDetail: () => void;
  getStatCardDescription: (cardId: string) => string;
  taskStats: TaskStats;
}

export const DashboardModals: React.FC<DashboardModalsProps> = ({
  // Chart Modal
  chartVisible,
  chartType,
  chartData,
  onCloseChart,
  
  // Task Detail Modal
  taskDetailVisible,
  selectedTask,
  onCloseTaskDetail,
  onUpdateTask,
  onDeleteTask,
  
  // Edit Task Modal
  editTaskVisible = false,
  onCloseEditTask = () => {},
  onSaveEditTask = () => {},
  
  // Add Task Modal
  addTaskVisible,
  onCloseAddTask,
  onAddTask,
  
  // Stats Detail
  activeDetailCard,
  onCloseDetail,
  getStatCardDescription,
  taskStats
}) => {
  // Chart veri formatlama fonksiyonu
  const getChartData = (type: 'categories' | 'priorities') => {
    if (!chartData) return null;
    
    return type === 'categories' 
      ? chartData.categoriesData 
      : chartData.prioritiesData;
  };
  
  return (
    <>
      {/* StatCard Detay Popupları */}
      <StatCardDetail
        visible={activeDetailCard === 'pending'}
        title="Bekleyen Görevler"
        value={taskStats.pending}
        color={COLORS.blue}
        icon={<Ionicons name="time-outline" size={28} color={COLORS.blue} />}
        description={getStatCardDescription('pending')}
        onClose={onCloseDetail}
        cardId="pending"
      />
      
      <StatCardDetail
        visible={activeDetailCard === 'completed'}
        title="Tamamlanan Görevler"
        value={taskStats.completed}
        color={COLORS.green}
        icon={<Ionicons name="checkmark-done-outline" size={28} color={COLORS.green} />}
        description={getStatCardDescription('completed')}
        onClose={onCloseDetail}
        cardId="completed"
      />
      
      <StatCardDetail
        visible={activeDetailCard === 'total'}
        title="Toplam Görevler"
        value={taskStats.total}
        color={COLORS.purple}
        icon={<Ionicons name="document-text-outline" size={28} color={COLORS.purple} />}
        description={getStatCardDescription('total')}
        onClose={onCloseDetail}
        cardId="total"
      />
      
      <StatCardDetail
        visible={activeDetailCard === 'progress'}
        title="İlerleme Durumu"
        value={taskStats.progress}
        subtitle="Tamamlanma oranı"
        color={COLORS.pink}
        icon={<Ionicons name="analytics-outline" size={28} color={COLORS.pink} />}
        description={getStatCardDescription('progress')}
        onClose={onCloseDetail}
        cardId="progress"
      />

      {/* Task Detail Modal - modern ve şık görünüm için TaskViewModal kullandık */}
      {selectedTask && (
        <TaskViewModal
          visible={taskDetailVisible}
          task={selectedTask}
          onClose={onCloseTaskDetail}
          onEdit={onUpdateTask}
          onDelete={onDeleteTask}
        />
      )}
      
      {/* Görev Düzenleme Modalı */}
      {selectedTask && (
        <TaskModal
          visible={editTaskVisible}
          onClose={onCloseEditTask}
          onAdd={onSaveEditTask}
          initialTask={selectedTask}
        />
      )}
      
      {/* Grafikler Modalı */}
      {chartData && chartVisible && (
        <ChartModal
          visible={chartVisible}
          onClose={onCloseChart}
          data={getChartData(chartType as 'categories' | 'priorities')}
          title={chartType === 'categories' ? 'Kategori Dağılımı' : 'Öncelik Dağılımı'}
          type={chartType === 'categories' ? 'pie' : 'bar'}
        />
      )}
      
      {/* Görev Ekleme Modalı */}
      <AddTaskModal
        visible={addTaskVisible}
        onClose={onCloseAddTask}
        onAdd={onAddTask}
      />
    </>
  );
}; 