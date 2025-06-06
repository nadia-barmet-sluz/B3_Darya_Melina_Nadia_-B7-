function createProductCard(p, zustandMap) {
  const div = document.createElement("div");
  div.className = "ShopBox"; // ✅ Einheitlichs

  const bild = p.Bild?.startsWith("http")
    ? p.Bild
    : p.Bild
      ? `images/${p.Bild}`
      : "images/1170835_215.jpg";

  div.innerHTML = `
    <img src="${bild}" alt="${p.Produktname}" />
    <div class="ShopBoxInhalt">
      <div class="produkt-name">${p.Produktname}</div>
      <div class="preis">CHF ${Number(p.Preis).toFixed(2)}</div>
      <div class="tag-grid">
        <span class="tag kategorie">${p.Kategorie}</span>
        <span class="tag zustand">${zustandMap[p.Zustand]}</span>
        <div class="row-tags">
          <span class="tag farbe">${p.Farbe}</span>
          <span class="tag groesse">${p.Groesse}</span>
        </div>
      </div>
    </div>
  `;

  div.addEventListener("click", () => {
    window.location.href = `product.html?id=${p.Produkt_ID}`;
  });

  return div;
}


div.className = "ShopBox"; // Einheitlich
