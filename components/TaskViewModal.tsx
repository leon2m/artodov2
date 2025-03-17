import React, { useState, useCallback, useMemo } from 'react';
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
import { Task, TaskPriority, TaskStatus } from '@/types/task';
import { useTaskModalAnimations } from './modals/task/TaskModalAnimations';
import { format, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

interface TaskViewModalProps {
  visible: boolean;
  task: Task;
  onClose: () => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

export default function TaskViewModal({ 
  visible, 
  task,
  onClose,
  onEdit,
  onDelete
}: TaskViewModalProps) {
  const { theme, settings } = useSettings();
  const { board } = useTasks();
  const [editMode, setEditMode] = useState(false);
  
  // Modal animasyonları
  const {
    fadeAnim,
    scaleAnim,
    closeModal,
    MODAL_WIDTH,
    MODAL_HEIGHT
  } = useTaskModalAnimations(visible, handleClose, settings);
  
  // Modal kapatma - gerekli temizlikleri yap
  function handleClose() {
    setEditMode(false);
    onClose();
  }
  
  // Düzenleme moduna geç
  const handleEdit = () => {
    if (settings.hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    setEditMode(true);
    onEdit(task);
  };
  
  // Görevi sil
  const handleDelete = () => {
    if (settings.hapticFeedback) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
    }
    onDelete(task.id);
    onClose();
  };
  
  // Tarih formatı
  const formatDate = (date: string | Date) => {
    try {
      if (typeof date === 'string') {
        const parsedDate = parseISO(date);
        return format(parsedDate, 'dd MMMM yyyy', { locale: tr });
      } else {
        return format(date, 'dd MMMM yyyy', { locale: tr });
      }
    } catch (e) {
      return 'Geçersiz tarih';
    }
  };
  
  // Kategorinin adını al
  const getCategoryName = () => {
    if (!task.categoryId) return 'Kategori yok';
    const category = board.categories.find(c => c.id === task.categoryId);
    return category ? category.name : 'Bilinmeyen kategori';
  };
  
  // Kategorinin rengini al
  const getCategoryColor = () => {
    if (!task.categoryId) return theme.colors.secondaryText;
    const category = board.categories.find(c => c.id === task.categoryId);
    return category ? category.color : theme.colors.secondaryText;
  };
  
  // Etiketleri al
  const getLabels = () => {
    // labels alanı Task tipinde doğrudan tanımlanmamış olabilir
    // bu nedenle any tipini kullanarak erişiyoruz
    const labels = (task as any).labels;
    
    if (!labels || labels.length === 0) return [];
    return board.labels.filter(label => labels.includes(label.id));
  };
  
  // Öncelik rengini al
  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case 'high':
        return theme.colors.error;
      case 'medium':
        return theme.colors.warning;
      case 'low':
        return theme.colors.success;
      default:
        return theme.colors.secondaryText;
    }
  };
  
  // Durum adını al
  const getStatusName = (status: TaskStatus) => {
    switch (status) {
      case 'pending':
        return 'Beklemede';
      case 'completed':
        return 'Tamamlandı';
      case 'todo':
        return 'Yapılacak';
      case 'in_progress':
        return 'Devam Ediyor';
      case 'review':
        return 'İncelemede';
      case 'done':
        return 'Bitti';
      default:
        return 'Bilinmeyen Durum';
    }
  };
  
  // Öncelik adını al
  const getPriorityName = (priority: TaskPriority) => {
    switch (priority) {
      case 'high':
        return 'Yüksek';
      case 'medium':
        return 'Orta';
      case 'low':
        return 'Düşük';
      default:
        return 'Bilinmeyen';
    }
  };
  
  // Etiketleri görüntüle
  const renderLabels = () => {
    const labels = getLabels();
    if (labels.length === 0) return null;
    
    return (
      <View style={styles.labelsContainer}>
        {labels.map(label => (
          <View 
            key={label.id} 
            style={[styles.labelChip, { backgroundColor: label.color }]}
          >
            <Text style={styles.labelText}>{label.name}</Text>
          </View>
        ))}
      </View>
    );
  };
  
  // Backdrop'a tıklama handler'ı
  const handleBackdropPress = () => {
    Keyboard.dismiss();
    closeModal();
  };
  
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
            <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
              <Text style={[styles.title, { color: theme.colors.text }]}>
                Görev Detayları
              </Text>
              
              {/* Kapat butonu */}
              <TouchableOpacity
                style={styles.closeButton}
                onPress={closeModal}
              >
                <Ionicons
                  name="close"
                  size={24}
                  color={theme.colors.text}
                />
              </TouchableOpacity>
            </View>
            
            {/* Modal içeriği */}
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollViewContent}
              showsVerticalScrollIndicator={true}
              bounces={true}
              keyboardShouldPersistTaps="handled"
            >
              {/* Görev başlığı */}
              <View style={[styles.taskHeader, { backgroundColor: theme.colors.taskCardBackground }]}>
                <View style={styles.statusIndicator}>
                  <View style={[
                    styles.statusDot, 
                    { 
                      backgroundColor: task.status === 'completed' 
                        ? theme.colors.success 
                        : task.status === 'in_progress'
                          ? theme.colors.warning
                          : theme.colors.primary 
                    }
                  ]} />
                  <Text style={[styles.statusText, { color: theme.colors.secondaryText }]}>
                    {getStatusName(task.status)}
                  </Text>
                </View>
                
                <Text style={[styles.taskTitle, { color: theme.colors.text }]}>
                  {task.title}
                </Text>
              </View>
              
              {/* Görev açıklaması */}
              {task.description && (
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: theme.colors.secondaryText }]}>
                    Açıklama
                  </Text>
                  <Text style={[styles.descriptionText, { color: theme.colors.text }]}>
                    {task.description}
                  </Text>
                </View>
              )}
              
              {/* Görev meta bilgileri */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.colors.secondaryText }]}>
                  Detaylar
                </Text>
                
                <View style={styles.metaGrid}>
                  {/* Tarih */}
                  <View style={styles.metaItem}>
                    <Ionicons name="calendar-outline" size={20} color={theme.colors.primary} />
                    <View style={styles.metaContent}>
                      <Text style={[styles.metaLabel, { color: theme.colors.secondaryText }]}>
                        Tarih
                      </Text>
                      <Text style={[styles.metaValue, { color: theme.colors.text }]}>
                        {formatDate(task.date)}
                      </Text>
                    </View>
                  </View>
                  
                  {/* Öncelik */}
                  <View style={styles.metaItem}>
                    <Ionicons name="flag-outline" size={20} color={getPriorityColor(task.priority)} />
                    <View style={styles.metaContent}>
                      <Text style={[styles.metaLabel, { color: theme.colors.secondaryText }]}>
                        Öncelik
                      </Text>
                      <Text style={[styles.metaValue, { color: getPriorityColor(task.priority) }]}>
                        {getPriorityName(task.priority)}
                      </Text>
                    </View>
                  </View>
                  
                  {/* Kategori */}
                  {task.categoryId && (
                    <View style={styles.metaItem}>
                      <Ionicons name="folder-outline" size={20} color={getCategoryColor()} />
                      <View style={styles.metaContent}>
                        <Text style={[styles.metaLabel, { color: theme.colors.secondaryText }]}>
                          Kategori
                        </Text>
                        <Text style={[styles.metaValue, { color: theme.colors.text }]}>
                          {getCategoryName()}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              </View>
              
              {/* Etiketler */}
              {renderLabels()}
              
              {/* Oluşturulma zamanı */}
              <View style={styles.timeInfo}>
                <Text style={[styles.timeText, { color: theme.colors.secondaryText }]}>
                  Oluşturulma: {formatDate(task.createdAt)}
                </Text>
                {task.updatedAt !== task.createdAt && (
                  <Text style={[styles.timeText, { color: theme.colors.secondaryText }]}>
                    Son Güncelleme: {formatDate(task.updatedAt)}
                  </Text>
                )}
              </View>
            </ScrollView>
            
            {/* Footer - işlem butonları */}
            <View style={[styles.footer, { borderTopColor: theme.colors.border }]}>
              <TouchableOpacity 
                style={[styles.deleteButton, { borderColor: theme.colors.error }]} 
                onPress={handleDelete}
              >
                <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
                <Text style={[styles.deleteButtonText, { color: theme.colors.error }]}>
                  Sil
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.editButton, { backgroundColor: theme.colors.primary }]} 
                onPress={handleEdit}
              >
                <Ionicons name="create-outline" size={20} color="#FFF" />
                <Text style={styles.editButtonText}>
                  Düzenle
                </Text>
              </TouchableOpacity>
            </View>
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
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  scrollView: {
    width: '100%',
  },
  scrollViewContent: {
    padding: 20,
    paddingBottom: 40,
  },
  taskHeader: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  taskTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 24,
  },
  metaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: '45%',
    marginBottom: 12,
  },
  metaContent: {
    marginLeft: 12,
  },
  metaLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  labelsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  labelChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  labelText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFF',
  },
  timeInfo: {
    marginTop: 10,
  },
  timeText: {
    fontSize: 12,
    marginBottom: 4,
  },
  footer: {
    height: 72,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    borderTopWidth: 1,
    paddingVertical: 12,
    gap: 12
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    marginRight: 8,
  },
  deleteButtonText: {
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  editButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFF',
    marginLeft: 8,
  },
}); 