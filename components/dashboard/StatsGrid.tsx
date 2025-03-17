import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatCard } from './StatCard';

// İstatistik kartları renkleri
const COLORS = {
  blue: '#3B82F6',  // Bekleyen
  green: '#10B981', // Tamamlanan  
  purple: '#8B5CF6', // Toplam
  pink: '#EC4899'   // İlerleme
};

interface StatsGridProps {
  stats: {
    pending: number;
    completed: number;
    total: number;
    progress: number;
  };
  onStatCardPress: (cardId: string) => void;
}

export const StatsGrid: React.FC<StatsGridProps> = ({ stats, onStatCardPress }) => {
  return (
    <View style={styles.statsGridContainer}>
      <View style={styles.statsGrid}>
        <StatCard
          title="Bekleyen"
          value={stats.pending}
          icon={<Ionicons name="time-outline" size={22} color={COLORS.blue} />}
          color={COLORS.blue}
          type="pending"
          onPress={() => onStatCardPress('pending')}
          style={{ marginHorizontal: 4 }}
        />
        <StatCard
          title="Tamamlanan"
          value={stats.completed}
          icon={<Ionicons name="checkmark-done-outline" size={22} color={COLORS.green} />}
          color={COLORS.green}
          type="completed"
          onPress={() => onStatCardPress('completed')}
          style={{ marginHorizontal: 4 }}
        />
      </View>
      
      <View style={styles.statsGrid}>
        <StatCard
          title="Toplam"
          value={stats.total}
          icon={<Ionicons name="document-text-outline" size={22} color={COLORS.purple} />}
          color={COLORS.purple}
          type="total"
          onPress={() => onStatCardPress('total')}
          style={{ marginHorizontal: 4 }}
        />
        <StatCard
          title="İlerleme"
          value={stats.progress}
          icon={<Ionicons name="analytics-outline" size={22} color={COLORS.pink} />}
          color={COLORS.pink}
          type="progress"
          onPress={() => onStatCardPress('progress')}
          style={{ marginHorizontal: 4 }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  statsGridContainer: {
    marginVertical: 6,
    alignItems: 'center'
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 8,
  },
}); 