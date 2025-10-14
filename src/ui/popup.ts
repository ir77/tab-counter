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

export function updateDailyStatsDisplay(
  highElement: HTMLElement | null,
  lowElement: HTMLElement | null,
  stats?: DailyStats,
) {
  if (!highElement || !lowElement) return;

  if (stats) {
    highElement.textContent = stats.high.toString();
    lowElement.textContent = stats.low.toString();
  } else {
    highElement.textContent = "...";
    lowElement.textContent = "...";
  }
}

export function updatePreviousDayDisplay(
  container: HTMLElement | null,
  countElement: HTMLElement | null,
  count?: number,
) {
  if (!container || !countElement) return;

  if (count !== undefined && count !== null) {
    countElement.textContent = count.toString();
  } else {
    countElement.textContent = "データなし";
  }
}

// ---- Main Logic ----

// ストレージから値を読み込んで表示する関数
export function updateUI() {
  chrome.storage.local.get([
    "tabCount",
    "dailyStats",
    "lastAvailablePreviousDayCount",
  ], (result: StorageData) => {
    updateTabCountDisplay(tabCountElement, result.tabCount);
    updateDailyStatsDisplay(
      highCountElement,
      lowCountElement,
      result.dailyStats,
    );
    updatePreviousDayDisplay(
      previousDayContainer,
      previousDayLastCountElement,
      result.lastAvailablePreviousDayCount,
    );
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
        updateDailyStatsDisplay(
          highCountElement,
          lowCountElement,
          changes.dailyStats.newValue,
        );
      }
      if (changes.lastAvailablePreviousDayCount) {
        updatePreviousDayDisplay(
          previousDayContainer,
          previousDayLastCountElement,
          changes.lastAvailablePreviousDayCount.newValue,
        );
      }
    }
  },
);
