/// <reference types="npm:@types/chrome" />

import type { StorageData } from "./domain/types.ts";
import { calculateUpdatedStats } from "./domain/stats_calculator.ts";
import { determineBadgeColor } from "./domain/badge_color.ts";

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

  chrome.action.setBadgeText({ text: tabCount.toString() });

  const color = determineBadgeColor(
    tabCount,
    dailyStats,
    lastAvailablePreviousDayCount,
  );
  chrome.action.setBadgeBackgroundColor({ color: color });

  const updatedStorageData: StorageData = calculateUpdatedStats(
    tabCount,
    dailyStats,
    lastStoredTabCount,
    lastAvailablePreviousDayCount,
  );
  await chrome.storage.local.set(updatedStorageData);
}

chrome.runtime.onStartup.addListener(updateTabCount); // Chrome起動時
chrome.runtime.onInstalled.addListener(updateTabCount); // 拡張機能インストール時
chrome.tabs.onCreated.addListener(updateTabCount); // 新しいタブが作成された時
chrome.tabs.onRemoved.addListener(updateTabCount); // タブが閉じられた時
