import React, { useState } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Platform,
  ScrollView,
  Dimensions,
  Pressable
} from 'react-native';
import { useSettings } from '@/contexts/SettingsContext';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import { BarChart, PieChart } from 'react-native-chart-kit';
import { Task } from '@/types/task';
import { ChartData } from '@/types/chart';
import * as Haptics from 'expo-haptics';

interface ChartModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  type: 'bar' | 'pie';
  data: ChartData;
  tasks?: Task[];
}

export default function ChartModal({
  visible,
  onClose,
  title,
  type,
  data,
  tasks = []
}: ChartModalProps) {
  const { theme, settings } = useSettings();
  const screenWidth = Dimensions.get('window').width - 40;
  const [activeTab, setActiveTab] = useState<'chart' | 'tasks'>('chart');
  
  const handleClose = () => {
    if (settings.hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onClose();
  };
  
  const chartConfig = {
    backgroundGradientFrom: theme.colors.card,
    backgroundGradientTo: theme.colors.card,
    color: (opacity = 1) => theme.colors.primary,
    labelColor: (opacity = 1) => theme.colors.text,
    style: {
      borderRadius: 16
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: theme.colors.primary
    },
    barPercentage: 0.7,
    decimalPlaces: 0
  };
  
  const renderChart = () => {
    if (type === 'bar') {
      return (
        <BarChart
          data={{
            labels: data.labels,
            datasets: [
              {
                data: data.values
              }
            ]
          }}
          width={screenWidth}
          height={220}
          chartConfig={chartConfig}
          style={{
            marginVertical: 8,
            borderRadius: 16
          }}
          showValuesOnTopOfBars
          fromZero
          yAxisLabel=""
          yAxisSuffix=""
        />
      );
    } else if (type === 'pie') {
      const pieData = data.labels.map((label, index) => {
        return {
          name: label,
          value: data.values[index],
          color: data.colors?.[index] || `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 1)`,
          legendFontColor: theme.colors.text,
          legendFontSize: 12
        };
      });
      
      return (
        <PieChart
          data={pieData}
          width={screenWidth}
          height={220}
          chartConfig={chartConfig}
          accessor="value"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
        />
      );
    }
    
    return null;
  };
  
  const renderTaskList = () => {
    if (!tasks || tasks.length === 0) return null;
    
    return (
      <View style={styles.taskListContainer}>
        <Text style={[styles.taskListTitle, { color: theme.colors.text }]}>
          İlgili Görevler
        </Text>
        {tasks.map((task) => (
          <View 
            key={task.id} 
            style={[
              styles.taskItem, 
              { 
                backgroundColor: theme.colors.background,
                borderLeftColor: 
                  task.priority === 'high' 
                    ? theme.colors.error 
                    : task.priority === 'medium' 
                      ? theme.colors.warning 
                      : theme.colors.success
              }
            ]}
          >
            <View style={styles.taskItemContent}>
              <Text 
                style={[
                  styles.taskTitle, 
                  { 
                    color: theme.colors.text,
                    textDecorationLine: task.status === 'completed' ? 'line-through' : 'none'
                  }
                ]}
              >
                {task.title}
              </Text>
              {task.description ? (
                <Text 
                  style={[styles.taskDescription, { color: theme.colors.secondaryText }]}
                  numberOfLines={2}
                >
                  {task.description}
                </Text>
              ) : null}
            </View>
            <View style={styles.taskStatus}>
              <Ionicons 
                name={task.status === 'completed' ? 'checkmark-circle' : 'time-outline'} 
                size={18} 
                color={
                  task.status === 'completed' 
                    ? theme.colors.success 
                    : theme.colors.warning
                } 
              />
            </View>
          </View>
        ))}
      </View>
    );
  };
  
  const renderTabs = () => {
    if (!tasks || tasks.length === 0) return null;
    
    return (
      <View style={styles.tabContainer}>
        <Pressable
          style={[
            styles.tabButton,
            activeTab === 'chart' && [
              styles.activeTabButton,
              { borderBottomColor: theme.colors.primary }
            ]
          ]}
          onPress={() => setActiveTab('chart')}
        >
          <Text
            style={[
              styles.tabButtonText,
              { color: theme.colors.text },
              activeTab === 'chart' && { color: theme.colors.primary }
            ]}
          >
            Grafik
          </Text>
        </Pressable>
        <Pressable
          style={[
            styles.tabButton,
            activeTab === 'tasks' && [
              styles.activeTabButton,
              { borderBottomColor: theme.colors.primary }
            ]
          ]}
          onPress={() => setActiveTab('tasks')}
        >
          <Text
            style={[
              styles.tabButtonText,
              { color: theme.colors.text },
              activeTab === 'tasks' && { color: theme.colors.primary }
            ]}
          >
            Görevler ({tasks.length})
          </Text>
        </Pressable>
      </View>
    );
  };
  
  const renderContent = () => {
    if (activeTab === 'chart') {
      return (
        <View style={styles.chartContainer}>
          {renderChart()}
        </View>
      );
    } else {
      return renderTaskList();
    }
  };
  
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.centeredView}>
        <MotiView
          from={{ opacity: 0, translateY: 50 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 300 }}
          style={[
            styles.modalView,
            { backgroundColor: theme.colors.card }
          ]}
        >
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              {title}
            </Text>
            <TouchableOpacity
              onPress={handleClose}
              style={styles.closeButton}
              hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
            >
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
          
          {renderTabs()}
          
          <ScrollView 
            style={styles.modalContent}
            showsVerticalScrollIndicator={false}
          >
            {renderContent()}
          </ScrollView>
        </MotiView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20
  },
  modalView: {
    width: '100%',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    maxHeight: '80%'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto'
  },
  closeButton: {
    padding: 4
  },
  modalContent: {
    flex: 1
  },
  chartContainer: {
    alignItems: 'center',
    marginBottom: 20
  },
  taskListContainer: {
    marginTop: 10
  },
  taskListTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto'
  },
  taskItem: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 4
  },
  taskItemContent: {
    flex: 1
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto'
  },
  taskDescription: {
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto'
  },
  taskStatus: {
    justifyContent: 'center',
    paddingLeft: 8
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)'
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center'
  },
  activeTabButton: {
    borderBottomWidth: 2
  },
  tabButtonText: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto'
  }
});