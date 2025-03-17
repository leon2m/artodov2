import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { 
  Modal, 
  View, 
  KeyboardAvoidingView,
  Animated,
  Platform,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Keyboard,
  Text
} from 'react-native';
import { useSettings } from '@/contexts/SettingsContext';
import { useTasks } from '@/contexts/TaskContext';
import { AddTaskModalProps, NewTask } from './types';
import { useTaskModalAnimations } from './TaskModalAnimations';
import ModalHeader from './ModalHeader';
import ModalFooter from './ModalFooter';
import TaskForm from './TaskForm';
import CategoryPicker from './CategoryPicker';
import LabelPicker from './LabelPicker';

export default function TaskModal({ 
  visible, 
  onClose, 
  onAdd,
  initialTask
}: AddTaskModalProps) {
  const { theme, settings } = useSettings();
  const { board } = useTasks();
  
  // Form state
  const [newTask, setNewTask] = useState<NewTask>(() => {
    // Eğer initialTask varsa, onu kullan, yoksa default değerler ata
    if (initialTask) {
      return {
        title: initialTask.title || '',
        description: initialTask.description || '',
        date: initialTask.date || initialTask.dueDate?.toISOString() || new Date().toISOString(),
        status: initialTask.status || 'backlog',
        priority: initialTask.priority || 'medium',
        categoryId: initialTask.categoryId,
        labels: initialTask.labels || []
      };
    }
    
    return {
      title: '',
      description: '',
      date: new Date().toISOString(),
      status: 'backlog',
      priority: 'medium',
      categoryId: undefined,
      labels: []
    };
  });
  
  // initialTask değiştiğinde veya modal görünür olduğunda form verilerini güncelle
  useEffect(() => {
    if (visible && initialTask) {
      setNewTask({
        title: initialTask.title || '',
        description: initialTask.description || '',
        date: initialTask.date || initialTask.dueDate?.toISOString() || new Date().toISOString(),
        status: initialTask.status || 'backlog',
        priority: initialTask.priority || 'medium',
        categoryId: initialTask.categoryId,
        labels: initialTask.labels || []
      });
    }
  }, [visible, initialTask]);
  
  // UI states
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showLabelPicker, setShowLabelPicker] = useState(false);
  
  // Modal animasyonları
  const {
    fadeAnim,
    scaleAnim,
    closeModal,
    MODAL_WIDTH,
    MODAL_HEIGHT
  } = useTaskModalAnimations(visible, handleClose, settings);
  
  // Form resetleme - useCallback ile optimize ettik
  const resetForm = useCallback(() => {
    setNewTask({
      title: '',
      description: '',
      date: new Date().toISOString(),
      status: 'backlog',
      priority: 'medium',
      categoryId: undefined,
      labels: []
    });
    setShowCategoryPicker(false);
    setShowLabelPicker(false);
  }, []);
  
  // Modal kapatma - kendi closeModal fonksiyonumuzu kullanıyoruz
  function handleClose() {
    // Eğer yeni görev oluşturuyorsak formu resetle
    // Düzenleme yapıyorsak resetleme yapma (initialTask varsa düzenleme yapıyoruz demektir)
    if (!initialTask) {
      resetForm();
    }
    onClose();
  }
  
  // Görev ekle/güncelle işlevi - useCallback ile optimize ettik
  const handleAdd = useCallback(() => {
    if (!newTask.title?.trim() && !newTask.description?.trim()) {
      if (settings.hapticFeedback) {
        // Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      return;
    }
    
    // Eğer başlık boşsa ve açıklama varsa, açıklamayı başlık olarak ata
    let updatedTask = {...newTask};
    if (!updatedTask.title?.trim() && updatedTask.description?.trim()) {
      updatedTask.title = updatedTask.description;
    }
    
    onAdd(updatedTask);
    
    // Eğer yeni görev oluşturuyorsak formu resetle
    // Düzenleme yapıyorsak resetleme yapma
    if (!initialTask) {
      resetForm();
    }
    closeModal();
  }, [newTask, settings.hapticFeedback, onAdd, resetForm, closeModal, initialTask]);
  
  // Etiket seçme/kaldırma - useCallback ile optimize ettik
  const toggleLabel = useCallback((labelId: string) => {
    setNewTask(prevTask => {
      const isSelected = prevTask.labels?.includes(labelId);
      
      if (isSelected) {
        return {
          ...prevTask,
          labels: prevTask.labels?.filter(id => id !== labelId)
        };
      } else {
        return {
          ...prevTask,
          labels: [...(prevTask.labels || []), labelId]
        };
      }
    });
  }, []);
  
  // Kategori seçme - useCallback ile optimize ettik
  const selectCategory = useCallback((categoryId: string) => {
    setNewTask(prevTask => ({
      ...prevTask,
      categoryId
    }));
    setShowCategoryPicker(false);
  }, []);
  
  // Backdrop'a tıklama handler'ı
  const handleBackdropPress = useCallback(() => {
    // Backdrop'a tıklandığında klavyeyi kapat
    Keyboard.dismiss();
    // Kullanıcı modalın dışına tıkladığında modalı kapat
    closeModal();
  }, [closeModal]);
  
  // Görünür değilse hiçbir şey render etme
  if (!visible) return null;
  
  return (
    <Modal
      animationType="none"
      transparent={true}
      visible={visible}
      onRequestClose={closeModal}
      statusBarTranslucent={true}
    >
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={handleBackdropPress}
        />
        
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.centeredView}
        >
          <Animated.View
            style={[
              styles.modalView,
              { 
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border,
                width: MODAL_WIDTH,
                transform: [{ scale: scaleAnim }]
              }
            ]}
          >
            {/* Modal başlık çubuğu */}
            <ModalHeader
              onClose={closeModal}
              theme={theme as any}
              title={initialTask ? "Görevi Düzenle" : "Yeni Görev"}
            />
            
            {/* Modal içeriği */}
            <View style={styles.scrollContainer}>
              <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollViewContent}
                showsVerticalScrollIndicator={true}
                bounces={true}
                scrollEventThrottle={32}
                keyboardShouldPersistTaps="handled"
              >
                <TaskForm
                  task={newTask}
                  onTaskChange={setNewTask}
                  onSelectCategory={() => setShowCategoryPicker(true)}
                  onSelectLabels={() => setShowLabelPicker(true)}
                  theme={theme as any}
                  settings={settings}
                />
              </ScrollView>
            </View>
            
            {/* Footer butonları */}
            <ModalFooter
              onSave={handleAdd}
              onCancel={closeModal}
              isValid={!!(newTask.title?.trim() || newTask.description?.trim())}
              theme={theme as any}
              isEditMode={!!initialTask}
            />
            
            {/* Picker modals */}
            {showCategoryPicker && (
              <CategoryPicker
                visible={showCategoryPicker}
                onClose={() => setShowCategoryPicker(false)}
                categories={board.categories || []}
                selectedCategoryId={newTask.categoryId}
                onSelectCategory={selectCategory}
                theme={theme as any}
                settings={settings}
                board={board}
              />
            )}
            
            {showLabelPicker && (
              <LabelPicker
                visible={showLabelPicker}
                onClose={() => setShowLabelPicker(false)}
                labels={board.labels || []}
                selectedLabels={newTask.labels}
                onToggleLabel={toggleLabel}
                theme={theme as any}
                settings={settings}
                board={board}
              />
            )}
          </Animated.View>
        </KeyboardAvoidingView>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalView: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    maxHeight: '90%'
  },
  scrollContainer: {
    width: '100%',
    maxHeight: 450,
  },
  scrollView: {
    width: '100%',
  },
  scrollViewContent: {
    padding: 20,
    paddingBottom: 30,
  },
}); 