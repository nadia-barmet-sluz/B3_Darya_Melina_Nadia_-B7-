document.addEventListener("DOMContentLoaded", async () => {
  const sliderTrack = document.getElementById("sliderTrack");

  const result = await databaseClient.executeSqlQuery(`
    SELECT 
      p.Produkt_ID, p.Produktname, p.Preis, p.Bild,
      hk.Hauptkategorie_Name AS Kategorie,
      f.Farbe_Name AS Farbe,
      g.Groesse_Name AS Groesse,
      z.Zustand
    FROM produkte p
    JOIN hauptkategorie hk ON p.Hauptkategorie_ID = hk.Hauptkategorie_ID
    JOIN farben f ON p.Farbe_ID = f.Farbe_ID
    JOIN groessen g ON p.Groesse_ID = g.Groesse_ID
    JOIN zustand z ON p.Zustand_ID = z.Zustand_ID
    ORDER BY RAND()
    LIMIT 10
  `);

  const zustandMap = {
    0: "okay",
    1: "gut",
    2: "sehr gut",
    3: "ausgezeichnet"
  };

  const produkte = result?.[1] || [];
  produkte.forEach(p => {
    const card = createProductCard(p, zustandMap);
    sliderTrack.appendChild(card);
  });

  setupSlider(); // Navigation aktivieren
});

function setupSlider() {
  const track = document.querySelector(".slider-track");
  const slides = Array.from(track.children);
  const prevBtn = document.querySelector(".slider-btn.prev");
  const nextBtn = document.querySelector(".slider-btn.next");

  const visibleCount = 4;
  let currentIndex = 0;

  // Klone vorne und hinten
  for (let i = 0; i < visibleCount; i++) {
    const cloneStart = slides[i].cloneNode(true);
    const cloneEnd = slides[slides.length - 1 - i].cloneNode(true);
    track.appendChild(cloneStart);
    track.insertBefore(cloneEnd, track.firstChild);
  }

  const allSlides = Array.from(track.children);
  const slideWidth = allSlides[0].getBoundingClientRect().width;
  let position = slideWidth * visibleCount;

  track.style.transform = `translateX(-${position}px)`;

  function updateSlider(newIndex) {
    position = slideWidth * (visibleCount + newIndex);
    track.style.transition = "transform 0.4s ease";
    track.style.transform = `translateX(-${position}px)`;
    currentIndex = newIndex;
  }

  nextBtn.addEventListener("click", () => {
    if (currentIndex < slides.length) {
      updateSlider(currentIndex + 1);
    } else {
      // Sofort zurücksetzen + animieren
      track.style.transition = "none";
      track.style.transform = `translateX(-${slideWidth * visibleCount}px)`;
      currentIndex = 0;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => updateSlider(1));
      });
    }
  });

  prevBtn.addEventListener("click", () => {
    if (currentIndex > -1) {
      updateSlider(currentIndex - 1);
    } else {
      track.style.transition = "none";
      track.style.transform = `translateX(-${slideWidth * (slides.length)}px)`;
      currentIndex = slides.length - 1;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => updateSlider(currentIndex));
      });
    }
  });
}
