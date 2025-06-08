// Der Code wurde mithilfe verschiedener Quellen selbst geschrieben und anschliessend von ChatGPT überarbeitet was DRY sowie die Benennungen der Funktionen betrifft. Link zum Chat: https://chatgpt.com/share/68446528-57b8-800f-b0c8-74c5087298e1

window.addEventListener("DOMContentLoaded", () => {
  [
    { id: "header", file: "header.html", cb: setupNavigationAfterHeaderLoad },
    { id: "footer", file: "footer.html" },
    { id: "hero", file: "hero.html" },
    { id: "produktkachel-template", file: "produktkachel.html" }
  ].forEach(comp => includeComponent(comp.id, comp.file, comp.cb));

  let hasJumped = false;

  window.addEventListener("wheel", (e) => {
    // Wenn der Benutzer ganz oben ist und nach unten scrollt
    if (window.scrollY <= 0 && e.deltaY > 0 && !hasJumped) {
      console.log('Springe zum Anker!');

      // Scrolle zum unsichtbaren Anker unterhalb des hero
      const anchor = document.getElementById('scroll-anchor');
      if (anchor) {
        anchor.scrollIntoView({ behavior: 'smooth' });
        hasJumped = true; // Flag setzen, um zu verhindern, dass der Effekt mehrfach ausgeführt wird
      }
    }
  }, { passive: true });

  window.addEventListener("scroll", () => {
    // Rücksetzen des Flags, wenn der Benutzer wieder zurück nach oben scrollt
    if (window.scrollY < 10) {
      hasJumped = false;
    }
  });
});

// Quelle zur Inspiration: https://www.smashingmagazine.com/2018/07/html-include/
 
function includeComponent(id, file, callback) {
  fetch(file)
    .then(res => res.text())
    .then(html => {
      if (id === "produktkachel-template") {
        // Das Template direkt ins <body> einfügen (wenn noch nicht vorhanden)
        if (!document.getElementById("produktkachel-template")) {
          document.body.insertAdjacentHTML("beforeend", html);
        }
      } else {
        const el = document.getElementById(id);
        if (el) el.innerHTML = html;
      }
      if (typeof callback === "function") callback();
    })
    .catch(err => console.error(`Fehler beim Laden von ${file}:`, err));
}


/* mobile Menü (Burger-Menü) und Markierung der aktiven Seite.
   Quellen zur Inspiration: https://www.w3schools.com/howto/howto_js_mobile_navbar.asp 
   https://dev.to/ljcdev/easy-hamburger-menu-with-js-2do0 
   https://mmenujs.com/mburger/tutorial.html*/
function setupNavigationAfterHeaderLoad() {
  const burger = document.querySelector(".burger");
  const mobileMenu = document.getElementById("mobileMenu");
  const closeBtn = document.querySelector(".close-mobile-menu");

  function toggleMenu(open) {
    document.body.classList.toggle("menu-open", open);
  }

  burger?.addEventListener("click", () => toggleMenu(true));
  closeBtn?.addEventListener("click", () => toggleMenu(false));
  mobileMenu?.addEventListener("click", e => {
    if (e.target === mobileMenu) toggleMenu(false);
  });
  mobileMenu?.querySelectorAll("a").forEach(link =>
    link.addEventListener("click", () => toggleMenu(false))
  );

  // Aktiv-Link markieren (in Header + mobileMenu)
  const currentPath = window.location.pathname.split("/").pop();
  document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(link => {
    if (link.getAttribute('href') === currentPath) {
      link.classList.add('active');
    }
  });
}

// mehrfach verwendete Codeelemente

// Zustand (anstatt Zahl = Wort)
window.zustandMap = { 0: "akzeptabel", 1: "gut", 2: "sehr gut", 3: "ausgezeichnet" };

const createWarenkorbProdukt = (id, name, preis, farbe, groesse, zustand, bild) => ({
  id, name, preis, farbe, groesse, zustand, bild, menge: 1
});

/*Füllt ein <select> mit Optionen und setzt die Auswahl.
  https://developer.mozilla.org/en-US/docs/Web/API/HTMLSelectElement
 */
function fillSelect(id, selected, options) {
  const select = document.getElementById(id);
  if (!select) return;
  select.innerHTML = options.map(opt =>
    `<option value="${opt}"${opt === selected ? " selected" : ""}>${opt}</option>`
  ).join("");
}

// Datenbank


// Warten bis ein Element im DOM ist
// Inspiration: https://www.mediaevent.de/javascript/async-await.html
async function waitForTemplate() {
  return new Promise(resolve => {
    function check() {
      if (document.getElementById('produktkachel-template')) resolve();
      else setTimeout(check, 30);
    }
    check();
  });
}

async function loadAndDisplayProducts(sliderTrack) {
  const query = `
    SELECT 
      p.Produkt_ID, p.Produktname, p.Preis, p.Bild,
      hk.Hauptkategorie_Name AS Kategorie,
      f.Farbe_Name AS Farbe,
      g.Groesse_Name AS Groesse,
      z.Zustand
    FROM produkte p
    JOIN hauptkategorie hk ON p.Hauptkategorie_ID = hk.Hauptkategorie_ID
    JOIN farben f ON p.Farbe_ID = f.Farbe_ID
    JOIN groessen g ON p.Groesse_ID = g.Groesse_ID
    JOIN zustand z ON p.Zustand_ID = z.Zustand_ID
    ORDER BY RAND()
    LIMIT 10
  `;
 try {
    const result = await databaseClient.executeSqlQuery(query);
    const produkte = result?.[1] || [];
    sliderTrack.innerHTML = ""; 
    produkte.forEach(p => {
      const card = createProductCard(p, window.zustandMap);
      sliderTrack.appendChild(card);
    });

    // Nur wenn Produkte vorhanden, Slider initialisieren
    if (produkte.length > 0) {
      setupLoopSlider(sliderTrack, getVisibleCount());
    }
  } catch (err) {
    console.error("Fehler beim Laden der Produkte:", err);
    sliderTrack.innerHTML = "<div>Produkte konnten nicht geladen werden.</div>";
  }
}

// Formular Validierung

  // Funktion zum Überprüfen der E-Mail-Adresse
  function validateEmail(email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  }

  // Allgemeine Funktion zur Validierung von Formularen
function attachValidation(formId, config) {
  const form = document.getElementById(formId);
  if (!form) return;
  const submitBtn = form.querySelector("button[type='submit']");
  const touchedFields = {};

  function validateForm() {
    let allValid = true;
    config.forEach(field => {
      const input = form.querySelector(`#${field.id}`);
      const errorEl = form.querySelector(`#error-${field.id}`);
      const value = input?.value.trim();
      let isValid = !!value;

      if (field.pattern) isValid = field.pattern.test(value);
      errorEl.textContent = touchedFields[field.id] && !isValid ? field.message : "";

      const inputField = form.querySelector(`#${field.id}`);
      
      if (isValid && touchedFields[field.id]) {
        inputField.classList.add("valid");
        inputField.classList.remove("invalid");
      } else if (!isValid && touchedFields[field.id]) {
        inputField.classList.add("invalid");
        inputField.classList.remove("valid");
      }

      if (!isValid) allValid = false;
    });

    if (submitBtn) submitBtn.disabled = !allValid;
  }

  config.forEach(({ id }) => {
    const input = form.querySelector(`#${id}`);
    if (!input) return;

    input.addEventListener("focus", () => touchedFields[id] = false);
    input.addEventListener("input", () => { touchedFields[id] = true; validateForm(); });
    input.addEventListener("blur", () => { touchedFields[id] = true; validateForm(); });
  });

  validateForm();
}
