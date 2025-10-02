import type { DailyStats } from "./types.ts";

export interface UpdatedStatsResult {
  todayStats: DailyStats;
  newPreviousDayCount: number | undefined;
}

export function calculateUpdatedStats(
  currentTabCount: number,
  dailyStats: DailyStats | undefined,
  lastStoredTabCount: number | undefined,
  lastAvailablePreviousDayCount: number | undefined,
): UpdatedStatsResult {
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

  return { todayStats, newPreviousDayCount };
}

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
