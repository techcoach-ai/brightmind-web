/* ============================================================
   PURE PUBLISHING — Shared JavaScript
   - Sticky nav with frosted glass on scroll
   - Mobile hamburger menu
   - IntersectionObserver scroll reveals
   - Count-up animation for stats
   - Accordion (FAQ)
   ============================================================ */

(function () {
  'use strict';

  /* ── Sticky nav ── */
  const nav = document.querySelector('.nav');
  if (nav) {
    const onScroll = () => {
      if (window.scrollY > 40) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // run on load
  }

  /* ── Mobile hamburger ── */
  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');
  const mobileClose = document.querySelector('.mobile-menu-close');

  function openMenu() {
    if (!hamburger || !mobileMenu) return;
    hamburger.classList.add('open');
    mobileMenu.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    if (!hamburger || !mobileMenu) return;
    hamburger.classList.remove('open');
    mobileMenu.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (hamburger) hamburger.addEventListener('click', openMenu);
  if (mobileClose) mobileClose.addEventListener('click', closeMenu);

  // close on mobile link click
  if (mobileMenu) {
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeMenu);
    });
  }

  // close on Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeMenu();
  });

  /* ── Active nav link ── */
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  /* ── IntersectionObserver — scroll reveal ── */
  const revealSelectors = '.reveal, .reveal-left, .reveal-right';

  function setupReveal() {
    const elements = document.querySelectorAll(revealSelectors);
    if (!elements.length) return;

    if (!('IntersectionObserver' in window)) {
      // Fallback: just show everything
      elements.forEach(el => el.classList.add('visible'));
      return;
    }

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    elements.forEach(el => {
      if (el) observer.observe(el);
    });
  }

  setupReveal();

  /* ── Count-up animation ── */
  function animateCount(el) {
    if (!el) return;
    const target = parseInt(el.getAttribute('data-count'), 10);
    if (isNaN(target)) return;
    const duration = 1800;
    const start = performance.now();

    const tick = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(ease * target) + (el.getAttribute('data-suffix') || '');
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  function setupCountUp() {
    const counters = document.querySelectorAll('[data-count]');
    if (!counters.length) return;

    if (!('IntersectionObserver' in window)) {
      counters.forEach(animateCount);
      return;
    }

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    counters.forEach(el => {
      if (el) observer.observe(el);
    });
  }

  setupCountUp();

  /* ── Accordion (FAQ) ── */
  function setupAccordion() {
    const headers = document.querySelectorAll('.accordion-header');
    if (!headers.length) return;

    headers.forEach(header => {
      header.addEventListener('click', () => {
        const item = header.closest('.accordion-item');
        if (!item) return;
        const body = item.querySelector('.accordion-body');
        const isOpen = header.classList.contains('open');

        // Close all
        document.querySelectorAll('.accordion-header').forEach(h => {
          h.classList.remove('open');
          const b = h.closest('.accordion-item')?.querySelector('.accordion-body');
          if (b) b.classList.remove('open');
        });

        // Toggle current
        if (!isOpen && body) {
          header.classList.add('open');
          body.classList.add('open');
        }
      });
    });
  }

  setupAccordion();

  /* ── Smooth scroll for anchor links ── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const targetId = anchor.getAttribute('href');
      if (!targetId || targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

})();
