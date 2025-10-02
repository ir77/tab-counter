export interface DailyStats {
  date: string;
  high: number;
  low: number;
}

export interface StorageData {
  dailyStats?: DailyStats;
  tabCount?: number;
  lastAvailablePreviousDayCount?: number;
}
