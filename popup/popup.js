/***********************************
* SYSTEM THEME ADAPTATION BEHAVIOR *
***********************************/

// Tags to which the theme class will be applied.
const targetedTags = [
	"body",
	"header",
	"#title-container",
	"main",
	"hr",
	".mute",
	".card",
	"#chart-nav-button",
	"footer"
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
		const todayKey = now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, "0") + "-" + String(now.getDate()).padStart(2, "0");
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

// Compute daily, weekly and monthly average in hours (rounded).
function calculateAverages(stats) {
	const now = new Date();
	const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

	let totalSeconds = 0;
	let activeDays = 0;
	let activeWeeks = {};
	let activeMonths = {};

	for (const dateKey in stats) {
		if (Object.prototype.hasOwnProperty.call(stats, dateKey)) {
			const value = stats[dateKey];
			const entryDate = new Date(dateKey);

			// Skip future or invalid dates.
			if (entryDate > today || isNaN(entryDate.getTime())) {
				continue;
			}

			if (value < 60) {
				continue;
			}

			totalSeconds += value;
			activeDays += 1;

			const year = entryDate.getFullYear();
			const month = entryDate.getMonth() + 1;

			let monthStr = String(month);

			if (month < 10) {
				monthStr = "0" + month;
			}

			const monthKey = year + "-" + monthStr;
			activeMonths[monthKey] = true;

			const weekKey = getWeekKey(entryDate);
			activeWeeks[weekKey] = true;
		}
	}

	let daily = 0;
	let weekly = 0;
	let monthly = 0;

	if (activeDays > 0) {
		daily = Math.round(totalSeconds / activeDays / 3600);
	}

	const numberOfWeeks = Object.keys(activeWeeks).length;

	if (numberOfWeeks > 0) {
		weekly = Math.round(totalSeconds / numberOfWeeks / 3600);
	}

	const numberOfMonths = Object.keys(activeMonths).length;

	if (numberOfMonths > 0) {
		monthly = Math.round(totalSeconds / numberOfMonths / 3600);
	}

	return {
		daily: daily,
		weekly: weekly,
		monthly: monthly
	};
}

// Get Monday key for weekly stats.
function getWeekKey(date) {
	const tmp = new Date(date);
	tmp.setHours(0, 0, 0, 0);

	const day = tmp.getDay();
	let diff;

	if (day === 0) {
		diff = -6;
	} else {
		diff = 1 - day;
	}

	tmp.setDate(tmp.getDate() + diff);

	const year = tmp.getFullYear();
	const month = tmp.getMonth() + 1;
	const dayOfMonth = tmp.getDate();

	let monthStr = String(month);

	if (month < 10) {
		monthStr = "0" + month;
	}

	let dayStr = String(dayOfMonth);

	if (dayOfMonth < 10) {
		dayStr = "0" + dayOfMonth;
	}

	return year + "-" + monthStr + "-" + dayStr;
}

// Update average displays in the popup (rounded hours).
function updateAverages() {
	chrome.runtime.sendMessage("getTimerUsage", function (response) {
		let stats = {};

		if (response && response.dailyUsage) {
			stats = response.dailyUsage;
		}

		const averages = calculateAverages(stats);

		const averageDailyDisplay = document.getElementById("daily-average");
		const averageWeeklyDisplay = document.getElementById("weekly-average");
		const averageMonthlyDisplay = document.getElementById("monthly-average");

		if (averageDailyDisplay) {
			averageDailyDisplay.textContent = averages.daily;
		}

		if (averageWeeklyDisplay) {
			averageWeeklyDisplay.textContent = averages.weekly;
		}

		if (averageMonthlyDisplay) {
			averageMonthlyDisplay.textContent = averages.monthly;
		}
	});
}


/***************************
* WEEK NAVIGATION BEHAVIOR *
***************************/

let weekOffsetTime = 0;
let weekOffsetPrompt = 0;

function getStartOfWeek(offset = 0) {
	const now = new Date();
	const monday = getMonday(now);
	monday.setDate(monday.getDate() + (offset * 7));
	return monday;
}

// Time chart navigation.
document.getElementById("prev-time-week-btn").addEventListener("click", function () {
	weekOffsetTime -= 1;
	updateWeeklyTimeChart();
});

document.getElementById("next-time-week-btn").addEventListener("click", function () {
	if (weekOffsetTime < 0) {
		weekOffsetTime += 1;
		updateWeeklyTimeChart();
	}
});

// Prompt chart navigation.
document.getElementById("prev-prompt-week-btn").addEventListener("click", function () {
	weekOffsetPrompt -= 1;
	updateWeeklyPromptChart();
});

document.getElementById("next-prompt-week-btn").addEventListener("click", function () {
	if (weekOffsetPrompt < 0) {
		weekOffsetPrompt += 1;
		updateWeeklyPromptChart();
	}
});

