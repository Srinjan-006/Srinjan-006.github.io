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

/* ─── CONTACT FORM ─── */
const form = document.getElementById('contactForm');
if (form) {
  form.addEventListener('submit', e => {
    e.preventDefault();
    const name    = form.querySelector('#name').value;
    const email   = form.querySelector('#email').value;
    const subject = form.querySelector('#subject').value;
    const message = form.querySelector('#message').value;

    // Replace entry IDs with YOUR actual ones
    const googleFormURL = 'https://docs.google.com/forms/d/e/1FAIpQLSdvfS1rTurs-s143SonDM6z2_pjt64Bz_gvWW3UVEPHjqdRFw/viewform?usp=header';
    const data = new FormData();
    data.append('entry.111', name);     // replace with your Name entry ID
    data.append('entry.222', email);    // replace with your Email entry ID
    data.append('entry.333', subject);  // replace with your Subject entry ID
    data.append('entry.444', message);  // replace with your Message entry ID

    fetch(googleFormURL, { method: 'POST', body: data, mode: 'no-cors' })

    const btn = form.querySelector('.form-submit');
    btn.textContent = 'Message Sent ✓';
    btn.style.background = '#00f5a0';
    setTimeout(() => {
      btn.textContent = 'Send Message →';
      btn.style.background = '';
      form.reset();
    }, 3000);
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
    if (isOpen) {
      closeMobileNav();
    } else {
      hamburger.classList.add('open');
      mobileNav.classList.add('open');
    }
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

// Close drawer when clicking outside
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

// Sequences
const tagEl   = document.querySelector('.typed-tag');
const tagCursor = document.querySelector('.typed-cursor-inline');
const nameEl  = document.getElementById('typed-name');
const roleEl  = document.getElementById('typed-role');

const tagText  = 'AI Developer · CSE Student · Builder';
const nameText = 'Ghosh';
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

// Kick off sequence: tag → name → role → cycle
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
