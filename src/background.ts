/// <reference types="npm:@types/chrome" />

import type { StorageData } from "./domain/types.ts";
import {
  calculateUpdatedStats,
  determineBadgeColor,
} from "./domain/tab_stats.ts";

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

  // 拡張機能アイコンのバッジにタブ数を表示
  chrome.action.setBadgeText({ text: tabCount.toString() });

  // バッジの背景色を決定して設定
  const color = determineBadgeColor(
    tabCount,
    dailyStats,
    lastAvailablePreviousDayCount,
  );
  chrome.action.setBadgeBackgroundColor({ color: color });

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
