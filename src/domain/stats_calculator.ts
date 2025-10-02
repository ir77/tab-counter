import type { DailyStats, StorageData } from "./types.ts";

/**
 * 現在のタブ数と既存の統計情報を基に日次統計を更新します。
 * 前日のタブ数を必要に応じて繰り越し、保存用データを返します。
 */
export function calculateUpdatedStats(
  currentTabCount: number,
  dailyStats: DailyStats | undefined,
  lastStoredTabCount: number | undefined,
  lastAvailablePreviousDayCount: number | undefined,
): StorageData {
  const today = new Date().toLocaleDateString("sv-SE");

  let todayStats: DailyStats;
  let newPreviousDayCount: number | undefined = lastAvailablePreviousDayCount;

  if (!dailyStats || dailyStats.date !== today) {
    if (dailyStats) {
      newPreviousDayCount = lastStoredTabCount;
    }
    todayStats = {
      date: today,
      high: currentTabCount,
      low: currentTabCount,
    };
  } else {
    todayStats = {
      ...dailyStats,
      high: Math.max(dailyStats.high, currentTabCount),
      low: Math.min(dailyStats.low, currentTabCount),
    };
  }

  return {
    tabCount: currentTabCount,
    dailyStats: todayStats,
    lastAvailablePreviousDayCount: newPreviousDayCount,
  };
}
