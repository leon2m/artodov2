import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { MotiView } from 'moti';
import { useSettings } from '@/contexts/SettingsContext';
import { 
  format, 
  isSameDay, 
  isSameMonth, 
  startOfMonth, 
  endOfMonth, 
  addDays, 
  getDay, 
  eachDayOfInterval 
} from 'date-fns';

interface MonthlyCalendarProps {
  selectedDate: Date;
  currentMonth: Date;
  getTaskCountForDate: (date: Date) => number;
  setSelectedDate: (date: Date) => void;
  visible: boolean;
}

const MonthlyCalendar: React.FC<MonthlyCalendarProps> = ({
  selectedDate,
  currentMonth,
  getTaskCountForDate,
  setSelectedDate,
  visible
}) => {
  const { theme } = useSettings();
  
  if (!visible) return null;
  
  // Takvim günlerini oluştur
  const getDaysInMonth = () => {
    const days = [];
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    
    // Ay başlangıcından önceki günleri ekle (önceki aydan)
    const dayOfWeek = getDay(monthStart);
    const weekStartsOn = 1; // Pazartesi
    
    const start = addDays(monthStart, -((dayOfWeek - weekStartsOn + 7) % 7));
    const end = addDays(monthEnd, (6 - ((getDay(monthEnd) - weekStartsOn + 7) % 7)));
    
    // Tüm günleri aralık olarak al
    const daysInMonth = eachDayOfInterval({ start, end });
    
    return daysInMonth;
  };
  
  const days = getDaysInMonth();
  const dayNames = ['Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pz'];
  
  return (
    <MotiView 
      from={{ opacity: 0, translateY: 10 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'spring', damping: 15 }}
      style={[
        styles.calendarContainer,
        { backgroundColor: theme.dark ? theme.colors.card : 'rgba(0,0,0,0.03)' }
      ]}
    >
      {/* Gün isimleri */}
      <View style={styles.calendarDayNames}>
        {dayNames.map((day, index) => (
          <View key={index} style={styles.calendarDayNameCell}>
            <Text style={[styles.calendarDayNameText, { color: theme.colors.secondaryText }]}>
              {day}
            </Text>
          </View>
        ))}
      </View>
      
      {/* Takvim günleri */}
      <View style={styles.calendarDays}>
        {days.map((day, index) => {
          const isSelected = isSameDay(day, selectedDate);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const taskCount = getTaskCountForDate(day);
          
          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.calendarDay,
                isSelected && [styles.selectedCalendarDay, { backgroundColor: theme.colors.primary }]
              ]}
              onPress={() => setSelectedDate(day)}
            >
              <Text 
                style={[
                  styles.calendarDayText, 
                  { 
                    color: isSelected 
                      ? '#fff' 
                      : isCurrentMonth 
                        ? theme.colors.text 
                        : theme.colors.secondaryText 
                  },
                  !isCurrentMonth && styles.calendarDayTextOtherMonth
                ]}
              >
                {format(day, 'd')}
              </Text>
              
              {taskCount > 0 && (
                <View 
                  style={[
                    styles.calendarDayDot, 
                    { 
                      backgroundColor: isSelected 
                        ? '#fff' 
                        : theme.colors.primary 
                    }
                  ]} 
                />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </MotiView>
  );
};

const styles = StyleSheet.create({
  calendarContainer: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  calendarDayNames: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  calendarDayNameCell: {
    flex: 1,
    alignItems: 'center',
    padding: 4,
  },
  calendarDayNameText: {
    fontSize: 13,
    fontWeight: '500',
  },
  calendarDays: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDay: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  selectedCalendarDay: {
    borderRadius: 10,
  },
  calendarDayText: {
    fontSize: 14,
    fontWeight: '500',
  },
  calendarDayTextOtherMonth: {
    opacity: 0.5,
  },
  calendarDayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 4,
  },
});

export default MonthlyCalendar; 