function updateDailyStats(currentTabCount, dailyStats, lastStoredTabCount, lastAvailablePreviousDayCount) {
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
    const dataToSet = {
        dailyStats: todayStats
    };
    if (newPreviousDayCount !== undefined) {
        dataToSet.lastAvailablePreviousDayCount = newPreviousDayCount;
    }
    return dataToSet;
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
    const { dailyStats } = await chrome.storage.local.get([
        "dailyStats"
    ]);
    const { tabCount: lastStoredTabCount } = await chrome.storage.local.get([
        "tabCount"
    ]);
    const { lastAvailablePreviousDayCount } = await chrome.storage.local.get([
        "lastAvailablePreviousDayCount"
    ]);
    const color = determineBadgeColor(tabCount, dailyStats, lastAvailablePreviousDayCount);
    chrome.action.setBadgeBackgroundColor({
        color: color
    });
    chrome.action.setBadgeText({
        text: tabCount.toString()
    });
    const statsData = await updateDailyStats(tabCount, dailyStats, lastStoredTabCount, lastAvailablePreviousDayCount);
    const dataToSet = {
        tabCount: tabCount,
        ...statsData
    };
    await chrome.storage.local.set(dataToSet);
}
chrome.runtime.onStartup.addListener(updateTabCount);
chrome.runtime.onInstalled.addListener(updateTabCount);
chrome.tabs.onCreated.addListener(updateTabCount);
chrome.tabs.onRemoved.addListener(updateTabCount);
