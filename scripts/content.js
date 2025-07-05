// Confirm script injection.
console.log("✅ content.js successfully injected into the page.");

// Inject injected.js into the page.
function injectPromptCounterScript() {
	const script = document.createElement("script");

	script.src = chrome.runtime.getURL("scripts/injected.js");

	script.onload = function () {
		this.remove();
	};

	(document.head || document.documentElement).appendChild(script);
}

// Listen for prompt usage event.
window.addEventListener("message", function (event) {
	if (
		event.source === window &&
		event.data &&
		event.data.source === "gpt-stats" &&
		event.data.type === "promptUsed"
	) {
		chrome.runtime.sendMessage({ type: "incrementPrompt" });
	}
});

injectPromptCounterScript();