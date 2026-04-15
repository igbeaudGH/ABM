/* =====================================================
   AMB LANDING PAGE — JAVASCRIPT (FLUID EDITION)
   ===================================================== */

(function () {
  'use strict';

  // ── Custom cursor ──────────────────────────────────
  const cursorDot  = document.getElementById('cursor-dot');
  const cursorRing = document.getElementById('cursor-ring');

  // Only activate on devices with real hover (not touch)
  if (window.matchMedia('(hover: hover)').matches && cursorDot && cursorRing) {
    let mouseX = -200, mouseY = -200;
    let ringX  = -200, ringY  = -200;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      // Dot snaps immediately
      cursorDot.style.left = mouseX + 'px';
      cursorDot.style.top  = mouseY + 'px';
    });

    // Ring lags behind with smooth lerp
    (function animateRing() {
      ringX += (mouseX - ringX) * 0.13;
      ringY += (mouseY - ringY) * 0.13;
      cursorRing.style.left = ringX + 'px';
      cursorRing.style.top  = ringY + 'px';
      requestAnimationFrame(animateRing);
    })();

    // Scale ring on interactive elements
    document.querySelectorAll('a, button, .card, .value-item, .social-link').forEach(el => {
      el.addEventListener('mouseenter', () => cursorRing.classList.add('hovering'));
      el.addEventListener('mouseleave', () => cursorRing.classList.remove('hovering'));
    });
  }

  // ── Scroll progress bar ────────────────────────────
  const progressBar = document.getElementById('scroll-progress');
  const backToTop   = document.getElementById('back-to-top');

  function updateOnScroll() {
    const y         = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;

    // Progress bar
    if (progressBar && maxScroll > 0) {
      progressBar.style.width = ((y / maxScroll) * 100) + '%';
    }

    // Navbar
    navbar.classList.toggle('scrolled', y > 40);

    // Back to top button
    if (backToTop) backToTop.classList.toggle('visible', y > 400);
  }

  // ── Navbar ─────────────────────────────────────────
  const navbar = document.getElementById('navbar');

  window.addEventListener('scroll', updateOnScroll, { passive: true });
  updateOnScroll(); // run once on load

  // ── Back to top ────────────────────────────────────
  backToTop?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // ── Mobile hamburger toggle ────────────────────────
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('nav-links');

  hamburger?.addEventListener('click', () => {
    const isOpen = hamburger.classList.toggle('open');
    navLinks.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  navLinks?.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      navLinks.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  // ── Floating particles in hero ─────────────────────
  const particlesContainer = document.getElementById('particles');
  if (particlesContainer) {
    for (let i = 0; i < 20; i++) {
      const p = document.createElement('span');
      p.classList.add('particle');
      const dur   = (6 + Math.random() * 8).toFixed(1);
      const delay = (Math.random() * 12).toFixed(1);
      const size  = (2 + Math.random() * 2.5).toFixed(1);
      p.style.cssText = `
        --dur: ${dur}s;
        --delay: ${delay}s;
        left: ${5 + Math.random() * 90}%;
        bottom: -8px;
        width: ${size}px;
        height: ${size}px;
      `;
      particlesContainer.appendChild(p);
    }
  }

  // ── Scroll-reveal (JS-driven, safe fallback) ───────
  // Elements start visible; JS adds class to animate them in
  const revealEls = document.querySelectorAll(
    '.card, .value-item, .section-header, .values-left, .hero-metrics .metric, .cta-inner'
  );

  // Add the reveal class only via JS so CSS fallback keeps elements visible
  revealEls.forEach((el) => {
    el.classList.add('js-reveal');
  });

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Stagger cards/items in same grid
          const siblings = [...(entry.target.parentElement?.querySelectorAll('.js-reveal:not(.is-visible)') || [])];
          const idx = Math.max(0, siblings.indexOf(entry.target));
          setTimeout(() => {
            entry.target.classList.add('is-visible');
          }, idx * 85);
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -30px 0px' }
  );

  revealEls.forEach(el => revealObserver.observe(el));

  // ── Animated metric counters ───────────────────────
  const metricEls = document.querySelectorAll('.metric-number[data-target]');

  const counterObs = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.6 }
  );

  metricEls.forEach(el => counterObs.observe(el));

  function animateCounter(el) {
    const target   = parseInt(el.dataset.target, 10);
    const prefix   = el.dataset.prefix || '';
    const suffix   = el.dataset.suffix || '';
    const duration = 1800;
    const start    = performance.now();

    function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      // Cubic ease-out
      const eased    = 1 - Math.pow(1 - progress, 3);
      el.textContent = prefix + Math.round(eased * target) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // ── Form submission ────────────────────────────────
  const form      = document.getElementById('cta-form');
  const submitBtn = document.getElementById('form-submit');

  form?.addEventListener('submit', (e) => {
    e.preventDefault();

    const nombre  = document.getElementById('form-nombre').value.trim();
    const email   = document.getElementById('form-email').value.trim();
    const mensaje = document.getElementById('form-mensaje').value.trim();

    if (!nombre || !email || !mensaje) {
      shakeEl(form);
      return;
    }

    submitBtn.textContent = 'Enviando...';
    submitBtn.disabled    = true;

    setTimeout(() => {
      submitBtn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
          <path d="M5 10l4 4 6-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Mensaje Enviado
      `;
      form.reset();

      setTimeout(() => {
        submitBtn.innerHTML = `Agendar una Consulta
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 10h12M12 6l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
        submitBtn.disabled  = false;
      }, 4000);
    }, 1500);
  });

  function shakeEl(el) {
    el.style.animation = 'shake 0.4s ease';
    el.addEventListener('animationend', () => { el.style.animation = ''; }, { once: true });
  }

  // Inject keyframes once
  if (!document.getElementById('_amb_kf')) {
    const s = document.createElement('style');
    s.id = '_amb_kf';
    s.textContent = `
      @keyframes shake {
        0%,100%{transform:translateX(0)}
        20%,60%{transform:translateX(-8px)}
        40%,80%{transform:translateX(8px)}
      }
    `;
    document.head.appendChild(s);
  }

  // ── Parallax: orbs follow mouse ────────────────────
  const orb  = document.querySelector('.hero-orb');
  const orb2 = document.querySelector('.hero-orb-2');
  let ticking = false;

  document.addEventListener('mousemove', (e) => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const x = (e.clientX / window.innerWidth  - 0.5) * 36;
      const y = (e.clientY / window.innerHeight - 0.5) * 24;
      if (orb)  orb.style.transform  = `translate(${x}px, ${y}px)`;
      if (orb2) orb2.style.transform = `translate(${-x * 0.4}px, ${-y * 0.4}px)`;
      ticking = false;
    });
  });

  // ── Active nav highlighting ────────────────────────
  const sections = document.querySelectorAll('section[id]');
  const navItems = document.querySelectorAll('.nav-links a[href^="#"]');

  const sectionObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          navItems.forEach(a => a.classList.remove('active'));
          const active = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
          active?.classList.add('active');
        }
      });
    },
    { rootMargin: '-40% 0px -55% 0px' }
  );
  sections.forEach(s => sectionObs.observe(s));

})();
