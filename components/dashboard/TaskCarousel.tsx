import React, { useRef, useState } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Dimensions } from 'react-native';
import { MotiView } from 'moti';
import { useSettings } from '@/contexts/SettingsContext';
import { Task } from '@/types/task';
import TaskCard from '@/components/TaskCard';
import { router } from 'expo-router';

// Ekran genişliğinin %90'ı kadar genişlikte kartlar
const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.9;

interface TaskCarouselProps {
  tasks: Task[];
  onTaskPress: (task: Task) => void;
  onToggleStatus: (taskId: string, status: 'completed' | 'pending') => void;
  onDelete: (taskId: string) => void;
}

export const TaskCarousel: React.FC<TaskCarouselProps> = ({
  tasks,
  onTaskPress,
  onToggleStatus,
  onDelete
}) => {
  const { theme } = useSettings();
  const [activeIndex, setActiveIndex] = useState(0);
  
  // ViewabilityConfig için referans
  const viewabilityConfig = { viewAreaCoveragePercentThreshold: 50 };
  const viewabilityConfigCallbackPairs = useRef([
    {
      viewabilityConfig,
      onViewableItemsChanged: ({ viewableItems }: any) => {
        if (viewableItems.length > 0) {
          setActiveIndex(viewableItems[0].index);
        }
      }
    }
  ]);
  
  // Sayfa gösterge noktaları
  const renderPaginationDots = () => {
    if (tasks.length <= 1) return null;
    
    return (
      <View style={styles.paginationContainer}>
        {tasks.map((_, index) => (
          <View
            key={index}
            style={[
              styles.paginationDot,
              {
                backgroundColor: index === activeIndex 
                  ? theme.colors.primary 
                  : theme.colors.border,
                width: index === activeIndex ? 16 : 8
              }
            ]}
          />
        ))}
      </View>
    );
  };
  
  return (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 500, delay: 150 }}
    >
      <View style={styles.taskSectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Bugünkü Görevler
        </Text>
        {tasks.length > 0 && (
          <TouchableOpacity 
            onPress={() => router.push('/planning')}
            style={[styles.seeAllButton, { backgroundColor: theme.colors.primary + '10' }]}
          >
            <Text style={[styles.seeAllText, { color: theme.colors.primary }]}>
              Tümünü Gör
            </Text>
          </TouchableOpacity>
        )}
      </View>
      
      {tasks.length === 0 ? (
        <MotiView 
          from={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', dampingRatio: 0.8 }}
          style={[
            styles.taskEmptyContainer, 
            { 
              backgroundColor: theme.dark ? theme.colors.card : 'rgba(0,0,0,0.03)',
              borderColor: theme.colors.border
            }
          ]}
        >
          <Text style={[styles.taskEmptyText, { color: theme.colors.secondaryText }]}>
            Bugün için planlanmış görev bulunmuyor
          </Text>
        </MotiView>
      ) : (
        <>
          <FlatList
            data={tasks}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            pagingEnabled
            snapToAlignment="center"
            decelerationRate="fast"
            contentContainerStyle={styles.taskCarouselContent}
            renderItem={({ item }) => (
              <View style={[styles.taskCarouselItem, { width: CARD_WIDTH }]}>
                <TaskCard
                  task={item}
                  onPress={() => onTaskPress(item)}
                  onToggleStatus={() => onToggleStatus(item.id, item.status)}
                  onDelete={() => onDelete(item.id)}
                  onEdit={() => onTaskPress(item)}
                  viewMode="large"
                />
              </View>
            )}
            viewabilityConfigCallbackPairs={viewabilityConfigCallbackPairs.current}
          />
          
          {/* Görsel gösterge - kaç sayfada olduğumuzu belirten noktalar */}
          {renderPaginationDots()}
        </>
      )}
    </MotiView>
  );
};

const styles = StyleSheet.create({
  taskSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  seeAllButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '500',
  },
  taskEmptyContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  taskEmptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
  taskCarouselContent: {
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  taskCarouselItem: {
    marginRight: 10,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  paginationDot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 3,
  },
}); 