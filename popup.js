import { STORAGE_KEYS } from './constants.js';

// UI要素の取得
const tabCountElement = document.getElementById('tabCount');
const highCountElement = document.getElementById('highCount');
const lowCountElement = document.getElementById('lowCount');
const previousDayContainer = document.getElementById('previousDayContainer');
const previousDayLastCountElement = document.getElementById('previousDayLastCount');

/**
 * UIをデータで更新する
 * @param {object} data - ストレージから取得したデータ
 */
function render(data) {
  const tabCount = data[STORAGE_KEYS.TAB_COUNT];
  const dailyStats = data[STORAGE_KEYS.DAILY_STATS];
  const previousDayTabCount = data[STORAGE_KEYS.PREVIOUS_DAY_COUNT];

  // 現在のタブ数を表示
  tabCountElement.textContent = tabCount !== undefined ? tabCount : '...';

  // 今日の最高・最低タブ数を表示
  if (dailyStats) {
    highCountElement.textContent = dailyStats.high;
    lowCountElement.textContent = dailyStats.low;
  } else {
    highCountElement.textContent = '...';
    lowCountElement.textContent = '...';
  }

  // 前日の最後の値を表示（値がある場合のみ）
  if (previousDayTabCount !== undefined && previousDayTabCount !== null) {
    previousDayLastCountElement.textContent = previousDayTabCount;
    previousDayContainer.style.display = 'block';
  } else {
    previousDayContainer.style.display = 'none';
  }
}

const storageKeyList = Object.values(STORAGE_KEYS);

// ポップアップを開いたときにUIを初期化・更新
chrome.storage.local.get(storageKeyList, (result) => {
  render(result);
});

// ストレージの値が変更されたときにUIを更新
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local') {
    // 変更があったキーの新しい値を取得し、現在の値とマージしてUIを更新
    chrome.storage.local.get(storageKeyList, (result) => {
      render(result);
    });
  }
});
