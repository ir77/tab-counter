// UI要素を取得
const tabCountElement = document.getElementById('tabCount');
const highCountElement = document.getElementById('highCount');
const lowCountElement = document.getElementById('lowCount');

// ストレージから値を読み込んで表示する関数
function updateUI() {
  chrome.storage.local.get(['tabCount', 'dailyStats'], (result) => {
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
  }
});
