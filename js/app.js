/* ============================================
   app.js — Router, Cursor, Nav, Utilities
   ============================================ */

'use strict';

/* ─── CURSOR ─── */
const cursor     = document.getElementById('cursor');
const cursorRing = document.getElementById('cursorRing');
let mx = 0, my = 0, rx = 0, ry = 0;

document.addEventListener('mousemove', e => {
  mx = e.clientX;
  my = e.clientY;
  cursor.style.left = mx + 'px';
  cursor.style.top  = my + 'px';
});

(function animateRing() {
  rx += (mx - rx) * 0.12;
  ry += (my - ry) * 0.12;
  cursorRing.style.left = rx + 'px';
  cursorRing.style.top  = ry + 'px';
  requestAnimationFrame(animateRing);
})();

document.addEventListener('mouseover', e => {
  const el = e.target.closest('a, button, .proj-card, .skill-tag, .tl-item, .filter-btn, .contact-link-row');
  if (el) {
    cursor.style.transform     = 'translate(-50%,-50%) scale(2)';
    cursorRing.style.transform = 'translate(-50%,-50%) scale(1.5)';
    cursorRing.style.opacity   = '1';
  } else {
    cursor.style.transform     = 'translate(-50%,-50%) scale(1)';
    cursorRing.style.transform = 'translate(-50%,-50%) scale(1)';
    cursorRing.style.opacity   = '0.5';
  }
});

/* ─── ROUTER ─── */
const pages    = document.querySelectorAll('.page');
const navLinks = document.querySelectorAll('.nav-links a[data-page]');

function showPage(id) {
  pages.forEach(p => {
    p.style.display = p.id === 'page-' + id ? 'block' : 'none';
  });
  navLinks.forEach(a => {
    a.classList.toggle('active', a.dataset.page === id);
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });
  requestAnimationFrame(() => {
    const visible = document.getElementById('page-' + id);
    if (!visible) return;
    visible.querySelectorAll('.fade-in').forEach((el, i) => {
      el.classList.remove('visible');
      setTimeout(() => el.classList.add('visible'), 80 + i * 60);
    });
  });
}

navLinks.forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    showPage(a.dataset.page);
    history.pushState({}, '', '#' + a.dataset.page);
  });
});

document.addEventListener('click', e => {
  const btn = e.target.closest('[data-goto]');
  if (btn) {
    e.preventDefault();
    showPage(btn.dataset.goto);
    history.pushState({}, '', '#' + btn.dataset.goto);
  }
});

function routeFromHash() {
  const hash = location.hash.replace('#', '') || 'home';
  showPage(hash);
}
window.addEventListener('popstate', routeFromHash);
routeFromHash();

/* ─── INTERSECTION OBSERVER (fade-in) ─── */
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.1 });

document.querySelectorAll('#page-home .fade-in').forEach(el => observer.observe(el));

/* ─── PROJECTS FILTER ─── */
const filterBtns = document.querySelectorAll('.filter-btn');
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const cat = btn.dataset.filter;
    document.querySelectorAll('.proj-card').forEach(card => {
      const match = cat === 'all' || card.dataset.cat === cat;
      card.classList.toggle('hidden', !match);
    });
  });
});

/* ─── EXPERIENCE TIMELINE ─── */
const tlItems   = document.querySelectorAll('.tl-item');
const expPanels = document.querySelectorAll('.exp-detail');

function activateExp(id) {
  tlItems.forEach(i => i.classList.toggle('active', i.dataset.exp === id));
  expPanels.forEach(p => p.classList.toggle('active', p.id === 'exp-' + id));
}

tlItems.forEach(item => {
  item.addEventListener('click', () => activateExp(item.dataset.exp));
});

if (tlItems.length) activateExp(tlItems[0].dataset.exp);

/* ─── CONTACT FORM → GOOGLE FORMS ─── */
const GOOGLE_FORM_ACTION = 'https://docs.google.com/forms/d/e/1FAIpQLSdvfS1rTurs-s143SonDM6z2_pjt64Bz_gvWW3UVEPHjqdRFw/formResponse';
const ENTRY = {
  name:    'entry.1146939794',
  email:   'entry.683678966',
  subject: 'entry.1379328599',
  message: 'entry.1094043494'
};

