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

/**
 * タブ数の状況からバッジの色を判断します。
 * 閾値を下回る場合は緑色とし、それ以外は赤色を返します。
 */
export function determineBadgeColor(
  tabCount: number,
  dailyStats: DailyStats | undefined,
  lastAvailablePreviousDayCount: number | undefined,
): "green" | "red" {
  const today = new Date().toLocaleDateString("sv-SE");

  if (tabCount <= 5) {
    return "green";
  }

  if (
    lastAvailablePreviousDayCount !== undefined &&
    lastAvailablePreviousDayCount !== null &&
    tabCount <= lastAvailablePreviousDayCount
  ) {
    return "green";
  }

  if (dailyStats && dailyStats.date === today && tabCount <= dailyStats.low) {
    return "green";
  }

  return "red";
}
