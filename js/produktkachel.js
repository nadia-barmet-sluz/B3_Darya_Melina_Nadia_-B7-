function createProductCard(p, zustandMap) {
  const template = document.getElementById('produktkachel-template');
  const card = template.content.cloneNode(true);

  card.querySelector('img').src = p.Bild?.startsWith("http") ? p.Bild : `images/${p.Bild || "1170835_215.jpg"}`;
  card.querySelector('img').alt = p.Produktname;
  card.querySelector('.produkt-name').textContent = p.Produktname;
  card.querySelector('.preis').textContent = "CHF " + Number(p.Preis).toFixed(2);
  card.querySelector('.tag.kategorie').textContent = p.Kategorie;
  card.querySelector('.tag.zustand').textContent = zustandMap[p.Zustand];
  card.querySelector('.tag.farbe').textContent = p.Farbe;
  card.querySelector('.tag.groesse').textContent = p.Groesse;

  const wrapper = card.querySelector('.ShopBox');
  wrapper.addEventListener('click', () => {
    window.location.href = `product.html?id=${p.Produkt_ID}`;
  });

  return card;
}
