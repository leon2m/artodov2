import React, { useState, useEffect, useRef } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  useWindowDimensions,
  Animated,
  PanResponder,
  Pressable
} from 'react-native';
import { useSettings } from '@/contexts/SettingsContext';
import { Task } from '@/types/task';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format, parseISO, isValid } from 'date-fns';
import { tr } from 'date-fns/locale';
import Button from './Button';
import * as Haptics from 'expo-haptics';
import { MotiView, AnimatePresence } from 'moti';

interface TaskDetailModalProps {
  visible: boolean;
  task: Task;
  onClose: () => void;
  onUpdate: (task: Task) => void;
  onDelete: () => void;
}

export default function TaskDetailModal({
  visible,
  task,
  onClose,
  onUpdate,
  onDelete
}: TaskDetailModalProps) {
  const { theme, settings } = useSettings();
  const { height, width } = useWindowDimensions();
  const [editedTask, setEditedTask] = useState<Task>({ ...task });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Animasyon değerleri
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(height)).current;
  const expandAnim = useRef(new Animated.Value(0)).current; // Genişleme animasyonu
  
  // Modal yükseklik durumları
  const NORMAL_HEIGHT = height * 0.75;
  const EXPANDED_HEIGHT = height * 0.9;
  
  // Kapatma için kullanılacak eşik değeri
  const DISMISS_THRESHOLD = height * 0.2;
  const VELOCITY_THRESHOLD = 0.7;
  const EXPAND_THRESHOLD = -50; // Yukarı sürükleme eşiği
  
  // PanResponder - sürükleme hareketi yakalama
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 5; // Hem yukarı hem aşağı sürükleme
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) { // Aşağı sürükleme (kapama)
          if (!isExpanded) {
            slideAnim.setValue(gestureState.dy);
            // Arkaplanı fade etme
            const opacity = 1 - (gestureState.dy / (height / 2));
            fadeAnim.setValue(Math.max(0.5, opacity));
          } else {
            // Genişletilmiş durumdan normal duruma geçiş
            const expandProgress = Math.max(0, Math.min(1, gestureState.dy / (EXPANDED_HEIGHT - NORMAL_HEIGHT)));
            expandAnim.setValue(1 - expandProgress);
          }
        } else if (gestureState.dy < 0 && !isExpanded) { // Yukarı sürükleme (genişletme)
          // Negatif değeri pozitife çeviriyoruz ve 0-1 aralığına normalize ediyoruz
          const expandProgress = Math.min(1, Math.abs(gestureState.dy) / (EXPANDED_HEIGHT - NORMAL_HEIGHT));
          expandAnim.setValue(expandProgress);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > DISMISS_THRESHOLD || gestureState.vy > VELOCITY_THRESHOLD) {
          // Kapatma eşiğini geçtiyse veya hızlıca aşağı sürüklediyse
          if (isExpanded) {
            // Genişletilmiş durumdan normal duruma geçiş
            shrinkModal();
          } else {
            // Normal durumdan kapatma
            if (settings.hapticFeedback) {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
            closeModal();
          }
        } else if (gestureState.dy < EXPAND_THRESHOLD || gestureState.vy < -VELOCITY_THRESHOLD) {
          // Yukarı sürükleme ile genişletme
          expandModal();
        } else {
          // Eşiği geçmediyse eski konumuna geri getir
          if (isExpanded) {
            // Genişletilmiş durumda kalması için
            Animated.spring(expandAnim, {
              toValue: 1,
              tension: 65,
              friction: 11,
              useNativeDriver: true,
            }).start();
          } else {
            // Normal duruma geri dönüş
            Animated.parallel([
              Animated.spring(slideAnim, {
                toValue: 0,
                tension: 65,
                friction: 11,
                useNativeDriver: true,
              }),
              Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 150,
                useNativeDriver: true,
              }),
              Animated.spring(expandAnim, {
                toValue: 0,
                tension: 65,
                friction: 11,
                useNativeDriver: true,
              })
            ]).start();
          }
        }
      }
    })
  ).current;
  
  // Modal'ı genişletme fonksiyonu
  const expandModal = () => {
    if (settings.hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    setIsExpanded(true);
    Animated.spring(expandAnim, {
      toValue: 1,
      tension: 65,
      friction: 11,
      useNativeDriver: true,
    }).start();
  };
  
  // Modal'ı daraltma fonksiyonu
  const shrinkModal = () => {
    if (settings.hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    setIsExpanded(false);
    Animated.spring(expandAnim, {
      toValue: 0,
      tension: 65,
      friction: 11,
      useNativeDriver: true,
    }).start();
  };
  
  // Modal'ı kapatma fonksiyonu
  const closeModal = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
      setConfirmDelete(false);
      setIsExpanded(false);
      expandAnim.setValue(0);
    });
  };
  
  useEffect(() => {
    setEditedTask({ ...task });
    setConfirmDelete(false);
  }, [task, visible]);
  
  // Modal açıldığında animasyon başlat
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 65,
          friction: 11,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, height]);
  
  const handleSave = () => {
    if (settings.hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onUpdate(editedTask);
    closeModal();
  };
  
  const handleDelete = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      if (settings.hapticFeedback) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }
      return;
    }
    
    if (settings.hapticFeedback) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    onDelete();
    closeModal();
  };
  
  // Güvenli tarih biçimlendirme fonksiyonu
  const safeFormatDate = (dateString: string, formatString: string, options?: any): string => {
    try {
      if (!dateString) return 'Belirtilmemiş';
      
      const date = parseISO(dateString);
      if (!isValid(date)) return 'Geçersiz Tarih';
      
      return format(date, formatString, options);
    } catch (error) {
      console.warn('Tarih biçimlendirme hatası:', error);
      return 'Geçersiz Tarih';
    }
  };
  
  // Güvenli tarih ayrıştırma fonksiyonu
  const safeParseDateString = (dateString: string): Date => {
    try {
      if (!dateString) return new Date();
      
      const date = parseISO(dateString);
      if (!isValid(date)) return new Date();
      
      return date;
    } catch (error) {
      console.warn('Tarih ayrıştırma hatası:', error);
      return new Date();
    }
  };
  
  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate && isValid(selectedDate)) {
      setEditedTask({
        ...editedTask,
        date: selectedDate.toISOString()
      });
      
      if (settings.hapticFeedback) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }
  };
  
  const toggleStatus = () => {
    setEditedTask({
      ...editedTask,
      status: editedTask.status === 'completed' ? 'pending' : 'completed'
    });
    
    if (settings.hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };
  
  const setPriority = (priority: 'low' | 'medium' | 'high') => {
    setEditedTask({
      ...editedTask,
      priority
    });
    
    if (settings.hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };
  
  // Genişletilmiş yükseklik hesaplaması
  const modalHeight = Animated.add(
    NORMAL_HEIGHT,
    Animated.multiply(
      expandAnim,
      EXPANDED_HEIGHT - NORMAL_HEIGHT
    )
  );
  
  // Görünür değilse hiçbir şey render etme
  if (!visible) return null;
  
  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={closeModal}
    >
      <Pressable 
        style={styles.backdrop} 
        onPress={closeModal}
      >
        <Animated.View 
          style={[
            styles.overlay,
            { 
              opacity: fadeAnim,
              backgroundColor: 'rgba(0, 0, 0, 0.5)'
            }
          ]}
        >
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardView}
            pointerEvents="box-none"
          >
            <Animated.View 
              style={[
                styles.modalView,
                {
                  transform: [{ translateY: slideAnim }],
                  backgroundColor: theme.colors.background,
                  borderColor: theme.colors.border,
                  height: modalHeight,
                  maxHeight: EXPANDED_HEIGHT
                }
              ]}
            >
              {/* Sürükleme işaretçisi */}
              <Pressable
                style={styles.dragIndicatorContainer}
                {...panResponder.panHandlers}
              >
                <View style={[styles.dragIndicator, { backgroundColor: theme.colors.border }]} />
                <Animated.Text 
                  style={[
                    styles.expandHint, 
                    { 
                      color: theme.colors.secondaryText,
                      opacity: Animated.subtract(1, expandAnim)
                    }
                  ]}
                >
                  Genişletmek için yukarı kaydır
                </Animated.Text>
              </Pressable>
              
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                  Görev Detayları
                </Text>
              </View>

              {/* Modal içeriği */}
              <ScrollView
                style={styles.modalContent}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
              >
                <View style={styles.formGroup}>
                  <Text style={[styles.label, { color: theme.colors.text }]}>Başlık</Text>
                  <TextInput
                    style={[
                      styles.input,
                      { 
                        color: theme.colors.text,
                        backgroundColor: theme.colors.card,
                        borderColor: theme.colors.border
                      }
                    ]}
                    value={editedTask.title}
                    onChangeText={(text) => setEditedTask({ ...editedTask, title: text })}
                    placeholder="Görev başlığı"
                    placeholderTextColor={theme.colors.secondaryText}
                  />
                </View>
                
                <View style={styles.formGroup}>
                  <Text style={[styles.label, { color: theme.colors.text }]}>Açıklama</Text>
                  <TextInput
                    style={[
                      styles.input,
                      styles.textArea,
                      { 
                        color: theme.colors.text,
                        backgroundColor: theme.colors.card,
                        borderColor: theme.colors.border
                      }
                    ]}
                    value={editedTask.description || ''}
                    onChangeText={(text) => setEditedTask({ ...editedTask, description: text })}
                    placeholder="Görev açıklaması"
                    placeholderTextColor={theme.colors.secondaryText}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                </View>
                
                <View style={styles.formGroup}>
                  <Text style={[styles.label, { color: theme.colors.text }]}>Tarih</Text>
                  <TouchableOpacity
                    style={[
                      styles.dateButton,
                      { 
                        backgroundColor: theme.colors.card,
                        borderColor: theme.colors.border
                      }
                    ]}
                    onPress={() => setShowDatePicker(true)}
                  >
                    <Text style={[styles.dateText, { color: theme.colors.text }]}>
                      {safeFormatDate(editedTask.date, 'dd MMMM yyyy', { locale: tr })}
                    </Text>
                    <Ionicons name="calendar" size={20} color={theme.colors.primary} />
                  </TouchableOpacity>
                  
                  {showDatePicker && (
                    <DateTimePicker
                      value={safeParseDateString(editedTask.date)}
                      mode="date"
                      display={Platform.OS === 'ios' ? 'inline' : 'default'}
                      onChange={handleDateChange}
                    />
                  )}
                </View>
                
                <View style={styles.formGroup}>
                  <Text style={[styles.label, { color: theme.colors.text }]}>Durum</Text>
                  <TouchableOpacity
                    style={[
                      styles.statusButton,
                      { 
                        backgroundColor: editedTask.status === 'completed' 
                          ? theme.colors.success + '20' 
                          : theme.colors.warning + '20',
                        borderColor: editedTask.status === 'completed'
                          ? theme.colors.success
                          : theme.colors.warning
                      }
                    ]}
                    onPress={toggleStatus}
                  >
                    <Ionicons 
                      name={editedTask.status === 'completed' ? 'checkmark-circle' : 'time'}
                      size={20}
                      color={editedTask.status === 'completed' ? theme.colors.success : theme.colors.warning}
                    />
                    <Text 
                      style={[
                        styles.statusText, 
                        { 
                          color: editedTask.status === 'completed' 
                            ? theme.colors.success 
                            : theme.colors.warning 
                        }
                      ]}
                    >
                      {editedTask.status === 'completed' ? 'Tamamlandı' : 'Bekliyor'}
                    </Text>
                  </TouchableOpacity>
                </View>
                
                <View style={styles.formGroup}>
                  <Text style={[styles.label, { color: theme.colors.text }]}>Öncelik</Text>
                  <View style={styles.priorityButtons}>
                    <TouchableOpacity
                      style={[
                        styles.priorityButton,
                        { 
                          backgroundColor: editedTask.priority === 'low' 
                            ? '#10B98120'
                            : theme.colors.card,
                          borderColor: editedTask.priority === 'low'
                            ? '#10B981'
                            : theme.colors.border,
                        }
                      ]}
                      onPress={() => setPriority('low')}
                    >
                      <View style={[styles.priorityDot, { backgroundColor: '#10B981' }]} />
                      <Text style={[
                        styles.priorityText, 
                        { color: editedTask.priority === 'low' ? '#10B981' : theme.colors.text }
                      ]}>
                        Düşük
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[
                        styles.priorityButton,
                        { 
                          backgroundColor: editedTask.priority === 'medium' 
                            ? '#F59E0B20'
                            : theme.colors.card,
                          borderColor: editedTask.priority === 'medium'
                            ? '#F59E0B'
                            : theme.colors.border,
                        }
                      ]}
                      onPress={() => setPriority('medium')}
                    >
                      <View style={[styles.priorityDot, { backgroundColor: '#F59E0B' }]} />
                      <Text style={[
                        styles.priorityText,
                        { color: editedTask.priority === 'medium' ? '#F59E0B' : theme.colors.text }
                      ]}>
                        Orta
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[
                        styles.priorityButton,
                        { 
                          backgroundColor: editedTask.priority === 'high' 
                            ? '#EF444420'
                            : theme.colors.card,
                          borderColor: editedTask.priority === 'high'
                            ? '#EF4444'
                            : theme.colors.border,
                        }
                      ]}
                      onPress={() => setPriority('high')}
                    >
                      <View style={[styles.priorityDot, { backgroundColor: '#EF4444' }]} />
                      <Text style={[
                        styles.priorityText,
                        { color: editedTask.priority === 'high' ? '#EF4444' : theme.colors.text }
                      ]}>
                        Yüksek
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>
              
              {/* Aksiyon Butonları - Daha belirgin */}
              <MotiView
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: 'timing', duration: 300, delay: 200 }}
                style={[
                  styles.actionButtons, 
                  { 
                    backgroundColor: theme.colors.card,
                    borderTopColor: theme.colors.border,
                  }
                ]}
              >
                <Button
                  title={confirmDelete ? "Vazgeç" : "Vazgeç"}
                  onPress={closeModal}
                  variant="outline"
                  style={{ flex: 1, marginRight: 8 }}
                />
                <Button
                  title={confirmDelete ? "Görevi Sil" : "Kaydet"}
                  onPress={confirmDelete ? handleDelete : handleSave}
                  variant={confirmDelete ? "danger" : "primary"}
                  style={{ flex: 1, marginLeft: 8 }}
                />
              </MotiView>
              
              {/* Silme butonu */}
              <MotiView
                style={[
                  styles.deleteButtonContainer,
                  { bottom: confirmDelete ? 80 : 16 }
                ]}
              >
                <TouchableOpacity
                  style={[
                    styles.deleteButton,
                    { backgroundColor: theme.colors.error + '15' }
                  ]}
                  onPress={handleDelete}
                >
                  <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
                  <Text style={[styles.deleteText, { color: theme.colors.error }]}>
                    {confirmDelete ? "Emin misiniz?" : "Görevi Sil"}
                  </Text>
                </TouchableOpacity>
              </MotiView>
            </Animated.View>
          </KeyboardAvoidingView>
        </Animated.View>
      </Pressable>
      
      {/* Tarih seçici */}
      {showDatePicker && Platform.OS === 'ios' && (
        <View style={styles.datePickerContainer}>
          <View style={[styles.datePickerHeader, { backgroundColor: theme.colors.card }]}>
            <TouchableOpacity onPress={() => setShowDatePicker(false)}>
              <Text style={{ color: theme.colors.primary }}>İptal</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => {
                setShowDatePicker(false);
              }}
            >
              <Text style={{ color: theme.colors.primary }}>Tamam</Text>
            </TouchableOpacity>
          </View>
          <DateTimePicker
            value={safeParseDateString(editedTask.date)}
            mode="date"
            display="spinner"
            onChange={handleDateChange}
            style={{ backgroundColor: theme.colors.background }}
            textColor={theme.colors.text}
          />
        </View>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  },
  modalView: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    width: '100%',
    borderTopWidth: 1,
    overflow: 'hidden',
  },
  dragIndicatorContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  dragIndicator: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    padding: 16,
    maxHeight: '60%',
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  dateButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
  },
  dateText: {
    fontSize: 16,
  },
  statusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  priorityButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priorityButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 4,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  priorityText: {
    fontSize: 14,
    fontWeight: '500',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
  },
  expandHint: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 5,
    fontStyle: 'italic',
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  deleteButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
  },
  deleteText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  datePickerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  scrollContent: {
    padding: 16,
  },
}); 