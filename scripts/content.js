// Confirm script injection.
console.log("✅ content.js successfully injected into the page.");

let extensionContextValid = true;

// Check if extension context is still valid.
function isExtensionContextValid() {
	try {
		return extensionContextValid && chrome.runtime && chrome.runtime.id;
	} catch (error) {
		extensionContextValid = false;
		return false;
	}
}

// Send message to background script with error handling.
function sendMessage(message, callback) {
	if (!isExtensionContextValid()) {
		console.log("Extension context invalidated, skipping message.");

		if (callback) {
			callback(null);
		}

		return;
	}

	try {
		chrome.runtime.sendMessage(message, function (response) {
			if (chrome.runtime.lastError) {
				console.log("Runtime error:", chrome.runtime.lastError.message);

				if (chrome.runtime.lastError.message.includes("context invalidated")) {
					extensionContextValid = false;
				}

				if (callback) {
					callback(null);
				}
			} else {
				if (callback) {
					callback(response);
				}
			}
		});
	} catch (error) {
		console.log("Failed to send message:", error.message);
		extensionContextValid = false;

		if (callback) {
			callback(null);
		}
	}
}

// Inject injected.js into the page.
function injectPromptCounterScript() {
	if (!isExtensionContextValid()) {
		return;
	}

	try {
		const script = document.createElement("script");
		script.src = chrome.runtime.getURL("scripts/injected.js");

		script.onload = function () {
			this.remove();
		};

		(document.head || document.documentElement).appendChild(script);
	} catch (error) {
		console.log("Failed to inject script:", error.message);
		extensionContextValid = false;
	}
}

// Listen for prompt usage event.
window.addEventListener("message", function (event) {
	if (
		event.source === window &&
		event.data &&
		event.data.source === "gpt-stats" &&
		event.data.type === "promptUsed"
	) {
		sendMessage({ type: "incrementPrompt" });
		updatePageCounter();
	}
});

let pageCounterElement = null;

// Detect if dark mode is currently active.
function isDarkMode() {
	return document.documentElement.classList.contains("dark") ||
		document.body.classList.contains("dark") ||
		window.matchMedia("(prefers-color-scheme: dark)").matches;
}

// Apply theme-appropriate styles to counter element.
function applyCounterTheme() {
	if (!pageCounterElement) return;

	const darkMode = isDarkMode();

	const baseStyle = `
        padding: 5px 10px;
        position: fixed;
        bottom: 20px;
        right: 20px;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
        font-size: 12px;
		border-radius: 10px;
        pointer-events: none;
        user-select: none;
        z-index: 10000;
    `;

	if (darkMode) {
		pageCounterElement.style.cssText = baseStyle + `
            color: rgb(250, 250, 250);
			border: 1px solid rgb(70, 70, 70);
            background: rgb(23, 23, 23);
        `;
	} else {
		pageCounterElement.style.cssText = baseStyle + `
            color: rgb(23, 23, 23);
			border: 1px solid rgb(229, 229, 229);
            background: rgb(255, 255, 255);
        `;
	}
}

// Create and display the page counter element.
function createPageCounter() {
	if (pageCounterElement) return;

	pageCounterElement = document.createElement("div");
	pageCounterElement.id = "gpt-stats-counter";

	applyCounterTheme();

	document.body.appendChild(pageCounterElement);
	updatePageCounter();
}

// Remove the page counter element.
function removePageCounter() {
	if (pageCounterElement) {
		pageCounterElement.remove();
		pageCounterElement = null;
	}
}

// Update counter display with current prompt usage.
function updatePageCounter() {
	if (!pageCounterElement || !isExtensionContextValid()) return;

	sendMessage("getPromptUsage", function (response) {
		if (pageCounterElement && response && response.promptUsage !== undefined) {
			pageCounterElement.innerHTML = `Total Prompt: <span style="font-family: monospace; font-weight: 800;">${response.promptUsage}</span>`;
		}
	});
}

// Handle messages from popup or background script.
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
	if (!isExtensionContextValid()) {
		sendResponse({ error: "Extension context invalidated." });
		return;
	}

	if (message.type === "toggleCounter") {
		if (message.show) {
			createPageCounter();
		} else {
			removePageCounter();
		}
	}

	sendResponse({ received: true });
});

// Initialize counter based on stored preferences.
function initializeCounter() {
	if (!isExtensionContextValid()) {
		return;
	}

	try {
		chrome.storage.local.get({ enableCounterOnPage: false }, function (result) {
			if (chrome.runtime.lastError) {
				console.log("Storage access failed:", chrome.runtime.lastError.message);

				if (chrome.runtime.lastError.message.includes("context invalidated")) {
					extensionContextValid = false;
				}

				return;
			}

			if (result.enableCounterOnPage) {
				setTimeout(createPageCounter, 1000);
			}
		});
	} catch (error) {
		console.log("Failed to access storage:", error.message);
		extensionContextValid = false;
	}
}

// Set up observers to detect theme changes.
function setupThemeObserver() {
	const observer = new MutationObserver(function (mutations) {
		mutations.forEach(function (mutation) {
			if (mutation.type === "attributes" &&
				(mutation.attributeName === "class" || mutation.attributeName === "data-theme")) {
				if (pageCounterElement) {
					applyCounterTheme();
				}
			}
		});
	});

	// Observe document element for theme changes.
	observer.observe(document.documentElement, {
		attributes: true,
		attributeFilter: ["class", "data-theme"]
	});

	// Observe document body for theme changes.
	observer.observe(document.body, {
		attributes: true,
		attributeFilter: ["class", "data-theme"]
	});

	// Listen for system theme preference changes.
	window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function () {
		if (pageCounterElement) {
			applyCounterTheme();
		}
	});
}

setTimeout(initializeCounter, 100);

// Start interval to update counter periodically.
const counterUpdateInterval = setInterval(function () {
	if (!isExtensionContextValid()) {
		clearInterval(counterUpdateInterval);

		console.log("Stopping counter updates - extension context invalidated.");

		return;
	}

	if (pageCounterElement) {
		updatePageCounter();
		applyCounterTheme();
	}
}, 2000);

// Initialize script injection and theme observer.
setTimeout(function () {
	try {
		injectPromptCounterScript();
		setupThemeObserver();
	} catch (error) {
		console.log("Failed to inject prompt counter script:", error);
		extensionContextValid = false;
	}
}, 50);

// Clean up counter on page unload.
window.addEventListener("beforeunload", function () {
	if (pageCounterElement) {
		removePageCounter();
	}
});
