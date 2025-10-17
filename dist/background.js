function calculateUpdatedStats(currentTabCount, dailyStats, lastStoredTabCount, lastPreviousDayCount) {
    const today = new Date().toLocaleDateString("sv-SE");
    let todayStats;
    let newPreviousDayCount = lastPreviousDayCount;
    if (!dailyStats || dailyStats.date !== today) {
        if (dailyStats) {
            newPreviousDayCount = lastStoredTabCount;
        }
        todayStats = {
            date: today,
            high: currentTabCount,
            low: currentTabCount
        };
    } else {
        todayStats = {
            ...dailyStats,
            high: Math.max(dailyStats.high, currentTabCount),
            low: Math.min(dailyStats.low, currentTabCount)
        };
    }
    return {
        tabCount: currentTabCount,
        dailyStats: todayStats,
        lastPreviousDayCount: newPreviousDayCount
    };
}
function determineBadgeColor(tabCount, dailyStats, lastPreviousDayCount) {
    const today = new Date().toLocaleDateString("sv-SE");
    if (tabCount <= 5) {
        return "green";
    }
    if (lastPreviousDayCount !== undefined && lastPreviousDayCount !== null && tabCount <= lastPreviousDayCount) {
        return "green";
    }
    if (dailyStats && dailyStats.date === today && tabCount <= dailyStats.low) {
        return "green";
    }
    return "red";
}
async function updateTabCount() {
    const tabCount = await chrome.tabs.query({}).then((tabs)=>tabs.length);
    const { dailyStats, tabCount: lastStoredTabCount, lastPreviousDayCount } = await chrome.storage.local.get([
        "dailyStats",
        "tabCount",
        "lastPreviousDayCount"
    ]);
    chrome.action.setBadgeText({
        text: tabCount.toString()
    });
    const color = determineBadgeColor(tabCount, dailyStats, lastPreviousDayCount);
    chrome.action.setBadgeBackgroundColor({
        color: color
    });
    const updatedStorageData = calculateUpdatedStats(tabCount, dailyStats, lastStoredTabCount, lastPreviousDayCount);
    await chrome.storage.local.set(updatedStorageData);
}
chrome.runtime.onStartup.addListener(updateTabCount);
chrome.runtime.onInstalled.addListener(updateTabCount);
chrome.tabs.onCreated.addListener(updateTabCount);
chrome.tabs.onRemoved.addListener(updateTabCount);