// Compute the Date object for Monday of the same week as "date".
function getMonday(date) {
	const d = new Date(date);
	const day = d.getDay();
	let diff;

	// If Sunday (0), go back 6 days; otherwise offset to Monday (1).
	if (day === 0) {
		diff = -6;
	} else {
		diff = 1 - day;
	}

	d.setDate(d.getDate() + diff);
	// Normalize to midnight.
	d.setHours(0, 0, 0, 0);

	return d;
}


/***********************************
* WEEKLY USAGE TIME CHART BEHAVIOR *
***********************************/

// Holds the Chart.js instance so it can be updated later.
let weeklyTimeChartInstance = null;

// Initialize the bar chart showing Monday to Sunday prompt counts.
function initWeeklyTimeChart() {
	const startOfWeek = getStartOfWeek(weekOffsetTime);
	const labels = [];
	const initialData = [];

	// Build labels array: 7 entries from Monday to Sunday in "DD/MM" format.
	for (let i = 0; i < 7; i++) {
		const d = new Date(startOfWeek);
		d.setDate(startOfWeek.getDate() + i);
		const day = String(d.getDate()).padStart(2, "0");
		const month = String(d.getMonth() + 1).padStart(2, "0");
		labels.push(`${day}/${month}`);
		initialData.push(0);
	}

	const ctx = document.getElementById("weekly-time-chart").getContext("2d");

	// Instantiate the chart and manage its rendering.
	weeklyTimeChartInstance = new Chart(ctx, {
		type: "bar",
		data: {
			labels: labels,
			datasets: [{
				data: initialData,
				backgroundColor: "rgb(15, 158, 123)",
				borderWidth: 0,
				borderRadius: 5
			}]
		},
		options: {
			animation: {
				duration: 1000,
				easing: "easeOutBounce"
			},
			plugins: {
				legend: {
					display: false
				},
				tooltip: {
					enabled: false
				}
			},
			scales: {
				x: {
					type: "category",
					offset: true,
					grid: {
						display: false,
					},
					border: {
						display: false
					},
					ticks: {
						display: true,
						autoSkip: false,
						maxRotation: 0,
						minRotation: 0,
						font: {
							family: "system-ui, sans-serif",
							size: 10,
							weight: "500"
						},
						color: "rgb(115, 115, 115)"
					},
					title: { display: false }
				},
				y: {
					display: false
				}
			},
			elements: {
				bar: {
					borderSkipped: false
				}
			}
		}
	});
}

// Update the weekly time chart with usage data (in hours) for each day from Monday to Sunday.
function updateWeeklyTimeChart() {
	chrome.runtime.sendMessage("getTimerUsage", function (response) {
		const stats = response.dailyUsage || {};
		const startOfWeek = getStartOfWeek(weekOffsetTime);
		const newData = [];
		const newLabels = [];

		// For each day Monday to Sunday, compute hours spent (rounded to 0.1h).
		for (let i = 0; i < 7; i++) {
			const d = new Date(startOfWeek);
			d.setDate(startOfWeek.getDate() + i);
			const day = String(d.getDate()).padStart(2, "0");
			const month = String(d.getMonth() + 1).padStart(2, "0");
			newLabels.push(`${day}/${month}`);

			const key = d.getFullYear() + "-" + month + "-" + String(d.getDate()).padStart(2, "0");
			const seconds = stats[key] || 0;
			newData.push(Math.round((seconds / 3600) * 10) / 10);
		}

		// Replace dataset values and redraw chart.
		if (weeklyTimeChartInstance) {
			weeklyTimeChartInstance.data.labels = newLabels;
			weeklyTimeChartInstance.data.datasets[0].data = newData;
			weeklyTimeChartInstance.update();
		}
	});
}


/***************************
* PROMPT TRACKING BEHAVIOR *
***************************/

// Update prompt usage counter display.
function updatePromptCounter() {
	chrome.runtime.sendMessage("getPromptUsage", function (response) {
		const promptDisplay = document.getElementById("total-prompt");

		if (promptDisplay) {
			promptDisplay.textContent = response.promptUsage;
		}
	});
}


/*************************************
* WEEKLY PROMPT COUNT CHART BEHAVIOR *
*************************************/

// Holds the Chart.js instance so it can be updated later.
let weeklyPromptChartInstance = null;

