const urlParams = new URLSearchParams(window.location.search);
const produktId = urlParams.get("id");

const zustandMap = {
  0: "okay",
  1: "gut",
  2: "sehr gut",
  3: "ausgezeichnet"
};

async function loadProductDetail() {
  if (!produktId) return;

  const result = await databaseClient.executeSqlQuery(`
    SELECT 
      p.Produktname, p.Preis, p.Bild,
      hk.Hauptkategorie_Name AS Kategorie,
      f.Farbe_Name AS Farbe,
      g.Groesse_Name AS Groesse,
      z.Zustand
    FROM produkte p
    JOIN hauptkategorie hk ON p.Hauptkategorie_ID = hk.Hauptkategorie_ID
    JOIN farben f ON p.Farbe_ID = f.Farbe_ID
    JOIN groessen g ON p.Groesse_ID = g.Groesse_ID
    JOIN zustand z ON p.Zustand_ID = z.Zustand_ID
    WHERE p.Produkt_ID = ${produktId}
  `);

  const produkt = result?.[1]?.[0];
  if (!produkt) return;

  // Bild
  const bild = produkt.Bild?.startsWith("http")
    ? produkt.Bild
    : produkt.Bild
      ? `images/${produkt.Bild}`
      : "images/1170835_215.jpg";
  document.getElementById("produktBild").src = bild;
  document.getElementById("produktBild").alt = produkt.Produktname;

  // Texte einsetzen
  document.getElementById("produktName").textContent = produkt.Produktname;
  document.getElementById("produktPreis").textContent = Number(produkt.Preis).toFixed(2);
  document.getElementById("produktKategorie").textContent = produkt.Kategorie;

  // Dropdowns einsetzen
  fillSelect("farbeSelect", produkt.Farbe, ["schwarz", "dunkelrot", "blau", "grau", "weiss"]);
  fillSelect("groesseSelect", produkt.Groesse, ["XS", "S", "M", "L", "XL"]);
  fillSelect("zustandSelect", zustandMap[produkt.Zustand], ["okay", "gut", "sehr gut", "ausgezeichnet"]);

document.querySelector(".add-to-cart").addEventListener("click", () => {
  const produkt = {
    id: produktId,
    name: document.getElementById("produktName").textContent,
    preis: parseFloat(document.getElementById("produktPreis").textContent),
    farbe: document.getElementById("farbeSelect").value,
    groesse: document.getElementById("groesseSelect").value,
    zustand: document.getElementById("zustandSelect").value,
    bild: document.getElementById("produktBild").src,
    menge: 1
  };

  const warenkorb = JSON.parse(localStorage.getItem("warenkorb")) || [];
  warenkorb.push(produkt);
  localStorage.setItem("warenkorb", JSON.stringify(warenkorb));

 
  window.location.href = "warenkorb.html";
});

  // 👉 Neue Bestätigung einblenden
  const msg = document.getElementById("addMsg");
  msg.textContent = "✅ Ihr Produkt wurde erfolgreich dem Warenkorb hinzugefügt.";
  msg.style.display = "block";

  // h 5 Sekunden ausblenden
  setTimeout(() => {
    msg.style.display = "none";
  }, 5000);
};

document.querySelector(".checkout").addEventListener("click", () => {
  const produkt = {
    id: produktId,
    name: document.getElementById("produktName").textContent,
    preis: parseFloat(document.getElementById("produktPreis").textContent),
    farbe: document.getElementById("farbeSelect").value,
    groesse: document.getElementById("groesseSelect").value,
    zustand: document.getElementById("zustandSelect").value,
    bild: document.getElementById("produktBild").src,
    menge: 1
  };

  const warenkorb = JSON.parse(localStorage.getItem("warenkorb")) || [];
  warenkorb.push(produkt);
  localStorage.setItem("warenkorb", JSON.stringify(warenkorb));

  window.location.href = "checkout.html";
});



function fillSelect(id, selected, options) {
  const select = document.getElementById(id);
  select.innerHTML = "";
  options.forEach(opt => {
    const option = document.createElement("option");
    option.value = opt;
    option.textContent = opt;
    if (opt === selected) option.selected = true;
    select.appendChild(option);
  });
}

document.addEventListener("DOMContentLoaded", loadProductDetail);
