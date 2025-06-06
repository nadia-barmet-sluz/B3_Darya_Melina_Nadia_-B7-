document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("contact-form");
  const submitBtn = document.getElementById("submit-btn");
  const required = ["vorname", "name", "email", "nachricht"];

  form.addEventListener("input", () => {
    const filled = required.every((id) => document.getElementById(id).value.trim() !== "");
    submitBtn.disabled = !filled;
  });

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
