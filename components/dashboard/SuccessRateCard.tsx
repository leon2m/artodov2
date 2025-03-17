import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { MotiView } from 'moti';
import { Ionicons } from '@expo/vector-icons';
import { useSettings } from '@/contexts/SettingsContext';
import * as Haptics from 'expo-haptics';

interface SuccessRateCardProps {
  rate: number;
  completedCount: number;
  totalCount: number;
  weeklyGoal: number;
  onPress: () => void;
}

export const SuccessRateCard: React.FC<SuccessRateCardProps> = ({
  rate,
  completedCount,
  totalCount,
  weeklyGoal,
  onPress
}) => {
  const { theme, settings } = useSettings();
  
  // Başarı oranı için renk belirleme
  const getStatusColor = () => {
    if (rate >= 80) return '#4CAF50'; // Yeşil (başarılı)
    if (rate >= 50) return '#FF9800'; // Turuncu (orta)
    return '#F44336'; // Kırmızı (düşük)
  };
  
  // Hedefe göre mesaj belirleme
  const getMessage = () => {
    const remaining = weeklyGoal - completedCount;
    
    if (remaining <= 0) {
      return `Tebrikler! Haftalık hedefinize ulaştınız.`;
    } 
    
    if (remaining === 1) {
      return `Haftalık hedefinize ulaşmak için 1 görev daha tamamlayın.`;
    }
    
    return `Haftalık hedefinize ulaşmak için ${remaining} görev daha tamamlayın.`;
  };
  
  const statusColor = getStatusColor();
  
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => {
        if (settings?.hapticFeedback) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        onPress();
      }}
    >
      <MotiView
        from={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'timing', duration: 400 }}
        style={[
          styles.container,
          { 
            backgroundColor: theme.dark ? theme.colors.card : theme.colors.background,
            borderColor: theme.colors.border
          }
        ]}
      >
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              Başarı Oranı
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.secondaryText }]}>
              Bu haftaki ilerlemeniz
            </Text>
          </View>
          
          <View style={[styles.rateBadge, { backgroundColor: statusColor + '20' }]}>
            <Text style={[styles.rateText, { color: statusColor }]}>
              %{rate}
            </Text>
          </View>
        </View>
        
        <View style={styles.progressContainer}>
          <View 
            style={[
              styles.progressTrack, 
              { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
            ]}
          >
            <MotiView
              from={{ width: '0%' }}
              animate={{ width: `${Math.min(rate, 100)}%` }}
              transition={{ type: 'spring', damping: 15 }}
              style={[
                styles.progressFill,
                { backgroundColor: statusColor }
              ]}
            />
          </View>
        </View>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Ionicons name="checkmark-circle-outline" size={18} color={statusColor} style={styles.statIcon} />
            <Text style={[styles.statText, { color: theme.colors.text }]}>
              {completedCount} / {totalCount} görev tamamlandı
            </Text>
          </View>
          
          <View style={styles.statItem}>
            <Ionicons name="flag-outline" size={18} color={theme.colors.primary} style={styles.statIcon} />
            <Text style={[styles.statText, { color: theme.colors.text }]}>
              Haftalık hedef: {weeklyGoal} görev
            </Text>
          </View>
        </View>
        
        <Text style={[styles.message, { color: statusColor }]}>
          {getMessage()}
        </Text>
      </MotiView>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginVertical: 6,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
  },
  rateBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rateText: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  statsContainer: {
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  statIcon: {
    marginRight: 8,
  },
  statText: {
    fontSize: 14,
  },
  message: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
}); 