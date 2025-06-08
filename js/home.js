// Der Code wurde mithilfe verschiedener Quellen selbst geschrieben und anschliessend von ChatGPT überarbeitet was DRY sowie die Benennungen der Funktionen betrifft. Link zum Chat: https://chatgpt.com/share/6844618d-207c-800f-9ec0-af20f9123a59

document.addEventListener("DOMContentLoaded", async () => {
  await waitForTemplate();
  const sliderTrack = document.getElementById("sliderTrack");
  await loadAndDisplayProducts(sliderTrack);

  // Achtung: setupLoopSlider NICHT nochmal separat aufrufen!
  window.addEventListener("resize", () => {
    setupLoopSlider(sliderTrack, getVisibleCount());
  });
});

// Responsive Anzahl Kacheln
// Inspiration: Swiper.js breakpoints https://swiperjs.com/swiper-api#param-breakpoints
function getVisibleCount() {
  const w = window.innerWidth;
  if (w <= 500) return 2;
  if (w <= 900) return 3;
  return 4;
}

// SLIDER MIT LOOP
// Inspirationen:
// - https://css-tricks.com/css-only-carousel/
// - https://swiperjs.com/get-started (Loop erklärt unter "Loop mode")
// - https://developer.mozilla.org/en-US/docs/Web/API/Element/cloneNode
// - https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect

function setupLoopSlider(track, visibleCount = 4) {
  if (!track) return;

  let slides = Array.from(track.children).filter(el => !el.classList.contains('slider-clone'));
  track.innerHTML = '';
  slides.forEach(el => track.appendChild(el));

  // Loop Clones (am Anfang/Ende)
  for (let i = 0; i < visibleCount; i++) {
    let first = slides[i].cloneNode(true);
    first.classList.add('slider-clone');
    let last = slides[slides.length - 1 - i].cloneNode(true);
    last.classList.add('slider-clone');
    track.appendChild(first);
    track.insertBefore(last, track.firstChild);
  }

  let allSlides = Array.from(track.children);
  let slideStyle = getComputedStyle(allSlides[0]);
  let slideWidth = allSlides[0].getBoundingClientRect().width
    + parseFloat(slideStyle.marginLeft)
    + parseFloat(slideStyle.marginRight);

  let currentIndex = 0;
  let position = slideWidth * visibleCount;

  track.style.transition = "none";
  track.style.transform = `translateX(-${position}px)`;

  const nextBtn = document.querySelector(".slider-btn.next");
  const prevBtn = document.querySelector(".slider-btn.prev");

  // Buttons zum Navigieren
  nextBtn.onclick = () => {
    if (currentIndex < slides.length) {
      currentIndex++;
      update();
    } else {
      jumpToStart();
    }
  };
  prevBtn.onclick = () => {
    if (currentIndex > 0) {
      currentIndex--;
      update();
    } else {
      jumpToEnd();
    }
  };

  function update() {
    position = slideWidth * (visibleCount + currentIndex);
    track.style.transition = "transform 0.4s cubic-bezier(.62,.01,.5,1.02)";
    track.style.transform = `translateX(-${position}px)`;
  }
  function jumpToStart() {
    track.style.transition = "none";
    track.style.transform = `translateX(-${slideWidth * visibleCount}px)`;
    currentIndex = 0;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        currentIndex++;
        update();
      });
    });
  }
  function jumpToEnd() {
    track.style.transition = "none";
    track.style.transform = `translateX(-${slideWidth * (slides.length + visibleCount)}px)`;
    currentIndex = slides.length - 1;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        currentIndex--;
        update();
      });
    });
  }
}