import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { Task, Priority, TaskStatus, Board, Column, Category, Label } from '@/types/task';
import { LocalStorageService } from '@/services/LocalStorageService';

interface TaskContextType {
  tasks: Task[];
  board: Board;
  loading: boolean;
  error: string | null;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTask: (id: string, task: Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  moveTask: (taskId: string, sourceColumnId: string, targetColumnId: string, newIndex: number) => Promise<void>;
  toggleTaskStatus: (taskId: string) => Promise<void>;
  addColumn: (column: Omit<Column, 'id'>) => Promise<void>;
  updateColumn: (id: string, column: Partial<Omit<Column, 'id'>>) => Promise<void>;
  deleteColumn: (id: string) => Promise<void>;
  addCategory: (category: Omit<Category, 'id'>) => Promise<void>;
  updateCategory: (id: string, category: Partial<Omit<Category, 'id'>>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  addLabel: (label: Omit<Label, 'id'>) => Promise<void>;
  updateLabel: (id: string, label: Partial<Omit<Label, 'id'>>) => Promise<void>;
  deleteLabel: (id: string) => Promise<void>;
  refreshBoard: () => Promise<void>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};

interface TaskProviderProps {
  children: ReactNode;
}

export const TaskProvider = ({ children }: TaskProviderProps) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [board, setBoard] = useState<Board>({
    id: 'default',
    name: 'Main Board',
    columns: [
      { id: 'backlog', title: 'Backlog', status: 'backlog', taskIds: [], color: '#E5E7EB' },
      { id: 'todo', title: 'To Do', status: 'todo', taskIds: [], color: '#93C5FD' },
      { id: 'in_progress', title: 'In Progress', status: 'in_progress', taskIds: [], color: '#FCD34D' },
      { id: 'review', title: 'Review', status: 'review', taskIds: [], color: '#F9A8D4' },
      { id: 'completed', title: 'Completed', status: 'completed', taskIds: [], color: '#86EFAC' },
    ],
    categories: [],
    labels: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshBoard = async () => {
    try {
      setLoading(true);
      setError(null);
      const loadedTasks = await LocalStorageService.getTasks();
      const loadedBoard = await LocalStorageService.getBoard();
      setTasks(loadedTasks);
      setBoard(loadedBoard || board);
    } catch (err) {
      console.error('Error loading board:', err);
      setError('Error loading board');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshBoard();
  }, []);

  const addTask = async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setError(null);
      // Find the category and use its status if available
      const category = task.categoryId ? board.categories.find(cat => cat.id === task.categoryId) : null;
      const taskStatus = category?.status || task.status || 'todo';
      
      // Ensure labels array is properly initialized
      const taskLabels = task.labels || [];
      
      const taskToAdd = {
        ...task,
        status: taskStatus,
        categoryId: task.categoryId || null,
        labels: taskLabels
      };
      
      const newTask = await LocalStorageService.addTask(taskToAdd);
      const updatedBoard = { ...board };
      const column = updatedBoard.columns.find(col => col.status === taskStatus);
      
      if (column) {
        column.taskIds.push(newTask.id);
        await LocalStorageService.updateBoard(updatedBoard);
      }
      await refreshBoard();
      return newTask;
    } catch (err: any) {
      console.error('Error adding task:', err);
      setError('Error adding task');
      throw err;
    }
  };

  const updateTask = async (id: string, taskUpdate: Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>) => {
    try {
      setError(null);
      const currentTask = tasks.find(t => t.id === id);
      if (!currentTask) throw new Error('Task not found');

      // If category is being updated, update the status accordingly
      if (taskUpdate.categoryId !== undefined) {
        const category = taskUpdate.categoryId ? board.categories.find(cat => cat.id === taskUpdate.categoryId) : null;
        if (category) {
          taskUpdate.status = category.status;
        }
      }

      // Ensure labels are properly handled
      if (taskUpdate.labels !== undefined) {
        taskUpdate.labels = taskUpdate.labels || [];
      }

      const updatedTaskData = {
        ...taskUpdate,
        categoryId: taskUpdate.categoryId === undefined ? currentTask.categoryId : taskUpdate.categoryId,
        labels: taskUpdate.labels === undefined ? currentTask.labels : taskUpdate.labels
      };

      await LocalStorageService.updateTask(id, updatedTaskData);
      
      // Update task position in columns if status changed
      if (taskUpdate.status) {
        const updatedBoard = { ...board };
        // Remove task from all columns
        updatedBoard.columns.forEach(column => {
          column.taskIds = column.taskIds.filter(taskId => taskId !== id);
        });
        // Add task to new column
        const targetColumn = updatedBoard.columns.find(col => col.status === taskUpdate.status);
        if (targetColumn) {
          targetColumn.taskIds.push(id);
          await LocalStorageService.updateBoard(updatedBoard);
        }
      }
      await refreshBoard();
    } catch (err: any) {
      console.error('Error updating task:', err);
      setError('Error updating task');
      throw err;
    }
  };

  const deleteTask = async (id: string) => {
    try {
      setError(null);
      await LocalStorageService.deleteTask(id);
      const updatedBoard = { ...board };
      updatedBoard.columns.forEach(column => {
        column.taskIds = column.taskIds.filter(taskId => taskId !== id);
      });
      await LocalStorageService.updateBoard(updatedBoard);
      await refreshBoard();
    } catch (err: any) {
      console.error('Error deleting task:', err);
      setError('Error deleting task');
      throw err;
    }
  };

  const moveTask = async (taskId: string, sourceColumnId: string, targetColumnId: string, newIndex: number) => {
    try {
      setError(null);
      const updatedBoard = { ...board };
      const sourceColumn = updatedBoard.columns.find(col => col.id === sourceColumnId);
      const targetColumn = updatedBoard.columns.find(col => col.id === targetColumnId);

      if (!sourceColumn || !targetColumn) return;

      sourceColumn.taskIds = sourceColumn.taskIds.filter(id => id !== taskId);
      targetColumn.taskIds.splice(newIndex, 0, taskId);

      await LocalStorageService.updateBoard(updatedBoard);
      if (sourceColumn.status !== targetColumn.status) {
        await LocalStorageService.updateTask(taskId, { status: targetColumn.status });
      }
      await refreshBoard();
    } catch (err: any) {
      console.error('Error moving task:', err);
      setError('Error moving task');
      throw err;
    }
  };

  const addColumn = async (column: Omit<Column, 'id'>) => {
    try {
      setError(null);
      const updatedBoard = { ...board };
      const newColumn: Column = { ...column, id: Date.now().toString(), taskIds: [] };
      updatedBoard.columns.push(newColumn);
      await LocalStorageService.updateBoard(updatedBoard);
      await refreshBoard();
    } catch (err: any) {
      console.error('Error adding column:', err);
      setError('Error adding column');
      throw err;
    }
  };

  const updateColumn = async (id: string, columnUpdate: Partial<Omit<Column, 'id'>>) => {
    try {
      setError(null);
      const updatedBoard = { ...board };
      const columnIndex = updatedBoard.columns.findIndex(col => col.id === id);
      if (columnIndex !== -1) {
        updatedBoard.columns[columnIndex] = { ...updatedBoard.columns[columnIndex], ...columnUpdate };
        await LocalStorageService.updateBoard(updatedBoard);
        await refreshBoard();
      }
    } catch (err: any) {
      console.error('Error updating column:', err);
      setError('Error updating column');
      throw err;
    }
  };

  const deleteColumn = async (id: string) => {
    try {
      setError(null);
      const updatedBoard = { ...board };
      updatedBoard.columns = updatedBoard.columns.filter(col => col.id !== id);
      await LocalStorageService.updateBoard(updatedBoard);
      await refreshBoard();
    } catch (err: any) {
      console.error('Error deleting column:', err);
      setError('Error deleting column');
      throw err;
    }
  };

  const addCategory = async (category: Omit<Category, 'id'>) => {
    try {
      setError(null);
      const updatedBoard = { ...board };
      const newCategory: Category = { ...category, id: Date.now().toString() };
      updatedBoard.categories.push(newCategory);
      await LocalStorageService.updateBoard(updatedBoard);
      await refreshBoard();
    } catch (err: any) {
      console.error('Error adding category:', err);
      setError('Error adding category');
      throw err;
    }
  };

  const updateCategory = async (id: string, categoryUpdate: Partial<Omit<Category, 'id'>>) => {
    try {
      setError(null);
      const updatedBoard = { ...board };
      const categoryIndex = updatedBoard.categories.findIndex(cat => cat.id === id);
      if (categoryIndex !== -1) {
        updatedBoard.categories[categoryIndex] = { ...updatedBoard.categories[categoryIndex], ...categoryUpdate };
        await LocalStorageService.updateBoard(updatedBoard);
        await refreshBoard();
      }
    } catch (err: any) {
      console.error('Error updating category:', err);
      setError('Error updating category');
      throw err;
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      setError(null);
      const updatedBoard = { ...board };
      updatedBoard.categories = updatedBoard.categories.filter(cat => cat.id !== id);
      await LocalStorageService.updateBoard(updatedBoard);
      await refreshBoard();
    } catch (err: any) {
      console.error('Error deleting category:', err);
      setError('Error deleting category');
      throw err;
    }
  };

  const addLabel = async (label: Omit<Label, 'id'>) => {
    try {
      setError(null);
      const updatedBoard = { ...board };
      const newLabel: Label = { ...label, id: Date.now().toString() };
      updatedBoard.labels.push(newLabel);
      await LocalStorageService.updateBoard(updatedBoard);
      await refreshBoard();
    } catch (err: any) {
      console.error('Error adding label:', err);
      setError('Error adding label');
      throw err;
    }
  };

  const updateLabel = async (id: string, labelUpdate: Partial<Omit<Label, 'id'>>) => {
    try {
      setError(null);
      const updatedBoard = { ...board };
      const labelIndex = updatedBoard.labels.findIndex(lbl => lbl.id === id);
      if (labelIndex !== -1) {
        updatedBoard.labels[labelIndex] = { ...updatedBoard.labels[labelIndex], ...labelUpdate };
        await LocalStorageService.updateBoard(updatedBoard);
        await refreshBoard();
      }
    } catch (err: any) {
      console.error('Error updating label:', err);
      setError('Error updating label');
      throw err;
    }
  };

  const deleteLabel = async (id: string) => {
    try {
      setError(null);
      const updatedBoard = { ...board };
      updatedBoard.labels = updatedBoard.labels.filter(lbl => lbl.id !== id);
      await LocalStorageService.updateBoard(updatedBoard);
      await refreshBoard();
    } catch (err: any) {
      console.error('Error deleting label:', err);
      setError('Error deleting label');
      throw err;
    }
  };

  const toggleTaskStatus = async (taskId: string) => {
    try {
      setError(null);
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      const newStatus = task.status === 'completed' ? 'todo' : 'completed';
      await updateTask(taskId, { status: newStatus });
    } catch (err: any) {
      console.error('Error toggling task status:', err);
      setError('Error toggling task status');
      throw err;
    }
  };

  const value = {
    tasks,
    board,
    loading,
    error,
    addTask,
    updateTask,
    deleteTask,
    moveTask,
    addColumn,
    updateColumn,
    toggleTaskStatus,
    deleteColumn,
    addCategory,
    updateCategory,
    deleteCategory,
    addLabel,
    updateLabel,
    deleteLabel,
    refreshBoard,
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
};