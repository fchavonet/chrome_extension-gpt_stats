<img height="50px" align="right" src="https://raw.githubusercontent.com/fchavonet/fchavonet/main/assets/images/logo-google_chrome.png" alt="Google Chrome logo">

# GPT Stats

## 🔖 Table of contents

<details>
    <summary>
        CLICK TO ENLARGE 😇
    </summary>
    📄 <a href="#description">Description</a>
    <br>
    🎓 <a href="#objectives">Objectives</a>
    <br>
    🔨 <a href="#tech-stack">Tech stack</a>
    <br>
    📂 <a href="#files-description">Files description</a>
    <br>
    💻 <a href="#installation_and_how_to_use">Installation and how to use</a>
    <br>
    🔧 <a href="#whats-next">What's next?</a>
    <br>
    ♥️ <a href="#thanks">Thanks</a>
    <br>
    👷 <a href="#authors">Authors</a>
</details>

## 📄 <span id="description">Description</span>

GPT Stats is a lightweight Chrome extension that tracks [ChatGPT](https://chatgpt.com/) usage effortlessly. It automatically measures the time you spend, counts your prompts, and displays useful usage statistics, all in a clean and minimal popup interface.
<br><br>
All data is stored locally in your browser using `chrome.storage.local`, ensuring full control, offline compatibility, and compliance with modern extension security standards.
<br><br>
Whether you're a student, developer, productivity-focused, a data enthusiast, or simply curious about your usage habits, GPT Stats provides clear insights without compromising performance or privacy.

## 🎓 <span id="objectives">Objectives</span>

- Track the time spent on ChatGPT.
- Count the number of prompts sent.
- Provide a visual dashboard using `Chart.js`.
- Persist usage data across browser sessions.
- Ensure everything works offline, locally, with no external dependencies.

## 🔨 <span id="tech-stack">Tech stack</span>

<p align="left">
    <img src="https://img.shields.io/badge/HTML5-e34f26?logo=html5&logoColor=white&style=for-the-badge" alt="HTML5 badge">
    <img src="https://img.shields.io/badge/CSS3-1572b6?logo=css3&logoColor=white&style=for-the-badge" alt="CSS3 badge">
    <img src="https://img.shields.io/badge/JAVASCRIPT-f7df1e?logo=javascript&logoColor=black&style=for-the-badge" alt="JavaScript badge">
    <img src="https://img.shields.io/badge/JSON-000000?logo=json&logoColor=white&style=for-the-badge" alt="JSON badge">
    <img src="https://img.shields.io/badge/GIT-f05032?logo=git&logoColor=white&style=for-the-badge" alt="Git badge">
    <img src="https://img.shields.io/badge/GITHUB-181717?logo=github&logoColor=white&style=for-the-badge" alt="GitHub badge">
    <img src="https://img.shields.io/badge/MARKDOWN-000000?logo=markdown&logoColor=white&style=for-the-badge" alt="Markdown badge">
    <img src="https://img.shields.io/badge/VS CODE-007acc?logo=data:image/svg+xml;base64,PCFET0NUWVBFIHN2ZyBQVUJMSUMgIi0vL1czQy8vRFREIFNWRyAxLjEvL0VOIiAiaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkIj4KDTwhLS0gVXBsb2FkZWQgdG86IFNWRyBSZXBvLCB3d3cuc3ZncmVwby5jb20sIFRyYW5zZm9ybWVkIGJ5OiBTVkcgUmVwbyBNaXhlciBUb29scyAtLT4KPHN2ZyBmaWxsPSIjZmZmZmZmIiB3aWR0aD0iODAwcHgiIGhlaWdodD0iODAwcHgiIHZpZXdCb3g9Ii0wLjUgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KDTxnIGlkPSJTVkdSZXBvX2JnQ2FycmllciIgc3Ryb2tlLXdpZHRoPSIwIi8+Cg08ZyBpZD0iU1ZHUmVwb190cmFjZXJDYXJyaWVyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KDTxnIGlkPSJTVkdSZXBvX2ljb25DYXJyaWVyIj4KDTxwYXRoIGQ9Im0xNy44NTggMjMuOTk4LTkuNzcxLTkuNDg0LTUuODY2IDQuNDY1LTIuMjIxLTEuMTE1di0xMS43MTlsMi4yMzQtMS4xMjEgNS44NyA0LjQ2OSA5Ljc0Ny05LjQ5MyA1LjU4NyAyLjIzOXYxOS41MzFsLTUuNTc5IDIuMjN6bS0uNTYzLTE2LjE4Ni01LjU3NyA0LjE3MyA1LjU4IDQuMjAyem0tMTQuNTA3IDEuNjg1djUuMDE2bDIuNzg3LTIuNTI1eiIvPgoNPC9nPgoNPC9zdmc+&logoColor=white&style=for-the-badge" alt="VS Code badge">
</p>

## 📂 <span id="files-description">File description</span>

| **FILE**        | **DESCRIPTION**                                                           |
| :-------------: | ------------------------------------------------------------------------- |
| `assets`        | Contains the resources required for the repository.                       |
| `manifest.json` | Chrome manifest file (V3) that declares extension metadata.               |
| `background.js` | Background service worker, manages session timing.                        |
| `popup`         | Contains the popup interface: `popup.html`, `popup.css` , and `popup.js`. |
| `scripts`       | Placeholder for extra logic or utility functions.                         |
| `libs`          | Contains local dependencies.                                              |
| `images`        | Folder containing icons or UI images.                                     |
| `README.md`     | The README file you are currently reading 😉.                             |

## 💻 <span id="installation_and_how_to_use">Installation and how to use</span>

**Installation:**

1. Clone this repository:
    - Open your preferred Terminal.
    - Navigate to the directory where you want to clone the repository.
    - Run the following command:

```bash
git clone https://github.com/fchavonet/chrome_extension-gpt_stats.git
```

2. Open a Chromium-based browser (Brave, Edge, Google Chrome...) and navigate to:

```
chrome://extensions/
```

3. Enable Developer mode.
   
4. Click on "Load unpacked" and select the project folder.

5. The extension should now appear in your extensions menu.

> 📌 You can pin it to your browser toolbar via your extensions menu.

**How to use:**

1. Open [ChatGPT](https://chatgpt.com/) in your browser.

2. The extension will automatically start tracking your usage time.

3. Each prompt you send is counted in real time.
   <br>
   ( ⚠️ Make sure you're logged into your OpenAI account for prompt tracking to work! ⚠️ )

4. Click the extension icon to open the popup and view your usage statistics.

5. All data is stored locally and will persist across browser restarts.

6. If you just want to test the extension without waiting, you can inject some mock data using the script below.
> 📌 Right-click the opened extension → Inspect → open the Console tab, then paste and run the code.

<details>
    <summary>
    Click here to see the code.
    </summary>

```javascript
(function simulateUsageHistory() {
    const now = new Date();
    const dailyUsage = {};
    const dailyPromptCount = {};

	for (let i = 0; i < 185; i++) {
		const date = new Date();
		date.setDate(now.getDate() - i);

		const yyyy = date.getFullYear();
		const mm = String(date.getMonth() + 1).padStart(2, "0");
		const dd = String(date.getDate()).padStart(2, "0");

		const key = `${yyyy}-${mm}-${dd}`;

		const seconds = Math.floor(Math.random() * (90 - 5 + 1) + 5) * 60;
		dailyUsage[key] = seconds;

		dailyPromptCount[key] = Math.floor(Math.random() * 30) + 1;
	}

	const totalPrompt = Object.values(dailyPromptCount).reduce((a, b) => a + b, 0);

	chrome.storage.local.set({
		dailyUsage: dailyUsage,
		dailyPromptCount: dailyPromptCount,
		promptUsage: totalPrompt
	}, () => {
		console.log("✅ Simulated 6 months of usage data successfully injected.");
	});
})();
```
</details>

<p align="left">
    <picture>
        <source media="(prefers-color-scheme: dark)" srcset="./assets/images/screenshot-dark.webp">
        <source media="(prefers-color-scheme: light)" srcset="./assets/images/screenshot-light.webp">
        <img src="" alt="Screenshots">
    </picture>
</p>

## 🔧 <span id="whats-next">What's next?</span>

- Add a persistent prompt counter overlay directly within the ChatGPT interface.
- Implement CSV export of usage data.
- Improve or redesign the mobile layout.
- Add additional usage metrics.
- Explore Firefox support.

## ♥️ <span id="thanks">Thanks</span>

- A big thank you to my friends Pierre and Yoann, always available to test and provide feedback on my projects.

## 👷 <span id="authors">Authors</span>

**Fabien CHAVONET**
- GitHub: [@fchavonet](https://github.com/fchavonet)
