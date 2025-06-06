document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("checkout-form");
  const submitBtn = document.getElementById("bestellen-btn");
  const successBox = document.getElementById("bestaetigung");
  const summaryContent = document.getElementById("summary-content");
  const warenkorb = JSON.parse(localStorage.getItem("warenkorb")) || [];

  // === Live-Validierung ===
  const required = ["vorname", "nachname", "email", "strasse", "hausnummer", "plz", "ort"];
const touchedFields = {};

function validateForm() {
  const fields = {
    vorname: { message: "Vorname ist erforderlich." },
    nachname: { message: "Nachname ist erforderlich." },
    email: { message: "Bitte gültige E-Mail angeben." },
    strasse: { message: "Strasse ist erforderlich." },
    hausnummer: { message: "Hausnummer ist erforderlich." },
    plz: { message: "PLZ muss 4-stellig sein." },
    ort: { message: "Ort ist erforderlich." }
  };

  let allValid = true;

  for (const id of required) {
    const input = document.getElementById(id);
    const errorEl = document.getElementById("error-" + id);
    const value = input.value.trim();

    let isValid = value !== "";
    if (id === "email") isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    if (id === "plz") isValid = /^\d{4}$/.test(value);

    // Nur anzeigen, wenn Feld schon benutzt wurde
    if (touchedFields[id]) {
      errorEl.textContent = isValid ? "" : fields[id].message;
    } else {
      errorEl.textContent = "";
    }

    if (!isValid) {
      allValid = false;
    }
  }

  submitBtn.disabled = !allValid;
}

  form.addEventListener("input", validateForm);
  validateForm(); // initial prüfen
// Merken, dass ein Feld einmal verlassen wurde
required.forEach(id => {
  const input = document.getElementById(id);
  input.addEventListener("blur", () => {
    touchedFields[id] = true;
    validateForm();
  });
});

  // === Warenkorb-Zusammenfassung anzeigen ===
  let total = 0;
  if (warenkorb.length === 0) {
    summaryContent.innerHTML = "<p>Ihr Warenkorb ist leer.</p>";
    submitBtn.disabled = true;
    return;
  }

  summaryContent.innerHTML = "";
  warenkorb.forEach(item => {
    total += item.preis;
    summaryContent.innerHTML += `
      <p><strong>${item.name}</strong> – ${item.farbe}, ${item.groesse}, ${item.zustand} – CHF ${item.preis.toFixed(2)}</p>
    `;
  });
  summaryContent.innerHTML += `<p><strong>Gesamtpreis:</strong> CHF ${total.toFixed(2)}</p>`;

  // === Formular absenden ===
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const kunde = {
      Vorname: form.vorname.value,
      Nachname: form.nachname.value,
      Email: form.email.value,
      Strasse: form.strasse.value,
      Hausnummer: form.hausnummer.value,
      Postleitzahl: form.plz.value,
      Ort: form.ort.value,
    };

    let kundenId;

    // 👤 Prüfen, ob Kunde schon existiert (per E-Mail)
    const kundenCheck = await databaseClient.executeSqlQuery(`
      SELECT Kunden_ID FROM kunden WHERE Email = '${kunde.Email}'
    `);

    if (kundenCheck?.[1]?.length > 0) {
      kundenId = kundenCheck[1][0].Kunden_ID;
    } else {
      // 👤 Neu anlegen, wenn nicht vorhanden
      const kundenInsert = await databaseClient.insertInto("kunden", kunde);
      if (!kundenInsert || kundenInsert.error) {
        alert("Fehler beim Speichern des Kunden.");
        return;
      }
      kundenId = kundenInsert.insertId;
    }

    const datum = new Date().toISOString().split("T")[0];
    const bestellung = {
      Kunden_ID: kundenId,
      Erstelldatum: datum,
      Gesamtpreis: total.toFixed(2),
      Zahlungsstatus: 0
    };

    const bestellungInsert = await databaseClient.insertInto("bestellungen", bestellung);
    if (!bestellungInsert || bestellungInsert.error) {
      alert("Fehler beim Speichern der Bestellung.");
      return;
    }

    const bestellungId = bestellungInsert.insertId;
    for (const item of warenkorb) {
      const produktZuordnung = {
        Produkt_ID: item.id,
        Bestellung_ID: bestellungId,
        Menge: item.menge || 1
      };
      await databaseClient.insertInto("produkte_bestellungen", produktZuordnung);
    }

    localStorage.removeItem("warenkorb");

 // Zufällige Bestellnummer generieren (z. B. mit Präfix B2S)
const zufallsNr = "B2S-" + Math.floor(100000 + Math.random() * 900000);

successBox.innerHTML = `
  <h3>🎉 <span style="color: #2e7d32">Vielen Dank für Ihre Bestellung!</span></h3>
  <p>Ihre Bestellung ist erfolgreich bei uns eingegangen.</p>
  <span class="bestellnummer">Bestellnummer: ${zufallsNr}</span>
  <p>Sobald Ihre Ware versandbereit ist, erhalten Sie von uns eine E-Mail mit weiteren Informationen sowie die Rechnung im Anhang.</p>
  <p>🧡 Vielen Dank für Ihr Vertrauen in <strong>Back2Style</strong>.</p>
  <button id="zurueckShopBtn" class="shop-btn">🔙 Zurück zum Shop</button>
`;


successBox.classList.remove("hidden");
document.getElementById("zurueckShopBtn").addEventListener("click", () => {
  window.location.href = "shop.html"; // passe ggf. den Pfad an
});


console.log("Erfolgsmeldung eingeblendet");

form.classList.add("hidden");

// Titel ausblenden nach erfolgreicher Bestellung
const title = document.getElementById("checkout-title");
if (title) {
  title.style.display = "none";
}

});
});


