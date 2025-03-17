import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { MotiView } from 'moti';
import { useSettings } from '@/contexts/SettingsContext';
import { 
  format, 
  isSameDay, 
  eachDayOfInterval 
} from 'date-fns';
import { tr } from 'date-fns/locale';

interface DateRange {
  start: Date;
  end: Date;
}

interface WeeklyViewProps {
  selectedDate: Date;
  dateRange: DateRange;
  getTaskCountForDate: (date: Date) => number;
  setSelectedDate: (date: Date) => void;
  visible: boolean;
}

const WeeklyView: React.FC<WeeklyViewProps> = ({
  selectedDate,
  dateRange,
  getTaskCountForDate,
  setSelectedDate,
  visible
}) => {
  const { theme } = useSettings();
  
  if (!visible) return null;
  
  const { start, end } = dateRange;
  const daysInWeek = eachDayOfInterval({ start, end });
  
  return (
    <MotiView 
      from={{ opacity: 0, translateY: 10 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'spring', damping: 15 }}
      style={styles.weeklyContainer}
    >
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
      >
        <View style={styles.weekDaysContainer}>
          {daysInWeek.map((day, index) => {
            const isSelected = isSameDay(day, selectedDate);
            const isToday = isSameDay(day, new Date());
            const taskCount = getTaskCountForDate(day);
            
            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.weekDay,
                  isSelected && [styles.selectedWeekDay, { borderColor: theme.colors.primary }],
                  isToday && { backgroundColor: theme.colors.primary + '10' }
                ]}
                onPress={() => setSelectedDate(day)}
              >
                <Text style={[styles.weekDayName, { color: theme.colors.secondaryText }]}>
                  {format(day, 'E', { locale: tr })}
                </Text>
                <View 
                  style={[
                    styles.weekDayNumber, 
                    isSelected && [styles.selectedWeekDayNumber, { backgroundColor: theme.colors.primary }]
                  ]}
                >
                  <Text 
                    style={[
                      styles.weekDayNumberText, 
                      { color: isSelected ? '#fff' : theme.colors.text }
                    ]}
                  >
                    {format(day, 'd')}
                  </Text>
                </View>
                
                {taskCount > 0 && (
                  <View style={styles.weekDayTaskCount}>
                    <Text style={[styles.weekDayTaskCountText, { color: theme.colors.primary }]}>
                      {taskCount} görev
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </MotiView>
  );
};

const styles = StyleSheet.create({
  weeklyContainer: {
    marginBottom: 16,
  },
  weekDaysContainer: {
    flexDirection: 'row',
    paddingHorizontal: 4,
  },
  weekDay: {
    width: 65,
    padding: 10,
    marginRight: 10,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedWeekDay: {
    borderWidth: 1,
  },
  weekDayName: {
    fontSize: 12,
    marginBottom: 4,
  },
  weekDayNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedWeekDayNumber: {
    borderRadius: 16,
  },
  weekDayNumberText: {
    fontSize: 14,
    fontWeight: '600',
  },
  weekDayTaskCount: {
    marginTop: 4,
  },
  weekDayTaskCountText: {
    fontSize: 11,
  },
});

export default WeeklyView; 