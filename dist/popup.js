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
    chrome.storage.local.get([
        "tabCount",
        "dailyStats",
        "lastAvailablePreviousDayCount"
    ], (result)=>{
        updateTabCountDisplay(getPopupElement(PopupElementId.TabCount), result.tabCount);
        updateDailyStatsDisplay(getPopupElement(PopupElementId.HighCount), getPopupElement(PopupElementId.LowCount), result.dailyStats);
        updatePreviousDayDisplay(getPopupElement(PopupElementId.PreviousDayContainer), getPopupElement(PopupElementId.PreviousDayLastCount), result.lastAvailablePreviousDayCount);
    });
}
updateUI();
chrome.storage.onChanged.addListener((changes, namespace)=>{
    if (namespace === "local") {
        if (changes.tabCount) {
            updateTabCountDisplay(getPopupElement(PopupElementId.TabCount), changes.tabCount.newValue);
        }
        if (changes.dailyStats) {
            updateDailyStatsDisplay(getPopupElement(PopupElementId.HighCount), getPopupElement(PopupElementId.LowCount), changes.dailyStats.newValue);
        }
        if (changes.lastAvailablePreviousDayCount) {
            updatePreviousDayDisplay(getPopupElement(PopupElementId.PreviousDayContainer), getPopupElement(PopupElementId.PreviousDayLastCount), changes.lastAvailablePreviousDayCount.newValue);
        }
    }
});
export { PopupElementId as PopupElementId };
export { getPopupElement as getPopupElement };
export { updateTabCountDisplay as updateTabCountDisplay };
export { updateDailyStatsDisplay as updateDailyStatsDisplay };
export { updatePreviousDayDisplay as updatePreviousDayDisplay };
export { updateUI as updateUI };
