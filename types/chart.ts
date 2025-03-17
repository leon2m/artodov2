export interface ChartData {
  labels: string[];
  values: number[];
  colors?: string[];
  datasets?: {
    data: number[];
    color?: (opacity?: number) => string;
    strokeWidth?: number;
  }[];
} 