/// <reference types="npm:@types/chrome" />
import { DailyStats, StorageData } from "../domain/types.ts";

// UI要素を取得
const tabCountElement = document.getElementById("tabCount");
const highCountElement = document.getElementById("highCount");
const lowCountElement = document.getElementById("lowCount");
const previousDayContainer = document.getElementById("previousDayContainer");
const previousDayLastCountElement = document.getElementById(
  "previousDayLastCount",
);

// ---- Helper Functions for UI Update ----

export function updateTabCountDisplay(
  element: HTMLElement | null,
  count?: number,
) {
  if (!element) return;

  element.textContent = count !== undefined ? count.toString() : "...";
}

export function updateDailyStatsDisplay(stats?: DailyStats) {
  if (!highCountElement || !lowCountElement) return;

  if (stats) {
    highCountElement.textContent = stats.high.toString();
    lowCountElement.textContent = stats.low.toString();
  } else {
    highCountElement.textContent = "...";
    lowCountElement.textContent = "...";
  }
}

export function updatePreviousDayDisplay(count?: number) {
  if (!previousDayContainer || !previousDayLastCountElement) return;

  if (count !== undefined && count !== null) {
    previousDayLastCountElement.textContent = count.toString();
    previousDayContainer.style.display = "block";
  } else {
    previousDayContainer.style.display = "none";
  }
}

// ---- Main Logic ----

// ストレージから値を読み込んで表示する関数
function updateUI() {
  chrome.storage.local.get([
    "tabCount",
    "dailyStats",
    "lastAvailablePreviousDayCount",
  ], (result: StorageData) => {
    updateTabCountDisplay(tabCountElement, result.tabCount);
    updateDailyStatsDisplay(result.dailyStats);
    updatePreviousDayDisplay(result.lastAvailablePreviousDayCount);
  });
}

// ポップアップが開かれたときに一度実行
updateUI();

// ストレージの値が変更されたときに表示を更新
chrome.storage.onChanged.addListener(
  (
    changes: { [key: string]: chrome.storage.StorageChange },
    namespace: string,
  ) => {
    if (namespace === "local") {
      if (changes.tabCount) {
        updateTabCountDisplay(tabCountElement, changes.tabCount.newValue);
      }
      if (changes.dailyStats) {
        updateDailyStatsDisplay(changes.dailyStats.newValue);
      }
      if (changes.lastAvailablePreviousDayCount) {
        updatePreviousDayDisplay(
          changes.lastAvailablePreviousDayCount.newValue,
        );
      }
    }
  },
);
