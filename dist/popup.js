const tabCountElement = document.getElementById("tabCount");
const highCountElement = document.getElementById("highCount");
const lowCountElement = document.getElementById("lowCount");
const previousDayContainer = document.getElementById("previousDayContainer");
const previousDayLastCountElement = document.getElementById("previousDayLastCount");
function updateTabCountDisplay(element, count) {
    if (!element) return;
    element.textContent = count !== undefined ? count.toString() : "...";
}
function updateDailyStatsDisplay(highElement, lowElement, stats) {
    if (!highElement || !lowElement) return;
    if (stats) {
        highElement.textContent = stats.high.toString();
        lowElement.textContent = stats.low.toString();
    } else {
        highElement.textContent = "...";
        lowElement.textContent = "...";
    }
}
function updatePreviousDayDisplay(container, countElement, count) {
    if (!container || !countElement) return;
    if (count !== undefined && count !== null) {
        countElement.textContent = count.toString();
    } else {
        countElement.textContent = "データなし";
    }
}
function updateUI() {
    chrome.storage.local.get([
        "tabCount",
        "dailyStats",
        "lastAvailablePreviousDayCount"
    ], (result)=>{
        updateTabCountDisplay(tabCountElement, result.tabCount);
        updateDailyStatsDisplay(highCountElement, lowCountElement, result.dailyStats);
        updatePreviousDayDisplay(previousDayContainer, previousDayLastCountElement, result.lastAvailablePreviousDayCount);
    });
}
updateUI();
chrome.storage.onChanged.addListener((changes, namespace)=>{
    if (namespace === "local") {
        if (changes.tabCount) {
            updateTabCountDisplay(tabCountElement, changes.tabCount.newValue);
        }
        if (changes.dailyStats) {
            updateDailyStatsDisplay(highCountElement, lowCountElement, changes.dailyStats.newValue);
        }
        if (changes.lastAvailablePreviousDayCount) {
            updatePreviousDayDisplay(previousDayContainer, previousDayLastCountElement, changes.lastAvailablePreviousDayCount.newValue);
        }
    }
});
export { updateTabCountDisplay as updateTabCountDisplay };
export { updateDailyStatsDisplay as updateDailyStatsDisplay };
export { updatePreviousDayDisplay as updatePreviousDayDisplay };
export { updateUI as updateUI };
