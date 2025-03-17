import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { ModalFooterProps } from './types';

/**
 * Modal için alt alan bileşeni
 * Vazgeç ve Kaydet/Güncelle butonları içerir
 */
export default function ModalFooter({ 
  onSave, 
  onCancel, 
  isValid,
  theme,
  isEditMode = false
}: ModalFooterProps) {
  return (
    <View style={[styles.footer, { borderTopColor: theme.colors.border }]}>
      {/* İptal butonu */}
      <TouchableOpacity 
        style={[styles.cancelButton, { borderColor: theme.colors.border }]} 
        onPress={onCancel}
      >
        <Text style={[styles.cancelButtonText, { color: theme.colors.text }]}>
          Vazgeç
        </Text>
      </TouchableOpacity>
      
      {/* Kaydet butonu */}
      <TouchableOpacity 
        style={[
          styles.saveButton, 
          { 
            backgroundColor: theme.colors.primary,
            opacity: isValid ? 1 : 0.5
          }
        ]} 
        onPress={onSave}
        disabled={!isValid}
      >
        <Text style={styles.saveButtonText}>
          {isEditMode ? 'Güncelle' : 'Kaydet'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
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
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
}); 