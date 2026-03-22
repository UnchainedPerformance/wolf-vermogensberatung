/* ============================================
   WOLF – Vermögensberatung JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  initScrollReveal();
  initNavigation();
  initSmoothScroll();
  initServiceCards();
  initFAQ();
  initFunnel();
});

/* ============================================
   SCROLL REVEAL
   ============================================ */
function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal');
  if (!reveals.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  reveals.forEach(el => observer.observe(el));
}

/* ============================================
   NAVIGATION
   ============================================ */
function initNavigation() {
  const nav = document.getElementById('nav');
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');

  // Scroll effect
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        nav.classList.toggle('nav--scrolled', window.scrollY > 50);
        ticking = false;
      });
      ticking = true;
    }
  });

  // Mobile hamburger
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navLinks.classList.toggle('active');
      document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
    });

    // Close menu on link click
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navLinks.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }
}

/* ============================================
   SERVICE CARDS – Expand/Collapse
   ============================================ */
function initServiceCards() {
  const toggles = document.querySelectorAll('.services__card-toggle');

  toggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
      const card = toggle.closest('.services__card');
      const isExpanded = card.classList.contains('is-expanded');

      // Toggle state
      card.classList.toggle('is-expanded');
      toggle.setAttribute('aria-expanded', !isExpanded);

      // Smooth scroll to keep card in view when expanding
      if (!isExpanded) {
        setTimeout(() => {
          card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
      }
    });
  });
}

/* ============================================
   FAQ ACCORDION
   ============================================ */
function initFAQ() {
  const items = document.querySelectorAll('.faq__item');
  if (!items.length) return;

  items.forEach(item => {
    const question = item.querySelector('.faq__question');
    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');

      // Close all other items (single-selection accordion)
      items.forEach(other => {
        if (other !== item) {
          other.classList.remove('is-open');
          other.querySelector('.faq__question').setAttribute('aria-expanded', 'false');
        }
      });

      // Toggle current item
      item.classList.toggle('is-open');
      question.setAttribute('aria-expanded', !isOpen);
    });
  });
}

/* ============================================
   CONTACT FUNNEL
   ============================================ */
function initFunnel() {
  const funnel = document.getElementById('funnel');
  if (!funnel) return;

  const progressBar = document.getElementById('funnelProgress');
  const allSteps = funnel.querySelectorAll('.funnel__step');

  // State
  const state = {
    currentStep: 1,
    type: null,        // 'privat' or 'geschaeftlich'
    topics: [],
    name: '',
    phone: '',
    email: '',
    message: ''
  };

  // Show a specific step
  function showStep(stepNum) {
    allSteps.forEach(s => s.classList.remove('is-active'));

    let target;
    if (stepNum === 2 && state.type) {
      target = funnel.querySelector(`.funnel__step[data-step="2"][data-variant="${state.type}"]`);
    } else {
      target = funnel.querySelector(`.funnel__step[data-step="${stepNum}"]:not([data-variant])`);
      if (!target) target = funnel.querySelector(`.funnel__step[data-step="${stepNum}"]`);
    }

    if (target) {
      target.classList.add('is-active');
      state.currentStep = stepNum;
      progressBar.style.width = (stepNum / 4 * 100) + '%';

      // Scroll to funnel
      funnel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // Step 1: Single choice (Privat / Geschäftlich)
  funnel.querySelectorAll('.funnel__step[data-step="1"] .funnel__choice').forEach(btn => {
    btn.addEventListener('click', () => {
      state.type = btn.dataset.value;
      state.topics = [];

      // Visual feedback
      btn.closest('.funnel__choices').querySelectorAll('.funnel__choice').forEach(b => b.classList.remove('is-selected'));
      btn.classList.add('is-selected');

      // Brief delay for visual feedback, then advance
      setTimeout(() => showStep(2), 250);
    });
  });

  // Step 2: Multi-choice topics
  funnel.querySelectorAll('.funnel__choice--multi').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.classList.toggle('is-selected');

      // Collect selected topics from the active step
      const activeStep = funnel.querySelector('.funnel__step.is-active');
      const selected = activeStep.querySelectorAll('.funnel__choice--multi.is-selected');
      state.topics = Array.from(selected).map(b => b.dataset.value);

      // Enable/disable next button
      const nextBtn = activeStep.querySelector('.funnel__next');
      nextBtn.disabled = state.topics.length === 0;
    });
  });

  // Next buttons
  funnel.querySelectorAll('.funnel__next').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.disabled) return;
      const nextStep = parseInt(btn.dataset.next);
      showStep(nextStep);
    });
  });

  // Back buttons
  funnel.querySelectorAll('.funnel__back').forEach(btn => {
    btn.addEventListener('click', () => {
      const currentStep = btn.closest('.funnel__step');
      const stepNum = parseInt(currentStep.dataset.step);
      showStep(stepNum - 1);
    });
  });

  // Step 3: Form submission
  const form = document.getElementById('funnelForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const nameInput = document.getElementById('funnel-name');
      const phoneInput = document.getElementById('funnel-phone');
      const emailInput = document.getElementById('funnel-email');
      const messageInput = document.getElementById('funnel-message');

      // Simple validation
      let valid = true;
      [nameInput, phoneInput, emailInput].forEach(input => {
        input.classList.remove('is-invalid');
        if (!input.value.trim()) {
          input.classList.add('is-invalid');
          valid = false;
        }
      });
      if (emailInput.value && !emailInput.value.includes('@')) {
        emailInput.classList.add('is-invalid');
        valid = false;
      }

      if (!valid) return;

      // Collect data
      state.name = nameInput.value.trim();
      state.phone = phoneInput.value.trim();
      state.email = emailInput.value.trim();
      state.message = messageInput.value.trim();

      // Disable button while sending
      const submitBtn = form.querySelector('.funnel__submit');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Wird gesendet...';

      // ===== GHL INBOUND WEBHOOK =====
      const GHL_WEBHOOK_URL = 'https://services.leadconnectorhq.com/hooks/v1BwfiTpLdvE0IDL3Xij/webhook-trigger/2ef3f072-9a3b-460c-8a5b-219c5f4261ff';

      const payload = {
        type: state.type,
        topics: state.topics.join(', '),
        name: state.name,
        phone: state.phone,
        email: state.email,
        message: state.message
      };

      fetch(GHL_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      .then(() => {
        showStep(4);
      })
      .catch((err) => {
        console.error('Webhook error:', err);
        // Show success anyway — don't block the user
        showStep(4);
      })
      .finally(() => {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Anfrage absenden';
      });
    });
  }
}

/* ============================================
   SMOOTH SCROLL
   ============================================ */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}
