// UI要素を取得
const tabCountElement = document.getElementById('tabCount');

// ストレージからタブ数を読み込んで表示する関数
function displayTabCount() {
  chrome.storage.local.get(['tabCount'], (result) => {
    // ストレージに値があれば表示、なければ'...'を表示
    const count = result.tabCount !== undefined ? result.tabCount : '...';
    tabCountElement.textContent = count;
  });
}

// ポップアップが開かれたときに一度実行
displayTabCount();

// ストレージの値が変更されたときに表示を更新
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' && changes.tabCount) {
    tabCountElement.textContent = changes.tabCount.newValue;
  }
});
