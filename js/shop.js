// Der Code wurde mithilfe verschiedener Quellen sowie der Datei von Herr Hatz selbst geschrieben und anschliessend von ChatGPT überarbeitet was DRY sowie die Benennungen der Funktionen betrifft. Link zum Chat: https://chatgpt.com/share/68448378-e304-800f-9148-8e0dee8ee863
async function waitForTemplate() {
  return new Promise(resolve => {
    function check() {
      if (document.getElementById('produktkachel-template')) resolve();
      else setTimeout(check, 30);
    }
    check();
  });
}

const GROUP_NAME = "b7";
const PASSWORD = "snpgq0fq8amafv92";
const SERVER_URL = "https://ict-290.herokuapp.com/sql";

const databaseClient = {
  executeSqlQuery: async (sql) => {
    const payload = { group: GROUP_NAME, pw: PASSWORD, sql };
    try {
      const response = await fetch(SERVER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      return await response.json();
    } catch (err) {
      console.error("Verbindungsfehler:", err);
    }
  }
};

// Quelle: https://www.mediaevent.de/javascript/async-await.html
async function waitForTemplate() {
  return new Promise(resolve => {
    (function check() {
      document.getElementById('produktkachel-template') ? resolve() : setTimeout(check, 30);
    })();
  });
}

const filterConfig = [
  { id: "filterKategorie", col: "hk.Hauptkategorie_Name", sql: "SELECT DISTINCT Hauptkategorie_Name AS name FROM hauptkategorie" },
  { id: "filterZustand",  col: "z.Zustand",              sql: "SELECT DISTINCT Zustand AS name FROM zustand", customMap: zustandMap },
  { id: "filterFarbe",    col: "f.Farbe_Name",           sql: "SELECT DISTINCT Farbe_Name AS name FROM farben" },
  { id: "filterGroesse",  col: "g.Groesse_Name",         sql: "SELECT DISTINCT Groesse_Name AS name FROM groessen" }
];

// Warten bis alles geladen ist, dann Filter + Produkte rendern
document.addEventListener("DOMContentLoaded", async () => {
  await waitForTemplate();   // Template sicherstellen 
  await loadFilters();       // Filteroptionen laden
  await loadProductsWithFilter(); // Produkte laden
  document.getElementById("applyFilterBtn").onclick = loadProductsWithFilter;
  document.getElementById("resetFilterBtn").onclick = () => {
    filterConfig.forEach(f => document.getElementById(f.id).value = "");
    loadProductsWithFilter();
  };
});

// Quelle: https://developer.mozilla.org/en-US/docs/Web/API/HTMLSelectElement
async function loadFilters() {
  for (const { id, sql, customMap } of filterConfig) {
    const select = document.getElementById(id);
    select.innerHTML = `<option value="">${select.getAttribute("data-placeholder") || select.options[0]?.text || "Wählen..."}</option>`;
    const result = await databaseClient.executeSqlQuery(sql);
    (result?.[1] || []).forEach(row => {
      const opt = document.createElement("option");
      opt.value = row.name;
      opt.textContent = customMap ? customMap[row.name] : row.name;
      select.appendChild(opt);
    });
  }
}

async function loadProductsWithFilter() {
  let sql = `
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
    WHERE 1=1
  `;
  filterConfig.forEach(({ id, col }) => {
    const val = document.getElementById(id).value;
    if (val) sql += ` AND ${col} = '${val}'`;
  });
  const result = await databaseClient.executeSqlQuery(sql);
  renderProducts(result?.[1] || []);
}

function renderProducts(products) {
  const container = document.getElementById("productContainer");
  const countBox  = document.getElementById("produktCount");
  container.innerHTML = "";
  if (!products.length) {
    countBox.textContent = "Keine Produkte gefunden.";
    return;
  }
  countBox.textContent = `${products.length} Produkte gefunden`;
  products.forEach(p => container.appendChild(createProductCard(p, zustandMap, "grid")));
}