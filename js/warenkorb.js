// Der Code wurde mithilfe von Unterrichtsmaterial von Herr Suter aus dem letzten Lehrjahr sowie demjenigen von Herr Hatz selbst geschrieben und anschliessend von ChatGPT überarbeitet was DRY sowie die Benennungen der Funktionen betrifft. Link zum Chat: https://chatgpt.com/share/6844a0a9-857c-800f-bbfc-908130331e99

function loadComponents() {
  const components = [
    { id: "header", file: "header.html", cb: setupNavigationAfterHeaderLoad },
    { id: "footer", file: "footer.html" },
    { id: "hero", file: "hero.html" },
    { id: "produktkachel-template", file: "produktkachel.html" }
  ];
  components.forEach(comp => includeComponent(comp.id, comp.file, comp.cb));
}

// Helper für das Erstellen und Auffüllen des Warenkorbs
function populateCart(warenkorb) {
  const cartItemsContainer = document.getElementById("cartItems");
  const gesamtpreisEl = document.getElementById("gesamtpreis");
  const template = document.getElementById("warenkorb-item-template");

  if (warenkorb.length === 0) {
    cartItemsContainer.innerHTML = "<p>Dein Warenkorb ist leer.</p>";
    gesamtpreisEl.textContent = "";
    return;
  }

  let gesamtpreis = 0;

  // Produkte hinzufügen
  warenkorb.forEach((item, index) => {
    const clone = template.content.cloneNode(true);
    clone.querySelector("img").src = item.bild || "default.jpg";  // Default-Bild, falls keines vorhanden ist
    clone.querySelector("h3").textContent = item.name;
    clone.querySelector(".farbe").textContent = `Farbe: ${item.farbe}`;
    clone.querySelector(".groesse").textContent = `Grösse: ${item.groesse}`;
    clone.querySelector(".zustand").textContent = `Zustand: ${item.zustand}`;
    clone.querySelector(".preis-warenkorb").textContent = `CHF ${item.preis.toFixed(2)}`;

    // Entfernen-Button
     const removeBtn = clone.querySelector(".remove");
    removeBtn.dataset.index = index;
    removeBtn.addEventListener("click", () => {
      warenkorb.splice(index, 1);
      localStorage.setItem("warenkorb", JSON.stringify(warenkorb));
      location.reload(); // Seite neu laden
    });

    cartItemsContainer.appendChild(clone);
    gesamtpreis += item.preis;
  });

  gesamtpreisEl.textContent = `Gesamt: CHF ${gesamtpreis.toFixed(2)}`;
}

function setupCheckout() {
  document.getElementById("zurKasse").addEventListener("click", () => {
    window.location.href = "checkout.html";
  });
};

document.addEventListener("DOMContentLoaded", () => {
  loadComponents();
  
  const warenkorb = JSON.parse(localStorage.getItem("warenkorb")) || [];
  populateCart(warenkorb);
  setupCheckout();
});
