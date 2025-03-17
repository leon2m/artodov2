import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import { useSettings } from '@/contexts/SettingsContext';
import { 
  Clock, 
  Calendar, 
  Calendar as CalendarIcon,
  LayoutGrid,
  Plus
} from 'lucide-react-native';

// Plan kategorilerini tanımlayalım
export type PlanCategory = 'daily' | 'weekly' | 'monthly';
export type ViewMode = 'compact' | 'detailed';

interface PlanningHeaderProps {
  activeCategory: PlanCategory;
  viewMode: ViewMode;
  setActiveCategory: (category: PlanCategory) => void;
  setViewMode: (mode: ViewMode) => void;
  onAddTask: () => void;
}

const PlanningHeader: React.FC<PlanningHeaderProps> = ({
  activeCategory,
  viewMode,
  setActiveCategory,
  setViewMode,
  onAddTask
}) => {
  const { theme } = useSettings();

  // Header sağ tarafındaki butonlar
  const renderHeaderRightButtons = () => (
    <View style={styles.headerRightButtons}>
      <TouchableOpacity 
        onPress={() => setViewMode(viewMode === 'compact' ? 'detailed' : 'compact')}
        style={styles.headerButton}
      >
        <LayoutGrid size={22} color={theme.colors.text} />
      </TouchableOpacity>
      
      <TouchableOpacity 
        onPress={onAddTask}
        style={styles.headerButton}
      >
        <Plus size={22} color={theme.colors.primary} />
      </TouchableOpacity>
    </View>
  );

  // Kategori sekmeleri
  const renderCategoryTabs = () => (
    <MotiView 
      from={{ opacity: 0, translateY: -10 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'spring', damping: 15 }}
      style={styles.categoryTabsContainer}
    >
      <TouchableOpacity
        style={[
          styles.categoryTab,
          activeCategory === 'daily' && [styles.activeTab, { borderColor: theme.colors.primary }]
        ]}
        onPress={() => setActiveCategory('daily')}
      >
        <Clock 
          size={18} 
          color={activeCategory === 'daily' ? theme.colors.primary : theme.colors.text} 
        />
        <Text 
          style={[
            styles.categoryTabText, 
            { color: activeCategory === 'daily' ? theme.colors.primary : theme.colors.text }
          ]}
        >
          Günlük
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[
          styles.categoryTab,
          activeCategory === 'weekly' && [styles.activeTab, { borderColor: theme.colors.primary }]
        ]}
        onPress={() => setActiveCategory('weekly')}
      >
        <Calendar 
          size={18} 
          color={activeCategory === 'weekly' ? theme.colors.primary : theme.colors.text} 
        />
        <Text 
          style={[
            styles.categoryTabText, 
            { color: activeCategory === 'weekly' ? theme.colors.primary : theme.colors.text }
          ]}
        >
          Haftalık
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[
          styles.categoryTab,
          activeCategory === 'monthly' && [styles.activeTab, { borderColor: theme.colors.primary }]
        ]}
        onPress={() => setActiveCategory('monthly')}
      >
        <CalendarIcon 
          size={18} 
          color={activeCategory === 'monthly' ? theme.colors.primary : theme.colors.text} 
        />
        <Text 
          style={[
            styles.categoryTabText, 
            { color: activeCategory === 'monthly' ? theme.colors.primary : theme.colors.text }
          ]}
        >
          Aylık
        </Text>
      </TouchableOpacity>
    </MotiView>
  );

  return (
    <>
      {renderCategoryTabs()}
    </>
  );
};

const styles = StyleSheet.create({
  categoryTabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 6,
    marginTop: 8,
    marginBottom: 16,
    justifyContent: 'space-between',
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'transparent',
    flex: 1,
    marginHorizontal: 4,
  },
  categoryTabText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  activeTab: {
    borderWidth: 1,
  },
  headerRightButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
  },
});

export default PlanningHeader; 