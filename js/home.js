function initHomeJs() {
  window.scrollTo(0, 0);
  const nav = document.getElementById("nav");
  const hero = document.querySelector(".hero");
  let hasJumped = false;

  if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
  }

  window.addEventListener("scroll", () => {
    if (window.scrollY > 10 && nav) {
      nav.style.transform = "translateY(0)";
    }
  });

  window.addEventListener(
    "wheel",
    (e) => {
      if (
        !hasJumped &&
        window.scrollY < hero.offsetHeight - 50 &&
        e.deltaY > 0
      ) {
        e.preventDefault();
        window.scrollTo({
          top: hero.offsetHeight,
          behavior: "smooth",
        });
        hasJumped = true;
      }
    },
    { passive: false }
  );

  const track = document.querySelector(".slider-track");
  const prevBtn = document.querySelector(".slider-btn.prev");
  const nextBtn = document.querySelector(".slider-btn.next");
  let isDragging = false;
  let startX = 0;
  let scrollLeft = 0;

  if (track) {
    track.addEventListener("mousedown", (e) => {
      isDragging = true;
      track.classList.add("dragging");
      startX = e.pageX - track.offsetLeft;
      scrollLeft = track.scrollLeft;
    });

    track.addEventListener("mouseleave", () => {
      isDragging = false;
      track.classList.remove("dragging");
    });

    track.addEventListener("mouseup", () => {
      isDragging = false;
      track.classList.remove("dragging");
    });

    track.addEventListener("mousemove", (e) => {
      if (!isDragging) return;
      e.preventDefault();
      const x = e.pageX - track.offsetLeft;
      const walk = (x - startX) * 1.5;
      track.scrollLeft = scrollLeft - walk;
    });

    nextBtn?.addEventListener("click", () => {
      const slideWidth = track.children[0].getBoundingClientRect().width + 40;
      track.scrollBy({ left: slideWidth, behavior: "smooth" });
    });

    prevBtn?.addEventListener("click", () => {
      const slideWidth = track.children[0].getBoundingClientRect().width + 40;
      track.scrollBy({ left: -slideWidth, behavior: "smooth" });
    });
  }
}

window.onbeforeunload = function () {
  window.scrollTo(0, 0);
};

const track = document.querySelector(".slider-track");
const slides = Array.from(document.querySelectorAll(".slide"));
const prevBtn = document.querySelector(".slider-btn.prev");
const nextBtn = document.querySelector(".slider-btn.next");

let currentIndex = 0;
const visibleSlides = 3;
const totalSlides = slides.length;

// Clone slides for infinite loop illusion
slides.slice(0, 3).forEach((slide) => {
  const clone = slide.cloneNode(true);
  track.appendChild(clone);
});

function updateSlider() {
  const slideWidth = slides[0].getBoundingClientRect().width + 20; // 10px padding each side
  track.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
}

nextBtn.addEventListener("click", () => {
  currentIndex++;
  updateSlider();

  if (currentIndex >= totalSlides) {
    setTimeout(() => {
      track.style.transition = "none";
      currentIndex = 0;
      updateSlider();
      setTimeout(() => {
        track.style.transition = "transform 0.4s ease";
      }, 10);
    }, 400);
  }
});

prevBtn.addEventListener("click", () => {
  if (currentIndex <= 0) {
    track.style.transition = "none";
    currentIndex = totalSlides;
    updateSlider();
    setTimeout(() => {
      track.style.transition = "transform 0.4s ease";
      currentIndex--;
      updateSlider();
    }, 10);
  } else {
    currentIndex--;
    updateSlider();
  }
});
