import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { CategoryPickerProps, COLORS } from './types';

export default function CategoryPicker({
  visible,
  onClose,
  categories,
  selectedCategoryId,
  onSelectCategory,
  theme,
  settings,
  board
}: CategoryPickerProps) {
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState(COLORS[0]);

  // Yeni kategori oluşturma fonksiyonu
  const createNewCategory = () => {
    if (!newCategoryName.trim()) return;
    
    // Yeni kategori oluşturma
    // useTasks context'inden createCategory fonksiyonu kullanılabilir
    // Şimdilik dummy kategori oluşturalım
    const newCategory = {
      id: `cat_${Date.now()}`,
      name: newCategoryName,
      color: newCategoryColor
    };
    
    // Sisteme kategorileri ekleme fonksiyonu burada çağrılmalı
    // Örnek: createCategory(newCategory);
    console.log('Yeni kategori oluşturuldu:', newCategory);
    
    // Yeni oluşturulan kategoriyi seç
    onSelectCategory(newCategory.id);
    
    // Form temizle
    setNewCategoryName('');
    
    if (settings.hapticFeedback) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  if (!visible) return null;

  return (
    <View style={[styles.pickerContainer, { backgroundColor: theme.colors.card }]}>
      <View style={styles.pickerHeader}>
        <Text style={[styles.pickerTitle, { color: theme.colors.text }]}>Kategoriler</Text>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.pickerContent}>
        {/* Yeni kategori oluşturma formu */}
        <View style={styles.newItemForm}>
          <TextInput
            style={[
              styles.newItemInput,
              { 
                color: theme.colors.text,
                backgroundColor: theme.dark ? theme.colors.background : '#f0f0f0',
                borderColor: theme.colors.border
              }
            ]}
            value={newCategoryName}
            onChangeText={setNewCategoryName}
            placeholder="Yeni kategori adı..."
            placeholderTextColor={theme.colors.text + '80'}
          />
          
          <View style={styles.colorOptions}>
            {COLORS.map(color => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorOption,
                  { backgroundColor: color },
                  newCategoryColor === color && styles.selectedColorOption
                ]}
                onPress={() => setNewCategoryColor(color)}
              />
            ))}
          </View>
          
          <TouchableOpacity
            style={[
              styles.newItemButton,
              { 
                backgroundColor: theme.colors.primary,
                opacity: newCategoryName.trim() ? 1 : 0.6
              }
            ]}
            onPress={createNewCategory}
            disabled={!newCategoryName.trim()}
          >
            <Text style={[styles.newItemButtonText, { color: '#fff' }]}>
              Yeni Kategori Ekle
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={[styles.itemDivider, { backgroundColor: theme.colors.border }]} />
        
        {/* Mevcut kategoriler */}
        {categories.length === 0 ? (
          <Text style={[styles.emptyText, { color: theme.colors.text + '80' }]}>
            Hiç kategori bulunamadı. Yukarıdan yeni kategori ekleyebilirsiniz.
          </Text>
        ) : (
          categories.map(category => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryItem,
                { 
                  backgroundColor: selectedCategoryId === category.id
                    ? `${category.color}30`
                    : theme.colors.background
                }
              ]}
              onPress={() => onSelectCategory(category.id)}
            >
              <View style={[styles.categoryColor, { backgroundColor: category.color }]} />
              <Text style={[styles.categoryTitle, { color: theme.colors.text }]}>
                {category.name}
              </Text>
              {selectedCategoryId === category.id && (
                <Ionicons name="checkmark" size={18} color={theme.colors.text} />
              )}
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  pickerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    zIndex: 10,
    borderRadius: 12,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  pickerContent: {
    flex: 1,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  categoryColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12,
  },
  categoryTitle: {
    flex: 1,
    fontSize: 16,
  },
  newItemForm: {
    marginBottom: 16,
  },
  newItemInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  colorOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  colorOption: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
    marginBottom: 10,
  },
  selectedColorOption: {
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 1,
    elevation: 2,
  },
  itemDivider: {
    height: 1,
    marginVertical: 10,
  },
  newItemButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newItemButtonText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
}); 