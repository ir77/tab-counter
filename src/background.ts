/// <reference types="npm:@types/chrome" />

import type { DailyStats, StorageData } from "./types.ts";

// 新しい統計情報を計算する
function calculateUpdatedStats(
  currentTabCount: number,
  dailyStats: DailyStats | undefined,
  lastStoredTabCount: number | undefined,
  lastAvailablePreviousDayCount: number | undefined,
): { todayStats: DailyStats; newPreviousDayCount: number | undefined } {
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

// バッジの背景色を決定する関数
function determineBadgeColor(
  tabCount: number,
  dailyStats: DailyStats | undefined,
  lastAvailablePreviousDayCount: number | undefined,
): "green" | "red" {
  const today = new Date().toLocaleDateString("sv-SE");

  // OR条件：いずれかを満たせば緑（良い状態）
  // 1. 現在のタブ数が5以下
  if (tabCount <= 5) {
    return "green";
  }
  // 2. 前日の最終タブ数以下
  if (
    lastAvailablePreviousDayCount !== undefined &&
    lastAvailablePreviousDayCount !== null &&
    tabCount <= lastAvailablePreviousDayCount
  ) {
    return "green";
  }
  // 3. 今日の最低タブ数以下
  if (dailyStats && dailyStats.date === today && tabCount <= dailyStats.low) {
    return "green";
  }

  // どの条件も満たさない場合は赤（悪い状態）
  return "red";
}

// タブの数を更新する非同期関数
async function updateTabCount(): Promise<void> {
  const tabCount = await chrome.tabs.query({}).then((tabs) => tabs.length);

  const {
    dailyStats,
    tabCount: lastStoredTabCount,
    lastAvailablePreviousDayCount,
  }: StorageData = await chrome.storage.local.get([
    "dailyStats",
    "tabCount",
    "lastAvailablePreviousDayCount",
  ]);

  // バッジの背景色を決定して設定
  const color = determineBadgeColor(
    tabCount,
    dailyStats,
    lastAvailablePreviousDayCount,
  );
  chrome.action.setBadgeBackgroundColor({ color: color });

  // 拡張機能アイコンのバッジにタブ数を表示
  chrome.action.setBadgeText({ text: tabCount.toString() });

  const { todayStats, newPreviousDayCount } = calculateUpdatedStats(
    tabCount,
    dailyStats,
    lastStoredTabCount,
    lastAvailablePreviousDayCount,
  );

  const dataToSet: StorageData = {
    tabCount: tabCount,
    dailyStats: todayStats,
    lastAvailablePreviousDayCount: newPreviousDayCount,
  };

  await chrome.storage.local.set(dataToSet);
}

chrome.runtime.onStartup.addListener(updateTabCount); // Chrome起動時
chrome.runtime.onInstalled.addListener(updateTabCount); // 拡張機能インストール時
chrome.tabs.onCreated.addListener(updateTabCount); // 新しいタブが作成された時
chrome.tabs.onRemoved.addListener(updateTabCount); // タブが閉じられた時
