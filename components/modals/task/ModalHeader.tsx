import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ModalHeaderProps } from './types';

/**
 * Modal için başlık çubuğu bileşeni
 */
export default function ModalHeader({ 
  onClose,
  theme,
  title = "Görev"
}: {
  onClose: () => void;
  theme: any;
  title?: string;
}) {
  return (
    <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>
        {title}
      </Text>
      
      {/* Kapat butonu */}
      <TouchableOpacity
        style={styles.closeButton}
        onPress={onClose}
      >
        <Ionicons
          name="close"
          size={24}
          color={theme.colors.text}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
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
}); 