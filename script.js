// Smooth reveal on scroll — section titles / headings
const titleObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.08 });

document.querySelectorAll('.section-title, .toc-main-title, .project-header-title, .contact-heading, .thank-you-heading').forEach(el => {
  el.style.cssText += 'opacity:0;transform:translateY(30px);transition:opacity 0.9s ease,transform 0.9s ease;';
  titleObserver.observe(el);
});

// Nav shadow on scroll
window.addEventListener('scroll', () => {
  const nav = document.querySelector('nav');
  nav.style.boxShadow = window.scrollY > 40 ? '0 2px 20px rgba(44,26,14,0.08)' : 'none';
});

// ---------- Gallery image reveal-on-scroll ----------
const gallerySelectors = '.gallery-split img, .gallery-one img, .gallery-three img, .gallery-labeled-img img, .rooftop-full img';
const galleryImgs = Array.from(document.querySelectorAll(gallerySelectors));

galleryImgs.forEach(img => img.classList.add('reveal-img'));

// Stagger images that sit side-by-side in the same row container
document.querySelectorAll('.gallery-split, .gallery-three').forEach(row => {
  Array.from(row.querySelectorAll('img')).forEach((img, i) => {
    if (i === 1) img.classList.add('delay-1');
    if (i === 2) img.classList.add('delay-2');
  });
});

const imgObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      imgObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

galleryImgs.forEach(img => imgObserver.observe(img));

// ---------- Lightbox ----------
(function setupLightbox() {
  const images = galleryImgs.map(img => ({
    src: img.getAttribute('src'),
    alt: img.getAttribute('alt') || ''
  }));

  galleryImgs.forEach((img, idx) => {
    img.dataset.lightboxIndex = idx;
    img.addEventListener('click', () => openLightbox(idx));
  });

  const overlay = document.createElement('div');
  overlay.className = 'lightbox-overlay';
  overlay.innerHTML = `
    <button class="lightbox-close" aria-label="Close">&times;</button>
    <button class="lightbox-prev" aria-label="Previous">&#8249;</button>
    <button class="lightbox-next" aria-label="Next">&#8250;</button>
    <div class="lightbox-figure">
      <img src="" alt="">
      <div class="lightbox-caption"></div>
    </div>
    <div class="lightbox-counter"></div>
  `;
  document.body.appendChild(overlay);

  const figureImg = overlay.querySelector('.lightbox-figure img');
  const captionEl = overlay.querySelector('.lightbox-caption');
  const counterEl = overlay.querySelector('.lightbox-counter');
  const closeBtn = overlay.querySelector('.lightbox-close');
  const prevBtn = overlay.querySelector('.lightbox-prev');
  const nextBtn = overlay.querySelector('.lightbox-next');

  let currentIndex = 0;

  function render() {
    const item = images[currentIndex];
    figureImg.src = item.src;
    figureImg.alt = item.alt;
    captionEl.textContent = item.alt;
    counterEl.textContent = `${currentIndex + 1} / ${images.length}`;
  }

  function openLightbox(idx) {
    currentIndex = idx;
    render();
    overlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    overlay.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  function showPrev() {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    render();
  }

  function showNext() {
    currentIndex = (currentIndex + 1) % images.length;
    render();
  }

  closeBtn.addEventListener('click', closeLightbox);
  prevBtn.addEventListener('click', showPrev);
  nextBtn.addEventListener('click', showNext);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (!overlay.classList.contains('is-open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') showPrev();
    if (e.key === 'ArrowRight') showNext();
  });
})();


// ═══════════════════════════════════════════════════════
// SLIDESHOW ENGINE
// ═══════════════════════════════════════════════════════
(function initSlideshows() {
  document.querySelectorAll('.slideshow-stage').forEach(stage => {
    const track = stage.querySelector('.slides-track');
    const slides = Array.from(track.querySelectorAll('.slide'));
    const prevBtn = stage.querySelector('.slide-btn-prev');
    const nextBtn = stage.querySelector('.slide-btn-next');
    const dotsWrap = stage.querySelector('.slide-dots');

    // Find the paired info panel (sibling of the stage's parent .slideshow-block)
    const block = stage.closest('.slideshow-block');
    const currentEl = block ? block.querySelector('.slide-current') : null;
    const totalEl = block ? block.querySelector('.slide-total') : null;

    const total = slides.length;
    let current = 0;
    let autoTimer = null;
    const interval = parseInt(stage.dataset.interval, 10) || 4000;

    // ── Build dots ──────────────────────────────────────
    if (dotsWrap && total > 1) {
      slides.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.className = 'slide-dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
        dot.addEventListener('click', () => goTo(i));
        dotsWrap.appendChild(dot);
      });
    }

    // ── Set total label ──────────────────────────────────
    if (totalEl) totalEl.textContent = total;

    // ── Hide prev/next if only 1 slide ───────────────────
    if (total <= 1) {
      if (prevBtn) prevBtn.style.display = 'none';
      if (nextBtn) nextBtn.style.display = 'none';
    }

    // ── Core: go to a slide ──────────────────────────────
    function goTo(idx) {
      slides[current].classList.remove('active');
      if (dotsWrap) {
        dotsWrap.querySelectorAll('.slide-dot')[current]?.classList.remove('active');
      }

      current = (idx + total) % total;

      slides[current].classList.add('active');
      if (dotsWrap) {
        dotsWrap.querySelectorAll('.slide-dot')[current]?.classList.add('active');
      }
      if (currentEl) currentEl.textContent = current + 1;
    }

    // ── Auto-advance ─────────────────────────────────────
    function startAuto() {
      if (total <= 1) return;
      autoTimer = setInterval(() => goTo(current + 1), interval);
    }

    function resetAuto() {
      clearInterval(autoTimer);
      startAuto();
    }

    // ── Button listeners ─────────────────────────────────
    if (prevBtn) {
      prevBtn.addEventListener('click', () => { goTo(current - 1); resetAuto(); });
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', () => { goTo(current + 1); resetAuto(); });
    }

    // ── Touch / swipe support ────────────────────────────
    let touchStartX = 0;
    stage.addEventListener('touchstart', e => {
      touchStartX = e.changedTouches[0].clientX;
    }, { passive: true });
    stage.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 40) {
        goTo(dx < 0 ? current + 1 : current - 1);
        resetAuto();
      }
    }, { passive: true });

    // ── Pause on hover ───────────────────────────────────
    stage.addEventListener('mouseenter', () => clearInterval(autoTimer));
    stage.addEventListener('mouseleave', startAuto);

    // ── Kick off ─────────────────────────────────────────
    goTo(0);
    startAuto();
  });
})();