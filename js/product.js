// Der Code wurde mithilfe von Unterrichtsmaterial von Herr Suter aus dem letzten Lehrjahr sowie denjenigen von Herr Hatz selbst geschrieben und anschliessend von ChatGPT überarbeitet was DRY sowie die Benennungen der Funktionen betrifft. Link zum Chat: https://chatgpt.com/share/684492c0-786c-800f-b5a9-fd632eb030e6

const urlParams = new URLSearchParams(window.location.search);
const produktId = urlParams.get("id");

// Produktdetails laden & anzeigen
document.addEventListener("DOMContentLoaded", async () => {
  if (!produktId) return;
  const result = await databaseClient.executeSqlQuery(`
    SELECT p.Produktname, p.Preis, p.Bild, hk.Hauptkategorie_Name AS Kategorie,
           f.Farbe_Name AS Farbe, g.Groesse_Name AS Groesse, z.Zustand
    FROM produkte p
    JOIN hauptkategorie hk ON p.Hauptkategorie_ID = hk.Hauptkategorie_ID
    JOIN farben f ON p.Farbe_ID = f.Farbe_ID
    JOIN groessen g ON p.Groesse_ID = g.Groesse_ID
    JOIN zustand z ON p.Zustand_ID = z.Zustand_ID
    WHERE p.Produkt_ID = ${produktId}
  `);
  const produkt = result?.[1]?.[0];
  if (!produkt) return;

  // Setze Produktdaten ein
  document.getElementById("produktBild").src = produkt.Bild?.startsWith("http")
    ? produkt.Bild
    : produkt.Bild
      ? `images/${produkt.Bild}`
      : "images/1170835_215.jpg";
  document.getElementById("produktName").textContent = produkt.Produktname;
  document.getElementById("produktPreis").textContent = Number(produkt.Preis).toFixed(2);
  document.getElementById("produktKategorie").textContent = produkt.Kategorie;

  fillSelect("farbeSelect", produkt.Farbe, ["schwarz", "dunkelrot", "blau", "grau", "weiss"]);
  fillSelect("groesseSelect", produkt.Groesse, ["XS", "S", "M", "L", "XL"]);
  fillSelect("zustandSelect", zustandMap[produkt.Zustand], ["okay", "gut", "sehr gut", "ausgezeichnet"]);

  setupButtonHandlers();
});

function setupButtonHandlers() {
  const msg = document.getElementById("addMsg");
  const produktObjekt = {
    id: produktId,
    name: document.getElementById("produktName").textContent,
    preis: parseFloat(document.getElementById("produktPreis").textContent),
    farbe: document.getElementById("farbeSelect").value,
    groesse: document.getElementById("groesseSelect").value,
    zustand: document.getElementById("zustandSelect").value,
    bild: document.getElementById("produktBild").src,
    menge: 1
  };

  document.querySelector(".add-to-cart").onclick = () => {
    const warenkorb = JSON.parse(localStorage.getItem("warenkorb")) || [];
    warenkorb.push(produktObjekt);
    localStorage.setItem("warenkorb", JSON.stringify(warenkorb));
    msg.textContent = "Ihr Produkt wurde erfolgreich dem Warenkorb hinzugefügt.";
    msg.style.display = "block";
    setTimeout(() => msg.style.display = "none", 5000);
  };

  document.querySelector(".checkout").onclick = () => {
    const warenkorb = JSON.parse(localStorage.getItem("warenkorb")) || [];
    warenkorb.push(produktObjekt);
    localStorage.setItem("warenkorb", JSON.stringify(warenkorb));
    window.location.href = "checkout.html";
  };
}
