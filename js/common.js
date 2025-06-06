// Komponenten laden: Header, Footer, Hero
window.addEventListener("DOMContentLoaded", () => {
  includeComponent("header", "header.html");
  includeComponent("footer", "footer.html");
  includeComponent("hero", "hero.html");

  // Prüfen, ob ein Hero vorhanden ist – falls nicht, Navigation sofort anzeigen
  const heroCheckInterval = setInterval(() => {
    const nav = document.getElementById("nav");
    const hero = document.querySelector(".hero");

    if (nav) {
      if (!hero) {
        nav.style.transform = "translateY(0)";
        nav.style.transition = "transform 0.3s ease";
        clearInterval(heroCheckInterval);
      }
    }
  }, 100);
});

// Funktion zum Laden externer Komponenten (header, footer, etc.)
function includeComponent(id, file) {
  fetch(file)
    .then((res) => res.text())
    .then((html) => {
      const container = document.getElementById(id);
      if (container) container.innerHTML = html;
    })
    .catch((err) => console.error(`Fehler beim Laden von ${file}`, err));
}

// Seite beim Neuladen nach oben scrollen
window.onload = function () {
  window.scrollTo(0, 0);
};

// Navigation ein-/ausblenden beim Scrollen
window.addEventListener("scroll", () => {
  const nav = document.getElementById("nav");
  const initialNav = document.querySelector(".initial-nav");

  if (window.scrollY > 10) {
    nav?.style && (nav.style.transform = "translateY(0)");
    initialNav?.classList.add("fade-out");
  } else {
    nav?.style && (nav.style.transform = "translateY(-100%)");
    initialNav?.classList.remove("fade-out");
  }
});

// Smooth Scroll beim ersten Scrollen über den Hero
let hasJumped = false;

window.addEventListener(
  "wheel",
  (e) => {
    const hero = document.querySelector(".hero");

    if (!hasJumped && hero && window.scrollY < hero.offsetHeight - 50 && e.deltaY > 0) {
      e.preventDefault();
      window.scrollTo({
        top: hero.offsetHeight,
        behavior: "smooth",
      });
      hasJumped = true;
    }
  },
  { passive: false }
);

// Erlaubt erneuten Hero-Jump, wenn man zurück nach oben scrollt
window.addEventListener("scroll", () => {
  if (window.scrollY < 10) {
    hasJumped = false;
  }
});
