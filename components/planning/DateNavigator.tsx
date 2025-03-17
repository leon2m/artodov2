import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { MotiView } from 'moti';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useSettings } from '@/contexts/SettingsContext';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { PlanCategory } from './PlanningHeader';

interface DateRange {
  start: Date;
  end: Date;
}

interface DateNavigatorProps {
  activeCategory: PlanCategory;
  selectedDate: Date;
  currentMonth: Date;
  dateRange: DateRange;
  goToPreviousMonth: () => void;
  goToNextMonth: () => void;
}

const DateNavigator: React.FC<DateNavigatorProps> = ({
  activeCategory,
  selectedDate,
  currentMonth,
  dateRange,
  goToPreviousMonth,
  goToNextMonth
}) => {
  const { theme } = useSettings();
  
  // Tarih başlığı metni
  const getDateText = () => {
    const { start, end } = dateRange;
    
    switch (activeCategory) {
      case 'daily':
        return format(selectedDate, 'd MMMM yyyy, EEEE', { locale: tr });
      case 'weekly':
        return `${format(start, 'd MMMM', { locale: tr })} - ${format(end, 'd MMMM yyyy', { locale: tr })}`;
      case 'monthly':
        return format(selectedDate, 'MMMM yyyy', { locale: tr });
      default:
        return '';
    }
  };
  
  return (
    <MotiView 
      from={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ type: 'timing', duration: 500 }}
      style={styles.dateHeaderContainer}
    >
      <TouchableOpacity 
        onPress={activeCategory === 'monthly' ? goToPreviousMonth : undefined}
        disabled={activeCategory !== 'monthly'}
      >
        <ChevronLeft 
          size={24} 
          color={activeCategory === 'monthly' ? theme.colors.text : theme.colors.text + '40'} 
        />
      </TouchableOpacity>
      
      <Text style={[styles.dateHeaderText, { color: theme.colors.text }]}>
        {getDateText()}
      </Text>
      
      <TouchableOpacity 
        onPress={activeCategory === 'monthly' ? goToNextMonth : undefined}
        disabled={activeCategory !== 'monthly'}
      >
        <ChevronRight 
          size={24} 
          color={activeCategory === 'monthly' ? theme.colors.text : theme.colors.text + '40'} 
        />
      </TouchableOpacity>
    </MotiView>
  );
};

const styles = StyleSheet.create({
  dateHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  dateHeaderText: {
    fontSize: 18,
    fontWeight: '600',
  },
});

export default DateNavigator; 