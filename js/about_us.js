document.addEventListener("DOMContentLoaded", () => {
  const usedEmails = JSON.parse(localStorage.getItem("usedEmails") || "[]");
  let spinning = false;
  let popupClosed = false;
  let number = 5000;

  const container = document.querySelector(".container");
  const btn = document.getElementById("spin");
  const popup = document.getElementById("popup");
  const hero = document.getElementById("hero");



window.addEventListener("scroll", () => {
  if (!popupClosed && window.scrollY > 50) {
    popup.classList.add("visible");
  }
});

window.closePopup = function () {
  popup.classList.remove("visible");
  popupClosed = true;
};


  btn.onclick = function () {
    const emailInput = document.getElementById("email").value.trim().toLowerCase();

    if (!emailInput.includes("@")) {
      alert("Bitte gib eine gültige E-Mail-Adresse ein.");
      return;
    }

    if (usedEmails.includes(emailInput)) {
      alert("Diese E-Mail hat bereits teilgenommen.");
      return;
    }

    if (spinning) return;
    spinning = true;

    container.style.transform = "rotate(" + number + "deg)";
    number += 360 * 8 + Math.floor(Math.random() * 360);

    container.addEventListener("transitionend", handleResult, { once: true });

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
          ? `🎉 Du hast ${result.value} Rabatt gewonnen!<br>🛒 Rabattcode: <strong>${result.code}</strong>`
          : "😢 Leider kein Gewinn";

        document.getElementById("result").innerHTML = resultText;

        usedEmails.push(emailInput);
        localStorage.setItem("usedEmails", JSON.stringify(usedEmails));
        spinning = false;
      }
    }
  };
});
