function calculateUpdatedStats(currentTabCount, dailyStats, lastStoredTabCount, lastAvailablePreviousDayCount) {
    const today = new Date().toLocaleDateString("sv-SE");
    let todayStats;
    let newPreviousDayCount = lastAvailablePreviousDayCount;
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
        todayStats,
        newPreviousDayCount
    };
}
function determineBadgeColor(tabCount, dailyStats, lastAvailablePreviousDayCount) {
    const today = new Date().toLocaleDateString("sv-SE");
    if (tabCount <= 5) {
        return "green";
    }
    if (lastAvailablePreviousDayCount !== undefined && lastAvailablePreviousDayCount !== null && tabCount <= lastAvailablePreviousDayCount) {
        return "green";
    }
    if (dailyStats && dailyStats.date === today && tabCount <= dailyStats.low) {
        return "green";
    }
    return "red";
}
async function updateTabCount() {
    const tabCount = await chrome.tabs.query({}).then((tabs)=>tabs.length);
    const { dailyStats, tabCount: lastStoredTabCount, lastAvailablePreviousDayCount } = await chrome.storage.local.get([
        "dailyStats",
        "tabCount",
        "lastAvailablePreviousDayCount"
    ]);
    chrome.action.setBadgeText({
        text: tabCount.toString()
    });
    const color = determineBadgeColor(tabCount, dailyStats, lastAvailablePreviousDayCount);
    chrome.action.setBadgeBackgroundColor({
        color: color
    });
    const { todayStats, newPreviousDayCount } = calculateUpdatedStats(tabCount, dailyStats, lastStoredTabCount, lastAvailablePreviousDayCount);
    const dataToSet = {
        tabCount: tabCount,
        dailyStats: todayStats,
        lastAvailablePreviousDayCount: newPreviousDayCount
    };
    await chrome.storage.local.set(dataToSet);
}
chrome.runtime.onStartup.addListener(updateTabCount);
chrome.runtime.onInstalled.addListener(updateTabCount);
chrome.tabs.onCreated.addListener(updateTabCount);
chrome.tabs.onRemoved.addListener(updateTabCount);
