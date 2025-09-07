/**
 * 現在開いているタブの数を取得します。
 * @returns {Promise<number>} タブの数を解決するPromise。
 */
export async function getTabCount() {
  const tabs = await chrome.tabs.query({});
  return tabs.length;
}
