import { getTabCount } from './common.js';

// タブの数を更新する非同期関数
async function updateTabCount() {
  const tabCount = await getTabCount();

  // 拡張機能アイコンのバッジにタブ数を表示
  chrome.action.setBadgeText({ text: tabCount.toString() });
  // バッジの背景色を青に設定（オプション）
  chrome.action.setBadgeBackgroundColor({ color: '#4688F1' });

  // ストレージにタブ数を保存
  await chrome.storage.local.set({ tabCount: tabCount });
}

// 拡張機能がインストールされた、またはChromeが起動した時に一度実行
chrome.runtime.onStartup.addListener(updateTabCount);
chrome.runtime.onInstalled.addListener(updateTabCount);

// 新しいタブが作成された時に実行
chrome.tabs.onCreated.addListener(updateTabCount);

// タブが閉じられた時に実行
chrome.tabs.onRemoved.addListener(updateTabCount);
