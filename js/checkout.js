// Der Code wurde mit optimierter Validierung und einer besseren Handhabung der SQL-Inserts überarbeitet
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

document.addEventListener("DOMContentLoaded", () => {
  attachValidation("checkout-form", [
    { id: "vorname", message: "Vorname ist erforderlich." },
    { id: "nachname", message: "Nachname ist erforderlich." },
    { id: "email", message: "Bitte gültige E-Mail angeben.", pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
    { id: "strasse", message: "Strasse ist erforderlich." },
    { id: "hausnummer", message: "Hausnummer ist erforderlich." },
    { id: "plz", message: "PLZ muss genau 4 Ziffern haben.", pattern: /^\d{4}$/ },
    { id: "ort", message: "Ort ist erforderlich." }
  ]);

  const form = document.getElementById("checkout-form");
  const submitBtn = document.getElementById("bestellen-btn");
  const successBox = document.getElementById("bestaetigung");
  const summaryContent = document.getElementById("summary-content");

  const warenkorb = JSON.parse(localStorage.getItem("warenkorb")) || [];
  let total = 0;
  let discount = 0;

  if (warenkorb.length === 0) {
    summaryContent.innerHTML = "<p>Ihr Warenkorb ist leer.</p>";
    submitBtn.disabled = true;
    return;
  }

  warenkorb.forEach(item => {
    total += item.preis;
    summaryContent.innerHTML += `<p>${item.name} – ${item.farbe}, ${item.groesse}, ${item.zustand} – CHF ${item.preis.toFixed(2)}</p>`;
  });

  summaryContent.innerHTML += `<p><strong>Gesamtpreis:</strong> CHF <strong>${total.toFixed(2)}</strong></p>`;

  function applyDiscount(code) {
    discount = 0;
    if (code === "RABATT5") {
      discount = 0.05;
    } else if (code === "RABATT10") {
      discount = 0.10;
    } else if (code === "RABATT15") {
      discount = 0.15;
    } else if (code === "RABATT20") {
      discount = 0.20;
    }

    if (discount > 0) {
      const discountedPrice = total - (total * discount);
      summaryContent.innerHTML += `<p><strong>Rabatt (${code}):</strong> -CHF ${(total * discount).toFixed(2)}</p>`;
      summaryContent.innerHTML += `<p><strong>Gesamtpreis nach Rabatt:</strong> CHF <strong>${discountedPrice.toFixed(2)}</strong></p>`;
      total = discountedPrice;
    } else {
      summaryContent.innerHTML += `<p><strong>Kein gültiger Rabatt-Code.</strong></p>`;
    }
  }

  const rabattCodeInput = document.getElementById("rabatt-code");
  const errorRabattCode = document.querySelector("#error-rabatt-code");

  rabattCodeInput.addEventListener('blur', () => {
    const rabattCode = rabattCodeInput.value.trim().toUpperCase();
    if (rabattCode) {
      applyDiscount(rabattCode);
      if (discount === 0) {
        rabattCodeInput.classList.add("invalid");
        rabattCodeInput.classList.remove("valid");
        errorRabattCode.textContent = "Ungültiger Rabatt-Code.";
      } else {
        rabattCodeInput.classList.add("valid");
        rabattCodeInput.classList.remove("invalid");
        errorRabattCode.textContent = "";
      }
    }
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const datum = new Date().toISOString().split("T")[0];  // Beispiel: 2025-06-08
    let kundenId = 123; // Placeholder für die Kunden-ID, diese muss korrekt ermittelt werden

    const bestellung = {
      Kunden_ID: kundenId,
      Erstelldatum: datum,
      Gesamtpreis: total.toFixed(2),
      Zahlungsstatus: 0
    };

    try {
      const kundenCheck = await databaseClient.executeSqlQuery(`
        SELECT Kunden_ID FROM kunden WHERE Email = '${form.email.value}'
      `);
    
      const testConnection = await databaseClient.executeSqlQuery("SELECT 1");
      console.log("Verbindung zur Datenbank erfolgreich:", testConnection);

      if (kundenCheck?.[1]?.length > 0) {
        kundenId = kundenCheck[1][0].Kunden_ID;
      } else {
        const kundenInsert = await databaseClient.insertInto("kunden", {
          Vorname: form.vorname.value,
          Nachname: form.nachname.value,
          Email: form.email.value,
          Strasse: form.strasse.value,
          Hausnummer: form.hausnummer.value,
          Postleitzahl: form.plz.value,
          Ort: form.ort.value
        });
        if (!kundenInsert || kundenInsert.error) {
          throw new Error("Fehler beim Speichern des Kunden.");
        }
        kundenId = kundenInsert.insertId;
      }

      const bestellungInsert = await databaseClient.insertInto("bestellungen", bestellung);
      if (!bestellungInsert || bestellungInsert.error) {
        throw new Error("Fehler beim Speichern der Bestellung.");
      }

      const bestellungId = bestellungInsert.insertId;
      for (const item of warenkorb) {
        const produktZuordnung = {
          Produkt_ID: item.id,
          Bestellung_ID: bestellungId,
          Menge: 1,
        };
        await databaseClient.insertInto("produkte_bestellungen", produktZuordnung);
      }

      localStorage.removeItem("warenkorb");

      const zufallsNr = "B2S-" + Math.floor(100000 + Math.random() * 900000);

      successBox.innerHTML = `
        <h3>Vielen Dank für Ihre Bestellung!</h3>
        <p>Ihre Bestellung ist erfolgreich bei uns eingegangen.</p>
        <span class="bestellnummer">Bestellnummer: ${zufallsNr}</span>
        <p>Sobald Ihre Ware versandbereit ist, erhalten Sie von uns eine E-Mail mit der Trackingnummer.</p>
        <button id="zurueckShopBtn" class="btn bg-schwarz btn-hover-pflaume mb-2">Zurück zum Shop</button>
      `;
      successBox.classList.remove("hidden");

      document.getElementById("zurueckShopBtn").addEventListener("click", () => {
        window.location.href = "shop.html";
      });
      
      form.classList.add("hidden");
      document.getElementById("checkout-title").style.display = "none";
    } catch (error) {
      console.error("Fehler bei der Bestellung:", error);
      alert("Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.");
    }
  });
});