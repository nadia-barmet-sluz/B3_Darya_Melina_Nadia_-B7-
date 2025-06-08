// Der Code wurde mithilfe von Unterrichtsmaterial von Herr Suter aus dem letzten Lehrjahr sowie demjenigen von Herr Hatz selbst geschrieben und anschliessend von ChatGPT überarbeitet was DRY sowie die Benennungen der Funktionen betrifft: https://chatgpt.com/share/68450512-36cc-800f-a6fc-c78d093621ed
function attachValidation(formId, config) {
  const form = document.getElementById(formId);
  if (!form) return;
  const submitBtn = form.querySelector("button[type='submit']");
  const touchedFields = {};

  // Hilfsfunktion zum Validieren eines Feldes
  function validateField(field, value) {
    const input = form.querySelector(`#${field.id}`);
    const errorEl = form.querySelector(`#error-${field.id}`);
    let isValid = !!value;
    
    if (field.pattern) isValid = field.pattern.test(value);
    errorEl.textContent = touchedFields[field.id] && !isValid ? field.message : "";
    
    if (isValid && touchedFields[field.id]) {
      input.classList.add("valid");
      input.classList.remove("invalid");
    } else if (!isValid && touchedFields[field.id]) {
      input.classList.add("invalid");
      input.classList.remove("valid");
    }

    return isValid;
  }

   // Funktion zur Überprüfung des gesamten Formulars
  function validateForm() {
    let allValid = true;
    config.forEach(field => {
      const value = form.querySelector(`#${field.id}`).value.trim();
      if (!validateField(field, value)) allValid = false;
    });
    if (submitBtn) submitBtn.disabled = !allValid;
  }

  // Event-Listener für die Eingabefelder
  config.forEach(({ id }) => {
    const input = form.querySelector(`#${id}`);
    if (!input) return;

    input.addEventListener("focus", () => touchedFields[id] = false);
    input.addEventListener("input", () => { touchedFields[id] = true; validateForm(); });
    input.addEventListener("blur", () => { touchedFields[id] = true; validateForm(); });
  });

  validateForm();
}

document.addEventListener("DOMContentLoaded", function () {
   attachValidation("contact-form", [
    { id: "vorname", message: "Vorname ist erforderlich." },
    { id: "name", message: "Name ist erforderlich." },
    { id: "email", message: "Bitte gültige E-Mail angeben.", pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
    { id: "nachricht", message: "Nachricht ist erforderlich." }
  ]);

  const form = document.getElementById("contact-form");
  const submitBtn = document.getElementById("submit-btn");
  const required = ["vorname", "name", "email", "nachricht"];

   form.addEventListener("input", () => {
    const filled = required.every((id) => document.getElementById(id).value.trim() !== "");
    submitBtn.disabled = !filled; 
  });

  // Formular absenden
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const spinner = document.getElementById("spinner");
    const successMsg = document.getElementById("success-msg");
    spinner.classList.remove("hidden");
    successMsg.classList.add("hidden");

    const formData = {
      Vorname: form.vorname.value,
      Nachname: form.name.value,
      Email: form.email.value,
      Telefonnummer: form.telefon.value,
      Nachricht: form.nachricht.value,
    };

    const result = await databaseClient.insertInto("kontaktformular", formData);
    spinner.classList.add("hidden");
    if (result && !result.error) {
      successMsg.classList.remove("hidden");
      form.reset();
    }
  });
});