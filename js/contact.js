document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("contact-form");
  const submitBtn = document.getElementById("submit-btn");
  const requiredFields = ["vorname", "name", "email", "nachricht"];
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const telRegex = /^\+41\s\d{2}\s\d{3}\s\d{2}\s\d{2}$/;

  function validateField(id, regex = null) {
    const el = document.getElementById(id);
    const value = el.value.trim();
    if (!value) return false;
    return regex ? regex.test(value) : true;
  }

  function validateForm() {
    // Button wird aktiv, sobald alle Pflichtfelder ausgefüllt sind (Format egal)
    const allFilled = requiredFields.every((id) => {
      const el = document.getElementById(id);
      return el && el.value.trim() !== "";
    });

    // Formatprüfung (zeigt Browser-Fehlermeldung bei Submit)
    const emailValid = validateField("email", emailRegex);
    const telField = document.getElementById("telefon");
    const telValid = !telField.value || telRegex.test(telField.value);

    document
      .getElementById("email")
      .setCustomValidity(
        emailValid ? "" : "Bitte eine gültige E-Mail-Adresse eingeben."
      );

    telField.setCustomValidity(
      telField.value && !telValid ? "Format: +41 26 123 45 67" : ""
    );

    // Button nur abhängig von Pflichtfeldern aktivieren
    submitBtn.disabled = !allFilled;
  }

  form.addEventListener("input", validateForm);
});

let isSubmitting = false;
document

  .getElementById("contact-form")
  .addEventListener("submit", async (event) => {
    event.preventDefault();

    if (isSubmitting) return;
    isSubmitting = true;

    const spinner = document.getElementById("spinner");
    const successMsg = document.getElementById("success-msg");

    spinner.classList.remove("hidden");
    successMsg.classList.add("hidden");

    const formData = {
      Vorname: document.getElementById("vorname").value,
      Nachname: document.getElementById("name").value,
      Email: document.getElementById("email").value,
      Telefonnummer: document.getElementById("telefon").value,
      Nachricht: document.getElementById("nachricht").value,
    };

    const result = await databaseClient.insertInto("kontaktformular", formData);

    spinner.classList.add("hidden");

    if (result && !result.error) {
      successMsg.classList.remove("hidden");
      document.getElementById("contact-form").reset();
    }

    isSubmitting = false;
  });
