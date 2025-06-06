document.addEventListener('DOMContentLoaded', () => {
    const nav = document.getElementById('nav');
    const hero = document.querySelector('.hero');
    let hasJumped = false;
  
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
  
    window.addEventListener('scroll', () => {
      if (window.scrollY > 10) {
        nav.style.transform = 'translateY(0)';
      }
    });
  
    window.addEventListener('wheel', (e) => {
      if (!hasJumped && window.scrollY < hero.offsetHeight - 50 && e.deltaY > 0) {
        e.preventDefault();
        window.scrollTo({
          top: hero.offsetHeight,
          behavior: 'smooth'
        });
        hasJumped = true;
      }
    }, { passive: false });
  
    // === CLEAN INFINITE SLIDER ===
    const slider = document.querySelector('.slider');
    const track = document.querySelector('.slider-track');
    const prevBtn = document.querySelector('.slider-btn.prev');
    const nextBtn = document.querySelector('.slider-btn.next');
    let slides = Array.from(track.children);
  
    let currentIndex = 0;
    const visibleSlides = 3;
  
    // Move to correct index
    function updateSlider(instant = false) {
      const slideWidth = slider.offsetWidth / visibleSlides;
      if (instant) track.style.transition = 'none';
      else track.style.transition = 'transform 0.4s ease-in-out';
      track.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
    }
  
    // Duplicate slides to allow looping effect
    function setupInfiniteSlider() {
      slides.forEach(slide => {
        const clone = slide.cloneNode(true);
        clone.classList.add('clone');
        track.appendChild(clone);
      });
      slides.forEach(slide => {
        const clone = slide.cloneNode(true);
        clone.classList.add('clone');
        track.insertBefore(clone, track.firstChild);
      });
      currentIndex = slides.length;
      updateSlider(true);
    }
  
    nextBtn?.addEventListener('click', () => {
      const total = track.children.length;
      currentIndex++;
      updateSlider();
      if (currentIndex >= total - visibleSlides) {
        setTimeout(() => {
          currentIndex = slides.length;
          updateSlider(true);
        }, 400);
      }
    });
  
    prevBtn?.addEventListener('click', () => {
      currentIndex--;
      updateSlider();
      if (currentIndex < 1) {
        setTimeout(() => {
          currentIndex = slides.length - 1;
          updateSlider(true);
        }, 400);
      }
    });
  
    window.addEventListener('resize', () => updateSlider(true));
    setupInfiniteSlider();
  });
  