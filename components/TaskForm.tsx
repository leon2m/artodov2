import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ScrollView, Platform, Modal } from 'react-native';
import { Task, TaskPriority, TaskStatus } from '@/types/task';
import { Calendar, Tag, Folder, Layout, Plus, X } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTasks } from '@/contexts/TaskContext';
import { useSettings } from '@/contexts/SettingsContext';

/**
 * !!!! UYARI !!!!
 * 
 * Bu bileşen artık kullanılmıyor. Onun yerine components/modals/task/TaskForm.tsx
 * bileşenini kullanın. Bu dosya, sadece geriye dönük uyumluluk için burada tutulmaktadır.
 * 
 * Yeni görev eklemeleri ve düzenlemeleri için:
 * import TaskModal from '@/components/modals/task';
 * veya
 * import AddTaskModal from '@/components/AddTaskModal';
 * kullanın.
 */

interface TaskFormProps {
  onSubmit: (task: Partial<Task>) => void;
  onCancel: () => void;
  initialValues?: Partial<Task>;
}

const priorityOptions: { value: TaskPriority; label: string; color: string }[] = [
  { value: 'low', label: 'Düşük', color: '#10B981' },
  { value: 'medium', label: 'Orta', color: '#F59E0B' },
  { value: 'high', label: 'Yüksek', color: '#EF4444' },
];

