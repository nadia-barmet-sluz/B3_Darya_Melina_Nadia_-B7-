document.addEventListener("DOMContentLoaded", () => {
  const cartItemsContainer = document.getElementById("cartItems");
  const gesamtpreisEl = document.getElementById("gesamtpreis");
  const warenkorb = JSON.parse(localStorage.getItem("warenkorb")) || [];

  if (warenkorb.length === 0) {
    cartItemsContainer.innerHTML = "<p>Dein Warenkorb ist leer.</p>";
    gesamtpreisEl.textContent = "";
    return;
  }

  let gesamtpreis = 0;

  warenkorb.forEach((item, index) => {
    const div = document.createElement("div");
    div.className = "warenkorb-item";

    div.innerHTML = `
      <img src="${item.bild}" alt="${item.name}" />
      <div class="info">
        <h3>${item.name}</h3>
        <p>Farbe: ${item.farbe}</p>
        <p>Grösse: ${item.groesse}</p>
        <p>Zustand: ${item.zustand}</p>
        <p>CHF ${item.preis.toFixed(2)}</p>
        <button data-index="${index}" class="remove">❌ Entfernen</button>
      </div>
    `;
    cartItemsContainer.appendChild(div);
    gesamtpreis += item.preis;
  });

  gesamtpreisEl.textContent = `Gesamt: CHF ${gesamtpreis.toFixed(2)}`;

  // Entfernen-Button
  document.querySelectorAll(".remove").forEach(btn => {
    btn.addEventListener("click", () => {
      const index = btn.dataset.index;
      warenkorb.splice(index, 1);
      localStorage.setItem("warenkorb", JSON.stringify(warenkorb));
      location.reload();
    });
  });

  // Zur Kasse (Demo)
document.getElementById("zurKasse").addEventListener("click", () => {
  window.location.href = "checkout.html";
});
});


document.getElementById("zurKasse").addEventListener("click", async () => {
  const warenkorb = JSON.parse(localStorage.getItem("warenkorb")) || [];
  if (warenkorb.length === 0) return;

  // 1. Neue Bestellung erfassen
  const bestellungErstellenSQL = `
    INSERT INTO bestellungen (Datum) VALUES (NOW())
  `;
  const result = await databaseClient.executeSqlQuery(bestellungErstellenSQL);
  const bestellId = result?.insertId;

  // 2. Produkte verknüpfen
  for (const produkt of warenkorb) {
    const produktId = produkt.id; // ← wichtig: beim Hinzufügen in localStorage muss .id mitgegeben werden!
    const menge = 1;

    const insertSQL = `
      INSERT INTO produkte_bestellungen (Produkt_ID, Bestellung_ID, Menge)
      VALUES (${produktId}, ${bestellId}, ${menge})
    `;
    await databaseClient.executeSqlQuery(insertSQL);
  }

  // 3. Warenkorb leeren
  localStorage.removeItem("warenkorb");
  alert("✅ Bestellung erfolgreich gespeichert!");
  window.location.href = "danke.html"; // oder andere Seite
});
