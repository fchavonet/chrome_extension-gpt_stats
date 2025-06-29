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
