(function () {
	console.log("✅ Prompt counter successfully initialized.");

	if (window.__promptCounterInit === true) {
		return;
	}

	window.__promptCounterInit = true;

	let promptCount = 0;

	function notifyExtension() {
		window.postMessage(
			{
				source: "gpt-stats",
				type: "promptUsed"
			},
			"*"
		);

		if (chrome && chrome.runtime && chrome.runtime.sendMessage) {
			chrome.runtime.sendMessage({ type: "incrementPrompt" });
		}
	}

	const origFetch = window.fetch;

	window.fetch = function (resource, init) {
		let url = "";

		if (typeof resource === "string") {
			url = resource;
		} else if (resource && resource.url) {
			url = resource.url;
		}

		if (init && init.method === "POST" && (
			url.includes("/backend-api/conversation") ||
			url.includes("/backend-api/f/conversation") ||  // ← Nouveau endpoint
			url.includes("/api/chat-process")
		)) {
			promptCount += 1;
			notifyExtension();
		}

		return origFetch.apply(this, arguments);
	};

	const origOpen = XMLHttpRequest.prototype.open;
	const origSend = XMLHttpRequest.prototype.send;

	XMLHttpRequest.prototype.open = function (method, url) {
		this._method = method;
		this._url = url;

		return origOpen.apply(this, arguments);
	};

	XMLHttpRequest.prototype.send = function (body) {
		if (this._method === "POST" && this._url && (
			this._url.includes("/backend-api/conversation") ||
			this._url.includes("/backend-api/f/conversation") ||  // ← Nouveau endpoint
			this._url.includes("/api/chat-process")
		)) {
			promptCount += 1;
			notifyExtension();
		}

		return origSend.apply(this, arguments);
	};
})();
