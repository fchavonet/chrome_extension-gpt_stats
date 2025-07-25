/**********************************
* USER ACTIVITY TRACKING BEHAVIOR *
**********************************/

let tabIsActive = false;
let timerIntervalId = null;

// Check if the URL matches ChatGPT.
function isGoodUrl(url) {
	if (!url) {
		return false;
	}

	if (url.startsWith("https://chatgpt.com") || url.startsWith("https://chat.openai.com")) {
		return true;
	}

	return false;
}

function startTimer() {
	if (timerIntervalId === null) {
		timerIntervalId = setInterval(function () {
			// Get today's date as "YYYY-MM-DD".
			const currentDate = new Date().toISOString().slice(0, 10);

			chrome.storage.local.get({ dailyUsage: {} }, function (result) {
				const usageStats = result.dailyUsage;

				// Initialize the day if not present.
				if (!usageStats[currentDate]) {
					usageStats[currentDate] = 0;
				}

				// Add 1 second to today's usage
				usageStats[currentDate] += 1;

				chrome.storage.local.set({ dailyUsage: usageStats });
			});
		}, 1000);
	}
}

// Stop the timer.
function stopTimer() {
	if (timerIntervalId !== null) {
		clearInterval(timerIntervalId);
		timerIntervalId = null;
	}
}

// Ensure storage is initialized.
function initializeStorage() {
	chrome.storage.local.get({ dailyUsage: {}, promptUsage: 0 }, function (result) {
		chrome.storage.local.set({
			dailyUsage: result.dailyUsage || {},
			promptUsage: result.promptUsage || 0
		});
	});
}

// On extension install or browser startup.
chrome.runtime.onInstalled.addListener(initializeStorage);
chrome.runtime.onStartup.addListener(initializeStorage);

// Start timer if active tab is already ChatGPT.
chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
	const currentTab = tabs[0];
	if (currentTab && isGoodUrl(currentTab.url)) {
		tabIsActive = true;
		startTimer();
	}
});

// On tab change.
chrome.tabs.onActivated.addListener(function (info) {
	chrome.tabs.get(info.tabId, function (activeTab) {
		if (isGoodUrl(activeTab.url)) {
			tabIsActive = true;
			startTimer();
		} else {
			tabIsActive = false;
			stopTimer();
		}
	});
});

// On navigation or internal page change.
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
	if (tab.active && changeInfo.status === "complete") {
		if (isGoodUrl(tab.url)) {
			tabIsActive = true;
			startTimer();
		} else {
			tabIsActive = false;
			stopTimer();
		}
	}
});

// On window focus change.
chrome.windows.onFocusChanged.addListener(function (newWindowId) {
	if (newWindowId === chrome.windows.WINDOW_ID_NONE) {
		// No window is focused.
		stopTimer();
		return;
	}

	chrome.tabs.query({ active: true, windowId: newWindowId }, function (tabs) {
		const activeTab = tabs[0];
		if (activeTab && isGoodUrl(activeTab.url)) {
			tabIsActive = true;
			startTimer();
		} else {
			tabIsActive = false;
			stopTimer();
		}
	});
});

// Respond to "popup.js" asking for stored data.
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
	if (message === "getTimerUsage") {
		chrome.storage.local.get({ dailyUsage: {} }, function (result) {
			sendResponse({ dailyUsage: result.dailyUsage });
		});
		return true;
	}

	if (message === "getPromptUsage") {
		chrome.storage.local.get({ promptUsage: 0 }, function (result) {
			sendResponse({ promptUsage: result.promptUsage });
		});
		return true;
	}

	if (message.type === "incrementPrompt") {
		const today = new Date();
		const key =
			today.getFullYear() + "-" + String(today.getMonth() + 1).padStart(2, "0") + "-" + String(today.getDate()).padStart(2, "0");

		chrome.storage.local.get(["dailyPromptCount", "promptUsage"], function (result) {
			const dailyPromptCount = result.dailyPromptCount || {};
			const promptUsage = result.promptUsage || 0;

			if (!dailyPromptCount[key]) {
				dailyPromptCount[key] = 0;
			}

			dailyPromptCount[key] += 1;

			chrome.storage.local.set({
				dailyPromptCount: dailyPromptCount,
				promptUsage: promptUsage + 1
			});
		});
	}
});