/**
 * sheets.js — Google Apps Script API communication
 */
const SHEETS = (() => {

  function getUrl() { return window.APP.CFG.sheetsUrl; }

  async function get(params) {
    const url = getUrl();
    if (!url) throw new Error('Apps Script URL ni nastavljen');
    const qs = new URLSearchParams(params).toString();
    const resp = await fetch(`${url}?${qs}`, { redirect: 'follow' });
    return resp.json();
  }

  async function post(data) {
    const url = getUrl();
    if (!url) throw new Error('Apps Script URL ni nastavljen');
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify(data),
      redirect: 'follow',
    });
    return resp.json();
  }

  // Auth: check ime + PIN against Sheets
  async function login(ime, pin) {
    // No URL configured → offline/dev mode, accept any 4-digit PIN
    if (!getUrl()) {
      return { ok: true, offline: true };
    }
    try {
      const r = await get({ action: 'login', ime, pin });
      return r;
    } catch {
      // Offline fallback — allow if we already have stored auth
      const stored = window.APP.loadAuth();
      if (stored && stored.ime === ime && stored.pin === pin) {
        return { ok: true, offline: true };
      }
      throw new Error('Ni povezave s strežnikom. Preveri internet.');
    }
  }

  // Get vehicle capacity by reg
  async function getVozilo(reg) {
    if (!getUrl()) return { kapaciteta: 50, tip: 'neznano', offline: true };
    try {
      return await get({ action: 'vozilo', reg: reg.toUpperCase() });
    } catch {
      return { kapaciteta: 50, tip: 'neznano', offline: true };
    }
  }

  // Save completed kontrola
  async function saveKontrola(payload) {
    if (!getUrl()) {
      // No backend — queue locally
      window.APP.enqueue(payload);
      return { ok: true, queued: true };
    }
    try {
      const r = await post({ action: 'save', data: payload });
      return r;
    } catch {
      // Queue for later
      window.APP.enqueue(payload);
      return { ok: true, queued: true };
    }
  }

  // Get all data for dashboard
  async function getData(from_date) {
    return get({ action: 'data', from: from_date || '' });
  }

  // Sync queued items
  async function syncQueue() {
    const queue = window.APP.getQueue();
    const results = [];
    for (const item of queue) {
      try {
        const r = await post({ action: 'save', data: item.payload });
        if (r.ok) {
          window.APP.dequeue(item.id);
          results.push({ id: item.id, ok: true });
        }
      } catch {
        results.push({ id: item.id, ok: false });
      }
    }
    return results;
  }

  return { login, getVozilo, saveKontrola, getData, syncQueue };
})();

window.SHEETS = SHEETS;
