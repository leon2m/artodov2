import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  Platform,
  Modal,
  TouchableOpacity,
  FlatList,
  Dimensions,
  ViewToken,
  RefreshControl,
  NativeSyntheticEvent,
  NativeScrollEvent
} from 'react-native';
import { useSettings } from '@/contexts/SettingsContext';
import { useTasks } from '@/contexts/TaskContext';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import { MotiPressable } from 'moti/interactions';
import PageContainer from '@/components/PageContainer';
import PageHeader from '@/components/PageHeader';
import ChartModal from '@/components/ChartModal';
import * as Haptics from 'expo-haptics';
import AddTaskModal from '@/components/AddTaskModal';
import TaskDetailModal from '@/components/TaskDetailModal';
import { useRouter } from 'expo-router';
import { DashboardChartData, ChartItem } from '@/lib/types/dashboard';
import { Task } from '@/types/task';
import TaskCard from '@/components/TaskCard';

// Custom hooks
import { useDashboardStats } from '@/lib/hooks/useDashboardStats';

// Components
import { StatCard } from '@/components/dashboard/StatCard';
import { TaskSection } from '@/components/dashboard/TaskSection';
import { WeeklyProgressBar } from '@/components/dashboard/WeeklyProgressBar';
import { SuccessRateCard } from '@/components/dashboard/SuccessRateCard';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { TaskCarousel } from '@/components/dashboard/TaskCarousel';
import { DashboardModals } from '@/components/dashboard/DashboardModals';
import { StatsGrid } from '@/components/dashboard/StatsGrid';

// Sabit renkler
const COLORS = {
  blue: '#93C5FD',
  green: '#86EFAC',
  purple: '#C4B5FD',
  pink: '#F9A8D4'
};

// Ekran genişliği
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.85;

// ViewableItems için interface tanımlaması
interface ViewableItemsChanged {
  viewableItems: ViewToken[];
  changed: ViewToken[];
}

