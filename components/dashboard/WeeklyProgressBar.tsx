import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions } from 'react-native';
import { MotiView } from 'moti';
import { useSettings } from '@/contexts/SettingsContext';

// Günlük görev verisi tipi
interface DayData {
  day: string;
  shortName: string;
  completed: number;
  total: number;
  date: string;
}

interface WeeklyProgressBarProps {
  weeklyData: DayData[];
  onDayPress: (day: DayData) => void;
}

export const WeeklyProgressBar: React.FC<WeeklyProgressBarProps> = ({
  weeklyData,
  onDayPress
}) => {
  const { theme } = useSettings();
  const screenWidth = Dimensions.get('window').width - 40; // Ekran genişliği (padding çıkarılmış)
  const barWidth = screenWidth / 7; // Her günün genişliği
  
  // Türkçe gün isimleri
  const dayNames = {
    'Mon': 'Pzt',
    'Tue': 'Sal',
    'Wed': 'Çar',
    'Thu': 'Per',
    'Fri': 'Cum',
    'Sat': 'Cmt',
    'Sun': 'Paz'
  };
  
  return (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 400 }}
      style={[
        styles.container,
        { 
          backgroundColor: theme.dark ? theme.colors.card : theme.colors.background,
          borderColor: theme.colors.border
        }
      ]}
    >
      <View style={styles.headerContainer}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Haftalık İlerleme
        </Text>
      </View>
      
      <View style={styles.barContainer}>
        {weeklyData.map((item, index) => {
          const progress = item.total > 0 ? (item.completed / item.total) : 0;
          const today = new Date().toLocaleDateString('tr-TR', { weekday: 'short' }) === item.shortName;
          
          return (
            <TouchableOpacity
              key={index}
              style={[styles.dayContainer, { width: barWidth - 8 }]}
              onPress={() => onDayPress(item)}
            >
              <View style={styles.dayInfoContainer}>
                <Text style={[
                  styles.dayText,
                  { 
                    color: today ? theme.colors.primary : theme.colors.secondaryText,
                    fontWeight: today ? '600' : '400'
                  }
                ]}>
                  {dayNames[item.shortName as keyof typeof dayNames] || item.shortName}
                </Text>
                
                <Text style={[
                  styles.dayStatsText,
                  { color: theme.colors.secondaryText }
                ]}>
                  {item.completed}/{item.total}
                </Text>
              </View>
              
              <View style={[
                styles.barBackground,
                { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
              ]}>
                <MotiView
                  animate={{ height: `${Math.max(progress * 100, 3)}%` }}
                  transition={{ type: 'timing', duration: 500, delay: index * 50 }}
                  style={[
                    styles.barFill,
                    { 
                      backgroundColor: progress > 0 
                        ? (progress === 1 ? '#4CAF50' : theme.colors.primary) 
                        : theme.colors.border
                    }
                  ]}
                />
              </View>
              
              <View style={[
                styles.dayIndicator,
                { 
                  backgroundColor: today ? theme.colors.primary : 'transparent',
                  width: today ? 4 : 0
                }
              ]} />
            </TouchableOpacity>
          );
        })}
      </View>
    </MotiView>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginVertical: 6,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  barContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 120,
  },
  dayContainer: {
    height: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  dayInfoContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  dayText: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 2,
  },
  dayStatsText: {
    fontSize: 10,
    textAlign: 'center',
  },
  barBackground: {
    width: 10,
    height: 70,
    borderRadius: 5,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  barFill: {
    width: '100%',
    borderRadius: 5,
  },
  dayIndicator: {
    height: 4,
    borderRadius: 2,
    marginTop: 4,
  },
}); 