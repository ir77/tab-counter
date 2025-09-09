import { getTabCount } from './common.js';

// タブの数を更新する非同期関数
async function updateTabCount() {
  const tabCount = await getTabCount();

  // 拡張機能アイコンのバッジにタブ数を表示
  chrome.action.setBadgeText({ text: tabCount.toString() });
  // バッジの背景色を青に設定（オプション）
  chrome.action.setBadgeBackgroundColor({ color: '#4688F1' });
}

chrome.runtime.onStartup.addListener(updateTabCount); // Chrome起動時
chrome.runtime.onInstalled.addListener(updateTabCount); // 拡張機能インストール時
chrome.tabs.onCreated.addListener(updateTabCount); // 新しいタブが作成された時
chrome.tabs.onRemoved.addListener(updateTabCount); // タブが閉じられた時
