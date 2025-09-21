const tabCountElement = document.getElementById('tabCount');
const highCountElement = document.getElementById('highCount');
const lowCountElement = document.getElementById('lowCount');
const previousDayContainer = document.getElementById('previousDayContainer');
const previousDayLastCountElement = document.getElementById('previousDayLastCount');
function updateTabCountDisplay(count) {
    tabCountElement.textContent = count !== undefined ? count : '...';
}
function updateDailyStatsDisplay(stats) {
    if (stats) {
        highCountElement.textContent = stats.high;
        lowCountElement.textContent = stats.low;
    } else {
        highCountElement.textContent = '...';
        lowCountElement.textContent = '...';
    }
}
function updatePreviousDayDisplay(count) {
    if (count !== undefined && count !== null) {
        previousDayLastCountElement.textContent = count;
        previousDayContainer.style.display = 'block';
    } else {
        previousDayContainer.style.display = 'none';
    }
}
function updateUI() {
    chrome.storage.local.get([
        'tabCount',
        'dailyStats',
        'lastAvailablePreviousDayCount'
    ], (result)=>{
        updateTabCountDisplay(result.tabCount);
        updateDailyStatsDisplay(result.dailyStats);
        updatePreviousDayDisplay(result.lastAvailablePreviousDayCount);
    });
}
updateUI();
chrome.storage.onChanged.addListener((changes, namespace)=>{
    if (namespace === 'local') {
        if (changes.tabCount) {
            updateTabCountDisplay(changes.tabCount.newValue);
        }
        if (changes.dailyStats) {
            updateDailyStatsDisplay(changes.dailyStats.newValue);
        }
        if (changes.lastAvailablePreviousDayCount) {
            updatePreviousDayDisplay(changes.lastAvailablePreviousDayCount.newValue);
        }
    }
});
