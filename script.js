(() => {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ============== 1. Año dinámico en footer ============== */
  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  /* ============== 2. Reveal on scroll (reutilizable) ============== */
  const revealElements = document.querySelectorAll('.reveal');

  if (prefersReducedMotion) {
    revealElements.forEach((el) => el.classList.add('is-visible'));
  } else if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );
    revealElements.forEach((el) => revealObserver.observe(el));
  } else {
    revealElements.forEach((el) => el.classList.add('is-visible'));
  }

  /* ============== 3. Active section highlight en nav ============== */
  const navLinks = Array.from(document.querySelectorAll('.header__nav-link'));
  const sections = Array.from(document.querySelectorAll('main section[id]'));

  if (navLinks.length && sections.length && 'IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            navLinks.forEach((link) => {
              const isActive = link.getAttribute('href') === `#${id}`;
              link.classList.toggle('is-active', isActive);
              if (isActive) {
                link.setAttribute('aria-current', 'page');
              } else {
                link.removeAttribute('aria-current');
              }
            });
          }
        });
      },
      { rootMargin: '-40% 0px -55% 0px' }
    );
    sections.forEach((s) => sectionObserver.observe(s));
  }

  /* ============== 4. Mobile menu toggle ============== */
  const menuBtn = document.querySelector('.header__menu-btn');
  const nav = document.getElementById('primary-nav');

  const closeMobileMenu = () => {
    if (!menuBtn || !nav) return;
    menuBtn.setAttribute('aria-expanded', 'false');
    menuBtn.setAttribute('aria-label', 'Abrir menú de navegación');
    nav.classList.remove('is-open');
  };

  const openMobileMenu = () => {
    if (!menuBtn || !nav) return;
    menuBtn.setAttribute('aria-expanded', 'true');
    menuBtn.setAttribute('aria-label', 'Cerrar menú de navegación');
    nav.classList.add('is-open');
  };

  if (menuBtn && nav) {
    menuBtn.addEventListener('click', () => {
      const isOpen = menuBtn.getAttribute('aria-expanded') === 'true';
      if (isOpen) closeMobileMenu();
      else openMobileMenu();
    });

    nav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        if (window.matchMedia('(max-width: 719px)').matches) {
          closeMobileMenu();
        }
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && menuBtn.getAttribute('aria-expanded') === 'true') {
        closeMobileMenu();
        menuBtn.focus();
      }
    });
  }

  /* ============== 5. Header scroll state ============== */
  const header = document.getElementById('header');
  if (header) {
    let ticking = false;
    const handleScroll = () => {
      header.classList.toggle('is-scrolled', window.scrollY > 20);
      ticking = false;
    };
    window.addEventListener(
      'scroll',
      () => {
        if (!ticking) {
          window.requestAnimationFrame(handleScroll);
          ticking = true;
        }
      },
      { passive: true }
    );
  }

  /* ============== 6. Form validation + toast ============== */
  const form = document.getElementById('contact-form');
  const toast = document.getElementById('toast');

  if (form && toast) {
    let toastTimer;

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      toast.classList.add('is-visible');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => {
        toast.classList.remove('is-visible');
      }, 3500);

      form.reset();
    });
  }

  /* ============== 7. CV button feedback ============== */
  const cvBtn = document.getElementById('cv-button');
  if (cvBtn) {
    cvBtn.addEventListener('click', () => {
      cvBtn.classList.add('is-applied');
    });
  }

  /* ============== 8. Smooth scroll con offset del header ============== */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();
      const headerHeight = 64;
      const targetTop = target.getBoundingClientRect().top + window.scrollY - headerHeight;

      window.scrollTo({
        top: targetTop,
        behavior: prefersReducedMotion ? 'auto' : 'smooth'
      });
    });
  });
})();
