/**
 * kontrola.js — Field app logic for app.html
 */

const KAKOVOST_ITEMS = [
  'Vidnost in razločnost oznake linije',
  'Informacija o plačilu voznine',
  'Informacije o prepovedih',
  'Informacije o sedežih za potnike s posebnimi potrebami',
  'Dostopnost ter razločnost sheme linij',
  'Zvočen signal, ki opozarja na sledečo postajo',
  'Svetlobni napis z imenom sledeče postaje',
  'Informacije o morebitnih spremembah voznega reda',
  'Informacije o načinih varne vožnje',
  'Razumljivost oznak o načinu izstopa iz avtobusa',
  'Vidnost imena postaje iz avtobusa',
  'Čistoča avtobusa',
  'Delovanje napovednika',
  'Upoštevanje predpisov',
];

const VOZNIK_ITEMS = [
  'Prijaznost', 'Uniforma', 'Komunikacija', 'Profesionalnost', 'Mirna vožnja',
];

const VOZILO_ITEMS = ['Zaviranje / Pospeševanje', 'Tehnično stanje vozila'];

const DOSTOPNOST_ITEMS = [
  'Kneeling (spust za vstop)',
  'Vstop enostaven',
  'Invalidska mesta označena',
  'Izhod jasno označen',
];

// Slider labels: index = value (1–5)
const KAKOVOST_SLIDER = {
  5: 'Dobro', 4: 'Zadovoljivo', 3: 'Nezadovoljivo', 2: 'Slabo', 1: 'Ne obstaja',
};
const VOZNIK_SLIDER = {
  5: 'Dobro', 4: 'Zadovoljivo', 3: 'Nezadovoljivo', 2: 'Slabo', 1: 'Zelo slabo',
};

