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

document.addEventListener("DOMContentLoaded", async () => {
  await loadFilters();
  await loadProductsWithFilter();

  document.getElementById("applyFilterBtn").addEventListener("click", loadProductsWithFilter);
});


const zustandMap = {
  0: "okay",
  1: "gut",
  2: "sehr gut",
  3: "ausgezeichnet"
};

async function loadFilters() {
  const filterQueries = [
    { id: "filterKategorie", sql: "SELECT DISTINCT Hauptkategorie_Name AS name FROM hauptkategorie" },
    { id: "filterFarbe",     sql: "SELECT DISTINCT Farbe_Name AS name FROM farben" },
    { id: "filterGroesse",   sql: "SELECT DISTINCT Groesse_Name AS name FROM groessen" },
    { id: "filterZustand",   sql: "SELECT DISTINCT Zustand AS name FROM zustand", customMap: zustandMap }
  ];

  for (const { id, sql, customMap } of filterQueries) {
    const result = await databaseClient.executeSqlQuery(sql);
    const select = document.getElementById(id);

    (result?.[1] || []).forEach(row => {
      const opt = document.createElement("option");
      opt.value = row.name;
      opt.textContent = customMap ? customMap[row.name] : row.name;
      select.appendChild(opt);
    });
  }
}


async function loadProductsWithFilter() {
  const kat = document.getElementById("filterKategorie").value;
  const farbe = document.getElementById("filterFarbe").value;
  const groesse = document.getElementById("filterGroesse").value;
  const zustand = document.getElementById("filterZustand").value;

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

  if (kat) sql += ` AND hk.Hauptkategorie_Name = '${kat}'`;
  if (farbe) sql += ` AND f.Farbe_Name = '${farbe}'`;
  if (groesse) sql += ` AND g.Groesse_Name = '${groesse}'`;
  if (zustand) sql += ` AND z.Zustand = '${zustand}'`;

  const result = await databaseClient.executeSqlQuery(sql);
  renderProducts(result?.[1] || []);
}


function renderProducts(products) {
  const container = document.getElementById("productContainer");
  const countBox = document.getElementById("produktCount");
  container.innerHTML = "";

const zustandMap = {
  0: "okay",
  1: "gut",
  2: "sehr gut",
  3: "ausgezeichnet"
};


  if (!Array.isArray(products) || products.length === 0) {
    countBox.textContent = "Keine Produkte gefunden.";
    return;
  }

  countBox.textContent = `${products.length} Produkte gefunden`;

  products.forEach((p) => {
    const card = createProductCard(p, zustandMap, "grid");
    container.appendChild(card); // ✅ nur das – kein „div“ mehr!
  });
}


