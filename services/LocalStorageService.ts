import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task, Board } from '@/types/task';

const TASKS_STORAGE_KEY = '@ar_todo_tasks';
const BOARD_STORAGE_KEY = '@ar_todo_board';

export class LocalStorageService {
  static async getTasks(): Promise<Task[]> {
    try {
      const tasksJson = await AsyncStorage.getItem(TASKS_STORAGE_KEY);
      if (!tasksJson) return [];
      
      const tasks = JSON.parse(tasksJson);
      return tasks.map((task: any) => ({
        ...task,
        createdAt: new Date(task.createdAt),
        updatedAt: new Date(task.updatedAt),
        dueDate: task.dueDate ? new Date(task.dueDate) : undefined
      }));
    } catch (error) {
      console.error('Error loading tasks:', error);
      return [];
    }
  }

  static async getBoard(): Promise<Board | null> {
    try {
      const boardJson = await AsyncStorage.getItem(BOARD_STORAGE_KEY);
      return boardJson ? JSON.parse(boardJson) : null;
    } catch (error) {
      console.error('Error loading board:', error);
      return null;
    }
  }

  static async saveTasks(tasks: Task[]): Promise<void> {
    try {
      await AsyncStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
    } catch (error) {
      console.error('Error saving tasks:', error);
      throw new Error('Failed to save tasks');
    }
  }

  static async updateBoard(board: Board): Promise<void> {
    try {
      await AsyncStorage.setItem(BOARD_STORAGE_KEY, JSON.stringify(board));
    } catch (error) {
      console.error('Error saving board:', error);
      throw new Error('Failed to save board');
    }
  }

  static async addTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    const tasks = await this.getTasks();
    const newTask: Task = {
      ...task,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    tasks.push(newTask);
    await this.saveTasks(tasks);
    return newTask;
  }

  static async updateTask(id: string, taskUpdate: Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> {
    const tasks = await this.getTasks();
    const taskIndex = tasks.findIndex(t => t.id === id);
    
    if (taskIndex === -1) throw new Error('Task not found');
    
    tasks[taskIndex] = {
      ...tasks[taskIndex],
      ...taskUpdate,
      updatedAt: new Date()
    };
    
    await this.saveTasks(tasks);
  }

  static async deleteTask(id: string): Promise<void> {
    const tasks = await this.getTasks();
    const filteredTasks = tasks.filter(t => t.id !== id);
    await this.saveTasks(filteredTasks);
  }
}