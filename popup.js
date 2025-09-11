// UI要素を取得
const tabCountElement = document.getElementById('tabCount');
const highCountElement = document.getElementById('highCount');
const lowCountElement = document.getElementById('lowCount');
const previousDayContainer = document.getElementById('previousDayContainer');
const previousDayLastCountElement = document.getElementById('previousDayLastCount');

// ストレージから値を読み込んで表示する関数
function updateUI() {
  chrome.storage.local.get(['tabCount', 'dailyStats', 'lastAvailablePreviousDayCount'], (result) => {
    // 現在のタブ数を表示
    const count = result.tabCount !== undefined ? result.tabCount : '...';
    tabCountElement.textContent = count;

    // 今日の最高・最低タブ数を表示
    if (result.dailyStats) {
      highCountElement.textContent = result.dailyStats.high;
      lowCountElement.textContent = result.dailyStats.low;
    } else {
      highCountElement.textContent = '...';
      lowCountElement.textContent = '...';
    }

    // 前日の最後の値を表示（値がある場合のみ）
    if (result.lastAvailablePreviousDayCount !== undefined && result.lastAvailablePreviousDayCount !== null) {
      previousDayLastCountElement.textContent = result.lastAvailablePreviousDayCount;
      previousDayContainer.style.display = 'block';
    } else {
      previousDayContainer.style.display = 'none';
    }
  });
}

// ポップアップが開かれたときに一度実行
updateUI();

// ストレージの値が変更されたときに表示を更新
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local') {
    if (changes.tabCount) {
      tabCountElement.textContent = changes.tabCount.newValue;
    }
    if (changes.dailyStats) {
      highCountElement.textContent = changes.dailyStats.newValue.high;
      lowCountElement.textContent = changes.dailyStats.newValue.low;
    }
    if (changes.lastAvailablePreviousDayCount) {
      const newValue = changes.lastAvailablePreviousDayCount.newValue;
      if (newValue !== undefined && newValue !== null) {
        previousDayLastCountElement.textContent = newValue;
        previousDayContainer.style.display = 'block';
      } else {
        previousDayContainer.style.display = 'none';
      }
    }
  }
});
