import React, { useRef, useState, useCallback } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  FlatList, 
  ActivityIndicator, 
  Dimensions,
  ViewToken
} from 'react-native';
import { MotiView } from 'moti';
import { useSettings } from '@/contexts/SettingsContext';
import { Task } from '@/types/task';
import TaskCard from '@/components/TaskCard';
import Button from '@/components/Button';
import { Calendar as CalendarIcon } from 'lucide-react-native';
import { ViewMode } from './PlanningHeader';
import { PlanCategory } from './PlanningHeader';

// Ekran genişliği
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.85;

// ViewableItems için interface tanımlaması
interface ViewableItemsChanged {
  viewableItems: ViewToken[];
  changed: ViewToken[];
}

interface TaskViewProps {
  filteredTasks: Task[];
  isLoading: boolean;
  error: string | null;
  viewMode: ViewMode;
  activeCategory: PlanCategory;
  onTaskPress: (task: Task) => void;
  onToggleStatus: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onAddTask: () => void;
  setError: (error: string | null) => void;
}

const TaskView: React.FC<TaskViewProps> = ({
  filteredTasks,
  isLoading,
  error,
  viewMode,
  activeCategory,
  onTaskPress,
  onToggleStatus,
  onDeleteTask,
  onAddTask,
  setError
}) => {
  const { theme } = useSettings();
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  
  // FlatList'in viewable items değiştiğinde çağrılacak
  const handleViewableItemsChanged = useCallback((info: ViewableItemsChanged) => {
    if (info.viewableItems.length > 0 && typeof info.viewableItems[0].index === 'number') {
      setCurrentTaskIndex(info.viewableItems[0].index);
    }
  }, []);
  
  // Viewability config
  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50
  };
  
  // Viewability değişiklik callback'i
  const viewabilityConfigCallbackPairs = useRef([
    { viewabilityConfig, onViewableItemsChanged: handleViewableItemsChanged }
  ]);
  
  // Pagination göstergesi
  const renderPaginationDots = () => {
    if (filteredTasks.length <= 1) return null;
    
    return (
      <View style={styles.paginationContainer}>
        {filteredTasks.map((_, index) => (
          <View 
            key={index}
            style={[
              styles.paginationDot,
              { 
                backgroundColor: index === currentTaskIndex 
                  ? theme.colors.primary 
                  : theme.colors.border 
              }
            ]}
          />
        ))}
      </View>
    );
  };
  
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }
  
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={[styles.errorText, { color: theme.colors.error }]}>
          Görevler yüklenirken bir hata oluştu.
        </Text>
        <Button 
          title="Tekrar Dene" 
          onPress={() => setError(null)}
          variant="primary"
        />
      </View>
    );
  }
  
  if (filteredTasks.length === 0) {
    return (
      <MotiView
        from={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', damping: 15 }}
        style={styles.emptyContainer}
      >
        <CalendarIcon
          size={60}
          color={theme.colors.secondaryText}
          style={styles.emptyIcon}
        />
        <Text style={[styles.emptyText, { color: theme.colors.secondaryText }]}>
          {(() => {
            switch (activeCategory) {
              case 'daily': return 'Bu gün için görev bulunmuyor';
              case 'weekly': return 'Bu hafta için görev bulunmuyor';
              case 'monthly': return 'Bu ay için görev bulunmuyor';
              default: return 'Görev bulunmuyor';
            }
          })()}
        </Text>
        <Button 
          title="Görev Ekle" 
          onPress={onAddTask}
          variant="primary"
        />
      </MotiView>
    );
  }
  
  // Carousel görünümü
  if (viewMode === 'detailed') {
    return (
      <>
        <FlatList
          data={filteredTasks}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          snapToAlignment="center"
          decelerationRate="fast"
          viewabilityConfigCallbackPairs={viewabilityConfigCallbackPairs.current}
          contentContainerStyle={styles.taskListContent}
          renderItem={({ item }) => (
            <View style={[styles.taskCarouselItem, { width: CARD_WIDTH }]}>
              <TaskCard
                task={item}
                onPress={() => onTaskPress(item)}
                onToggleStatus={() => onToggleStatus(item)}
                onDelete={() => onDeleteTask(item.id)}
                onEdit={() => onTaskPress(item)}
                viewMode="large"
              />
            </View>
          )}
        />
        {renderPaginationDots()}
      </>
    );
  }
  
  // Kompakt liste görünümü
  return (
    <FlatList
      data={filteredTasks}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.taskListContent}
      renderItem={({ item }) => (
        <TaskCard
          task={item}
          onPress={() => onTaskPress(item)}
          onToggleStatus={() => onToggleStatus(item)}
          onDelete={() => onDeleteTask(item.id)}
          onEdit={() => onTaskPress(item)}
          viewMode="normal"
        />
      )}
      ItemSeparatorComponent={() => <View style={styles.taskSeparator} />}
    />
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyIcon: {
    marginBottom: 20,
    opacity: 0.5,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  taskListContent: {
    paddingBottom: 20,
  },
  taskCarouselItem: {
    paddingHorizontal: (SCREEN_WIDTH - CARD_WIDTH) / 2,
    width: SCREEN_WIDTH,
    justifyContent: 'center',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  taskSeparator: {
    height: 8,
  },
});

export default TaskView; 