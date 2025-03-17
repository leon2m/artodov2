import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { StyleSheet, View, Text, ScrollView, ActivityIndicator, Platform, Animated, Dimensions, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { PinchGestureHandler, State } from 'react-native-gesture-handler';
import { Task, TaskStatus } from '@/types/task';
import AddTaskButton from '@/components/AddTaskButton';
import TaskModal from '@/components/TaskModal';
import { usePathname } from 'expo-router';
import { useTasks } from '@/contexts/TaskContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSettings } from '@/contexts/SettingsContext';
import { MotiView } from 'moti';
import PageContainer from '@/components/PageContainer';
import PageHeader from '@/components/PageHeader';
import * as Haptics from 'expo-haptics';

// Hooks
import { useTaskView } from '@/lib/hooks/useTaskView';
import { useTaskOperations } from '@/lib/hooks/useTaskOperations';
import { useTaskColumns } from '@/lib/hooks/useTaskColumns';

// Components
import { TaskColumn } from '@/components/tasks/TaskColumn';
import { ViewModeButton } from '@/components/tasks/ViewModeButton';

export default function TasksScreen() {
  const pathname = usePathname();
  const { tasks, board, loading: tasksLoading, error } = useTasks();
  const insets = useSafeAreaInsets();
  const { theme, settings } = useSettings();
  const [uniqueKey] = useState(Date.now());
  const scrollY = useRef(new Animated.Value(0)).current;
  
  // Custom hooks
  const { 
    viewMode, 
    toggleViewMode,
    onPinchGestureEvent,
    onPinchHandlerStateChange
  } = useTaskView();
  
  const {
    selectedTask,
    isModalVisible,
    handleAddTask,
    handleUpdateTask,
    handleTaskStatusUpdate,
    handleDeleteTask,
    handleTaskPress,
    openAddTaskModal,
    openEditTaskModal,
    closeTaskModal
  } = useTaskOperations();
  
  const {
    expandedColumns,
    getColumnTasks,
    getTaskCount,
    getColumnColor,
    resetExpandedColumns,
    toggleColumnExpand
  } = useTaskColumns();

  // Sayfaya her girişte kolonları resetlemek yerine, sadece ilk yüklemede resetle
  useEffect(() => {
    // Sayfa yeniden ziyaret edildiğinde tüm kolonları kapat - sadece tek seferlik
    resetExpandedColumns();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Dependency array boş, sadece ilk yüklemede çalışır

  // PinchGestureHandler için configure edilmiş eventler
  const pinchGestureHandlerProps = useMemo(() => ({
    onGestureEvent: onPinchGestureEvent,
    onHandlerStateChange: onPinchHandlerStateChange
  }), [onPinchGestureEvent, onPinchHandlerStateChange]);

  // Scroll olayını fonksiyon olarak tanımlayalım - hata çözümü için
  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    // Animated.event yerine doğrudan değer ataması yapıyoruz
    scrollY.setValue(event.nativeEvent.contentOffset.y);
  }, [scrollY]);

  // ScrollView özellikleri memo ile optimize edildi
  const scrollViewProps = useMemo(() => ({
    style: styles.container,
    contentContainerStyle: { paddingBottom: insets.bottom + 80 },
    showsVerticalScrollIndicator: true, // Kullanıcıya yardımcı olmak için göster
    onScroll: handleScroll, // Object değil, fonksiyon atadık
    scrollEventThrottle: 32, // 16'dan 32'ye çıkarıldı
    removeClippedSubviews: true, // Ekran dışı görünümleri optimize et
    windowSize: 5, // İçerik oluşturma performansını artır (varsayılan 21)
  }), [insets.bottom, handleScroll]);

  // Column render mantığını memo ile optimize ettik
  const renderColumns = useCallback(() => {
    return board.columns.map((column, index) => {
      const columnTasks = getColumnTasks(column.id);
      const isExpanded = expandedColumns.includes(column.id);
      const columnColor = getColumnColor(column);
      const taskCount = getTaskCount(column);
      
      return (
        <TaskColumn
          key={column.id}
          column={column}
          tasks={columnTasks}
          isExpanded={isExpanded}
          columnColor={columnColor}
          taskCount={taskCount}
          index={index}
          onToggleExpand={toggleColumnExpand}
          onTaskPress={handleTaskPress}
          onTaskDelete={handleDeleteTask}
          onTaskEdit={openEditTaskModal}
          onTaskStatusToggle={handleTaskStatusUpdate}
          onAddTask={openAddTaskModal}
        />
      );
    });
  }, [board.columns, getColumnTasks, expandedColumns, getColumnColor, getTaskCount, 
      toggleColumnExpand, handleTaskPress, handleDeleteTask, openEditTaskModal, 
      handleTaskStatusUpdate, openAddTaskModal]);

  // Yükleme gösterimi
  if (tasksLoading) {
    return (
      <PageContainer>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.emptyText, { color: theme.colors.text }]}>
            Görevler yükleniyor...
          </Text>
        </View>
      </PageContainer>
    );
  }

  // Hata gösterimi
  if (error) {
    return (
      <PageContainer>
        <View style={styles.centered}>
          <Text style={[styles.emptyText, { color: theme.colors.error }]}>
            {error}
          </Text>
        </View>
      </PageContainer>
    );
  }

  // ViewModeButton bileşeni - memo ile sarmalayarak gereksiz render'ları önlüyoruz
  const viewModeBtnComponent = useMemo(() => (
    <ViewModeButton 
      viewMode={viewMode} 
      onPress={toggleViewMode} 
    />
  ), [viewMode, toggleViewMode]);

  return (
    <PageContainer
      headerComponent={
        <PageHeader 
          title="Görevlerim" 
          scrollY={scrollY}
          animate={true}
          rightComponent={viewModeBtnComponent}
        />
      }
      scrollable={false}
      showEmojiBg={false} // Emoji arka planını kapat - performans için
    >
      <PinchGestureHandler {...pinchGestureHandlerProps}>
        <ScrollView {...scrollViewProps}>
          {renderColumns()}
        </ScrollView>
      </PinchGestureHandler>

      <MotiView
        from={{ opacity: 0, scale: 0.8, translateY: 20 }}
        animate={{ opacity: 1, scale: 1, translateY: 0 }}
        transition={{ 
          type: 'timing', // Spring yerine timing kullanıyoruz - daha hafif
          duration: 200, // Daha kısa süre
          delay: 100, // Daha az gecikme
        }}
        style={styles.addButtonContainer}
      >
        <AddTaskButton
          onPress={() => {
            if (settings.hapticFeedback) {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
            }
            openAddTaskModal();
          }}
        />
      </MotiView>

      <TaskModal
        visible={isModalVisible}
        onClose={closeTaskModal}
        onSubmit={selectedTask ? handleUpdateTask : handleAddTask}
        initialValues={selectedTask || undefined}
      />
    </PageContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 45 : 15,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    marginTop: 8,
  },
  addButtonContainer: {
    position: 'absolute',
    bottom: 16,
    right: 16,
  },
}); 