export default function TaskForm({ onSubmit, onCancel, initialValues }: TaskFormProps) {
  // !!!! UYARI !!!! Bu form artık kullanılmıyor!
  
  const { theme } = useSettings();
  const { board, addLabel, addCategory } = useTasks();
  
  const [title, setTitle] = useState(() => initialValues?.title || '');
  const [description, setDescription] = useState(() => initialValues?.description || '');
  const [priority, setPriority] = useState<TaskPriority>(() => initialValues?.priority || 'medium');
  const [status, setStatus] = useState<TaskStatus>(() => initialValues?.status || 'todo');
  const [dueDate, setDueDate] = useState<Date | undefined>(() => initialValues?.dueDate);
  const [tempDate, setTempDate] = useState<Date | undefined>(() => initialValues?.dueDate);
  const [categoryId, setCategoryId] = useState<string | undefined>(() => initialValues?.categoryId);
  const [labels, setLabels] = useState<string[]>(() => initialValues?.labels || []);
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // Yeni etiket ve kategori ekleme için modaller
  const [showNewLabelModal, setShowNewLabelModal] = useState(false);
  const [showNewCategoryModal, setShowNewCategoryModal] = useState(false);
  const [newLabelTitle, setNewLabelTitle] = useState('');
  const [newLabelColor, setNewLabelColor] = useState('#3B82F6');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#3B82F6');
  const [newCategoryStatus, setNewCategoryStatus] = useState<TaskStatus>('todo');

  useEffect(() => {
    setTempDate(dueDate);
  }, [dueDate]);

  const handleSubmit = () => {
    if (!title.trim()) return;

    // Find the column that matches the selected category's status
    const selectedCategory = board.categories.find(cat => cat.id === categoryId);
    const targetStatus = selectedCategory?.columnId ? board.columns.find(col => col.id === selectedCategory.columnId)?.status : status;

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      priority,
      status: targetStatus,
      dueDate,
      categoryId,
      labels,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setTempDate(selectedDate);
    }
  };

  const handleDateConfirm = () => {
    setDueDate(tempDate);
    setShowDatePicker(false);
  };

  const handleDateCancel = () => {
    setTempDate(dueDate);
    setShowDatePicker(false);
  };

  const handleAddNewLabel = async () => {
    if (newLabelTitle.trim()) {
      try {
        await addLabel({
          name: newLabelTitle.trim(),
          color: newLabelColor
        });
        setNewLabelTitle('');
        setNewLabelColor('#3B82F6'); // Reset to default color
        setTimeout(() => {
          setShowNewLabelModal(false);
        }, 300); // Delay to ensure state updates before closing
      } catch (error) {
        console.error('Etiket eklenirken hata oluştu:', error);
      }
    }
  };

  const handleAddNewCategory = async () => {
    if (newCategoryName.trim()) {
      try {
        await addCategory({
          name: newCategoryName.trim(),
          color: newCategoryColor
        });
        setNewCategoryName('');
        setNewCategoryColor('#3B82F6'); // Reset to default color
        setTimeout(() => {
          setShowNewCategoryModal(false);
        }, 300); // Delay to ensure state updates before closing
      } catch (error) {
        console.error('Kategori eklenirken hata oluştu:', error);
      }
    }
  };

  const colorOptions = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#EC4899', 
    '#8B5CF6', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
  ];

  const renderLabelPicker = () => (
    <>
      <View style={styles.sectionHeader}>
        <Text style={[styles.label, { color: theme.colors.text }]}>Etiketler</Text>
        <Pressable 
          style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => setShowNewLabelModal(true)}
        >
          <Plus size={16} color="#FFF" />
          <Text style={styles.addButtonText}>Yeni Etiket</Text>
        </Pressable>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.labelsContainer}>
        {board.labels.map((label) => (
          <Pressable
            key={label.id}
            style={[
              styles.labelButton,
              { 
                backgroundColor: labels.includes(label.id) ? label.color : theme.colors.card,
                borderColor: theme.colors.border
              },
            ]}
            onPress={() => {
              if (labels.includes(label.id)) {
                setLabels(labels.filter(id => id !== label.id));
              } else {
                setLabels([...labels, label.id]);
              }
            }}>
            <Tag size={14} color={labels.includes(label.id) ? '#FFF' : theme.colors.secondaryText} />
            <Text
              style={[
                styles.labelText,
                { color: labels.includes(label.id) ? '#FFF' : theme.colors.text },
              ]}>
              {label.name}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </>
  );

  const renderCategoryPicker = () => (
    <>
      <View style={styles.sectionHeader}>
        <Text style={[styles.label, { color: theme.colors.text }]}>Kategori</Text>
        <Pressable 
          style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => setShowNewCategoryModal(true)}
        >
          <Plus size={16} color="#FFF" />
          <Text style={styles.addButtonText}>Yeni Kategori</Text>
        </Pressable>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
        {board.categories.map((category) => (
          <Pressable
            key={category.id}
            style={[
              styles.categoryButton,
              { 
                backgroundColor: categoryId === category.id ? category.color : theme.colors.card,
                borderColor: theme.colors.border
              },
            ]}
            onPress={() => setCategoryId(category.id)}>
            <Folder size={14} color={categoryId === category.id ? '#FFF' : theme.colors.secondaryText} />
            <Text
              style={[
                styles.categoryText,
                { color: categoryId === category.id ? '#FFF' : theme.colors.text },
              ]}>
              {category.name}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </>
  );

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: 'transparent' }]} 
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.label, { color: theme.colors.text }]}>Başlık</Text>
      <TextInput
        style={[styles.input, { 
          backgroundColor: theme.colors.card,
          color: theme.colors.text,
          borderColor: theme.colors.border
        }]}
        value={title}
        onChangeText={setTitle}
        placeholder="Görev başlığı"
        placeholderTextColor={theme.colors.secondaryText}
      />

      <Text style={[styles.label, { color: theme.colors.text }]}>Açıklama</Text>
      <TextInput
        style={[styles.input, styles.textArea, { 
          backgroundColor: theme.colors.card,
          color: theme.colors.text,
          borderColor: theme.colors.border
        }]}
        value={description}
        onChangeText={setDescription}
        placeholder="Görev açıklaması"
        placeholderTextColor={theme.colors.secondaryText}
        multiline
        numberOfLines={4}
      />

      <Text style={[styles.label, { color: theme.colors.text }]}>Tarih</Text>
      <Pressable
        style={[styles.input, { 
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border
        }]}
        onPress={() => setShowDatePicker(true)}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Calendar size={20} color={theme.colors.secondaryText} style={{ marginRight: 8 }} />
          <Text style={{ color: dueDate ? theme.colors.text : theme.colors.secondaryText }}>
            {dueDate ? dueDate.toLocaleDateString() : 'Tarih seç'}
          </Text>
        </View>
      </Pressable>

      {(Platform.OS === 'ios' && showDatePicker) && (
        <View style={[styles.datePickerContainer, { 
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border
        }]}>
          <View style={styles.datePickerHeader}>
            <Pressable onPress={handleDateCancel}>
              <Text style={[styles.datePickerButton, { color: theme.colors.error }]}>İptal</Text>
            </Pressable>
            <Pressable onPress={handleDateConfirm}>
              <Text style={[styles.datePickerButton, { color: theme.colors.primary }]}>Tamam</Text>
            </Pressable>
          </View>
          <DateTimePicker
            testID="dateTimePicker"
            value={tempDate || new Date()}
            mode="date"
            display="spinner"
            onChange={handleDateChange}
            textColor={theme.colors.text}
            style={styles.datePicker}
          />
        </View>
      )}
      {(Platform.OS === 'android' && showDatePicker) && (
        <DateTimePicker
          testID="dateTimePicker"
          value={tempDate || new Date()}
          mode="date"
          display="default"
          onChange={handleDateChange}
          style={styles.datePicker}
        />
      )}

      <Text style={[styles.label, { color: theme.colors.text }]}>Durum</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statusContainer}>
        {board.columns.map((column) => (
          <Pressable
            key={column.id}
            style={[
              styles.statusButton,
              { 
                backgroundColor: status === column.status ? column.color : theme.colors.card,
                borderColor: theme.colors.border
              },
            ]}
            onPress={() => setStatus(column.status)}>
            <Text
              style={[
                styles.statusText,
                { color: status === column.status ? '#FFF' : theme.colors.text },
              ]}>
              {column.title}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <Text style={[styles.label, { color: theme.colors.text }]}>Öncelik</Text>
      <View style={styles.priorityContainer}>
        {priorityOptions.map((option) => (
          <Pressable
            key={option.value}
            style={[
              styles.priorityButton,
              { 
                backgroundColor: priority === option.value ? option.color : theme.colors.card,
                borderColor: theme.colors.border
              },
            ]}
            onPress={() => setPriority(option.value)}>
            <Text
              style={[
                styles.priorityText,
                { color: priority === option.value ? '#FFF' : theme.colors.text },
              ]}>
              {option.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {renderCategoryPicker()}
      {renderLabelPicker()}

      <View style={styles.buttonContainer}>
        <Pressable
          style={[styles.submitButton, { backgroundColor: theme.colors.primary }]}
          onPress={handleSubmit}>
          <Text style={styles.buttonText}>
            {initialValues ? 'Güncelle' : 'Oluştur'}
          </Text>
        </Pressable>
        <Pressable
          style={[styles.cancelButton, { backgroundColor: theme.colors.error }]}
          onPress={onCancel}>
          <Text style={styles.buttonText}>İptal</Text>
        </Pressable>
      </View>

      {/* New Label Modal */}
      <Modal
        visible={showNewLabelModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowNewLabelModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Yeni Etiket</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: theme.colors.background,
                color: theme.colors.text,
                borderColor: theme.colors.border
              }]}
              value={newLabelTitle}
              onChangeText={setNewLabelTitle}
              placeholder="Etiket adı"
              placeholderTextColor={theme.colors.secondaryText}
            />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.colorPicker}>
              {colorOptions.map((color) => (
                <Pressable
                  key={color}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color },
                    newLabelColor === color && styles.selectedColor,
                  ]}
                  onPress={() => setNewLabelColor(color)}
                />
              ))}
            </ScrollView>
            <View style={styles.modalActions}>
              <Pressable
                style={[styles.modalButton, { backgroundColor: theme.colors.primary }]}
                onPress={handleAddNewLabel}>
                <Text style={styles.buttonText}>Ekle</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, { backgroundColor: theme.colors.error }]}
                onPress={() => setShowNewLabelModal(false)}>
                <Text style={styles.buttonText}>İptal</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* New Category Modal */}
      <Modal
        visible={showNewCategoryModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowNewCategoryModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Yeni Kategori</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: theme.colors.background,
                color: theme.colors.text,
                borderColor: theme.colors.border
              }]}
              value={newCategoryName}
              onChangeText={setNewCategoryName}
              placeholder="Kategori adı"
              placeholderTextColor={theme.colors.secondaryText}
            />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.colorPicker}>
              {colorOptions.map((color) => (
                <Pressable
                  key={color}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color },
                    newCategoryColor === color && styles.selectedColor,
                  ]}
                  onPress={() => setNewCategoryColor(color)}
                />
              ))}
            </ScrollView>
            <View style={styles.modalActions}>
              <Pressable
                style={[styles.modalButton, { backgroundColor: theme.colors.primary }]}
                onPress={handleAddNewCategory}>
                <Text style={styles.buttonText}>Ekle</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, { backgroundColor: theme.colors.error }]}
                onPress={() => setShowNewCategoryModal(false)}>
                <Text style={styles.buttonText}>İptal</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginVertical: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    minHeight: 48,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  datePickerContainer: {
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  datePickerButton: {
    fontSize: 16,
    fontWeight: '600',
  },
  datePicker: {
    height: 200,
  },
  statusContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  statusButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
  },
  statusText: {
    fontWeight: '500',
  },
  priorityContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  priorityButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 1,
  },
  priorityText: {
    fontWeight: '600',
  },
  categoryContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
  },
  categoryText: {
    marginLeft: 6,
    fontWeight: '500',
  },
  labelContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  labelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
  },
  labelText: {
    marginLeft: 6,
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: Platform.OS === 'ios' ? 24 : 16,
    gap: 12,
  },
  submitButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#FFF',
    fontSize: 14,
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  colorPicker: {
    flexDirection: 'row',
    marginVertical: 16,
  },
  colorOption: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  selectedColor: {
    borderWidth: 3,
    borderColor: '#FFF',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  labelsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  categoriesContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
});