import React from 'react';
import TaskModal from './modals/task';
import { AddTaskModalProps } from './modals/task/types';

/**
 * Bu AddTaskModal artık bir proxy bileşenidir. Mevcut kodun çalışmaya devam etmesi için burada tutuyoruz,
 * ancak yeni modüler yapıyı kullanır.
 */
export default function AddTaskModal(props: AddTaskModalProps) {
  return <TaskModal {...props} />;
}

// Yeni yapıda eskiden task.ts'deki tipleri dışa aktarıyoruz
export type { NewTask } from './modals/task/types'; 