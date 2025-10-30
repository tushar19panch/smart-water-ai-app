export interface WaterDataPoint {
  timestamp: string;
  flowRate: number; // Liters per minute
}

export interface ZoneData {
  zoneId: string;
  name: string;
  data: WaterDataPoint[];
}

export type Severity = 'High' | 'Medium' | 'Low';

export interface Alert {
  zoneId: string;
  zoneName: string;
  timestamp: string;
  severity: Severity;
  reason: string;
}

export interface AnalysisResult {
  alerts: Alert[];
  summary: string;
}

export interface Stat {
  name: string;
  value: string;
  change?: string;
  changeType?: 'increase' | 'decrease';
}

export interface ForecastResult {
  forecast: WaterDataPoint[];
  summary: string;
}
