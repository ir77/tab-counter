import { STORAGE_KEYS } from './constants.js';

/**
 * 拡張機能のバッジを更新する
 * @param {number} count - 表示するタブ数
 */
function updateBadge(count) {
  chrome.action.setBadgeText({ text: count.toString() });
  chrome.action.setBadgeBackgroundColor({ color: '#4688F1' });
}

/**
 * 日々の統計データを計算・更新する
 * @param {number} currentTabCount - 現在のタブ数
 * @returns {Promise<object>} ストレージに保存するためのデータオブジェクト
 */
async function calculateNextStats(currentTabCount) {
  const todayStr = new Date().toLocaleDateString('sv-SE');
  const storageKeyList = Object.values(STORAGE_KEYS);
  const result = await chrome.storage.local.get(storageKeyList);

  const dailyStats = result[STORAGE_KEYS.DAILY_STATS];
  const lastStoredTabCount = result[STORAGE_KEYS.TAB_COUNT];
  const previousDayTabCount = result[STORAGE_KEYS.PREVIOUS_DAY_COUNT];

  let newDailyStats;
  let newPreviousDayCount = previousDayTabCount;

  const isNewDay = !dailyStats || dailyStats.date !== todayStr;

  if (isNewDay) {
    // 新しい日になった場合
    if (dailyStats) {
      // 前日の最後のタブ数を保存
      newPreviousDayCount = lastStoredTabCount;
    }
    // 新しい統計データを作成
    newDailyStats = {
      date: todayStr,
      high: currentTabCount,
      low: currentTabCount,
    };
  } else {
    // 同じ日の場合、最高値と最低値を更新
    newDailyStats = {
      ...dailyStats,
      high: Math.max(dailyStats.high, currentTabCount),
      low: Math.min(dailyStats.low, currentTabCount),
    };
  }

  const dataToSet = {
    [STORAGE_KEYS.TAB_COUNT]: currentTabCount,
    [STORAGE_KEYS.DAILY_STATS]: newDailyStats,
  };

  // 前日のカウントが更新された場合のみ、データに含める
  if (newPreviousDayCount !== undefined) {
    dataToSet[STORAGE_KEYS.PREVIOUS_DAY_COUNT] = newPreviousDayCount;
  }

  return dataToSet;
}

/**
 * タブ情報を全体的に更新するメイン関数
 */
async function mainUpdater() {
  const count = await chrome.tabs.query({}).length;
  updateBadge(count);
  const dataToStore = await calculateNextStats(count);
  await chrome.storage.local.set(dataToStore);
}

// イベントリスナーを設定
chrome.runtime.onStartup.addListener(mainUpdater);
chrome.runtime.onInstalled.addListener(mainUpdater);
chrome.tabs.onCreated.addListener(mainUpdater);
chrome.tabs.onRemoved.addListener(mainUpdater);
