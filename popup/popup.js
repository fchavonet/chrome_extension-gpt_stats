/***********************************
* SYSTEM THEME ADAPTATION BEHAVIOR *
***********************************/

// Tags to which the theme class will be applied.
const targetedTags = [
	"body",
	"main"
];

// Apply or remove the "dark" class on each targeted element.
function applySystemTheme(isDarkMode) {
	targetedTags.forEach(function (tagName) {
		const elements = document.querySelectorAll(tagName);

		for (let i = 0; i < elements.length; i++) {
			const element = elements[i];

			if (isDarkMode) {
				element.classList.add("dark");
			} else {
				element.classList.remove("dark");
			}
		}
	});
}

// Initialize system color-scheme query.
const systemThemeQuery = window.matchMedia("(prefers-color-scheme: dark)");

// Apply initial theme.
applySystemTheme(systemThemeQuery.matches);

// listen for changes in system preference.
systemThemeQuery.addEventListener("change", function (event) {
	applySystemTheme(event.matches);
});


/******************
* TIMERS BEHAVIOR *
******************/

// Convert seconds to HH:MM:SS format.
function formatTime(seconds) {
	const h = Math.floor(seconds / 3600);
	const m = Math.floor((seconds % 3600) / 60);
	const s = seconds % 60;

	const hh = String(h).padStart(2, "0");
	const mm = String(m).padStart(2, "0");
	const ss = String(s).padStart(2, "0");

	return hh + ":" + mm + ":" + ss;
}

// Update today's live timer display.
function updateTimer() {
	chrome.runtime.sendMessage("getTimerUsage", function (response) {
		const stats = response.dailyUsage || {};
		const now = new Date();
		const todayKey = now.toISOString().slice(0, 10);
		let todaySeconds = 0;

		if (stats[todayKey]) {
			todaySeconds = stats[todayKey];
		}

		const timeText = formatTime(todaySeconds);
		const display = document.getElementById("daily-timer");

		if (display) {
			display.textContent = timeText;
		}
	});
}

// Update total time counter (all days combined).
function updateTotalTimer() {
	chrome.runtime.sendMessage("getTimerUsage", function (response) {
		const stats = response.dailyUsage || {};
		let totalSeconds = 0;

		for (const date in stats) {
			if (Object.prototype.hasOwnProperty.call(stats, date)) {
				totalSeconds += stats[date];
			}
		}

		const totalTime = formatTime(totalSeconds);
		const totalDisplay = document.getElementById("total-timer");

		if (totalDisplay) {
			totalDisplay.textContent = totalTime;
		}
	});
}

// Compute daily and monthly average in hours (rounded).
function calculateAverages(stats) {
	const now = new Date();
	const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

	let totalSeconds = 0;
	let activeDays = 0;
	let activeMonths = {};

	for (const dateKey in stats) {
		if (Object.prototype.hasOwnProperty.call(stats, dateKey)) {
			const value = stats[dateKey];
			const entryDate = new Date(dateKey);

			// Skip future or invalid dates.
			if (entryDate > today || isNaN(entryDate.getTime())) {
				continue;
			}

			totalSeconds += value;
			activeDays += 1;

			const year = entryDate.getFullYear();
			const month = entryDate.getMonth();
			const monthKey = year + "-" + String(month).padStart(2, "0");

			if (!activeMonths[monthKey]) {
				activeMonths[monthKey] = true;
			}
		}
	}

	let daily = 0;
	let monthly = 0;

	if (activeDays > 0) {
		daily = Math.round(totalSeconds / activeDays / 3600);
	}

	const numberOfMonths = Object.keys(activeMonths).length;

	if (numberOfMonths > 0) {
		monthly = Math.round(totalSeconds / numberOfMonths / 3600);
	}

	return {
		daily: daily,
		monthly: monthly
	};
}

// Update average displays in the popup (rounded hours).
function updateAverages() {
	chrome.runtime.sendMessage("getTimerUsage", function (response) {
		const stats = response.dailyUsage || {};
		const averages = calculateAverages(stats);

		const averageDailyDisplay = document.getElementById("daily-average");
		const averageMonthlyDisplay = document.getElementById("monthly-average");

		if (averageDailyDisplay) {
			averageDailyDisplay.textContent = averages.daily + " hours";
		}

		if (averageMonthlyDisplay) {
			averageMonthlyDisplay.textContent = averages.monthly + " hours";
		}
	});
}

updateTimer();
updateTotalTimer();
updateAverages();

setInterval(updateTimer, 1000);
setInterval(updateTotalTimer, 1000);
setInterval(updateAverages, 1000);