const form = document.getElementById('contactForm');
if (form) {
  form.addEventListener('submit', e => {
    e.preventDefault();

    const name    = form.querySelector('#name').value.trim();
    const email   = form.querySelector('#email').value.trim();
    const subject = form.querySelector('#subject').value.trim();
    const message = form.querySelector('#message').value.trim();
    const btn     = form.querySelector('.form-submit');

    if (!name || !email || !message) {
      btn.textContent = 'Fill all fields!';
      btn.style.background = '#ff6b35';
      setTimeout(() => {
        btn.textContent = 'Send Message →';
        btn.style.background = '';
      }, 2000);
      return;
    }

    btn.textContent = 'Sending...';
    btn.style.background = '#0a1018';
    btn.disabled = true;

    const data = new FormData();
    data.append(ENTRY.name,    name);
    data.append(ENTRY.email,   email);
    data.append(ENTRY.subject, subject);
    data.append(ENTRY.message, message);

    fetch(GOOGLE_FORM_ACTION, {
      method: 'POST',
      body: data,
      mode: 'no-cors'
    })
    .then(() => {
      btn.textContent      = 'Message Sent ✓';
      btn.style.background = '#00f5a0';
      btn.style.color      = '#050a0e';
      form.reset();
      setTimeout(() => {
        btn.textContent      = 'Send Message →';
        btn.style.background = '';
        btn.style.color      = '';
        btn.disabled         = false;
      }, 3500);
    })
    .catch(() => {
      btn.textContent      = 'Error — Try Again';
      btn.style.background = '#ff6b35';
      btn.disabled         = false;
      setTimeout(() => {
        btn.textContent      = 'Send Message →';
        btn.style.background = '';
      }, 3000);
    });
  });
}

/* ─── THEME TOGGLE ─── */
const themeBtn   = document.getElementById('themeToggle');
const themeLabel = themeBtn ? themeBtn.querySelector('.theme-label') : null;

function applyTheme(mode) {
  if (mode === 'light') {
    document.body.classList.add('light-mode');
    if (themeLabel) themeLabel.textContent = 'Dark';
  } else {
    document.body.classList.remove('light-mode');
    if (themeLabel) themeLabel.textContent = 'Light';
  }
  localStorage.setItem('theme', mode);
}

applyTheme(localStorage.getItem('theme') || 'dark');

if (themeBtn) {
  themeBtn.addEventListener('click', () => {
    const next = document.body.classList.contains('light-mode') ? 'dark' : 'light';
    applyTheme(next);
  });
}

/* ─── MOBILE NAV ─── */
const hamburger   = document.getElementById('navHamburger');
const mobileNav   = document.getElementById('navMobile');
const mobileLinks = document.querySelectorAll('[data-mobile-page]');

function closeMobileNav() {
  if (!hamburger || !mobileNav) return;
  hamburger.classList.remove('open');
  mobileNav.classList.remove('open');
}

if (hamburger && mobileNav) {
  hamburger.addEventListener('click', () => {
    const isOpen = mobileNav.classList.contains('open');
    if (isOpen) { closeMobileNav(); }
    else { hamburger.classList.add('open'); mobileNav.classList.add('open'); }
  });
}

mobileLinks.forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    const page = a.dataset.mobilePage;
    showPage(page);
    history.pushState({}, '', '#' + page);
    closeMobileNav();
    mobileLinks.forEach(l => l.classList.toggle('active', l.dataset.mobilePage === page));
  });
});

document.addEventListener('click', e => {
  if (mobileNav && mobileNav.classList.contains('open')) {
    if (!mobileNav.contains(e.target) && !hamburger.contains(e.target)) {
      closeMobileNav();
    }
  }
});

/* ─── TYPING ANIMATION ─── */
function typeText(el, text, speed, onDone) {
  let i = 0;
  el.textContent = '';
  const tick = () => {
    if (i < text.length) {
      el.textContent += text[i++];
      setTimeout(tick, speed);
    } else {
      if (onDone) onDone();
    }
  };
  setTimeout(tick, speed);
}

const tagEl     = document.querySelector('.typed-tag');
const tagCursor = document.querySelector('.typed-cursor-inline');
const nameEl    = document.getElementById('typed-name');
const roleEl    = document.getElementById('typed-role');

const tagText   = 'AI Developer · CSE Student · Builder';
const nameText  = 'Ghosh';
const roleTexts = [
  '{ [AI Developer] · [Computer Vision] · [Assistive Tech] }',
  '{ [ML Engineer]  · [Open Source]     · [Builder]        }',
  '{ [AI Developer] · [Community Lead]  · [Problem Solver] }',
];
let roleIndex = 0;

function eraseText(el, onDone) {
  const tick = () => {
    if (el.textContent.length > 0) {
      el.textContent = el.textContent.slice(0, -1);
      setTimeout(tick, 30);
    } else {
      if (onDone) onDone();
    }
  };
  setTimeout(tick, 30);
}

function cycleRole() {
  roleIndex = (roleIndex + 1) % roleTexts.length;
  eraseText(roleEl, () => {
    typeText(roleEl, roleTexts[roleIndex], 28, () => {
      setTimeout(cycleRole, 2800);
    });
  });
}

if (tagEl) {
  typeText(tagEl, tagText, 38, () => {
    if (tagCursor) tagCursor.classList.add('done');
    if (nameEl) {
      typeText(nameEl, nameText, 80, () => {
        nameEl.classList.add('done');
        if (roleEl) {
          typeText(roleEl, roleTexts[0], 28, () => {
            setTimeout(cycleRole, 2800);
          });
        }
      });
    }
  });
}