// Initialize the bar chart showing Monday to Sunday usage.
function initWeeklyPromptChart() {
	const startOfWeek = getStartOfWeek(weekOffsetPrompt);
	const labels = [];
	const initialData = [];

	for (let i = 0; i < 7; i++) {
		const d = new Date(startOfWeek);
		d.setDate(startOfWeek.getDate() + i);
		const day = String(d.getDate()).padStart(2, "0");
		const month = String(d.getMonth() + 1).padStart(2, "0");
		labels.push(`${day}/${month}`);
		initialData.push(0);
	}

	const ctx = document.getElementById("weekly-prompt-chart").getContext("2d");

	// Instantiate the chart and manage its rendering.
	weeklyPromptChartInstance = new Chart(ctx, {
		type: "bar",
		data: {
			labels: labels,
			datasets: [{
				data: initialData,
				backgroundColor: "rgb(15, 158, 123)",
				borderWidth: 0,
				borderRadius: 5
			}]
		},
		options: {
			animation: {
				duration: 1000,
				easing: "easeOutBounce"
			},
			plugins: {
				legend: {
					display: false
				},
				tooltip: {
					enabled: false
				}
			},
			scales: {
				x: {
					type: "category",
					offset: true,
					grid: {
						display: false,
					},
					border: {
						display: false
					},
					ticks: {
						display: true,
						autoSkip: false,
						maxRotation: 0,
						minRotation: 0,
						font: {
							family: "system-ui, sans-serif",
							size: 10,
							weight: "500"
						},
						color: "rgb(115, 115, 115)"
					},
					title: { display: false }
				},
				y: {
					display: false
				}
			},
			elements: {
				bar: { borderSkipped: false }
			}
		}
	});
}

// Update the weekly prompt chart with the number of prompts used each day from Monday to Sunday.
function updateWeeklyPromptChart() {
	chrome.storage.local.get({ dailyPromptCount: {} }, function (result) {
		const stats = result.dailyPromptCount;
		const startOfWeek = getStartOfWeek(weekOffsetPrompt);
		const newData = [];
		const newLabels = [];

		for (let i = 0; i < 7; i++) {
			const d = new Date(startOfWeek);
			d.setDate(startOfWeek.getDate() + i);
			const day = String(d.getDate()).padStart(2, "0");
			const month = String(d.getMonth() + 1).padStart(2, "0");
			newLabels.push(`${day}/${month}`);

			const key = d.getFullYear() + "-" + month + "-" + String(d.getDate()).padStart(2, "0");
			newData.push(stats[key] || 0);
		}

		if (weeklyPromptChartInstance) {
			weeklyPromptChartInstance.data.labels = newLabels;
			weeklyPromptChartInstance.data.datasets[0].data = newData;
			weeklyPromptChartInstance.update();
		}
	});
}


/*****************************************
* ENABLE ON-PAGE PROMPT COUNTER BEHAVIOR *
*****************************************/

// Handle checkbox for showing/hiding counter on ChatGPT page.
function enableOnPagePronptCounter() {
	const enableCounterCheckbox = document.getElementById("enable-counter-checkbox");

	if (!enableCounterCheckbox) {
		return;
	}

	chrome.storage.local.get({ enableCounterOnPage: false }, function (result) {
		enableCounterCheckbox.checked = result.enableCounterOnPage;
	});

	enableCounterCheckbox.addEventListener("change", function () {
		const enableCounter = enableCounterCheckbox.checked;

		chrome.storage.local.set({ enableCounterOnPage: enableCounter });
		chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
			if (!tabs[0]) {
				return;
			}

			chrome.tabs.sendMessage(tabs[0].id, { type: "toggleCounter", show: enableCounter }, function (response) {
				if (chrome.runtime.lastError) {
					console.log("Content script not ready:", chrome.runtime.lastError.message);
				}
			});
		});
	});
}


/********************************
* WATER CONSUMPTION CALCULATION *
********************************/

// Calculate total water consumption based on prompt usage.
function updateWaterConsumption() {
	chrome.runtime.sendMessage("getPromptUsage", function (response) {
		const totalPrompts = response.promptUsage || 0;
		const waterPerPrompt = 25;
		const totalWaterMl = totalPrompts * waterPerPrompt;

		const waterDisplay = document.getElementById("total-water");

		if (waterDisplay) {
			waterDisplay.textContent = (totalWaterMl / 1000).toFixed(3) + "L";
		}
	});
}


/*****************************
* INITIALIZATION & INTERVALS *
*****************************/

initWeeklyTimeChart();
initWeeklyPromptChart();

enableOnPagePronptCounter();

updateTimer();
updateTotalTimer();
updateAverages();
updateWeeklyTimeChart();
updatePromptCounter();
updateWeeklyPromptChart();
updateWaterConsumption();

setInterval(updateTimer, 1000);
setInterval(updateTotalTimer, 1000);
setInterval(updateAverages, 60000);
setInterval(updateWeeklyTimeChart, 60000);
setInterval(updatePromptCounter, 1000);
setInterval(updateWeeklyPromptChart, 60000);
setInterval(updateWaterConsumption, 1000);


/**************************
* RESET COUNTERS BEHAVIOR *
**************************/

const resetButton = document.getElementById("reset-button");

if (resetButton) {
	resetButton.addEventListener("click", function () {
		const confirmReset = confirm("Are you sure you want to reset all counters?");
		if (!confirmReset) {
			return;
		}

		chrome.storage.local.set({
			dailyUsage: {},
			promptUsage: 0,
			dailyPromptCount: {}
		}, function () {
			updateTimer();
			updateTotalTimer();
			updateAverages();
			updateWeeklyTimeChart();
			updatePromptCounter();
			updateWeeklyPromptChart();
			updateWaterConsumption();
		});
	});
}