import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, Dimensions, Platform, Animated } from 'react-native';
import { useSettings } from '@/contexts/SettingsContext';
import { useTasks } from '@/contexts/TaskContext';
import TaskCard from '@/components/TaskCard';
import { FlatList } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { Task } from '@/types/task';
import TaskViewModal from '@/components/TaskViewModal';

interface StatCardDetailProps {
  visible: boolean;
  title: string;
  value: number | string;
  subtitle?: string;
  color: string;
  icon: React.ReactNode;
  description: string;
  onClose: () => void;
  cardId?: string; // istatistik kartının tipi (pending, completed, total, progress)
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Modal boyutları - Ekrana göre daha doğru hesaplama
const MODAL_WIDTH = Math.min(SCREEN_WIDTH * 0.92, 420);
const MODAL_HEIGHT = Math.min(SCREEN_HEIGHT * 9, 1700);

export function StatCardDetail({
  visible,
  title,
  value,
  subtitle,
  color,
  icon,
  description,
  onClose,
  cardId
}: StatCardDetailProps) {
  const { theme, settings } = useSettings();
  const { tasks, updateTask, deleteTask } = useTasks();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [taskDetailVisible, setTaskDetailVisible] = useState(false);
  
  // Animasyon değerleri
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  
  // Görevleri filtrele
  const filteredTasks = React.useMemo(() => {
    if (!tasks || !cardId) return [];
    
    switch(cardId) {
      case 'pending':
        return tasks.filter(task => task.status !== 'completed')
          .sort((a, b) => {
            // Önce tarihe göre sırala
            const dateA = a.dueDate || new Date();
            const dateB = b.dueDate || new Date();
            return dateA.getTime() - dateB.getTime();
          });
      case 'completed':
        return tasks.filter(task => task.status === 'completed')
          .sort((a, b) => {
            // Tamamlanma tarihine göre, yeniden eskiye
            const dateA = a.dueDate || new Date();
            const dateB = b.dueDate || new Date();
            return dateB.getTime() - dateA.getTime();
          });
      case 'total':
        return [...tasks].sort((a, b) => {
          // Önce duruma göre, sonra tarihe göre sırala
          if (a.status === 'completed' && b.status !== 'completed') return 1;
          if (a.status !== 'completed' && b.status === 'completed') return -1;
          
          const dateA = a.dueDate || new Date();
          const dateB = b.dueDate || new Date();
          return dateA.getTime() - dateB.getTime();
        });
      case 'progress':
        // İlerleme durumu kartı için tamamlanmış olanları göster
        return tasks.filter(task => task.status === 'completed')
          .sort((a, b) => {
            const dateA = a.dueDate || new Date();
            const dateB = b.dueDate || new Date();
            return dateB.getTime() - dateA.getTime();
          });
      default:
        return [];
    }
  }, [tasks, cardId]);
  
  // Animasyon için modal gösterimini kontrol etmek
  useEffect(() => {
    if (visible) {
      setModalVisible(true);
      
      // Animasyonları başlat
      scaleAnim.setValue(0.8);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 50,
          useNativeDriver: true
        })
      ]).start();
    }
  }, [visible]);
  
  // Modal kapatma fonksiyonu
  const handleClose = () => {
    if (settings.hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 200,
        useNativeDriver: true
      })
    ]).start(() => {
      onClose();
      // Arka planda modal kapanmasını bekleyerek görünürlüğü kapat
      setTimeout(() => setModalVisible(false), 100);
    });
  };
  
  // Görev durumunu değiştir
  const handleToggleTaskStatus = (taskId: string, status: string) => {
    if (settings.hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    updateTask(taskId, {
      status: status === 'completed' ? 'pending' : 'completed'
    });
  };
  
  // Görev detayını görüntüle
  const handleTaskPress = (task: Task) => {
    if (settings.hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedTask(task);
    setTaskDetailVisible(true);
  };
  
  // Görevi sil
  const handleDeleteTask = (taskId: string) => {
    if (settings.hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    deleteTask(taskId);
    setTaskDetailVisible(false);
  };
  
  // Görevi düzenle
  const handleEditTask = (task: Task) => {
    if (settings.hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    // Not: Burada düzenleme modalını açabilir ya da başka bir işlem yapabilirsiniz
    setTaskDetailVisible(false);
  };
  
  // Görev listesi başlığını belirle
  const getTaskListTitle = () => {
    switch(cardId) {
      case 'pending':
        return "Bekleyen Görevler";
      case 'completed':
        return "Tamamlanan Görevler";
      case 'total':
        return "Tüm Görevler";
      case 'progress':
        return "Tamamlanan Görevler";
      default:
        return "Görevler";
    }
  };
  
  // Boş liste mesajını belirle
  const getEmptyMessage = () => {
    switch(cardId) {
      case 'pending':
        return "Bekleyen görev bulunmuyor";
      case 'completed':
        return "Tamamlanmış görev bulunmuyor";
      case 'total':
        return "Henüz görev eklenmemiş";
      case 'progress':
        return "Tamamlanmış görev bulunmuyor";
      default:
        return "Görev bulunmuyor";
    }
  };
  
  if (!visible && !modalVisible) return null;
  
  return (
    <>
      <Modal
        transparent
        visible={modalVisible}
        animationType="none"
        onRequestClose={handleClose}
        statusBarTranslucent
      >
        <Animated.View 
          style={[
            styles.detailOverlay,
            { opacity: fadeAnim }
          ]}
        >
          <TouchableOpacity
            style={styles.backdrop}
            activeOpacity={1}
            onPress={handleClose}
          />
          
          <Animated.View
            style={[
              styles.detailCard,
              { 
                backgroundColor: theme.colors.card, 
                borderColor: theme.dark ? theme.colors.border + '40' : theme.colors.border,
                borderWidth: 1,
                transform: [{ scale: scaleAnim }],
                width: MODAL_WIDTH,
                maxHeight: MODAL_HEIGHT
              }
            ]}
          >
            <View style={styles.contentContainer}>
              <View style={styles.detailHeader}>
                <View style={[styles.detailIconContainer, { backgroundColor: `${color}20` }]}>
                  {icon}
                </View>
                <View style={styles.detailTitleContainer}>
                  <Text style={[styles.detailTitle, { color: theme.colors.text }]}>
                    {title}
                  </Text>
                  {subtitle && (
                    <Text style={[styles.detailSubtitle, { color: theme.colors.secondaryText }]}>
                      {subtitle}
                    </Text>
                  )}
                </View>
              </View>
              
              <View style={styles.detailContent}>
                <Text style={[styles.detailValue, { color: title.includes('İlerleme') ? theme.colors.primary : theme.colors.text }]}>
                  {typeof value === 'number' && value > 0 ? value : (typeof value === 'number' ? '0' : value)}
                  {title === "İlerleme Durumu" && "%"}
                </Text>
                <Text style={[styles.detailDescription, { color: theme.colors.secondaryText }]}>
                  {description}
                </Text>
              </View>
              
              {/* Görev listesi */}
              <View style={styles.taskListContainer}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                  {getTaskListTitle()}
                </Text>
                
                <View style={[
                  styles.taskListWrapper,
                  { 
                    backgroundColor: theme.dark 
                      ? 'rgba(0,0,0,0.1)' 
                      : 'rgba(245,245,250,0.5)'
                  }
                ]}>
                  {filteredTasks.length > 0 ? (
                    <FlatList
                      data={filteredTasks.slice(0, 10)} // En fazla 10 görev göster
                      keyExtractor={(item) => item.id}
                      renderItem={({ item }) => (
                        <View style={styles.taskCardWrapper}>
                          <TaskCard
                            task={item}
                            onPress={() => handleTaskPress(item)}
                            onToggleStatus={() => handleToggleTaskStatus(item.id, item.status)}
                            onEdit={() => handleTaskPress(item)}
                            onDelete={() => handleDeleteTask(item.id)}
                            viewMode="list"
                          />
                        </View>
                      )}
                      contentContainerStyle={styles.taskList}
                      showsVerticalScrollIndicator={true}
                      initialNumToRender={10}
                    />
                  ) : (
                    <View style={styles.emptyContainer}>
                      <Text style={[styles.emptyText, { color: theme.colors.secondaryText }]}>
                        {getEmptyMessage()}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
              
              <TouchableOpacity
                style={[
                  styles.detailCloseButton, 
                  { 
                    backgroundColor: theme.colors.primary,
                    shadowColor: theme.colors.primary,
                    shadowOpacity: Platform.OS === 'ios' ? 0.3 : 0.5,
                  }
                ]}
                onPress={handleClose}
                activeOpacity={0.8}
              >
                <Text style={[styles.detailCloseText, { color: '#FFFFFF' }]}>
                  Kapat
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </Animated.View>
      </Modal>
      
      {/* Görev Detay Modalı */}
      {selectedTask && (
        <TaskViewModal
          visible={taskDetailVisible}
          task={selectedTask}
          onClose={() => setTaskDetailVisible(false)}
          onEdit={handleEditTask}
          onDelete={handleDeleteTask}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  detailOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  detailCard: {
    borderRadius: 22,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
      },
      android: {
        elevation: 16,
      },
    }),
  },
  contentContainer: {
    padding: 30,
    width: '100%',
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
    width: '50%',
  },
  detailIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  detailTitleContainer: {
    flex: 1,
  },
  detailTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: -0.5,
  },
  detailSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  detailContent: {
    marginBottom: 16,
  },
  detailValue: {
    fontSize: 38,
    fontWeight: 'bold',
    marginBottom: 10,
    letterSpacing: -1,
  },
  detailDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  taskListContainer: {
    flex: 1,
    minHeight: 120,
    maxHeight: 350,
    marginBottom: 50,
  },
  taskListWrapper: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
  },
  taskList: {
    paddingVertical: 6,
    paddingHorizontal: 6,
  },
  taskCardWrapper: {
    marginVertical: 4,
    marginHorizontal: 4,
    borderRadius: 14,
    overflow: 'hidden',
  },
  emptyContainer: {
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
  detailCloseButton: {
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  detailCloseText: {
    fontWeight: '22',
    fontSize: 15,
  },
}); 