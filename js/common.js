// Theme wechseln (nur wenn Button existiert)
const themeToggle = document.getElementById("theme-toggle");
if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const isDark = document.body.classList.toggle("dark-mode");
    localStorage.setItem("theme", isDark ? "dark" : "light");
  });
}

// Header und Footer laden
window.addEventListener("DOMContentLoaded", () => {
  includeComponent("header", "header.html", initHomeJs); // warte, bis header da ist
  includeComponent("footer", "footer.html"),
    includeComponent("hero", "common.html");
});

function includeComponent(id, file, callback) {
  fetch(file)
    .then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.text();
    })
    .then((html) => {
      document.getElementById(id).innerHTML = html;
      if (callback) callback(); // wichtig!
    })
    .catch((err) => console.error("Fehler beim Laden:", err));
}
