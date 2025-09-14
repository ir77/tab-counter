import { getTabCount } from './common.js';

// 毎日の統計を更新する
async function updateDailyStats(currentTabCount) {
  const today = new Date().toLocaleDateString('sv-SE');
  const { dailyStats, tabCount: lastStoredTabCount, lastAvailablePreviousDayCount } = await chrome.storage.local.get(['dailyStats', 'tabCount', 'lastAvailablePreviousDayCount']);

  let todayStats;
  let newPreviousDayCount = lastAvailablePreviousDayCount;

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

  const dataToSet = {
    dailyStats: todayStats
  };

  if (newPreviousDayCount !== undefined) {
    dataToSet.lastAvailablePreviousDayCount = newPreviousDayCount;
  }

  return dataToSet;
}

// タブの数を更新する非同期関数
async function updateTabCount() {
  const tabCount = await getTabCount();

  // 拡張機能アイコンのバッジにタブ数を表示
  chrome.action.setBadgeText({ text: tabCount.toString() });
  chrome.action.setBadgeBackgroundColor({ color: '#4688F1' });

  const statsData = await updateDailyStats(tabCount);

  const dataToSet = {
    tabCount: tabCount,
    ...statsData
  };

  await chrome.storage.local.set(dataToSet);
}

chrome.runtime.onStartup.addListener(updateTabCount); // Chrome起動時
chrome.runtime.onInstalled.addListener(updateTabCount); // 拡張機能インストール時
chrome.tabs.onCreated.addListener(updateTabCount); // 新しいタブが作成された時
chrome.tabs.onRemoved.addListener(updateTabCount); // タブが閉じられた時
