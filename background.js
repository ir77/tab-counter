import { getTabCount } from './common.js';

// タブの数を更新する非同期関数
async function updateTabCount() {
  const tabCount = await getTabCount();

  // 拡張機能アイコンのバッジにタブ数を表示
  chrome.action.setBadgeText({ text: tabCount.toString() });
  // バッジの背景色を青に設定（オプション）
  chrome.action.setBadgeBackgroundColor({ color: '#4688F1' });

  // 今日の日付を YYYY-MM-DD 形式で取得
  const today = new Date().toLocaleDateString('sv-SE');
  // ストレージから必要なデータを取得
  const { dailyStats, tabCount: lastStoredTabCount, lastAvailablePreviousDayCount } = await chrome.storage.local.get(['dailyStats', 'tabCount', 'lastAvailablePreviousDayCount']);

  let todayStats;
  let newPreviousDayCount = lastAvailablePreviousDayCount; // デフォルトで既存の値を引き継ぐ

  // 今日の日付と保存されている日付が違う、またはデータがない場合
  if (!dailyStats || dailyStats.date !== today) {
    // dailyStatsが存在する場合（つまり、初回起動ではない新しい日）
    if (dailyStats) {
      // 前日の最後のタブ数としてlastStoredTabCountを保存
      newPreviousDayCount = lastStoredTabCount;
    }
    // 新しい統計データを作成
    todayStats = {
      date: today,
      high: tabCount,
      low: tabCount,
    };
  } else {
    // 保存されているデータがあれば、最高値と最低値を更新
    todayStats = {
      ...dailyStats,
      high: Math.max(dailyStats.high, tabCount),
      low: Math.min(dailyStats.low, tabCount),
    };
  }

  // ストレージに保存するデータを準備
  const dataToSet = {
    tabCount: tabCount,
    dailyStats: todayStats
  };

  // newPreviousDayCountがundefinedでない場合のみ保存
  if (newPreviousDayCount !== undefined) {
    dataToSet.lastAvailablePreviousDayCount = newPreviousDayCount;
  }

  // ストレージにデータを保存
  await chrome.storage.local.set(dataToSet);
}

// 拡張機能がインストールされた、またはChromeが起動した時に一度実行
chrome.runtime.onStartup.addListener(updateTabCount);
chrome.runtime.onInstalled.addListener(updateTabCount);

// 新しいタブが作成された時に実行
chrome.tabs.onCreated.addListener(updateTabCount);

// タブが閉じられた時に実行
chrome.tabs.onRemoved.addListener(updateTabCount);
