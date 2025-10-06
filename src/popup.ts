/// <reference types="npm:@types/chrome" />
import { DailyStats, StorageData } from "./domain/types.ts";

// UI要素を取得（テスト環境では実行されない）
const tabCountElement = typeof document !== "undefined"
  ? document.getElementById("tabCount")
  : null;
const highCountElement = typeof document !== "undefined"
  ? document.getElementById("highCount")
  : null;
const lowCountElement = typeof document !== "undefined"
  ? document.getElementById("lowCount")
  : null;
const previousDayContainer = typeof document !== "undefined"
  ? document.getElementById("previousDayContainer")
  : null;
const previousDayLastCountElement = typeof document !== "undefined"
  ? document.getElementById("previousDayLastCount")
  : null;

// ---- Helper Functions for UI Update ----

export function updateTabCountDisplay(
  count?: number,
  element: HTMLElement | null = tabCountElement,
) {
  if (!element) return;

  element.textContent = count !== undefined ? count.toString() : "...";
}

export function updateDailyStatsDisplay(
  stats?: DailyStats,
  highElement: HTMLElement | null = highCountElement,
  lowElement: HTMLElement | null = lowCountElement,
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
  count?: number,
  container: HTMLElement | null = previousDayContainer,
  lastCountElement: HTMLElement | null = previousDayLastCountElement,
) {
  if (!container || !lastCountElement) return;

  if (count !== undefined && count !== null) {
    lastCountElement.textContent = count.toString();
    container.style.display = "block";
  } else {
    container.style.display = "none";
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
    updateTabCountDisplay(result.tabCount);
    updateDailyStatsDisplay(result.dailyStats);
    updatePreviousDayDisplay(result.lastAvailablePreviousDayCount);
  });
}

// ポップアップが開かれたときに一度実行（テスト環境では実行されない）
if (typeof chrome !== "undefined" && chrome.storage) {
  updateUI();

  // ストレージの値が変更されたときに表示を更新
  chrome.storage.onChanged.addListener(
    (
      changes: { [key: string]: chrome.storage.StorageChange },
      namespace: string,
    ) => {
      if (namespace === "local") {
        if (changes.tabCount) {
          updateTabCountDisplay(changes.tabCount.newValue);
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
}
