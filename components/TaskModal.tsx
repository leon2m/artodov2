import React from 'react';
import { Task } from '@/types/task';
import TaskModal from './modals/task';
import { AddTaskModalProps } from './modals/task/types';
import { useTasks } from '@/contexts/TaskContext';

/**
 * Bu TaskModal artık bir proxy bileşenidir. Mevcut kodun çalışmaya devam etmesi için burada tutuyoruz,
 * ancak yeni modüler yapıyı kullanır.
 */
export default function TaskModalProxy({ 
  visible, 
  onClose, 
  onSubmit, 
  initialValues 
}: {
  visible: boolean;
  onClose: () => void;
  onSubmit: (task: Partial<Task>) => void;
  initialValues?: Partial<Task>;
}) {
  // Board bilgisinin düzgün yüklenmesini sağlamak için TaskContext'i kullanıyoruz
  const { board } = useTasks();
  
  // Eski TaskModal ve modüler yapıdaki TaskModal arabirimi farklı olduğu için
  // burada bir adaptasyon yapmamız gerekiyor
  const handleAdd = (task: any) => {
    onSubmit(task);
  };

  return (
    <TaskModal
      visible={visible}
      onClose={onClose}
      onAdd={handleAdd}
      initialTask={initialValues}
    />
  );
}

// Yeni yapıda eskiden task.ts'deki tipleri dışa aktarıyoruz
export type { NewTask } from './modals/task/types';