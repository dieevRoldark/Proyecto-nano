(() => {
  'use strict';

  const API_BASE_URL = 'https://roldandev.com/';
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
  const submitBtn = form?.querySelector('button[type="submit"]');

  const TOAST_ICONS = Object.freeze({
    success: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M9 12l2 2 4-4"/></svg>',
    error: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6"/><path d="M9 9l6 6"/></svg>',
  });

  const TOAST_MESSAGES = Object.freeze({
    400: 'Por favor revisa los datos del formulario',
    429: 'Has enviado demasiados mensajes. Intenta más tarde',
    500: 'Error del servidor. Intenta de nuevo',
    network: 'Sin conexión con el servidor',
  });

  let toastTimer;

  function showToast(message, type = 'success') {
    if (!toast) return;
    toast.classList.remove('toast--error');
    if (type === 'error') toast.classList.add('toast--error');
    toast.innerHTML = `${TOAST_ICONS[type] || TOAST_ICONS.success}<span>${message}</span>`;
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('is-visible');
    }, 4000);
  }

  function setLoading(loading) {
    if (!submitBtn) return;
    submitBtn.disabled = loading;
    submitBtn.dataset.originalLabel ??= submitBtn.textContent.trim();
    submitBtn.textContent = loading ? 'Enviando...' : submitBtn.dataset.originalLabel;
  }

  if (form && toast) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      const data = {
        nombre: form.nombre.value.trim(),
        apellido: form.apellido.value.trim(),
        email: form.email.value.trim(),
        message: form.message.value.trim(),
      };

      setLoading(true);
      try {
        const response = await fetch('https://api.roldandev.com/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        const result = await response.json().catch(() => ({}));

        if (response.ok) {
          showToast(result.message || '¡Mensaje enviado con éxito!', 'success');
          form.reset();
        } else {
          const message = result.error || TOAST_MESSAGES[response.status] || 'No se pudo enviar el mensaje';
          showToast(message, 'error');
        }
      } catch {
        showToast(TOAST_MESSAGES.network, 'error');
      } finally {
        setLoading(false);
      }
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
