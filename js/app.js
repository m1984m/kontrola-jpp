/**
 * app.js — State management, auth, routing
 * Kontrola JPP PWA
 */

// ── Config ─────────────────────────────────────────────────────
const CFG = {
  get sheetsUrl() { return localStorage.getItem('sheets_url') || ''; },
  set sheetsUrl(v) { localStorage.setItem('sheets_url', v); },
};

// ── State ───────────────────────────────────────────────────────
let STATE = {
  kontrolor: null,  // {ime, pin}

  setup: {
    route_id: null,
    route_short: null,
    trip_id: null,
    headsign: null,
    reg_st: '',
    kapaciteta: 50,
    tip_dneva: 'D',  // D/S/N/P
    vreme: 'soncno',
    ura_zacetek: null,
  },

  stops: [],           // [{seq, sid, name, arr, dep}] from GTFS
  current_stop: 0,
  stop_data: [],       // [{arrived_at, departed_at, sedeci, stojeci, vstopili, skip}]

  kakovost: new Array(14).fill(null),   // 3=dobro, 2=zadov, 1=nezad, 0=slabo, -1=n/a
  voznik: new Array(5).fill(null),      // 2=da, 1=delno, 0=ne
  vozilo: new Array(2).fill(null),
  dostopnost: new Array(4).fill(null),
  opombe: '',
};

const SAVE_KEY = 'jpp_state';
const AUTH_KEY = 'jpp_auth';
const QUEUE_KEY = 'jpp_queue';

// ── Persistence ─────────────────────────────────────────────────
function saveState() {
  localStorage.setItem(SAVE_KEY, JSON.stringify(STATE));
}

function loadState() {
  const raw = localStorage.getItem(SAVE_KEY);
  if (raw) {
    try { Object.assign(STATE, JSON.parse(raw)); } catch {}
  }
}

function clearState() {
  localStorage.removeItem(SAVE_KEY);
  STATE.stop_data = [];
  STATE.current_stop = 0;
  STATE.stops = [];
  STATE.kakovost = new Array(14).fill(null);
  STATE.voznik = new Array(5).fill(null);
  STATE.vozilo = new Array(2).fill(null);
  STATE.dostopnost = new Array(4).fill(null);
  STATE.opombe = '';
  STATE.setup = {
    route_id: null, route_short: null, trip_id: null,
    headsign: null, reg_st: '', kapaciteta: 50,
    tip_dneva: 'D', vreme: 'soncno', ura_zacetek: null,
  };
}

// ── Auth ─────────────────────────────────────────────────────────
function saveAuth(kontrolor) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(kontrolor));
  STATE.kontrolor = kontrolor;
}

function loadAuth() {
  const raw = localStorage.getItem(AUTH_KEY);
  if (raw) {
    try { STATE.kontrolor = JSON.parse(raw); } catch {}
  }
  return STATE.kontrolor;
}

function logout() {
  localStorage.removeItem(AUTH_KEY);
  STATE.kontrolor = null;
  window.location.href = 'index.html';
}

// ── Offline queue ─────────────────────────────────────────────────
function enqueue(payload) {
  const q = getQueue();
  q.push({ id: Date.now(), payload, ts: new Date().toISOString() });
  localStorage.setItem(QUEUE_KEY, JSON.stringify(q));
}

function getQueue() {
  try { return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]'); } catch { return []; }
}

function dequeue(id) {
  const q = getQueue().filter(item => item.id !== id);
  localStorage.setItem(QUEUE_KEY, JSON.stringify(q));
}

// ── Utilities ─────────────────────────────────────────────────────
function nowTime() {
  const n = new Date();
  return `${String(n.getHours()).padStart(2,'0')}:${String(n.getMinutes()).padStart(2,'0')}:${String(n.getSeconds()).padStart(2,'0')}`;
}

function nowDate() {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,'0')}-${String(n.getDate()).padStart(2,'0')}`;
}

function timeDiffMin(t1, t2) {
  // "HH:MM:SS" → minutes diff (t2 - t1)
  if (!t1 || !t2) return null;
  const [h1,m1,s1] = t1.split(':').map(Number);
  const [h2,m2,s2] = t2.split(':').map(Number);
  return Math.round(((h2*3600+m2*60+s2) - (h1*3600+m1*60+s1)) / 60);
}

function formatTime(t) {
  // "HH:MM:SS" → "H:MM"
  if (!t) return '—';
  const [h,m] = t.split(':');
  return `${parseInt(h)}:${m}`;
}

function autoServiceType() {
  const dow = new Date().getDay(); // 0=Sun, 6=Sat
  if (dow === 0) return 'N';
  if (dow === 6) return 'S';
  return 'D';
}

function toast(msg, duration = 3000) {
  let wrap = document.querySelector('.toast-wrap');
  if (!wrap) {
    wrap = document.createElement('div');
    wrap.className = 'toast-wrap';
    document.body.appendChild(wrap);
  }
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  wrap.appendChild(t);
  setTimeout(() => t.remove(), duration);
}

// ── PWA Service Worker ─────────────────────────────────────────────
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').catch(() => {});
}

// ── Export globals ─────────────────────────────────────────────────
window.APP = {
  STATE, CFG, saveState, loadState, clearState,
  saveAuth, loadAuth, logout,
  enqueue, getQueue, dequeue,
  nowTime, nowDate, timeDiffMin, formatTime, autoServiceType, toast,
};
