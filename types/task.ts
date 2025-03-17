export type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'review' | 'done' | 'pending' | 'completed' | 'archived';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  description?: string;
  date: string; // ISO string
  dueDate?: Date; // Date objesi olarak bitiş tarihi
  status: TaskStatus;
  priority: TaskPriority;
  categoryId?: string;
  tags?: string[];
  location?: {
    latitude: number;
    longitude: number;
    name?: string;
  };
  reminder?: string; // ISO string
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon?: string;
  columnId?: string;
}

export interface Column {
  id: string;
  title: string;
  status: TaskStatus;
  taskIds: string[];
  color?: string;
}

export interface Label {
  id: string;
  name: string;
  color: string;
}

export interface Board {
  id: string;
  name: string;
  columns: Column[];
  categories: Category[];
  labels: Label[];
}

export interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  color: string;
  delay?: number;
}

export interface TaskSectionProps {
  title: string;
  tasks: Task[];
  icon: React.ReactNode;
  color: string;
  delay?: number;
}