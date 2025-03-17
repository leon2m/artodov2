// Task modalları için tip tanımlamaları
import { Theme } from '@react-navigation/native';
import { TaskStatus } from '@/types/task';

export interface Category {
  id: string;
  name: string;
  color: string;
}

export interface Label {
  id: string;
  name: string;
  color: string;
}

export interface Board {
  id: string;
  name: string;
  categories: Category[];
  labels: Label[];
}

export interface NewTask {
  title: string;
  description: string;
  date: string;
  status: TaskStatus;
  priority: 'low' | 'medium' | 'high';
  categoryId?: string;
  labels?: string[];
}

export interface AddTaskModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (task: NewTask) => void;
  initialTask?: any; // Hem Task hem de Partial<Task> tiplerini desteklemek için any kullanıldı
}

export interface TaskModalAnimationProps {
  isExpanded: boolean;
  expandAnim: any;
  fadeAnim: any;
  slideAnim: any;
  NORMAL_HEIGHT: number;
  EXPANDED_HEIGHT: number;
  setExpandProgress: (value: number) => void;
}

export interface CategoryPickerProps {
  visible: boolean;
  onClose: () => void;
  categories: Category[];
  selectedCategoryId?: string;
  onSelectCategory: (categoryId: string) => void;
  theme: Theme;
  settings: any;
  board: Board;
}

export interface LabelPickerProps {
  visible: boolean;
  onClose: () => void;
  labels: Label[];
  selectedLabels?: string[];
  onToggleLabel: (labelId: string) => void;
  theme: Theme;
  settings: any;
  board: Board;
}

export interface ModalHeaderProps {
  onClose: () => void;
  theme: Theme;
  title?: string;
}

export interface ModalFooterProps {
  onSave: () => void;
  onCancel: () => void;
  isValid: boolean;
  theme: Theme;
  isEditMode?: boolean;
}

export interface TaskFormProps {
  task: NewTask;
  onTaskChange: (task: NewTask) => void;
  onSelectCategory: () => void;
  onSelectLabels: () => void;
  theme: Theme;
  settings: any;
}

export interface TaskModalAnimationsProps {
  visible: boolean;
  onClose: () => void;
  settings: any;
}

// Renk paleti
export const COLORS = [
  '#EF4444',  // Kırmızı
  '#F97316',  // Turuncu
  '#F59E0B',  // Sarı
  '#10B981',  // Yeşil
  '#06B6D4',  // Açık mavi
  '#3B82F6',  // Mavi
  '#8B5CF6',  // Mor
  '#EC4899',  // Pembe
  '#94A3B8'   // Gri
]; 