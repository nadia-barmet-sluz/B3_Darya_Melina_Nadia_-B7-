// Der Code wurde mithilfe verschiedener Quellen selbst geschrieben und anschliessend von ChatGPT überarbeitet was DRY sowie die Benennungen der Funktionen betrifft. Link zum Chat: https://chatgpt.com/share/6844fadb-7e34-800f-9a9c-c2382b6beb08
// Quellen zur Inspiration: https://wisepops.com/blog/html-popup & https://www.w3schools.com/howto/howto_js_popup_form.asp

document.addEventListener("DOMContentLoaded", () => {
  const usedEmails = JSON.parse(localStorage.getItem("usedEmails") || "[]");
  let spinning = false;
  let popupClosed = false;
  let number = 5000;

  const container = document.querySelector(".container");
  const btn = document.getElementById("spin");
  const popup = document.getElementById("popup");
  const closeBtn = document.querySelector(".close-btn");

  const emailInput = document.getElementById("email");
  const errorMessage = document.getElementById("error-message");

  // Verzögere die Anzeige des Popups nach 3 Sekunden
  setTimeout(() => {
    if (!popupClosed) {
      popup.style.pointerEvents = 'auto'; 
      popup.classList.remove("off");
      popup.classList.add("visible"); 
    }
  }, 3000);

  // Dreh-Logik
  btn.onclick = function () {
    const email = emailInput.value.trim().toLowerCase();

    if (!validateEmail(email)) {
      showError("Bitte geben Sie eine gültige E-Mail Adresse ein.");
      return;
    }
    if (usedEmails.includes(email)) {
      showError("Diese E-Mail Adresse hat bereits teilgenommen.");
      return;
    }

    hideError();

    if (spinning) return;
    spinning = true;

    container.style.transform = `rotate(${number}deg)`;
    number += 360 * 8 + Math.floor(Math.random() * 360);

    container.addEventListener("transitionend", handleResult, { once: true });
  };

  function handleResult() {
    const transform = getComputedStyle(container).transform;
    if (transform !== "none") {
      const values = transform.split('(')[1].split(')')[0].split(',');
      const a = values[0];
      const b = values[1];
      const radians = Math.atan2(b, a);
      let degrees = radians * (180 / Math.PI);
      if (degrees < 0) degrees += 360;

      const index = Math.floor((degrees + 22.5) / 45) % 8;

      const segmentMap = [
        { value: "10%", color: "#3f51b5", code: "RABATT10" },
        { value: "", color: "#7a7a7a", code: null },
        { value: "15%", color: "#e91e63", code: "RABATT15" },
        { value: "", color: "#7a7a7a", code: null },
        { value: "20%", color: "#009688", code: "RABATT20" },
        { value: "", color: "#7a7a7a", code: null },
        { value: "5%", color: "#9c27b0", code: "RABATT5" },
        { value: "", color: "#7a7a7a", code: null }
      ];

      const result = segmentMap[index];
      const resultText = result.code
        ? `Sie haben ${result.value} Rabatt gewonnen!<br>Rabattcode: <strong>${result.code}</strong>`
        : "Leider kein Gewinn";

      document.getElementById("result").innerHTML = resultText;

      usedEmails.push(email);
      localStorage.setItem("usedEmails", JSON.stringify(usedEmails));
      spinning = false;
    }
  }

  // Fehlerbehandlung für ungültige oder bereits verwendete E-Mail
  function showError(message) {
    errorMessage.textContent = message;
    emailInput.classList.add("invalid");
    emailInput.classList.remove("valid");
    errorMessage.classList.add("visible");
  }

  function hideError() {
    errorMessage.textContent = "";
    emailInput.classList.remove("invalid");
    emailInput.classList.add("valid");
    errorMessage.classList.remove("visible");
  }

  // Popup schliessen
  window.closePopup = function () {
    popup.style.pointerEvents = 'none';
    popup.classList.remove("visible");
    popup.classList.add("off");
    popupClosed = true;
  };

  if (closeBtn) {
    closeBtn.addEventListener("click", closePopup);
  }
});
