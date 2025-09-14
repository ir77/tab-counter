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
  const tabCount = await chrome.tabs.query({}).then(tabs => tabs.length);

  // 拡張機能アイコンのバッジにタブ数を表示
  chrome.action.setBadgeText({ text: tabCount.toString() });

  // --- バッジの背景色を決定するロジック ---
  const { dailyStats, lastAvailablePreviousDayCount } = await chrome.storage.local.get(['dailyStats', 'lastAvailablePreviousDayCount']);
  const today = new Date().toLocaleDateString('sv-SE');

  // 条件をすべて満たしているかどうかのフラグ
  let isGoodState = true;

  // 条件1: 「現在のタブ数」が5以下である
  if (tabCount > 5) {
    isGoodState = false;
  }

  // 条件2: 「前日の最後の値」以下である
  // Note: lastAvailablePreviousDayCount が未定義またはnullの場合は、この条件を無視します
  if (lastAvailablePreviousDayCount !== undefined && lastAvailablePreviousDayCount !== null && tabCount > lastAvailablePreviousDayCount) {
    isGoodState = false;
  }

  // 条件3: 「今日の最低値」を満たしている
  // Note: 今日の統計がまだない場合（その日最初のタブ更新）、この条件は常に満たされます
  if (dailyStats && dailyStats.date === today && tabCount > dailyStats.low) {
    isGoodState = false;
  }

  // 条件に基づいて背景色を設定
  const backgroundColor = isGoodState ? 'green' : 'red';
  chrome.action.setBadgeBackgroundColor({ color: backgroundColor });
  // --- ロジックここまで ---

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
