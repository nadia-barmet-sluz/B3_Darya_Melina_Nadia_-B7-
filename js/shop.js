const GROUP_NAME = "b7";
const PASSWORD = "snpgq0fq8amafv92";
const SERVER_URL = "https://ict-290.herokuapp.com/sql";

const databaseClient = {
  executeSqlQuery: async (sql) => {
    const payload = { group: GROUP_NAME, pw: PASSWORD, sql };
    const response = await fetch(SERVER_URL, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify(payload),
    });
    const result = await response.json();
    return result;
  },
};

const showProduct = async (id) => {
  const sql = `
      SELECT
        p.Produkt_ID,
        p.Produktname,
        p.Preis,
        p.Bild,
        f.Farbe,
        g.Groesse,
        z.Zustand,
        k.Kategoriename,
        p.Lagerbestand
      FROM produkte p
      JOIN farben f ON p.Farbe_ID = f.Farbe_ID
      JOIN groessen g ON p.Groesse_ID = g.Groesse_ID
      JOIN zustand z ON p.Zustand_ID = z.Zustand_ID
      JOIN hauptkategorien k ON p.Hauptkategorie_ID = k.Hauptkategorie_ID
      WHERE p.Produkt_ID = ${id}
    `;

  const result = await databaseClient.executeSqlQuery(sql);
  const produkt = result[1][0]; // Daten sind im zweiten Array

  const container = document.getElementById("produkt-details");

  container.innerHTML = `
      <h2>${produkt.Produktname}</h2>
      <img src="${produkt.Bild}" alt="${produkt.Produktname}" width="200" />
      <p><strong>Preis:</strong> ${produkt.Preis} €</p>
      <p><strong>Farbe:</strong> ${produkt.Farbe}</p>
      <p><strong>Größe:</strong> ${produkt.Groesse}</p>
      <p><strong>Zustand:</strong> ${produkt.Zustand}</p>
      <p><strong>Kategorie:</strong> ${produkt.Kategoriename}</p>
      <p><strong>Lagerbestand:</strong> ${produkt.Lagerbestand}</p>
      <button onclick="window.history.back()">Zurück</button>
    `;
};

// Beispiel: Produkt mit ID = 1 anzeigen
showProduct(1);
