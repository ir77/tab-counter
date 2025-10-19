/// <reference types="npm:@types/chrome" />

import type { StorageData } from "./domain/types.ts";
import { calculateUpdatedStats } from "./domain/stats_calculator.ts";
import { determineBadgeColor } from "./domain/badge_color.ts";

// Chrome API操作: タブ数を取得
export async function getTabCount(): Promise<number> {
  const tabs = await chrome.tabs.query({});
  return tabs.length;
}

// Chrome API操作: ストレージからデータを取得
export async function getStorageData(): Promise<StorageData> {
  return await chrome.storage.local.get([
    "dailyStats",
    "tabCount",
    "lastPreviousDayCount",
  ]);
}

// Chrome API操作: バッジのテキストを設定
export function setBadgeText(text: string): void {
  chrome.action.setBadgeText({ text });
}

// Chrome API操作: バッジの背景色を設定
export function setBadgeColor(color: string): void {
  chrome.action.setBadgeBackgroundColor({ color });
}

// Chrome API操作: ストレージにデータを保存
export async function saveStorageData(data: StorageData): Promise<void> {
  await chrome.storage.local.set(data);
}

// タブの数を更新する非同期関数
async function updateTabCount(): Promise<void> {
  const tabCount = await getTabCount();

  const {
    dailyStats,
    tabCount: lastStoredTabCount,
    lastPreviousDayCount,
  }: StorageData = await getStorageData();

  setBadgeText(tabCount.toString());

  const color = determineBadgeColor(
    tabCount,
    dailyStats,
    lastPreviousDayCount,
  );
  setBadgeColor(color);

  const updatedStorageData: StorageData = calculateUpdatedStats(
    tabCount,
    dailyStats,
    lastStoredTabCount,
    lastPreviousDayCount,
  );
  await saveStorageData(updatedStorageData);
}

chrome.runtime.onStartup.addListener(updateTabCount); // Chrome起動時
chrome.runtime.onInstalled.addListener(updateTabCount); // 拡張機能インストール時
chrome.tabs.onCreated.addListener(updateTabCount); // 新しいタブが作成された時
chrome.tabs.onRemoved.addListener(updateTabCount); // タブが閉じられた時