export default function DashboardScreen() {
  const { theme, settings } = useSettings();
  const { tasks, addTask, updateTask, deleteTask } = useTasks();
  const router = useRouter();
  
  // State
  const [chartVisible, setChartVisible] = useState(false);
  const [chartType, setChartType] = useState<'categories' | 'priorities'>('categories');
  const [addTaskVisible, setAddTaskVisible] = useState(false);
  const [taskDetailVisible, setTaskDetailVisible] = useState(false);
  const [editTaskVisible, setEditTaskVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  
  // StatCard detay popup state'leri
  const [activeDetailCard, setActiveDetailCard] = useState<string | null>(null);
  
  // Animation
  const scrollY = useRef(new Animated.Value(0)).current;
  
  // Dashboard istatistikleri
  const { taskStats, chartData, todayTasks, thisWeekTasks, weeklyData: rawWeeklyData, successRate } = useDashboardStats(tasks);
  
  // weeklyData'yi DayData tipine uygun formata dönüştürme
  const weeklyData = rawWeeklyData.map(item => {
    const date = new Date(item.date);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    const shortDayName = date.toLocaleDateString('en-US', { weekday: 'short' });
    
    return {
      ...item,
      day: dayName,
      shortName: shortDayName
    };
  });
  
  // Bugünkü görevlerin slider değişkenlerini ekleyelim
  const [currentTodayTaskIndex, setCurrentTodayTaskIndex] = useState(0);
  
  // Görev slider'ı için viewability callbacks  
  const handleViewableItemsChanged = useCallback((info: ViewableItemsChanged) => {
    if (info.viewableItems.length > 0 && typeof info.viewableItems[0].index === 'number') {
      setCurrentTodayTaskIndex(info.viewableItems[0].index);
    }
  }, []);
  
  // Viewability ayarları
  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50
  };
  
  // Viewability değişiklik callback referansı
  const viewabilityConfigCallbackPairs = useRef([
    { viewabilityConfig, onViewableItemsChanged: handleViewableItemsChanged }
  ]);
  
  // StatCard'a basıldığında detay popup'ını gösterme
  const handleStatCardPress = (cardId: string) => {
    if (settings?.hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setActiveDetailCard(cardId);
  };
  
  // Grafik modalını açma işlevi
  const handleChartModalOpen = (type: 'categories' | 'priorities') => {
    if (settings?.hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setChartType(type);
    setChartVisible(true);
  };
  
  // ChartData dönüşümü
  const getChartData = (type: 'categories' | 'priorities') => {
    const items = type === 'categories' ? chartData.categories : chartData.priorities;
    return {
      labels: items.map((item: ChartItem) => item.name),
      values: items.map((item: ChartItem) => item.count),
      colors: items.map((item: ChartItem) => item.color)
    };
  };
  
  // Görev ekleme modalını açma işlevi
  const handleAddTask = () => {
    setAddTaskVisible(true);
  };
  
  // Görev detay modalını açma işlevi
  const handleTaskPress = (task: Task) => {
    setSelectedTask(task);
    setTaskDetailVisible(true);
  };
  
  // StatCard detay metinleri
  const getStatCardDescription = (cardId: string) => {
    switch (cardId) {
      case 'pending':
        return `Tamamlanmayı bekleyen ${taskStats.pending} adet görevin var. Bu görevleri tamamlamanla birlikte ilerleme durumun güncellenir.`;
      case 'completed':
        return `Tebrikler! Şimdiye kadar ${taskStats.completed} görevi başarıyla tamamladın. Görevleri düzenli tamamlaman, hedeflerine ulaşmanda önemli bir adımdır.`;
      case 'total': 
        return `Sistemde toplam ${taskStats.total} görev bulunuyor. Bunlardan ${taskStats.completed} tanesi tamamlanmış, ${taskStats.pending} tanesi bekliyor.`;
      case 'progress':
        return `Şu ana kadar görevlerin %${taskStats.progress}'ini tamamladın. Daha yüksek tamamlama oranı için bekleyen görevleri tamamlayabilirsin.`;
      default:
        return '';
    }
  };
  
  // Pagination dots render function 
  const renderPaginationDots = (tasks: Task[]) => {
    if (tasks.length <= 1) return null;
    
    return (
      <View style={styles.paginationContainer}>
        {tasks.map((_, index) => (
          <View 
            key={index}
            style={[
              styles.paginationDot,
              { 
                backgroundColor: index === currentTodayTaskIndex 
                  ? theme.colors.primary 
                  : theme.colors.border 
              }
            ]}
          />
        ))}
      </View>
    );
  };
  
  // Scroll fonksiyonunu tanımla
  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    // Animated.event kullanımı yerine doğrudan değer atama yapıyoruz
    scrollY.setValue(event.nativeEvent.contentOffset.y);
  }, [scrollY]);
  
  return (
    <PageContainer
      headerComponent={
        <PageHeader
          title="Görev Takibi"
          animate={true}
          scrollY={scrollY}
        />
      }
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* İstatistik kartları */}
        <StatsGrid 
          stats={taskStats} 
          onStatCardPress={handleStatCardPress} 
        />

        {/* Hızlı işlemler */}
        <QuickActions onAddTask={handleAddTask} />
        
        {/* Bugünkü görevler bölümü - carousel */}
        <TaskCarousel
          tasks={todayTasks}
          onTaskPress={handleTaskPress}
          onToggleStatus={(taskId, status) => {
            updateTask(taskId, {
              status: status === 'completed' ? 'pending' : 'completed'
            });
          }}
          onDelete={deleteTask}
        />

        {/* İnteraktif kart bileşenleri */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 500, delay: 200 }}
          style={styles.interactiveCardsContainer}
        >
          {/* Başarı oranı kartı */}
          <SuccessRateCard
            rate={successRate.rate}
            completedCount={successRate.completedCount}
            totalCount={successRate.totalCount}
            weeklyGoal={successRate.weeklyGoal}
            onPress={() => {
              if (settings?.hapticFeedback) {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              // İleri aşamada detaylı başarı analizlerine yönlendirilebilir
            }}
          />
        </MotiView>
        
        {/* Haftalık ilerleme grafiği */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 500, delay: 250 }}
          style={styles.weeklyProgressContainer}
        >
          <WeeklyProgressBar
            weeklyData={weeklyData}
            onDayPress={(day) => {
              if (settings?.hapticFeedback) {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              console.log('Seçilen gün:', day);
              // İleri aşamada seçilen günün görevlerine yönlendirilebilir
            }}
          />
        </MotiView>

        {/* Bu haftaki görevler bölümü */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 500, delay: 300 }}
        >
          <TaskSection
            title="Bu Hafta"
            tasks={thisWeekTasks.slice(0, 5)}
            onTaskPress={handleTaskPress}
            onToggleStatus={(taskId, status) => {
              updateTask(taskId, {
                status: status === 'completed' ? 'pending' : 'completed'
              });
            }}
            onDelete={deleteTask}
            onEdit={handleTaskPress}
            onSeeAll={() => router.push('/tasks')}
            emptyMessage="Bu hafta için planlanmış görev bulunmuyor"
          />
        </MotiView>
      </ScrollView>

      {/* Tüm Modallar */}
      <DashboardModals 
        // Chart Modal
        chartVisible={chartVisible}
        chartType={chartType}
        chartData={chartData}
        onCloseChart={() => setChartVisible(false)}
        
        // Task Detail Modal
        taskDetailVisible={taskDetailVisible}
        selectedTask={selectedTask}
        onCloseTaskDetail={() => setTaskDetailVisible(false)}
        onUpdateTask={(updatedTask) => {
          // Düzenleme modalını aç ve Task Detail Modalı kapat
          setSelectedTask(updatedTask);
          setTaskDetailVisible(false);
          setEditTaskVisible(true); // Düzenleme modalını aç
        }}
        onDeleteTask={(id) => {
          deleteTask(id);
          setTaskDetailVisible(false);
        }}
        
        // Edit Task Modal
        editTaskVisible={editTaskVisible}
        onCloseEditTask={() => setEditTaskVisible(false)}
        onSaveEditTask={(updatedTask) => {
          // Görevi güncelle ve modalı kapat
          if (selectedTask) {
            updateTask(selectedTask.id, updatedTask);
          }
          setEditTaskVisible(false);
        }}
        
        // Add Task Modal
        addTaskVisible={addTaskVisible}
        onCloseAddTask={() => setAddTaskVisible(false)}
        onAddTask={(newTask) => {
          // Tip dönüşümü ile gerekli alanları kontrol et
          const taskToAdd = {
            ...newTask,
            title: newTask.title || 'Yeni Görev'
          };
          // @ts-ignore - NewTask ve Task tipi arasındaki farkları görmezden gel
          addTask(taskToAdd);
          setAddTaskVisible(false);
        }}
        
        // Stats Detail
        activeDetailCard={activeDetailCard}
        onCloseDetail={() => setActiveDetailCard(null)}
        getStatCardDescription={getStatCardDescription}
        taskStats={taskStats}
      />
    </PageContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 12,
    paddingBottom: 32,
  },
  interactiveCardsContainer: {
    marginTop: 10,
  },
  weeklyProgressContainer: {
    marginTop: 10,
    marginBottom: 6,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 3,
  },
});