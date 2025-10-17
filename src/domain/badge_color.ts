import type { DailyStats } from "./types.ts";

/**
 * タブ数の状況からバッジの色を判断します。
 * 閾値を下回る場合は緑色とし、それ以外は赤色を返します。
 */
export function determineBadgeColor(
  tabCount: number,
  dailyStats: DailyStats | undefined,
  lastPreviousDayCount: number | undefined,
): "green" | "red" {
  const today = new Date().toLocaleDateString("sv-SE");

  if (tabCount <= 5) {
    return "green";
  }

  if (
    lastPreviousDayCount !== undefined &&
    lastPreviousDayCount !== null &&
    tabCount <= lastPreviousDayCount
  ) {
    return "green";
  }

  if (dailyStats && dailyStats.date === today && tabCount <= dailyStats.low) {
    return "green";
  }

  return "red";
}
