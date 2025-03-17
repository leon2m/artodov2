import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { MotiView } from 'moti';
import { useSettings } from '@/contexts/SettingsContext';
import { Grid3X3, Tag, Clock } from 'lucide-react-native';

interface PlanningFiltersProps {
  selectedCategory: string | null;
  selectedTag: string | null;
  setSelectedCategory: (category: string | null) => void;
  setSelectedTag: (tag: string | null) => void;
  goToToday: () => void;
}

const PlanningFilters: React.FC<PlanningFiltersProps> = ({
  selectedCategory,
  selectedTag,
  setSelectedCategory,
  setSelectedTag,
  goToToday
}) => {
  const { theme } = useSettings();
  
  return (
    <MotiView 
      from={{ opacity: 0, translateY: 10 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'spring', damping: 15 }}
      style={[
        styles.filterContainer,
        { backgroundColor: theme.dark ? theme.colors.card : 'rgba(0,0,0,0.03)' }
      ]}
    >
      <TouchableOpacity 
        style={[
          styles.filterButton,
          selectedCategory && { backgroundColor: theme.colors.primary + '20' }
        ]}
        onPress={() => {
          // Kategori seçim modalını göster
          // İleri aşamalarda eklenecek
          setSelectedCategory(selectedCategory ? null : 'category1');
        }}
      >
        <Grid3X3 size={16} color={theme.colors.text} />
        <Text style={[styles.filterButtonText, { color: theme.colors.text }]}>
          {selectedCategory ? 'Kategori: Seçildi' : 'Kategori'}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[
          styles.filterButton,
          selectedTag && { backgroundColor: theme.colors.primary + '20' }
        ]}
        onPress={() => {
          // Etiket seçim modalını göster
          // İleri aşamalarda eklenecek
          setSelectedTag(selectedTag ? null : 'tag1');
        }}
      >
        <Tag size={16} color={theme.colors.text} />
        <Text style={[styles.filterButtonText, { color: theme.colors.text }]}>
          {selectedTag ? 'Etiket: Seçildi' : 'Etiket'}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.filterButton}
        onPress={goToToday}
      >
        <Clock size={16} color={theme.colors.primary} />
        <Text style={[styles.filterButtonText, { color: theme.colors.primary }]}>
          Bugün
        </Text>
      </TouchableOpacity>
    </MotiView>
  );
};

const styles = StyleSheet.create({
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    padding: 8,
    borderRadius: 12,
    justifyContent: 'space-between',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  filterButtonText: {
    fontSize: 13,
    marginLeft: 4,
  },
});

export default PlanningFilters; 