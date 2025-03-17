import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Platform,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import * as Haptics from 'expo-haptics';
import { TaskFormProps, NewTask } from './types';
import { useTasks } from '@/contexts/TaskContext';
import { TaskStatus } from '@/types/task';

/**
 * Görev ekleme/düzenleme formu
 * Başlık, açıklama, tarih, öncelik, kategori ve etiket seçimi içerir
 */
export default function TaskForm({
  task,
  onTaskChange,
  onSelectCategory,
  onSelectLabels,
  theme,
  settings
}: TaskFormProps) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const { board } = useTasks(); // Board bilgilerini alıyoruz

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    
    if (selectedDate) {
      onTaskChange({
        ...task,
        date: selectedDate.toISOString()
      });
      
      if (settings.hapticFeedback) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }
  };

  const updateTaskDescription = (text: string) => {
    onTaskChange({
      ...task,
      description: text
    });
  };

  const updateTaskTitle = (text: string) => {
    onTaskChange({
      ...task,
      title: text
    });
  };

  const updateTaskPriority = (priority: 'low' | 'medium' | 'high') => {
    onTaskChange({
      ...task,
      priority
    });
    
    if (settings.hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const updateTaskStatus = (status: TaskStatus) => {
    // Eğer seçili bir kategori varsa ve bu kategori bir sütuna bağlıysa
    // ve seçilen durum bu sütunla uyumlu değilse, kategori seçimini temizle
    let updatedTask = { ...task, status };
    
    if (task.categoryId && board?.columns) {
      const selectedCategory = board.categories.find(c => c.id === task.categoryId);
      if (selectedCategory?.columnId) {
        const categoryColumn = board.columns?.find(c => c.id === selectedCategory.columnId);
        if (categoryColumn && categoryColumn.status !== status) {
          // Kategori sütunu ile yeni durum uyumsuz, kategori seçimini temizle
          updatedTask.categoryId = undefined;
        }
      }
    }
    
    onTaskChange(updatedTask);
    
    if (settings.hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const formatDate = (date: string | Date) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, 'dd MMMM yyyy', { locale: tr });
  };

  const getCategoryName = () => {
    if (!task.categoryId) return 'Kategori seçilmedi';
    const category = board?.categories?.find(c => c.id === task.categoryId);
    
    if (!category) return 'Kategori seçilmedi';
    
    // Eğer kategori bir sütuna bağlıysa, sütun adını da ekle
    if (category.columnId && board?.columns) {
      const column = board.columns?.find(c => c.id === category.columnId);
      if (column) {
        return `${category.name} (${column.title})`;
      }
    }
    
    return category.name;
  };

  const getStatusName = (status: TaskStatus) => {
    const column = board?.columns?.find(c => c.status === status);
    return column ? column.title : status;
  };

  const getCategoryColor = () => {
    if (!task.categoryId) return '#cccccc';
    const category = board?.categories?.find(c => c.id === task.categoryId);
    return category ? category.color : '#cccccc';
  };

  const getSelectedLabelsCount = () => {
    return task.labels?.length || 0;
  };

  return (
    <View style={styles.container}>
      {/* Görev başlığı */}
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.titleInput, { color: theme.colors.text, backgroundColor: theme.dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' }]}
          placeholder="Görev başlığı"
          placeholderTextColor={theme.colors.text + '80'}
          value={task.title}
          onChangeText={updateTaskTitle}
          maxLength={100}
          autoFocus={false}
          returnKeyType="next"
          selectionColor={theme.colors.primary}
          blurOnSubmit={false}
          onSubmitEditing={() => {
            if (settings.hapticFeedback) {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
          }}
        />
      </View>
      
      {/* Görev açıklaması */}
      <View style={styles.inputContainer}>
        <TextInput
          style={[
            styles.descriptionInput,
            {
              color: theme.colors.text,
              backgroundColor: theme.dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
              minHeight: 80
            }
          ]}
          placeholder="Görev açıklaması"
          placeholderTextColor={theme.colors.text + '80'}
          value={task.description}
          onChangeText={updateTaskDescription}
          multiline
          textAlignVertical="top"
          selectionColor={theme.colors.primary}
          maxLength={500}
          onFocus={() => {
            if (settings.hapticFeedback) {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
          }}
        />
        <Text style={[styles.characterCount, { color: theme.colors.text + '60' }]}>
          {task.description?.length || 0}/500
        </Text>
      </View>
      
      {/* Tarih seçici */}
      <View style={styles.inputContainer}>
        <TouchableOpacity
          style={[
            styles.dateButton,
            {
              backgroundColor: theme.dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
              borderColor: theme.colors.border
            }
          ]}
          onPress={() => {
            setShowDatePicker(true);
            if (settings.hapticFeedback) {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
          }}
        >
          <Ionicons
            name="calendar-outline"
            size={20}
            color={theme.colors.text}
            style={styles.dateIcon}
          />
          <Text style={[styles.dateText, { color: theme.colors.text }]}>
            {format(new Date(task.date), 'd MMMM yyyy', { locale: tr })}
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* DatePicker modal */}
      {showDatePicker && (
        <>
          {Platform.OS === 'ios' ? (
            <View style={[styles.datePickerContainer, {
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border
            }]}>
              <View style={styles.datePickerHeader}>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <Text style={{ color: theme.colors.primary }}>İptal</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => {
                    setShowDatePicker(false);
                    if (settings.hapticFeedback) {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }
                  }}
                >
                  <Text style={{ color: theme.colors.primary }}>Tamam</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                testID="dateTimePicker"
                value={new Date(task.date)}
                mode="date"
                display="spinner"
                onChange={handleDateChange}
                maximumDate={new Date(2030, 12, 31)}
                minimumDate={new Date(2020, 0, 1)}
                textColor={theme.colors.text}
                themeVariant={theme.dark ? 'dark' : 'light'}
                accentColor={theme.colors.primary}
              />
            </View>
          ) : (
            <DateTimePicker
              testID="dateTimePicker"
              value={new Date(task.date)}
              mode="date"
              display="default"
              onChange={handleDateChange}
              maximumDate={new Date(2030, 12, 31)}
              minimumDate={new Date(2020, 0, 1)}
              textColor={theme.colors.text}
              accentColor={theme.colors.primary}
            />
          )}
        </>
      )}

      {/* Durum seçimi */}
      <View style={styles.sectionContainer}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Durum
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statusContainer}>
          {board?.columns ? (
            board.columns.map(column => (
              <TouchableOpacity
                key={column.id}
                style={[
                  styles.statusButton,
                  { backgroundColor: theme.dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' },
                  task.status === column.status && styles.statusButtonActive,
                  task.status === column.status && { backgroundColor: column.color || '#6B7280' }
                ]}
                onPress={() => updateTaskStatus(column.status)}
              >
                <Text style={[
                  styles.statusButtonText,
                  { color: theme.colors.text },
                  task.status === column.status && styles.statusButtonTextActive
                ]}>
                  {column.title}
                </Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={{ color: theme.colors.text, opacity: 0.6 }}>Durum seçenekleri yüklenemedi</Text>
          )}
        </ScrollView>
      </View>
      
      {/* Öncelik seçenekleri */}
      <View style={styles.inputContainer}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Öncelik</Text>
        <View style={styles.priorityContainer}>
          <TouchableOpacity
            style={[
              styles.priorityButton,
              task.priority === 'low' && styles.priorityButtonActive,
              {
                backgroundColor: task.priority === 'low'
                  ? theme.colors.primary + '20'
                  : theme.dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'
              }
            ]}
            onPress={() => updateTaskPriority('low')}
          >
            <Ionicons
              name="arrow-down"
              size={18}
              color={task.priority === 'low' ? theme.colors.primary : theme.colors.text}
              style={styles.priorityIcon}
            />
            <Text
              style={[
                styles.priorityText,
                { color: task.priority === 'low' ? theme.colors.primary : theme.colors.text }
              ]}
            >
              Düşük
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.priorityButton,
              task.priority === 'medium' && styles.priorityButtonActive,
              {
                backgroundColor: task.priority === 'medium'
                  ? theme.colors.primary + '20'
                  : theme.dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'
              }
            ]}
            onPress={() => updateTaskPriority('medium')}
          >
            <Ionicons
              name="remove"
              size={18}
              color={task.priority === 'medium' ? theme.colors.primary : theme.colors.text}
              style={styles.priorityIcon}
            />
            <Text
              style={[
                styles.priorityText,
                { color: task.priority === 'medium' ? theme.colors.primary : theme.colors.text }
              ]}
            >
              Orta
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.priorityButton,
              task.priority === 'high' && styles.priorityButtonActive,
              {
                backgroundColor: task.priority === 'high'
                  ? theme.colors.primary + '20'
                  : theme.dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'
              }
            ]}
            onPress={() => updateTaskPriority('high')}
          >
            <Ionicons
              name="arrow-up"
              size={18}
              color={task.priority === 'high' ? theme.colors.primary : theme.colors.text}
              style={styles.priorityIcon}
            />
            <Text
              style={[
                styles.priorityText,
                { color: task.priority === 'high' ? theme.colors.primary : theme.colors.text }
              ]}
            >
              Yüksek
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Kategori ve etiket seçimi */}
      <View style={styles.inputContainer}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Kategori ve Etiketler</Text>
        <View style={styles.selectionContainer}>
          {/* Kategori seçim butonu */}
          <TouchableOpacity
            style={[
              styles.selectionButton,
              {
                backgroundColor: theme.dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                borderColor: getCategoryColor() || theme.colors.border
              }
            ]}
            onPress={onSelectCategory}
          >
            <Ionicons
              name="folder-outline"
              size={20}
              color={getCategoryColor() || theme.colors.text}
              style={styles.selectionIcon}
            />
            <Text
              style={[
                styles.selectionText,
                { color: theme.colors.text }
              ]}
              numberOfLines={1}
            >
              {getCategoryName() || 'Kategori seç'}
            </Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={theme.colors.text}
            />
          </TouchableOpacity>

          {/* Etiket seçim butonu */}
          <TouchableOpacity
            style={[
              styles.selectionButton,
              {
                backgroundColor: theme.dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                borderColor: theme.colors.border
              }
            ]}
            onPress={onSelectLabels}
          >
            <Ionicons
              name="pricetags-outline"
              size={20}
              color={theme.colors.text}
              style={styles.selectionIcon}
            />
            <Text
              style={[
                styles.selectionText,
                { color: theme.colors.text }
              ]}
              numberOfLines={1}
            >
              {getSelectedLabelsCount() > 0 ? `${getSelectedLabelsCount()} etiket seçildi` : 'Etiket seç'}
            </Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={theme.colors.text}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 8,
    width: '100%',
  },
  inputContainer: {
    marginBottom: 16,
    width: '100%',
  },
  titleInput: {
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    fontWeight: '500',
    width: '100%',
  },
  descriptionInput: {
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    textAlignVertical: 'top',
    minHeight: 80,
    width: '100%',
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1
  },
  dateIcon: {
    marginRight: 8
  },
  dateText: {
    fontSize: 16
  },
  priorityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8
  },
  priorityButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 8
  },
  priorityButtonActive: {
    borderWidth: 1,
    borderColor: 'transparent'
  },
  priorityIcon: {
    marginRight: 4
  },
  priorityText: {
    fontSize: 14,
    fontWeight: '500'
  },
  statusContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  statusButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 14,
    marginRight: 10,
    alignItems: 'center',
  },
  statusButtonActive: {
    borderWidth: 1,
    borderColor: 'white',
  },
  statusButtonText: {
    fontWeight: '500',
  },
  statusButtonTextActive: {
    color: 'white',
  },
  selectionContainer: {
    gap: 12,
  },
  selectionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  selectionIcon: {
    marginRight: 8,
  },
  selectionText: {
    flex: 1,
    fontSize: 16,
  },
  characterCount: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: 4,
    marginRight: 4
  },
  datePickerContainer: {
    marginBottom: 16,
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    paddingHorizontal: 16,
  },
}); 