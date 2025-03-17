import React, { useState, useCallback, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { useSettings } from '@/contexts/SettingsContext';
import { useTasks } from '@/contexts/TaskContext';
import { Task } from '@/types/task';
import {
  parseISO,
  isValid,
  startOfDay,
  startOfWeek,
  startOfMonth,
  endOfWeek,
  endOfMonth,
  endOfDay,
  addMonths,
  isWithinInterval,
  format,
  isSameDay
} from 'date-fns';
import PageContainer from '@/components/PageContainer';
import PageHeader from '@/components/PageHeader';

// Modüler bileşenleri içe aktar
import PlanningHeader, { PlanCategory, ViewMode } from '@/components/planning/PlanningHeader';
import PlanningFilters from '@/components/planning/PlanningFilters';
import DateNavigator from '@/components/planning/DateNavigator';
import MonthlyCalendar from '@/components/planning/MonthlyCalendar';
import WeeklyView from '@/components/planning/WeeklyView';
import TaskView from '@/components/planning/TaskView';
import PlanningModals from '@/components/planning/PlanningModals';

export default function PlanningScreen() {
  const { theme } = useSettings();
  const { tasks, updateTask, deleteTask, addTask } = useTasks();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [taskDetailVisible, setTaskDetailVisible] = useState(false);
  const [addTaskVisible, setAddTaskVisible] = useState(false);
  
  // Plan kategori yönetimi
  const [activeCategory, setActiveCategory] = useState<PlanCategory>('daily');
  
  // Görünüm modu (kompakt veya detaylı)
  const [viewMode, setViewMode] = useState<ViewMode>('detailed');
  
  // Tarih yönetimi
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  
  // Filtrelenmiş görevler
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  
  // Kategori filtresi
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  
  // Tarih aralığını hesapla
  const calculateDateRange = useCallback(() => {
    switch (activeCategory) {
      case 'daily':
        return {
          start: startOfDay(selectedDate),
          end: endOfDay(selectedDate) // Günün sonuna kadar (23:59:59) görevleri dahil et
        };
      case 'weekly':
        return {
          start: startOfWeek(selectedDate, { weekStartsOn: 1 }), // Pazartesi
          end: endOfWeek(selectedDate, { weekStartsOn: 1 }) // Pazar
        };
      case 'monthly':
        return {
          start: startOfMonth(selectedDate),
          end: endOfMonth(selectedDate)
        };
    }
  }, [activeCategory, selectedDate]);
  
  // Görevleri tarih aralığına göre filtrele
  useEffect(() => {
    if (!tasks || tasks.length === 0) {
      setFilteredTasks([]);
      return;
    }
    
    try {
      const { start, end } = calculateDateRange();
      
      // Görevleri tarih ve filtrelere göre filtrele
      const filtered = tasks.filter(task => {
        // Tarih kontrolü - önce dueDate, yoksa date kullan
        try {
          // Önce dueDate kullan, o yoksa date string'ini çevir
          let taskDate: Date | null = null;
          
          if (task.dueDate) {
            // dueDate zaten Date objesi olabilir
            taskDate = task.dueDate instanceof Date ? task.dueDate : new Date(task.dueDate);
          } else if (task.date) {
            // date her zaman string, çevirmeyi dene
            try {
              taskDate = parseISO(task.date);
            } catch (err) {
              // Geçersiz tarih, string olarak tarihi Date'e çevirmeyi dene
              taskDate = new Date(task.date);
            }
          }
          
          // Tarih yoksa veya geçersizse görevi gösterme
          if (!taskDate || !isValid(taskDate)) {
            return false;
          }
          
          // Karşılaştırma için tarihleri normalize et
          const taskDateStart = startOfDay(taskDate);
          
          // Tarih aralığında mı kontrol et - endOfDay kullandığımız için isWithinInterval yeterli
          const isInRange = isWithinInterval(taskDateStart, { start, end });
          
          // Kategori ve etiket filtresi uygula
          let matchesCategory = true;
          let matchesTag = true;
          
          if (selectedCategory) {
            matchesCategory = task.categoryId === selectedCategory;
          }
          
          if (selectedTag) {
            if (task.tags) {
              matchesTag = task.tags.includes(selectedTag);
            } else if ((task as any).labels) {
              // Bazı task'larda tags yerine labels kullanılmış olabilir
              matchesTag = (task as any).labels.includes(selectedTag);
            } else {
              matchesTag = false;
            }
          }
          
          return isInRange && matchesCategory && matchesTag;
        } catch (error) {
          console.error('Tarih filtreleme hatası:', error, task);
          return false;
        }
      });
      
      // Görevleri tarihe göre sırala
      const sorted = [...filtered].sort((a, b) => {
        const getDate = (task: Task) => {
          if (task.dueDate) return task.dueDate instanceof Date ? task.dueDate : new Date(task.dueDate);
          if (task.date) return parseISO(task.date);
          return new Date();
        };
        
        const dateA = getDate(a);
        const dateB = getDate(b);
        
        return dateA.getTime() - dateB.getTime();
      });
      
      setFilteredTasks(sorted);
      
    } catch (error) {
      console.error('Filtreleme hatası:', error);
      setError('Görevler filtrelenirken bir hata oluştu');
    }
  }, [tasks, activeCategory, selectedDate, selectedCategory, selectedTag, calculateDateRange]);
  
  // Görev işlevleri
  const handleToggleStatus = (task: Task) => {
    updateTask(task.id, {
      status: task.status === 'completed' ? 'pending' : 'completed'
    });
  };
  
  const handleDeleteTask = (id: string) => {
    deleteTask(id);
  };
  
  const handleTaskPress = (task: Task) => {
    setSelectedTask(task);
    setTaskDetailVisible(true);
  };
  
  const handleAddTask = () => {
    setAddTaskVisible(true);
  };
  
  // Ay değiştirme işlevleri
  const goToPreviousMonth = () => {
    const newDate = addMonths(currentMonth, -1);
    setCurrentMonth(newDate);
    setSelectedDate(newDate);
  };
  
  const goToNextMonth = () => {
    const newDate = addMonths(currentMonth, 1);
    setCurrentMonth(newDate);
    setSelectedDate(newDate);
  };
  
  // Bugüne dön
  const goToToday = () => {
    const today = new Date();
    setSelectedDate(today);
    setCurrentMonth(today);
  };
  
  // Görev sayısını hesapla
  const getTaskCountForDate = (date: Date) => {
    return tasks.filter(task => {
      const taskDate = task.dueDate || (task.date ? parseISO(task.date) : null);
      if (!taskDate) return false;
      if (!isValid(taskDate)) return false;
      
      try {
        return isValid(date) && isValid(taskDate) && 
          date.getFullYear() === taskDate.getFullYear() && 
          date.getMonth() === taskDate.getMonth() && 
          date.getDate() === taskDate.getDate();
      } catch (error) {
        console.error('Tarih karşılaştırma hatası:', error);
        return false;
      }
    }).length;
  };
  
  // Header sağ bileşeni için fonksiyon
  const renderHeaderRightButtons = () => {
    return (
      <PlanningHeader
        activeCategory={activeCategory}
        viewMode={viewMode}
        setActiveCategory={setActiveCategory}
        setViewMode={setViewMode}
        onAddTask={handleAddTask}
      />
    );
  };
  
  // Mevcut tarih aralığı
  const dateRange = calculateDateRange();

  return (
    <PageContainer
      headerComponent={
        <PageHeader 
          title="Planlama" 
          animate={true}
          rightComponent={renderHeaderRightButtons()}
        />
      }
    >
      <PlanningHeader
        activeCategory={activeCategory}
        viewMode={viewMode}
        setActiveCategory={setActiveCategory}
        setViewMode={setViewMode}
        onAddTask={handleAddTask}
      />
      
      <PlanningFilters
        selectedCategory={selectedCategory}
        selectedTag={selectedTag}
        setSelectedCategory={setSelectedCategory}
        setSelectedTag={setSelectedTag}
        goToToday={goToToday}
      />
      
      <DateNavigator
        activeCategory={activeCategory}
        selectedDate={selectedDate}
        currentMonth={currentMonth}
        dateRange={dateRange}
        goToPreviousMonth={goToPreviousMonth}
        goToNextMonth={goToNextMonth}
      />
      
      <MonthlyCalendar
        selectedDate={selectedDate}
        currentMonth={currentMonth}
        getTaskCountForDate={getTaskCountForDate}
        setSelectedDate={setSelectedDate}
        visible={activeCategory === 'monthly'}
      />
      
      <WeeklyView
        selectedDate={selectedDate}
        dateRange={dateRange}
        getTaskCountForDate={getTaskCountForDate}
        setSelectedDate={setSelectedDate}
        visible={activeCategory === 'weekly'}
      />
      
      <TaskView
        filteredTasks={filteredTasks}
        isLoading={isLoading}
        error={error}
        viewMode={viewMode}
        activeCategory={activeCategory}
        onTaskPress={handleTaskPress}
        onToggleStatus={handleToggleStatus}
        onDeleteTask={handleDeleteTask}
        onAddTask={handleAddTask}
        setError={setError}
      />
      
      <PlanningModals
        taskDetailVisible={taskDetailVisible}
        selectedTask={selectedTask}
        onCloseTaskDetail={() => setTaskDetailVisible(false)}
        onUpdateTask={(updatedTask) => {
          updateTask(updatedTask.id, updatedTask);
          setTaskDetailVisible(false);
        }}
        onDeleteTask={(id) => {
          deleteTask(id);
          setTaskDetailVisible(false);
        }}
        addTaskVisible={addTaskVisible}
        onCloseAddTask={() => setAddTaskVisible(false)}
        onAddTask={(newTask) => {
          // @ts-ignore - TaskStatus tipi için uyarlama
          addTask(newTask);
          setAddTaskVisible(false);
        }}
        selectedDate={selectedDate}
      />
    </PageContainer>
  );
}

const styles = StyleSheet.create({}); 