document.addEventListener('DOMContentLoaded', async () => {
  const { STATE, loadAuth, loadState, saveState, clearState,
          autoServiceType, formatTime, timeDiffMin, nowTime, nowDate, toast } = window.APP;

  // Check auth
  loadState();
  const auth = loadAuth();
  if (!auth) { window.location.href = 'index.html'; return; }

  document.getElementById('kontrolor-name').textContent = auth.ime;

  // ── SCREEN NAVIGATION ────────────────────────────────────────
  function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const el = document.getElementById(id);
    if (el) el.classList.add('active');
    // Scroll to top
    el && el.scrollTo(0, 0);
  }

  // ── SETUP SCREEN ─────────────────────────────────────────────
  const selRoute     = document.getElementById('sel-route');
  const selDir       = document.getElementById('sel-dir');
  const selTrip      = document.getElementById('sel-trip');
  const inpReg       = document.getElementById('inp-reg');
  const kapInfo      = document.getElementById('kap-info');
  const tipDnevaPills = document.querySelectorAll('.pill[data-tip]');
  const vremePills    = document.querySelectorAll('.pill[data-vreme]');

  // Auto-detect service type
  STATE.setup.tip_dneva = autoServiceType();

  // Load routes
  await GTFS.loadRoutes();
  await GTFS.loadTrips();
  const routes = await GTFS.loadRoutes();

  routes.forEach(r => {
    const opt = document.createElement('option');
    opt.value = r.id;
    opt.textContent = `${r.short} — ${r.long}`;
    selRoute.appendChild(opt);
  });

  // Restore saved state
  if (STATE.setup.route_id) {
    selRoute.value = STATE.setup.route_id;
    await updateDirections();
    if (STATE.setup.trip_id) {
      selTrip.value = STATE.setup.trip_id;
    }
  }

  // Set active tip dneva + vreme pills
  setActivePills(tipDnevaPills, 'tip', STATE.setup.tip_dneva);
  setActivePills(vremePills, 'vreme', STATE.setup.vreme);

  function setActivePills(pills, attr, val) {
    pills.forEach(p => {
      p.classList.toggle('active', p.dataset[attr] === val || p.dataset.tip === val || p.dataset.vreme === val);
    });
  }

  tipDnevaPills.forEach(p => p.addEventListener('click', () => {
    STATE.setup.tip_dneva = p.dataset.tip;
    setActivePills(tipDnevaPills, 'tip', STATE.setup.tip_dneva);
    updateTrips();
  }));

  vremePills.forEach(p => p.addEventListener('click', () => {
    STATE.setup.vreme = p.dataset.vreme;
    setActivePills(vremePills, 'vreme', STATE.setup.vreme);
  }));

  selRoute.addEventListener('change', updateDirections);
  selDir.addEventListener('change', updateTrips);

  async function updateDirections() {
    const rid = selRoute.value;
    if (!rid) return;

    STATE.setup.route_id = rid;
    const allTrips = GTFS.getTripsForRoute(rid, STATE.setup.tip_dneva);
    const dirs = GTFS.groupTripsByDirection(allTrips);

    selDir.innerHTML = '<option value="">Izberi smer...</option>';
    dirs.forEach(d => {
      const opt = document.createElement('option');
      opt.value = d.dir;
      opt.textContent = d.headsign;
      selDir.appendChild(opt);
    });

    if (dirs.length === 1) {
      selDir.value = dirs[0].dir;
      updateTrips();
    } else {
      selTrip.innerHTML = '<option value="">Izberi smer najprej</option>';
    }

    // Load stop times in background
    await GTFS.loadStopTimes(rid);
  }

  function updateTrips() {
    const rid = selRoute.value;
    const dir = parseInt(selDir.value);
    if (!rid || isNaN(dir)) return;

    const trips = GTFS.getTripsForRoute(rid, STATE.setup.tip_dneva)
      .filter(t => t.dir === dir);

    selTrip.innerHTML = '<option value="">Izberi vožnjo...</option>';
    trips.forEach(t => {
      const opt = document.createElement('option');
      opt.value = t.id;
      opt.textContent = `${APP.formatTime(t.dep)} — ${t.headsign}`;
      opt.dataset.headsign = t.headsign;
      selTrip.appendChild(opt);
    });
  }

  // Populate select from VOZILA
  VOZILA.forEach(v => {
    const opt = document.createElement('option');
    opt.value = v.reg;
    opt.textContent = `${v.reg} — ${v.znamka} ${v.tip}`;
    inpReg.appendChild(opt);
  });

  function updateKapaciteta(regVal) {
    const v = VOZILA.find(x => x.reg === regVal);
    if (v) {
      STATE.setup.kapaciteta = v.kapaciteta;
      STATE.setup.sedezi = v.sedezi;
      STATE.setup.stojisca = v.stojisca;
      kapInfo.textContent = `${v.znamka} ${v.tip} — ${v.sedezi}+${v.stojisca}=${v.kapaciteta}`;
      kapInfo.style.display = 'block';
    } else {
      STATE.setup.kapaciteta = 50;
      STATE.setup.sedezi = 30;
      STATE.setup.stojisca = 20;
      kapInfo.style.display = 'none';
    }
  }

  inpReg.addEventListener('change', () => {
    const val = inpReg.value;
    STATE.setup.reg_st = val;
    updateKapaciteta(val);
    saveState();
  });

  // Restore reg
  if (STATE.setup.reg_st) {
    inpReg.value = STATE.setup.reg_st;
    updateKapaciteta(STATE.setup.reg_st);
  }

  // Start button
  document.getElementById('btn-start').addEventListener('click', async () => {
    const rid = selRoute.value;
    const tripId = selTrip.value;
    const reg = inpReg.value.trim();

    if (!rid || !tripId || !reg) {
      toast('⚠ Izpolni vsa polja pred začetkom');
      return;
    }

    // Get selected route short name
    const route = routes.find(r => r.id === rid);
    const tripOpt = selTrip.options[selTrip.selectedIndex];

    STATE.setup.route_id = rid;
    STATE.setup.route_short = route ? route.short : rid;
    STATE.setup.trip_id = tripId;
    STATE.setup.headsign = tripOpt ? tripOpt.dataset.headsign : '';
    STATE.setup.ura_zacetek = APP.nowTime();

    // Load stop times
    await GTFS.loadStopTimes(rid);
    const stopsData = GTFS.getStopsForTrip(rid, tripId);

    if (!stopsData.length) {
      toast('⚠ Ni podatkov o postajah za to vožnjo');
      return;
    }

    STATE.stops = stopsData;
    STATE.current_stop = 0;
    STATE.stop_data = stopsData.map(() => ({
      arrived_at: null, departed_at: null,
      sedeci: 0, stojeci: 0, vstopili: 0, izstopili: 0, skip: false,
    }));

    saveState();
    renderStopScreen();
    showScreen('screen-stop');
  });

  // Resume if already in progress
  if (STATE.stops && STATE.stops.length > 0 && STATE.setup.ura_zacetek) {
    showConfirmModal('Imaš nedokončano kontrolo. Nadaljuješ?', () => {
      renderStopScreen();
      showScreen('screen-stop');
    }, () => {
      clearState();
    });
  }

  // ── CONFIRM MODAL (replaces browser confirm) ──────────────
  function showConfirmModal(message, onYes, onNo) {
    const overlay = document.getElementById('confirm-modal');
    document.getElementById('confirm-msg').textContent = message;
    overlay.classList.add('open');
    document.getElementById('confirm-yes').onclick = () => {
      overlay.classList.remove('open');
      if (onYes) onYes();
    };
    document.getElementById('confirm-no').onclick = () => {
      overlay.classList.remove('open');
      if (onNo) onNo();
    };
  }

  // ── STOP SCREEN ───────────────────────────────────────────────
  function renderStopScreen() {
    const stops = STATE.stops;
    const idx = STATE.current_stop;
    const stop = stops[idx];
    const data = STATE.stop_data[idx];

    if (!stop) { renderChecklists(); return; }

    // Header
    document.getElementById('stop-header-line').textContent =
      `${STATE.setup.route_short} — ${STATE.setup.headsign}`;

    // Progress
    renderProgress(stops, idx);

    // Stop info
    document.getElementById('stop-name').textContent = stop.name;
    document.getElementById('stop-plan-arr').textContent = APP.formatTime(stop.arr);
    document.getElementById('stop-plan-dep').textContent = APP.formatTime(stop.dep);

    const actualEl = document.getElementById('stop-actual-arr');
    if (data.arrived_at) {
      actualEl.textContent = APP.formatTime(data.arrived_at);
      actualEl.className = 'time-value actual';
      renderDelayBadge(stop.arr, data.arrived_at);
      showCounters(true);
    } else {
      actualEl.textContent = '—';
      actualEl.className = 'time-value placeholder';
      renderDelayBadge(null, null);
      showCounters(false);
    }

    // Dejanski odhod — prikaže se ko se vrneš nazaj (po kliku Naprej)
    const depEl = document.getElementById('stop-actual-dep');
    if (data.departed_at) {
      depEl.textContent = APP.formatTime(data.departed_at);
      depEl.className = 'time-value actual';
    } else {
      depEl.textContent = '—';
      depEl.className = 'time-value placeholder';
    }

    // Counter values
    document.getElementById('cnt-sedeci').textContent    = data.sedeci;
    document.getElementById('cnt-stojeci').textContent   = data.stojeci;
    document.getElementById('cnt-vstopili').textContent  = data.vstopili;
    document.getElementById('cnt-izstopili').textContent = data.izstopili || 0;

    // PRISPEL button
    const btnArrived = document.getElementById('btn-arrived');
    if (data.arrived_at) {
      btnArrived.textContent = '✓ Prispel ' + APP.formatTime(data.arrived_at);
      btnArrived.classList.add('done');
    } else {
      btnArrived.textContent = '▶ PRISPEL';
      btnArrived.classList.remove('done');
    }

    // Skip button state
    const skipBtn = document.getElementById('skip-toggle-btn');
    skipBtn.classList.toggle('active', !!data.skip);
    skipBtn.textContent = data.skip ? '✓ Postaja preskočena' : '✕ Preskoči to postajo';
    document.getElementById('skip-toggle').checked = data.skip || false;

    // NAPREJ button label
    const isLast = idx === stops.length - 1;
    document.getElementById('btn-next-stop').textContent =
      isLast ? '✓ Zaključi vožnjo' : 'Naprej ▶▶';
  }

  function renderProgress(stops, current) {
    const track = document.getElementById('progress-track');
    track.innerHTML = '';
    stops.forEach((s, i) => {
      const dot = document.createElement('div');
      dot.className = 'prog-dot';
      if (i < current) dot.classList.add('done');
      if (i === current) dot.classList.add('current');
      track.appendChild(dot);
      if (i < stops.length - 1) {
        const line = document.createElement('div');
        line.className = 'prog-line' + (i < current ? ' done' : '');
        track.appendChild(line);
      }
    });
    document.getElementById('stop-counter-text').textContent =
      `Postaja ${current + 1} / ${stops.length}`;
  }

  function renderDelayBadge(planned, actual) {
    const badge = document.getElementById('delay-badge');
    if (!planned || !actual) {
      badge.textContent = '⏱ Čakam...';
      badge.className = 'delay-badge pending';
      return;
    }
    const diff = APP.timeDiffMin(planned, actual);
    if (diff === 0) {
      badge.textContent = '✓ Točno';
      badge.className = 'delay-badge on-time';
    } else if (diff > 0 && diff <= 3) {
      badge.textContent = `+${diff} min`;
      badge.className = 'delay-badge warning';
    } else if (diff > 3) {
      badge.textContent = `+${diff} min ⚠`;
      badge.className = 'delay-badge danger';
    } else {
      badge.textContent = `${diff} min (prezgodaj)`;
      badge.className = 'delay-badge early';
    }
  }

  function showCounters(visible) {
    document.getElementById('counters-area').style.display = visible ? 'block' : 'none';
  }

  // PRISPEL button — tap to mark, re-tap to clear
  document.getElementById('btn-arrived').addEventListener('click', () => {
    const data = STATE.stop_data[STATE.current_stop];
    if (data.arrived_at) {
      // Re-tap: allow correction
      showConfirmModal('Ponastavim čas prihoda?', () => {
        data.arrived_at = null;
        saveState();
        renderStopScreen();
      });
      return;
    }
    data.arrived_at = APP.nowTime();

    // Carryover from last arrived stop
    if (STATE.current_stop > 0) {
      let lastIdx = -1;
      for (let i = STATE.current_stop - 1; i >= 0; i--) {
        if (STATE.stop_data[i].arrived_at !== null) { lastIdx = i; break; }
      }
      if (lastIdx >= 0) {
        const prev = STATE.stop_data[lastIdx];
        const seats = STATE.setup.sedezi || Math.round(STATE.setup.kapaciteta * 0.6);
        let sedeci  = prev.sedeci;
        let stojeci = prev.stojeci;
        for (let i = 0; i < (prev.vstopili || 0); i++) {
          if (sedeci < seats) sedeci++;
          else stojeci++;
        }
        for (let i = 0; i < (prev.izstopili || 0); i++) {
          if (stojeci > 0) stojeci--;
          else sedeci = Math.max(0, sedeci - 1);
        }
        data.sedeci  = sedeci;
        data.stojeci = stojeci;
      }
    }

    saveState();
    renderStopScreen();
  });

  // Counter buttons
  function makeCounter(counterId, dataKey) {
    document.getElementById(`btn-${counterId}-minus`).addEventListener('click', () => {
      const data = STATE.stop_data[STATE.current_stop];
      data[dataKey] = Math.max(0, data[dataKey] - 1);
      document.getElementById(`cnt-${counterId}`).textContent = data[dataKey];
      saveState();
    });
    document.getElementById(`btn-${counterId}-plus`).addEventListener('click', () => {
      const data = STATE.stop_data[STATE.current_stop];
      data[dataKey]++;
      document.getElementById(`cnt-${counterId}`).textContent = data[dataKey];
      saveState();
    });
  }
  makeCounter('sedeci', 'sedeci');
  makeCounter('stojeci', 'stojeci');
  makeCounter('vstopili', 'vstopili');
  makeCounter('izstopili', 'izstopili');

  // Skip button (toggle)
  document.getElementById('skip-toggle-btn').addEventListener('click', () => {
    const data = STATE.stop_data[STATE.current_stop];
    data.skip = !data.skip;
    document.getElementById('skip-toggle').checked = data.skip;
    const btn = document.getElementById('skip-toggle-btn');
    btn.classList.toggle('active', data.skip);
    btn.textContent = data.skip ? '✓ Postaja preskočena' : '✕ Preskoči to postajo';
    saveState();
  });

  // NAPREJ button
  document.getElementById('btn-next-stop').addEventListener('click', () => {
    const data = STATE.stop_data[STATE.current_stop];
    if (!data.skip && !data.arrived_at) {
      toast('⚠ Najprej tapni PRISPEL');
      return;
    }
    if (!data.departed_at) {
      data.departed_at = APP.nowTime();
    }

    const isLast = STATE.current_stop === STATE.stops.length - 1;
    if (isLast) {
      STATE.setup.ura_konec = APP.nowTime();
      saveState();
      renderChecklists();
      showScreen('screen-checklist-q');
    } else {
      STATE.current_stop++;
      saveState();
      renderStopScreen();
    }
  });

  // Back from stop screen
  document.getElementById('btn-back-stop').addEventListener('click', () => {
    if (STATE.current_stop > 0) {
      STATE.current_stop--;
      saveState();
      renderStopScreen();
    } else {
      showScreen('screen-setup');
    }
  });

  // ── CHECKLISTS ────────────────────────────────────────────────
  function renderChecklists() {
    renderKakovostList();
    renderSliderList('ddne-voznik', VOZNIK_ITEMS, STATE.voznik, VOZNIK_SLIDER);
    renderSliderList('slider-vozilo', VOZILO_ITEMS, STATE.vozilo, VOZNIK_SLIDER);
    renderSliderList('ddne-dostopnost', DOSTOPNOST_ITEMS, STATE.dostopnost, VOZNIK_SLIDER);
  }

  function renderSliderList(containerId, items, stateArr, labelsMap) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    items.forEach((name, idx) => {
      const currentVal = stateArr[idx]; // null or 1–5
      const box = document.createElement('div');
      box.className = 'slider-item';

      const sliderVal = currentVal !== null ? currentVal : 3;
      const labelText = currentVal !== null ? `${currentVal} — ${labelsMap[currentVal]}` : 'Ni ocenjeno';

      box.innerHTML = `
        <div class="slider-header">
          <span class="checklist-item-num">${idx + 1}</span>
          <span class="slider-name">${name}</span>
        </div>
        <div class="slider-track">
          <span class="slider-min">1</span>
          <input type="range" min="1" max="5" step="1" value="${sliderVal}"
                 class="rating-slider${currentVal === null ? ' unset' : ''}" data-idx="${idx}">
          <span class="slider-max">5</span>
        </div>
        <div class="slider-val-label${currentVal === null ? ' unset' : ''}">${labelText}</div>
      `;

      const slider = box.querySelector('.rating-slider');
      const label = box.querySelector('.slider-val-label');

      slider.addEventListener('input', () => {
        const v = parseInt(slider.value);
        stateArr[idx] = v;
        slider.classList.remove('unset');
        label.classList.remove('unset');
        label.textContent = `${v} — ${labelsMap[v]}`;
        saveState();
      });

      container.appendChild(box);
    });
  }

  function renderKakovostList() {
    renderSliderList('kakovost-list', KAKOVOST_ITEMS, STATE.kakovost, KAKOVOST_SLIDER);
  }

  function renderDDNeList(containerId, items, stateArr) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    items.forEach((name, idx) => {
      const box = document.createElement('div');
      box.className = 'ddne-item';
      box.innerHTML = `<div class="ddne-item-name">${name}</div>
        <div class="ddne-row">
          <button class="ddne-btn" data-val="2">Da</button>
          <button class="ddne-btn" data-val="1">Delno</button>
          <button class="ddne-btn" data-val="0">Ne</button>
        </div>`;

      const btns = box.querySelectorAll('.ddne-btn');
      if (stateArr[idx] !== null) {
        btns.forEach(b => {
          if (parseInt(b.dataset.val) === stateArr[idx]) {
            b.classList.add(b.dataset.val === '2' ? 'sel-da' : b.dataset.val === '1' ? 'sel-delno' : 'sel-ne');
          }
        });
      }

      btns.forEach(b => b.addEventListener('click', () => {
        stateArr[idx] = parseInt(b.dataset.val);
        saveState();
        btns.forEach(bb => bb.className = 'ddne-btn');
        b.classList.add(b.dataset.val === '2' ? 'sel-da' : b.dataset.val === '1' ? 'sel-delno' : 'sel-ne');
      }));

      container.appendChild(box);
    });
  }

  // Checklist navigation with validation
  function countUnset(arr) { return arr.filter(v => v === null).length; }

  document.getElementById('btn-next-kakovost').addEventListener('click', () => {
    const n = countUnset(STATE.kakovost);
    if (n > 0) {
      toast(`⚠ ${n} neocenjenih elementov — premakni vse drsnike`);
      return;
    }
    showScreen('screen-checklist-d');
  });
  document.getElementById('btn-back-kakovost').addEventListener('click', () => {
    STATE.current_stop = STATE.stops.length - 1;
    renderStopScreen();
    showScreen('screen-stop');
  });
  document.getElementById('btn-next-voznik').addEventListener('click', () => {
    const n = countUnset(STATE.voznik);
    if (n > 0) {
      toast(`⚠ ${n} neocenjenih elementov — premakni vse drsnike`);
      return;
    }
    showScreen('screen-checklist-v');
  });
  document.getElementById('btn-back-voznik').addEventListener('click', () => {
    showScreen('screen-checklist-q');
  });
  document.getElementById('btn-next-vozilo').addEventListener('click', () => {
    const nv = countUnset(STATE.vozilo);
    const nd = countUnset(STATE.dostopnost);
    if (nv + nd > 0) {
      toast(`⚠ ${nv + nd} neocenjenih elementov — premakni vse drsnike`);
      return;
    }
    renderReview();
    showScreen('screen-review');
  });
  document.getElementById('btn-back-vozilo').addEventListener('click', () => {
    showScreen('screen-checklist-d');
  });

  // ── REVIEW SCREEN ─────────────────────────────────────────────
  function renderReview() {
    const s = STATE.setup;
    const stops = STATE.stops;
    const stopData = STATE.stop_data;

    document.getElementById('rv-linija').textContent  = `${s.route_short} — ${s.headsign}`;
    document.getElementById('rv-datum').textContent   = APP.nowDate();
    document.getElementById('rv-zacetek').textContent = APP.formatTime(s.ura_zacetek);
    document.getElementById('rv-konec').textContent   = APP.formatTime(s.ura_konec);
    document.getElementById('rv-reg-text').textContent = s.reg_st;
    document.getElementById('rv-kap').textContent     = s.sedezi
      ? `${s.sedezi}+${s.stojisca}=${s.kapaciteta}` : `${s.kapaciteta} potnikov`;
    document.getElementById('rv-vreme').textContent   = s.vreme;

    // Avg delay
    const delays = stopData
      .filter(d => d.arrived_at && !d.skip)
      .map((d, i) => APP.timeDiffMin(stops[i].arr, d.arrived_at))
      .filter(d => d !== null);
    const avgDelay = delays.length ? (delays.reduce((a,b)=>a+b,0)/delays.length).toFixed(1) : '—';
    document.getElementById('rv-zamuda').textContent = delays.length ? `${avgDelay} min` : '—';

    // Max passengers
    const maxPotniki = Math.max(...stopData.map(d => d.sedeci + d.stojeci), 0);
    const zased = s.kapaciteta ? Math.round(maxPotniki / s.kapaciteta * 100) : '—';
    document.getElementById('rv-zased').textContent = `${maxPotniki} (${zased}%)`;

    // Skupaj vstopili
    const skupajVstopili = stopData.reduce((sum, d) => sum + (d.vstopili || 0), 0);
    document.getElementById('rv-vstopili').textContent = skupajVstopili;

    // Kakovost score (1=Ne obstaja excluded, scale 2–5)
    const kScores = STATE.kakovost.filter(v => v !== null && v > 1);
    const kAvg = kScores.length ? (kScores.reduce((a,b)=>a+b,0) / kScores.length / 5 * 100).toFixed(0) : '—';
    document.getElementById('rv-kakovost').textContent = kAvg !== '—' ? `${kAvg}%` : '—';
    const kBar = document.getElementById('rv-kakovost-bar');
    kBar.style.width = kAvg !== '—' ? `${kAvg}%` : '0%';
    kBar.style.background = kAvg > 70 ? 'var(--on-time)' : kAvg > 40 ? 'var(--warning)' : 'var(--danger)';

    // Voznik score (scale 1–5)
    const vScores = STATE.voznik.filter(v => v !== null);
    const vAvg = vScores.length ? (vScores.reduce((a,b)=>a+b,0) / vScores.length / 5 * 100).toFixed(0) : '—';
    document.getElementById('rv-voznik').textContent = vAvg !== '—' ? `${vAvg}%` : '—';
    const vBar = document.getElementById('rv-voznik-bar');
    vBar.style.width = vAvg !== '—' ? `${vAvg}%` : '0%';
    vBar.style.background = vAvg > 70 ? 'var(--on-time)' : 'var(--warning)';

    // Missing items warning
    const missing = [];
    if (STATE.kakovost.some(v => v === null)) missing.push('kakovost');
    if (STATE.voznik.some(v => v === null)) missing.push('ocena voznika');
    if (STATE.vozilo.some(v => v === null)) missing.push('ocena vožnje');
    if (STATE.dostopnost.some(v => v === null)) missing.push('dostopnost');

    const warn = document.getElementById('submit-warning');
    if (missing.length) {
      warn.textContent = `⚠ Niso izpolnjeni vsi razdelki: ${missing.join(', ')}`;
      warn.classList.add('show');
    } else {
      warn.classList.remove('show');
    }
  }

  document.getElementById('btn-back-review').addEventListener('click', () => {
    showScreen('screen-checklist-v');
  });

  // ── EDIT VEHICLE FROM REVIEW ──────────────────────────────────
  const editRegModal = document.getElementById('edit-reg-modal');
  const editRegSelect = document.getElementById('edit-reg-select');
  const editRegKap = document.getElementById('edit-reg-kap');

  VOZILA.forEach(v => {
    const opt = document.createElement('option');
    opt.value = v.reg;
    opt.textContent = `${v.reg} — ${v.znamka} ${v.tip}`;
    editRegSelect.appendChild(opt);
  });

  function updateEditRegKap(reg) {
    const v = VOZILA.find(x => x.reg === reg);
    editRegKap.textContent = v
      ? `${v.znamka} ${v.tip} — ${v.sedezi}+${v.stojisca}=${v.kapaciteta}`
      : '';
  }

  editRegSelect.addEventListener('change', () => updateEditRegKap(editRegSelect.value));

  document.getElementById('btn-edit-reg').addEventListener('click', () => {
    editRegSelect.value = STATE.setup.reg_st || '';
    updateEditRegKap(editRegSelect.value);
    editRegModal.classList.add('open');
  });

  document.getElementById('edit-reg-cancel').addEventListener('click', () => {
    editRegModal.classList.remove('open');
  });

  document.getElementById('edit-reg-save').addEventListener('click', () => {
    const reg = editRegSelect.value;
    if (!reg) {
      toast('⚠ Izberi vozilo');
      return;
    }
    const v = VOZILA.find(x => x.reg === reg);
    STATE.setup.reg_st = reg;
    if (v) {
      STATE.setup.kapaciteta = v.kapaciteta;
      STATE.setup.sedezi = v.sedezi;
      STATE.setup.stojisca = v.stojisca;
    }
    saveState();
    editRegModal.classList.remove('open');
    renderReview();
    toast('✅ Vozilo spremenjeno');
  });

  document.getElementById('btn-submit').addEventListener('click', async () => {
    const btn = document.getElementById('btn-submit');
    btn.disabled = true;
    btn.textContent = 'Pošiljam...';

    const payload = buildPayload();
    const r = await SHEETS.saveKontrola(payload).catch(err => ({ ok: false, error: err.message }));

    if (r.ok) {
      if (r.queued) {
        toast('📦 Shranjeno lokalno — bo sinhronizirano ob naslednji povezavi');
      } else {
        toast('✅ Kontrola uspešno shranjena!');
      }
      APP.clearState();
      setTimeout(() => {
        showScreen('screen-setup');
        btn.disabled = false;
        btn.textContent = '✓ Potrdi in pošlji';
      }, 1500);
    } else {
      btn.disabled = false;
      btn.textContent = '✓ Potrdi in pošlji';
      toast(`⚠ Napaka: ${r.error || 'Poskusi znova'}`);
    }
  });

  // ── BUILD PAYLOAD ─────────────────────────────────────────────
  function buildPayload() {
    const s = STATE.setup;
    return {
      kontrolor: APP.loadAuth().ime,
      datum: APP.nowDate(),
      linija: s.route_short,
      smer: s.headsign,
      trip_id: s.trip_id,
      reg_st: s.reg_st,
      kapaciteta: s.kapaciteta,
      tip_dneva: s.tip_dneva,
      vreme: s.vreme,
      ura_zacetek: s.ura_zacetek,
      ura_konec: s.ura_konec,
      kakovost: STATE.kakovost,
      voznik: STATE.voznik,
      vozilo: STATE.vozilo,
      dostopnost: STATE.dostopnost,
      opombe: STATE.opombe,
      skupaj_vstopili: STATE.stop_data.reduce((s, d) => s + (d.vstopili || 0), 0),
      postanki: STATE.stops.map((stop, i) => {
        const d = STATE.stop_data[i];
        return {
          zap_st: i + 1,
          postaja: stop.name,
          stop_id: stop.sid,
          nacrtovan_arr: stop.arr,
          dejanski_arr: d.arrived_at,
          zamuda_arr: (d.arrived_at && stop.arr) ? APP.timeDiffMin(stop.arr, d.arrived_at) : null,
          nacrtovan_dep: stop.dep,
          dejanski_dep: d.departed_at,
          sedeci: d.sedeci,
          stojeci: d.stojeci,
          vstopili: d.vstopili,
          izstopili: d.izstopili || 0,
          skip: d.skip,
        };
      }),
    };
  }

  // ── OPOMBE ───────────────────────────────────────────────────
  document.getElementById('inp-opombe').addEventListener('input', (e) => {
    STATE.opombe = e.target.value;
    saveState();
  });
  if (STATE.opombe) {
    document.getElementById('inp-opombe').value = STATE.opombe;
  }

  // Sync pending queue on load
  const queueLen = APP.getQueue().length;
  if (queueLen > 0 && navigator.onLine) {
    SHEETS.syncQueue().then(results => {
      const ok = results.filter(r => r.ok).length;
      if (ok) toast(`✅ ${ok} kontrola sinhronizirane`);
    });
  }

  // Show setup screen by default
  showScreen('screen-setup');
  window._showScreen = showScreen; // expose for nav
});
