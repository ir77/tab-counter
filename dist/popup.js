var PopupElementId;
(function(PopupElementId) {
    PopupElementId["TabCount"] = "tabCount";
    PopupElementId["HighCount"] = "highCount";
    PopupElementId["LowCount"] = "lowCount";
    PopupElementId["PreviousDayContainer"] = "previousDayContainer";
    PopupElementId["PreviousDayLastCount"] = "previousDayLastCount";
})(PopupElementId || (PopupElementId = {}));
function getPopupElement(id, doc = document) {
    return doc.getElementById(id);
}
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
    const tabCountElement = getPopupElement(PopupElementId.TabCount);
    const highCountElement = getPopupElement(PopupElementId.HighCount);
    const lowCountElement = getPopupElement(PopupElementId.LowCount);
    const previousDayContainer = getPopupElement(PopupElementId.PreviousDayContainer);
    const previousDayLastCountElement = getPopupElement(PopupElementId.PreviousDayLastCount);
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
    const tabCountElement = getPopupElement(PopupElementId.TabCount);
    const highCountElement = getPopupElement(PopupElementId.HighCount);
    const lowCountElement = getPopupElement(PopupElementId.LowCount);
    const previousDayContainer = getPopupElement(PopupElementId.PreviousDayContainer);
    const previousDayLastCountElement = getPopupElement(PopupElementId.PreviousDayLastCount);
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
export { PopupElementId as PopupElementId };
export { getPopupElement as getPopupElement };
export { updateTabCountDisplay as updateTabCountDisplay };
export { updateDailyStatsDisplay as updateDailyStatsDisplay };
export { updatePreviousDayDisplay as updatePreviousDayDisplay };
export { updateUI as updateUI };
