const tabCountElement = document.getElementById("tabCount");
const highCountElement = document.getElementById("highCount");
const lowCountElement = document.getElementById("lowCount");
const previousDayContainer = document.getElementById("previousDayContainer");
const previousDayLastCountElement = document.getElementById("previousDayLastCount");
function updateTabCountDisplay(element, count) {
    if (!element) return;
    element.textContent = count !== undefined ? count.toString() : "...";
}
function updateDailyStatsDisplay(stats) {
    if (!highCountElement || !lowCountElement) return;
    if (stats) {
        highCountElement.textContent = stats.high.toString();
        lowCountElement.textContent = stats.low.toString();
    } else {
        highCountElement.textContent = "...";
        lowCountElement.textContent = "...";
    }
}
function updatePreviousDayDisplay(count) {
    if (!previousDayContainer || !previousDayLastCountElement) return;
    if (count !== undefined && count !== null) {
        previousDayLastCountElement.textContent = count.toString();
        previousDayContainer.style.display = "block";
    } else {
        previousDayContainer.style.display = "none";
    }
}
function updateUI() {
    chrome.storage.local.get([
        "tabCount",
        "dailyStats",
        "lastAvailablePreviousDayCount"
    ], (result)=>{
        updateTabCountDisplay(tabCountElement, result.tabCount);
        updateDailyStatsDisplay(result.dailyStats);
        updatePreviousDayDisplay(result.lastAvailablePreviousDayCount);
    });
}
updateUI();
chrome.storage.onChanged.addListener((changes, namespace)=>{
    if (namespace === "local") {
        if (changes.tabCount) {
            updateTabCountDisplay(tabCountElement, changes.tabCount.newValue);
        }
        if (changes.dailyStats) {
            updateDailyStatsDisplay(changes.dailyStats.newValue);
        }
        if (changes.lastAvailablePreviousDayCount) {
            updatePreviousDayDisplay(changes.lastAvailablePreviousDayCount.newValue);
        }
    }
});
export { updateTabCountDisplay as updateTabCountDisplay };
export { updateDailyStatsDisplay as updateDailyStatsDisplay };
export { updatePreviousDayDisplay as updatePreviousDayDisplay };
