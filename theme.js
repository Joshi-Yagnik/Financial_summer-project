// theme.js
function applyThemeFromStorage() {
  const savedTheme = localStorage.getItem("theme") || "default";
  const body = document.body;

  if (savedTheme === "default") {
    const hour = new Date().getHours();
    const theme = (hour >= 19 || hour < 7) ? "dark" : "light";
    body.setAttribute("data-theme", theme);
  } else {
    body.setAttribute("data-theme", savedTheme);
  }
}
window.onload = applyThemeFromStorage;
