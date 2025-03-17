import React from 'react';
import { Task } from '@/types/task';
import TaskViewModal from '@/components/TaskViewModal';
import AddTaskModal from '@/components/AddTaskModal';

interface PlanningModalsProps {
  // Task Detail Modal
  taskDetailVisible: boolean;
  selectedTask: Task | null;
  onCloseTaskDetail: () => void;
  onUpdateTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  
  // Add Task Modal
  addTaskVisible: boolean;
  onCloseAddTask: () => void;
  onAddTask: (task: any) => void;
  selectedDate: Date;
}

const PlanningModals: React.FC<PlanningModalsProps> = ({
  // Task Detail Modal
  taskDetailVisible,
  selectedTask,
  onCloseTaskDetail,
  onUpdateTask,
  onDeleteTask,
  
  // Add Task Modal
  addTaskVisible,
  onCloseAddTask,
  onAddTask,
  selectedDate
}) => {
  return (
    <>
      {/* Task Detail Modal - daha modern ve şık görünüm için yeni TaskViewModal kullanılıyor */}
      {selectedTask && (
        <TaskViewModal
          visible={taskDetailVisible}
          task={selectedTask}
          onClose={onCloseTaskDetail}
          onEdit={onUpdateTask}
          onDelete={onDeleteTask}
        />
      )}
      
      {/* Add Task Modal */}
      <AddTaskModal
        visible={addTaskVisible}
        onClose={onCloseAddTask}
        onAdd={(newTask) => {
          if (newTask.title) {
            // Tarih seçimine göre görev ekle
            const taskDate = selectedDate.toISOString();
            
            // @ts-ignore - Eksik alanlar (id, createdAt, updatedAt) backend tarafından otomatik ekleniyor
            onAddTask({
              ...newTask,
              status: newTask.status || 'pending',
              priority: newTask.priority || 'medium',
              date: taskDate, // Görev tarihi olarak seçili tarihi kullan
              title: newTask.title // Title undefined olmasın diye açıkça belirtiyoruz
            });
          }
        }}
      />
    </>
  );
};

export default PlanningModals; 