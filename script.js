// Smooth reveal on scroll
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.08 });

document.querySelectorAll('.section-title, .toc-main-title, .project-header-title, .contact-heading, .thank-you-heading').forEach(el => {
  el.style.cssText += 'opacity:0;transform:translateY(30px);transition:opacity 0.9s ease,transform 0.9s ease;';
  observer.observe(el);
});

// Nav active state
window.addEventListener('scroll', () => {
  const nav = document.querySelector('nav');
  nav.style.boxShadow = window.scrollY > 40 ? '0 2px 20px rgba(44,26,14,0.08)' : 'none';
});
