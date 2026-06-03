// ===== app.js — utilidades globales =====

// Toast notification
function showToast(msg, color = '#25a83e') {
  let t = document.getElementById('toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'toast';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.style.background = color;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2800);
}

// localStorage helpers
const DB = {
  get(key) {
    try { return JSON.parse(localStorage.getItem(key)) || []; }
    catch { return []; }
  },
  set(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  },
  getObj(key) {
    try { return JSON.parse(localStorage.getItem(key)) || {}; }
    catch { return {}; }
  }
};

// Generar ID único
function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

// Formatear fecha legible
function fmtFecha(isoStr) {
  if (!isoStr) return '—';
  const [y, m, d] = isoStr.split('-');
  return `${d}/${m}/${y}`;
}

// Fecha de hoy en YYYY-MM-DD
function hoy() {
  return new Date().toISOString().split('T')[0];
}

// Marcar nav-item activo según la página actual
(function marcarNavActivo() {
  const path = window.location.pathname;
  document.querySelectorAll('.nav-item').forEach(a => {
    a.classList.toggle('active', path.endsWith(a.getAttribute('href').replace('./', '')));
  });
  // Fix: inicio
  if (path.endsWith('index.html') || path.endsWith('/')) {
    document.querySelectorAll('.nav-item').forEach(a => a.classList.remove('active'));
    const inicio = document.querySelector('.nav-item[data-page="inicio"]');
    if (inicio) inicio.classList.add('active');
  }
})();

// Fecha en top bar
(function setTopDate() {
  const el = document.getElementById('topDate');
  if (!el) return;
  const now = new Date();
  el.textContent = now.toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
})();
