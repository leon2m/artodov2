import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LabelPickerProps, COLORS } from './types';

export default function LabelPicker({
  visible,
  onClose,
  labels,
  selectedLabels = [],
  onToggleLabel,
  theme,
  settings,
  board
}: LabelPickerProps) {
  const [newLabelName, setNewLabelName] = useState('');
  const [newLabelColor, setNewLabelColor] = useState(COLORS[0]);

  // Yeni etiket oluşturma fonksiyonu
  const createNewLabel = () => {
    if (!newLabelName.trim()) return;
    
    // Yeni etiket oluşturma
    // useTasks context'inden createLabel fonksiyonu kullanılabilir
    // Şimdilik dummy etiket oluşturalım
    const newLabel = {
      id: `label_${Date.now()}`,
      name: newLabelName,
      color: newLabelColor
    };
    
    // Sisteme etiketleri ekleme fonksiyonu burada çağrılmalı
    // Örnek: createLabel(newLabel);
    console.log('Yeni etiket oluşturuldu:', newLabel);
    
    // Yeni oluşturulan etiketi seç
    onToggleLabel(newLabel.id);
    
    // Form temizle
    setNewLabelName('');
    
    if (settings.hapticFeedback) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  if (!visible) return null;

  return (
    <View style={[styles.pickerContainer, { backgroundColor: theme.colors.card }]}>
      <View style={styles.pickerHeader}>
        <Text style={[styles.pickerTitle, { color: theme.colors.text }]}>Etiketler</Text>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.pickerContent}>
        {/* Yeni etiket oluşturma formu */}
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
            value={newLabelName}
            onChangeText={setNewLabelName}
            placeholder="Yeni etiket adı..."
            placeholderTextColor={theme.colors.text + '80'}
          />
          
          <View style={styles.colorOptions}>
            {COLORS.map(color => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorOption,
                  { backgroundColor: color },
                  newLabelColor === color && styles.selectedColorOption
                ]}
                onPress={() => setNewLabelColor(color)}
              />
            ))}
          </View>
          
          <TouchableOpacity
            style={[
              styles.newItemButton,
              { 
                backgroundColor: theme.colors.primary,
                opacity: newLabelName.trim() ? 1 : 0.6
              }
            ]}
            onPress={createNewLabel}
            disabled={!newLabelName.trim()}
          >
            <Text style={[styles.newItemButtonText, { color: '#fff' }]}>
              Yeni Etiket Ekle
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={[styles.itemDivider, { backgroundColor: theme.colors.border }]} />
        
        {/* Mevcut etiketler */}
        {labels.length === 0 ? (
          <Text style={[styles.emptyText, { color: theme.colors.text + '80' }]}>
            Hiç etiket bulunamadı. Yukarıdan yeni etiket ekleyebilirsiniz.
          </Text>
        ) : (
          labels.map(label => (
            <TouchableOpacity
              key={label.id}
              style={[
                styles.labelItem,
                { 
                  backgroundColor: selectedLabels.includes(label.id)
                    ? `${label.color}30`
                    : theme.colors.background
                }
              ]}
              onPress={() => onToggleLabel(label.id)}
            >
              <View style={[styles.labelColor, { backgroundColor: label.color }]} />
              <Text style={[styles.labelTitle, { color: theme.colors.text }]}>
                {label.name}
              </Text>
              {selectedLabels.includes(label.id) && (
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
  labelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  labelColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12,
  },
  labelTitle: {
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