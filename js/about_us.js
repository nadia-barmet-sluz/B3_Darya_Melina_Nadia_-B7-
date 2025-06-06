const segments = ["5%", "10%", "15%", "20%", "Leider nichts"];
const codes = {
  "5%": "RABATT5",
  "10%": "RABATT10",
  "15%": "RABATT15",
  "20%": "RABATT20",
  "Leider nichts": "Kein Code",
};

const usedEmails = JSON.parse(localStorage.getItem("usedEmails") || "[]");
let spinning = false;

function spin() {
  const emailInput = document.getElementById("email");
  const email = emailInput.value.trim().toLowerCase();

  if (!email || !email.includes("@")) {
    alert("Bitte gib eine gültige E-Mail-Adresse ein.");
    return;
  }

  if (usedEmails.includes(email)) {
    alert("Diese E-Mail hat bereits teilgenommen.");
    return;
  }

  if (spinning) return;
  spinning = true;

  const wheel = document.getElementById("wheel");
  const deg = 360 * 4 + Math.floor(Math.random() * 360);
  wheel.style.transform = `rotate(${deg}deg)`;

  const segmentSize = 360 / segments.length;
  const selected = (360 - (deg % 360)) % 360;
  const index = Math.floor(selected / segmentSize);

  setTimeout(() => {
    const resultText = segments[index];
    const code = codes[resultText];
    document.getElementById("result").textContent =
      resultText === "Leider nichts"
        ? "Leider kein Rabatt gewonnen 😢"
        : `🎉 Glückwunsch! Du bekommst ${resultText} Rabatt. Dein Code: ${code}`;

    usedEmails.push(email);
    localStorage.setItem("usedEmails", JSON.stringify(usedEmails));
    spinning = false;
  }, 4000);
}

// Pop-up automatisch anzeigen
window.onload = () => {
  document.getElementById("popup").style.display = "flex";
};

function closePopup() {
  document.getElementById("popup").style.display = "none";
}

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1 }
);

document.querySelectorAll(".info-card").forEach((card) => {
  observer.observe(card);
});
