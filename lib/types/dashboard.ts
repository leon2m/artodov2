export interface ChartItem {
  name: string;
  count: number;
  color: string;
}

export interface DashboardChartData {
  categories: ChartItem[];
  priorities: ChartItem[];
}

export interface TaskStats {
  pending: number;
  completed: number;
  total: number;
  progress: number;
}

export interface WeeklyProgressData {
  date: string;
  completed: number;
  total: number;
  percentage: number;
}

export interface SuccessRateData {
  rate: number;
  completedCount: number;
  totalCount: number;
  weeklyGoal: number;
} 