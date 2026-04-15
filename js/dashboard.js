/**
 * dashboard.js — Analytics dashboard logic
 */
document.addEventListener('DOMContentLoaded', async () => {
  const { loadAuth, toast } = window.APP;

  // Auth guard
  loadAuth();
  if (!window.APP.STATE.kontrolor) {
    window.location.href = 'index.html';
    return;
  }

  // State
  let allData = [];
  let filteredData = [];
  let charts = {};
  let activeFilter = { linija: '', kontrolor: '', from: '' };

  // ── HELPERS ───────────────────────────────────────────────────
  function avgScore(arr) {
    const valid = arr.filter(v => v !== null && v > 1);
    return valid.length ? valid.reduce((a, b) => a + b, 0) / valid.length / 5 * 100 : null;
  }

  function avgScoreAll(arr) {
    const valid = arr.filter(v => v !== null);
    return valid.length ? valid.reduce((a, b) => a + b, 0) / valid.length / 5 * 100 : null;
  }

  // ── LOAD DATA ───────────────────────────────────────────────
  async function loadData(fromDate) {
    document.getElementById('loading-indicator').style.display = 'flex';
    try {
      const r = await SHEETS.getData(fromDate || '');
      if (r && r.rows) {
        allData = r.rows;
        buildFilters(allData);
        applyFilters();
      } else {
        toast('Ni podatkov ali napaka strežnika');
      }
    } catch(e) {
      toast('⚠ Napaka pri nalaganju: ' + e.message);
    } finally {
      document.getElementById('loading-indicator').style.display = 'none';
    }
  }

  // ── FILTERS ──────────────────────────────────────────────────
  function buildFilters(rows) {
    const linije = [...new Set(rows.map(r => r.linija))].sort();
    const kontrolorji = [...new Set(rows.map(r => r.kontrolor))].sort();

    const selLinija = document.getElementById('filter-linija');
    const selKontrolorFilter = document.getElementById('filter-kontrolor');

    selLinija.innerHTML = '<option value="">Vse linije</option>';
    linije.forEach(l => {
      const opt = document.createElement('option');
      opt.value = l; opt.textContent = l;
      selLinija.appendChild(opt);
    });

    selKontrolorFilter.innerHTML = '<option value="">Vsi kontrolorji</option>';
    kontrolorji.forEach(k => {
      const opt = document.createElement('option');
      opt.value = k; opt.textContent = k;
      selKontrolorFilter.appendChild(opt);
    });
  }

  function applyFilters() {
    filteredData = allData.filter(r => {
      if (activeFilter.linija && r.linija !== activeFilter.linija) return false;
      if (activeFilter.kontrolor && r.kontrolor !== activeFilter.kontrolor) return false;
      if (activeFilter.from && r.datum < activeFilter.from) return false;
      return true;
    });
    renderKPIs(filteredData);
    renderCharts(filteredData);
    renderTable(filteredData);
  }

  document.getElementById('filter-linija').addEventListener('change', e => {
    activeFilter.linija = e.target.value;
    applyFilters();
  });
  document.getElementById('filter-kontrolor').addEventListener('change', e => {
    activeFilter.kontrolor = e.target.value;
    applyFilters();
  });
  document.getElementById('filter-from').addEventListener('change', e => {
    activeFilter.from = e.target.value;
    applyFilters();
  });
  document.getElementById('btn-refresh').addEventListener('click', () => {
    const from = document.getElementById('filter-from').value;
    loadData(from);
  });

  // ── KPIs ─────────────────────────────────────────────────────
  function renderKPIs(rows) {
    document.getElementById('kpi-total').textContent = rows.length;

    // Avg delay
    const delays = rows
      .map(r => r.postanki
        ? r.postanki
            .filter(p => p.zamuda_arr !== null && p.zamuda_arr !== undefined && !p.skip)
            .map(p => Number(p.zamuda_arr))
        : [])
      .flat()
      .filter(d => !isNaN(d));
    const avgDelay = delays.length
      ? (delays.reduce((a,b)=>a+b,0) / delays.length).toFixed(1)
      : '—';
    document.getElementById('kpi-delay').textContent = avgDelay !== '—' ? `${avgDelay} min` : '—';

    // Kakovost (1.3)
    const kScores = rows.map(r => r.kakovost ? r.kakovost.filter(v => v !== null && v > 1) : []).flat();
    const avgK = kScores.length ? Math.round(kScores.reduce((a,b)=>a+b,0) / kScores.length / 5 * 100) : null;
    document.getElementById('kpi-kakovost').textContent = avgK !== null ? `${avgK}%` : '—';

    // Voznik (1.4)
    const vnScores = rows.map(r => r.voznik ? r.voznik.filter(v => v !== null) : []).flat();
    const avgVn = vnScores.length ? Math.round(vnScores.reduce((a,b)=>a+b,0) / vnScores.length / 5 * 100) : null;
    document.getElementById('kpi-voznik').textContent = avgVn !== null ? `${avgVn}%` : '—';

    // Vožnja (1.5)
    const vzScores = rows.map(r => r.vozilo ? r.vozilo.filter(v => v !== null) : []).flat();
    const avgVz = vzScores.length ? Math.round(vzScores.reduce((a,b)=>a+b,0) / vzScores.length / 5 * 100) : null;
    document.getElementById('kpi-voznja').textContent = avgVz !== null ? `${avgVz}%` : '—';

    // Dostopnost (1.6)
    const dsScores = rows.map(r => r.dostopnost ? r.dostopnost.filter(v => v !== null) : []).flat();
    const avgDs = dsScores.length ? Math.round(dsScores.reduce((a,b)=>a+b,0) / dsScores.length / 5 * 100) : null;
    document.getElementById('kpi-dostopnost').textContent = avgDs !== null ? `${avgDs}%` : '—';

    // Zasedenost
    const zaseds = rows
      .map(r => {
        if (!r.postanki || !r.kapaciteta) return null;
        const max = Math.max(...r.postanki.map(p => (p.sedeci||0) + (p.stojeci||0)));
        return Math.round(max / r.kapaciteta * 100);
      })
      .filter(v => v !== null);
    const avgZ = zaseds.length ? Math.round(zaseds.reduce((a,b)=>a+b,0) / zaseds.length) : null;
    document.getElementById('kpi-zased').textContent = avgZ !== null ? `${avgZ}%` : '—';

    // Vstopili
    const totalVstopili = rows.reduce((sum, r) => {
      if (r.skupaj_vstopili != null) return sum + Number(r.skupaj_vstopili);
      if (r.postanki) return sum + r.postanki.reduce((s, p) => s + (p.vstopili || 0), 0);
      return sum;
    }, 0);
    document.getElementById('kpi-vstopili').textContent = totalVstopili || '—';
  }

  // ── CHART HELPERS ────────────────────────────────────────────
  const DAYS_SI = ['ned', 'pon', 'tor', 'sre', 'čet', 'pet', 'sob'];
  function fmtLabel(dateStr) {
    // Handles both "2026-04-10" and full JS Date strings
    if (!dateStr) return '?';
    let d;
    if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
      const [y, m, day] = dateStr.split('-').map(Number);
      d = new Date(y, m - 1, day);
    } else {
      d = new Date(dateStr);
    }
    if (isNaN(d)) return dateStr;
    return `${DAYS_SI[d.getDay()]}, ${d.getDate()}.${d.getMonth() + 1}.`;
  }

  // ── CHARTS ───────────────────────────────────────────────────
  function renderCharts(rows) {
    renderDelayChart(rows);
    renderQualityTrendChart(rows);
    renderKakovostChart(rows);
    renderLinijeSummary(rows);
    renderVozilaChart(rows);
    renderLoadProfile(rows);
    renderODHeatmap(rows);
  }

  function destroyChart(id) {
    if (charts[id]) { charts[id].destroy(); delete charts[id]; }
  }

  function renderDelayChart(rows) {
    destroyChart('delay');
    const ctx = document.getElementById('chart-delay').getContext('2d');

    const byDate = {};
    rows.forEach(r => {
      if (!r.postanki) return;
      r.postanki.forEach(p => {
        if (p.skip || p.zamuda_arr === null || p.zamuda_arr === undefined) return;
        if (!byDate[r.datum]) byDate[r.datum] = [];
        byDate[r.datum].push(Number(p.zamuda_arr));
      });
    });

    const keys = Object.keys(byDate).sort();
    const labels = keys.map(fmtLabel);
    const values = keys.map(d => {
      const arr = byDate[d];
      return +(arr.reduce((a,b)=>a+b,0) / arr.length).toFixed(2);
    });

    charts['delay'] = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Povp. zamuda (min)',
          data: values,
          borderColor: '#d6304a',
          backgroundColor: 'rgba(214,48,74,0.12)',
          borderWidth: 2,
          tension: 0.3,
          fill: true,
          pointRadius: 4,
          pointBackgroundColor: '#d6304a',
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: '#9a94ac', maxRotation: 45 }, grid: { color: 'rgba(255,255,255,0.05)' } },
          y: { ticks: { color: '#9a94ac' }, grid: { color: 'rgba(255,255,255,0.05)' }, beginAtZero: true },
        },
      },
    });
  }

  // ── NEW: Quality trend over time ────────────────────────────
  function renderQualityTrendChart(rows) {
    destroyChart('quality-trend');
    const ctx = document.getElementById('chart-quality-trend').getContext('2d');

    const byDate = {};
    rows.forEach(r => {
      if (!byDate[r.datum]) byDate[r.datum] = { kak: [], voz: [], vzn: [], dos: [] };
      const d = byDate[r.datum];
      if (r.kakovost) { const s = avgScore(r.kakovost); if (s !== null) d.kak.push(s); }
      if (r.voznik) { const s = avgScoreAll(r.voznik); if (s !== null) d.voz.push(s); }
      if (r.vozilo) { const s = avgScoreAll(r.vozilo); if (s !== null) d.vzn.push(s); }
      if (r.dostopnost) { const s = avgScoreAll(r.dostopnost); if (s !== null) d.dos.push(s); }
    });

    const keys2 = Object.keys(byDate).sort();
    const labels = keys2.map(fmtLabel);
    const avg = arr => arr.length ? +(arr.reduce((a,b)=>a+b,0)/arr.length).toFixed(1) : null;

    charts['quality-trend'] = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          { label: 'Kakovost', data: keys2.map(d => avg(byDate[d].kak)), borderColor: '#3a8c5c', borderWidth: 2, tension: 0.3, pointRadius: 3 },
          { label: 'Voznik', data: keys2.map(d => avg(byDate[d].voz)), borderColor: '#6c8ebf', borderWidth: 2, tension: 0.3, pointRadius: 3 },
          { label: 'Vožnja', data: keys2.map(d => avg(byDate[d].vzn)), borderColor: '#e8734a', borderWidth: 2, tension: 0.3, pointRadius: 3 },
          { label: 'Dostopnost', data: keys2.map(d => avg(byDate[d].dos)), borderColor: '#9b59b6', borderWidth: 2, tension: 0.3, pointRadius: 3 },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom', labels: { color: '#9a94ac', boxWidth: 12, font: { size: 11 } } } },
        scales: {
          x: { ticks: { color: '#9a94ac', maxRotation: 45 }, grid: { color: 'rgba(255,255,255,0.05)' } },
          y: { ticks: { color: '#9a94ac', callback: v => `${v}%` }, grid: { color: 'rgba(255,255,255,0.05)' }, min: 0, max: 100 },
        },
      },
    });
  }

  function renderKakovostChart(rows) {
    destroyChart('kakovost');
    const ctx = document.getElementById('chart-kakovost').getContext('2d');

    const sums = new Array(14).fill(0);
    const counts = new Array(14).fill(0);
    rows.forEach(r => {
      if (!r.kakovost) return;
      r.kakovost.forEach((v, i) => {
        if (v !== null && v > 1) {
          sums[i] += v;
          counts[i]++;
        }
      });
    });

    const labels = [
      'Oznaka linije', 'Plačilo voznine', 'Prepovedi', 'Posebne potrebe',
      'Shema linij', 'Zvočni signal', 'Svetlobni napis', 'Spremembe VR',
      'Varna vožnja', 'Izstop', 'Ime postaje', 'Čistoča', 'Napovednik', 'Predpisi',
    ];
    const values = sums.map((s, i) => counts[i] ? +(s / counts[i] / 5 * 100).toFixed(1) : null);

    const colors = values.map(v =>
      v === null ? '#3a3a5c' : v >= 70 ? '#3a8c5c' : v >= 40 ? '#e8734a' : '#d6304a'
    );

    charts['kakovost'] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Ocena (%)',
          data: values,
          backgroundColor: colors,
          borderRadius: 4,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: '#9a94ac', callback: v => `${v}%` }, grid: { color: 'rgba(255,255,255,0.05)' }, max: 100 },
          y: { ticks: { color: ctx2 => colors[ctx2.index] ?? '#e8e4f0', font: { size: 11 } }, grid: { display: false } },
        },
      },
    });
  }

  // ── NEW: Route quality summary ──────────────────────────────
  function renderLinijeSummary(rows) {
    destroyChart('linije');
    const ctx = document.getElementById('chart-linije').getContext('2d');

    const byRoute = {};
    rows.forEach(r => {
      if (!byRoute[r.linija]) byRoute[r.linija] = { scores: [], count: 0 };
      const entry = byRoute[r.linija];
      entry.count++;
      // Compute overall quality per kontrola (avg of all 4 dimensions)
      const dims = [];
      if (r.kakovost) { const s = avgScore(r.kakovost); if (s !== null) dims.push(s); }
      if (r.voznik) { const s = avgScoreAll(r.voznik); if (s !== null) dims.push(s); }
      if (r.vozilo) { const s = avgScoreAll(r.vozilo); if (s !== null) dims.push(s); }
      if (r.dostopnost) { const s = avgScoreAll(r.dostopnost); if (s !== null) dims.push(s); }
      if (dims.length) entry.scores.push(dims.reduce((a,b)=>a+b,0)/dims.length);
    });

    const sorted = Object.entries(byRoute).sort((a,b) => {
      const aAvg = a[1].scores.length ? a[1].scores.reduce((x,y)=>x+y,0)/a[1].scores.length : 0;
      const bAvg = b[1].scores.length ? b[1].scores.reduce((x,y)=>x+y,0)/b[1].scores.length : 0;
      return bAvg - aAvg;
    });
    const labels = sorted.map(e => `${e[0]} (${e[1].count}x)`);
    const values = sorted.map(e => e[1].scores.length ? +(e[1].scores.reduce((a,b)=>a+b,0)/e[1].scores.length).toFixed(1) : 0);
    const colors = values.map(v => v >= 70 ? '#3a8c5c' : v >= 40 ? '#e8734a' : '#d6304a');

    charts['linije'] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Skupna ocena (%)',
          data: values,
          backgroundColor: colors,
          borderRadius: 4,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: '#9a94ac' }, grid: { color: 'rgba(255,255,255,0.05)' } },
          y: { ticks: { color: '#9a94ac', callback: v => `${v}%` }, grid: { color: 'rgba(255,255,255,0.05)' }, min: 0, max: 100 },
        },
      },
    });
  }

  // ── NEW: Worst vehicles chart ───────────────────────────────
  function renderVozilaChart(rows) {
    destroyChart('vozila');
    const ctx = document.getElementById('chart-vozila').getContext('2d');

    const byVehicle = {};
    rows.forEach(r => {
      if (!r.reg_st) return;
      if (!byVehicle[r.reg_st]) byVehicle[r.reg_st] = { scores: [], count: 0 };
      const entry = byVehicle[r.reg_st];
      entry.count++;
      const dims = [];
      if (r.vozilo) { const s = avgScoreAll(r.vozilo); if (s !== null) dims.push(s); }
      if (r.dostopnost) { const s = avgScoreAll(r.dostopnost); if (s !== null) dims.push(s); }
      if (dims.length) entry.scores.push(dims.reduce((a,b)=>a+b,0)/dims.length);
    });

    // Sort by worst score, take top 10
    const sorted = Object.entries(byVehicle)
      .filter(e => e[1].scores.length > 0)
      .sort((a,b) => {
        const aAvg = a[1].scores.reduce((x,y)=>x+y,0)/a[1].scores.length;
        const bAvg = b[1].scores.reduce((x,y)=>x+y,0)/b[1].scores.length;
        return aAvg - bAvg;
      })
      .slice(0, 10);

    const labels = sorted.map(e => e[0]);
    const values = sorted.map(e => +(e[1].scores.reduce((a,b)=>a+b,0)/e[1].scores.length).toFixed(1));
    const colors = values.map(v => v >= 70 ? '#3a8c5c' : v >= 40 ? '#e8734a' : '#d6304a');

    charts['vozila'] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Ocena vozila (%)',
          data: values,
          backgroundColor: colors,
          borderRadius: 4,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: '#9a94ac', callback: v => `${v}%` }, grid: { color: 'rgba(255,255,255,0.05)' }, min: 0, max: 100 },
          y: { ticks: { color: ctx2 => colors[ctx2.index] ?? '#e8e4f0', font: { size: 11 } }, grid: { display: false } },
        },
      },
    });
  }

  // ── A: LOAD PROFILE ─────────────────────────────────────────
  function renderLoadProfile(rows) {
    destroyChart('load-profile');
    const ctx = document.getElementById('chart-load-profile').getContext('2d');

    // Aggregate stop loads across all runs
    const stopMap = {}; // name -> { loads: [], minOrder: number }
    rows.forEach(r => {
      if (!r.postanki) return;
      r.postanki.forEach(p => {
        if (p.skip) return;
        const name = p.postaja;
        const ord = Number(p.zap_st) || 999;
        if (!stopMap[name]) stopMap[name] = { loads: [], minOrder: ord };
        stopMap[name].loads.push((p.sedeci || 0) + (p.stojeci || 0));
        stopMap[name].minOrder = Math.min(stopMap[name].minOrder, ord);
      });
    });

    const stops = Object.entries(stopMap)
      .sort((a, b) => a[1].minOrder - b[1].minOrder);

    const labels = stops.map(([name]) => name);
    const values = stops.map(([, d]) =>
      +(d.loads.reduce((a, b) => a + b, 0) / d.loads.length).toFixed(1)
    );
    const maxVal = Math.max(...values, 1);
    const colors = values.map(v => {
      const r = v / maxVal;
      return r > 0.7 ? '#d6304a' : r > 0.4 ? '#e8734a' : '#3a8c5c';
    });

    charts['load-profile'] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Povp. potniki',
          data: values,
          backgroundColor: colors,
          borderRadius: 3,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: '#9a94ac', maxRotation: 60, font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.05)' } },
          y: { ticks: { color: '#9a94ac' }, grid: { color: 'rgba(255,255,255,0.05)' }, beginAtZero: true, title: { display: true, text: 'Potniki', color: '#9a94ac', font: { size: 11 } } },
        },
      },
    });
  }

  // ── B: OD HEATMAP ────────────────────────────────────────────

  // Derive izstopili from passenger count changes if not recorded
  function effectiveIzstopili(stops) {
    const hasData = stops.some(p => (p.izstopili || 0) > 0);
    if (hasData) return stops.map(p => p.izstopili || 0);
    // Fallback: total[i-1] + vstopili[i] - total[i]
    return stops.map((p, i) => {
      if (i === 0) return 0;
      const prev = stops[i - 1];
      const totalPrev = (prev.sedeci || 0) + (prev.stojeci || 0);
      const totalCurr = (p.sedeci || 0) + (p.stojeci || 0);
      return Math.max(0, totalPrev + (p.vstopili || 0) - totalCurr);
    });
  }

  function renderODHeatmap(rows) {
    const wrap = document.getElementById('od-heatmap-wrap');

    if (!rows.length) {
      wrap.innerHTML = '<p style="color:var(--text-secondary);font-size:13px;padding:20px">Ni podatkov</p>';
      return;
    }

    // Build OD matrix: proportional assignment
    // vstopili at stop i → distributed to later stops proportionally to their izstopili
    const odMatrix = {};
    const stopOrder = {};

    rows.forEach(r => {
      if (!r.postanki) return;
      const stops = r.postanki.filter(p => !p.skip);
      const izstopiliValues = effectiveIzstopili(stops);

      stops.forEach((p, i) => {
        const ord = Number(p.zap_st) || i;
        if (!(p.postaja in stopOrder)) stopOrder[p.postaja] = ord;
        else stopOrder[p.postaja] = Math.min(stopOrder[p.postaja], ord);

        const vstopili = p.vstopili || 0;
        if (vstopili === 0) return;

        const exitAfter = izstopiliValues.slice(i + 1).reduce((sum, v) => sum + v, 0);
        if (exitAfter === 0) return;

        stops.slice(i + 1).forEach((dest, j) => {
          const izstopili = izstopiliValues[i + 1 + j];
          if (!izstopili) return;
          if (!odMatrix[p.postaja]) odMatrix[p.postaja] = {};
          odMatrix[p.postaja][dest.postaja] =
            (odMatrix[p.postaja][dest.postaja] || 0) + vstopili * izstopili / exitAfter;
        });
      });
    });

    const allStops = Object.keys(stopOrder);
    if (allStops.length === 0) {
      wrap.innerHTML = '<p style="color:var(--text-secondary);font-size:12px;padding:16px">Ni podatkov o vstopih/izstopih. Preverite, ali so štetniki izpolnjeni.</p>';
      return;
    }

    // Sort stops by sequence order
    allStops.sort((a, b) => (stopOrder[a] || 0) - (stopOrder[b] || 0));

    // Pick top 15 by total flow to keep heatmap readable
    const flowTotals = {};
    allStops.forEach(s => {
      flowTotals[s] = 0;
      allStops.forEach(t => {
        flowTotals[s] += (odMatrix[s]?.[t] || 0) + (odMatrix[t]?.[s] || 0);
      });
    });
    const topStops = allStops
      .filter(s => flowTotals[s] > 0)
      .sort((a, b) => flowTotals[b] - flowTotals[a])
      .slice(0, 15)
      .sort((a, b) => (stopOrder[a] || 0) - (stopOrder[b] || 0));

    if (topStops.length === 0) {
      wrap.innerHTML = '<p style="color:var(--text-secondary);font-size:12px;padding:16px">Ni podatkov o vstopih/izstopih.</p>';
      return;
    }

    let maxVal = 0;
    topStops.forEach(from => topStops.forEach(to => {
      maxVal = Math.max(maxVal, odMatrix[from]?.[to] || 0);
    }));

    const lbl = s => s.length > 13 ? s.slice(0, 12) + '…' : s;

    const cellColor = (val, max) => {
      if (val === 0) return { bg: '#f5f3ef', fg: 'transparent' };
      const r = val / max;
      if (r > 0.7) return { bg: '#d6304a', fg: 'white' };
      if (r > 0.4) return { bg: '#e8734a', fg: 'white' };
      if (r > 0.15) return { bg: '#f5c842', fg: '#333' };
      return { bg: '#c8e6c9', fg: '#333' };
    };

    let html = '<table style="border-collapse:collapse;font-size:10px">';
    // Header
    html += '<thead><tr><th style="padding:4px 8px;text-align:left;font-weight:600;color:var(--text-secondary);border-bottom:1px solid var(--border);white-space:nowrap;font-size:10px">Vstop ↓ / Izstop →</th>';
    topStops.forEach(to => {
      html += `<th title="${to}" style="padding:3px;border-bottom:1px solid var(--border)"><div style="writing-mode:vertical-rl;transform:rotate(180deg);height:72px;display:flex;align-items:center;font-size:10px;font-weight:500;color:var(--text-secondary);white-space:nowrap">${lbl(to)}</div></th>`;
    });
    html += '</tr></thead><tbody>';

    // Rows
    topStops.forEach(from => {
      html += `<tr><td title="${from}" style="padding:4px 8px;font-weight:500;color:var(--text-primary);white-space:nowrap;border-right:1px solid var(--border);font-size:10px">${lbl(from)}</td>`;
      topStops.forEach(to => {
        const val = Math.round(odMatrix[from]?.[to] || 0);
        const { bg, fg } = cellColor(val, maxVal);
        html += `<td title="${from} → ${to}: ~${val} pot." style="padding:4px 6px;text-align:center;background:${bg};color:${fg};font-weight:600;min-width:28px">${val || ''}</td>`;
      });
      html += '</tr>';
    });

    html += '</tbody></table>';
    if (topStops.length === 15) {
      html += '<p style="font-size:10px;color:var(--text-secondary);margin-top:6px;padding:0 4px">* Top 15 postaj po pretoku. Filtriraj po liniji za poln prikaz.</p>';
    }
    wrap.innerHTML = html;
  }

  // ── TABLE ────────────────────────────────────────────────────
  function renderTable(rows) {
    const tbody = document.getElementById('table-body');
    tbody.innerHTML = '';

    if (!rows.length) {
      const tr = document.createElement('tr');
      tr.innerHTML = '<td colspan="8" style="text-align:center;color:var(--text-secondary);padding:32px">Ni podatkov</td>';
      tbody.appendChild(tr);
      return;
    }

    rows.slice().reverse().forEach(r => {
      const delays = r.postanki
        ? r.postanki.filter(p => p.zamuda_arr !== null && !p.skip).map(p => Number(p.zamuda_arr))
        : [];
      const avgDelay = delays.length ? (delays.reduce((a,b)=>a+b,0)/delays.length).toFixed(1) : '—';
      const kScores = r.kakovost ? r.kakovost.filter(v => v !== null && v > 1) : [];
      const kPct = kScores.length ? Math.round(kScores.reduce((a,b)=>a+b,0)/kScores.length/5*100) : null;
      const maxP = r.postanki ? Math.max(...r.postanki.map(p => (p.sedeci||0)+(p.stojeci||0)), 0) : 0;
      const zased = r.kapaciteta ? Math.round(maxP/r.kapaciteta*100) : '—';
      const vstopili = r.skupaj_vstopili != null
        ? r.skupaj_vstopili
        : (r.postanki ? r.postanki.reduce((s,p) => s+(p.vstopili||0), 0) : '—');

      let delayClass = '';
      if (avgDelay !== '—') {
        delayClass = Number(avgDelay) <= 0 ? 'val-good' : Number(avgDelay) <= 3 ? 'val-warn' : 'val-bad';
      }

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${r.datum || '—'}</td>
        <td><strong>${r.linija || '—'}</strong></td>
        <td>${r.kontrolor || '—'}</td>
        <td class="${delayClass}">${avgDelay !== '—' ? `${avgDelay} min` : '—'}</td>
        <td>${zased !== '—' ? `${zased}%` : '—'}</td>
        <td>${vstopili}</td>
        <td>${kPct !== null ? `${kPct}%` : '—'}</td>
        <td><button class="table-detail-btn" data-id="${r.id || ''}">Odpri</button></td>`;
      tr.querySelector('.table-detail-btn').addEventListener('click', () => showDetail(r));
      tbody.appendChild(tr);
    });
  }

  // ── DETAIL MODAL (enhanced with all scores) ─────────────────
  const KAKOVOST_ITEMS = [
    'Oznaka linije', 'Plačilo voznine', 'Prepovedi', 'Posebne potrebe',
    'Shema linij', 'Zvočni signal', 'Svetlobni napis', 'Spremembe VR',
    'Varna vožnja', 'Izstop', 'Ime postaje', 'Čistoča', 'Napovednik', 'Predpisi',
  ];
  const VOZNIK_ITEMS = ['Prijaznost', 'Uniforma', 'Komunikacija', 'Profesionalnost', 'Mirna vožnja'];
  const VOZILO_ITEMS = ['Zaviranje / Pospeševanje', 'Tehnično stanje vozila'];
  const DOSTOPNOST_ITEMS = ['Kneeling', 'Vstop enostaven', 'Invalidska mesta', 'Izhod označen'];

  function scoreLabel(v) {
    if (v === null || v === undefined) return '<span style="color:var(--text-secondary)">—</span>';
    const color = v >= 4 ? 'var(--on-time)' : v >= 3 ? 'var(--warning)' : 'var(--danger)';
    return `<span style="color:${color};font-weight:600">${v}/5</span>`;
  }

  function renderScoreTable(title, items, values) {
    if (!values || values.every(v => v === null)) return '';
    const rows = items.map((name, i) => `<tr><td>${name}</td><td style="text-align:right">${scoreLabel(values[i])}</td></tr>`).join('');
    return `<div class="detail-section"><h4>${title}</h4><table class="detail-table"><tbody>${rows}</tbody></table></div>`;
  }

  function showDetail(r) {
    const modal = document.getElementById('detail-modal');
    const content = document.getElementById('detail-content');

    const delays = r.postanki
      ? r.postanki.filter(p => p.zamuda_arr !== null && !p.skip).map(p => Number(p.zamuda_arr))
      : [];
    const avgDelay = delays.length ? (delays.reduce((a,b)=>a+b,0)/delays.length).toFixed(1) : '—';

    content.innerHTML = `
      <div class="detail-section">
        <h3>${r.linija} — ${r.smer || ''}</h3>
        <p>${r.datum} &nbsp;|&nbsp; ${r.kontrolor} &nbsp;|&nbsp; ${r.reg_st || '—'}</p>
        <p>${r.ura_zacetek || '—'} → ${r.ura_konec || '—'} &nbsp;|&nbsp; Zamuda: ${avgDelay} min</p>
      </div>

      ${renderScoreTable('1.3 — Kakovost informacij', KAKOVOST_ITEMS, r.kakovost)}
      ${renderScoreTable('1.4 — Ocena voznika', VOZNIK_ITEMS, r.voznik)}
      ${renderScoreTable('1.5 — Ocena vožnje', VOZILO_ITEMS, r.vozilo)}
      ${renderScoreTable('1.6 — Dostopnost', DOSTOPNOST_ITEMS, r.dostopnost)}

      <div class="detail-section">
        <h4>Postanki</h4>
        <table class="detail-table">
          <thead><tr><th>#</th><th>Postaja</th><th>VR</th><th>Prihod</th><th>Zamuda</th><th>S</th><th>St</th><th>V</th></tr></thead>
          <tbody>${(r.postanki || []).map(p => `
            <tr${p.skip?' class="skipped"':''}>
              <td>${p.zap_st}</td>
              <td>${p.postaja}</td>
              <td>${p.nacrtovan_arr || '—'}</td>
              <td>${p.dejanski_arr || (p.skip?'preskočeno':'—')}</td>
              <td class="${p.zamuda_arr > 3 ? 'val-bad' : p.zamuda_arr > 0 ? 'val-warn' : 'val-good'}">${p.zamuda_arr !== null && p.zamuda_arr !== undefined ? `${p.zamuda_arr > 0 ? '+' : ''}${p.zamuda_arr} min` : '—'}</td>
              <td>${p.sedeci||0}</td>
              <td>${p.stojeci||0}</td>
              <td>${p.vstopili||0}</td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>

      ${r.opombe ? `<div class="detail-section"><h4>Opombe</h4><p>${r.opombe}</p></div>` : ''}
    `;

    modal.classList.add('open');
  }

  document.getElementById('detail-close').addEventListener('click', () => {
    document.getElementById('detail-modal').classList.remove('open');
  });
  document.getElementById('detail-modal').addEventListener('click', e => {
    if (e.target === document.getElementById('detail-modal')) {
      document.getElementById('detail-modal').classList.remove('open');
    }
  });

  // ── EXPORT CSV ──────────────────────────────────────────────
  document.getElementById('btn-export').addEventListener('click', () => {
    if (!filteredData.length) { toast('Ni podatkov za izvoz'); return; }

    const headers = ['datum','linija','smer','kontrolor','reg_st','zamuda_min',
      'kakovost_%','voznik_%','voznja_%','dostopnost_%','zasedenost_%','vstopili','opombe'];

    const csvRows = [headers.join(';')];
    filteredData.forEach(r => {
      const delays = r.postanki
        ? r.postanki.filter(p => p.zamuda_arr !== null && !p.skip).map(p => Number(p.zamuda_arr))
        : [];
      const avgD = delays.length ? (delays.reduce((a,b)=>a+b,0)/delays.length).toFixed(1) : '';
      const kPct = avgScore(r.kakovost || []);
      const vnPct = avgScoreAll(r.voznik || []);
      const vzPct = avgScoreAll(r.vozilo || []);
      const dsPct = avgScoreAll(r.dostopnost || []);
      const maxP = r.postanki ? Math.max(...r.postanki.map(p => (p.sedeci||0)+(p.stojeci||0)), 0) : 0;
      const zased = r.kapaciteta ? Math.round(maxP/r.kapaciteta*100) : '';
      const vstop = r.skupaj_vstopili != null ? r.skupaj_vstopili
        : (r.postanki ? r.postanki.reduce((s,p)=>s+(p.vstopili||0),0) : '');

      csvRows.push([
        r.datum, r.linija, r.smer, r.kontrolor, r.reg_st, avgD,
        kPct !== null ? kPct.toFixed(0) : '', vnPct !== null ? vnPct.toFixed(0) : '',
        vzPct !== null ? vzPct.toFixed(0) : '', dsPct !== null ? dsPct.toFixed(0) : '',
        zased, vstop,
        `"${(r.opombe || '').replace(/"/g, '""')}"`,
      ].join(';'));
    });

    const bom = '\uFEFF';
    const blob = new Blob([bom + csvRows.join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kontrola_jpp_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast('CSV izvožen');
  });

  // ── EXPORT PDF ───────────────────────────────────────────────
  const KAKOVOST_LBL = [
    'Vidnost oznake linije','Informacija o plačilu voznine','Informacije o prepovedih',
    'Sedeži za posebne potrebe','Shema linij','Zvočni signal sledeče postaje',
    'Svetlobni napis postaje','Spremembe voznega reda','Varna vožnja',
    'Oznake izstopa','Vidnost imena postaje','Čistoča avtobusa',
    'Delovanje napovednika','Upoštevanje predpisov',
  ];
  const VOZNIK_LBL = ['Prijaznost','Uniforma','Komunikacija','Profesionalnost','Mirna vožnja'];
  const VOZILO_LBL = ['Zaviranje/Pospeševanje','Tehnično stanje'];
  const DOSTOP_LBL = ['Kneeling','Vstop enostaven','Invalidska mesta','Izhod označen'];

  function avgByIndex(rows, field, idx) {
    const vals = rows.map(r => r[field]?.[idx]).filter(v => v !== null && v !== undefined && v > 0);
    if (!vals.length) return null;
    return vals.reduce((a,b)=>a+b,0) / vals.length;
  }

  // Font cache (UTF-8 support za šumnike)
  let pdfFontsLoaded = false;
  async function fetchFontBase64(url, onProgress) {
    const resp = await fetch(url);
    const total = Number(resp.headers.get('Content-Length')) || 0;
    const reader = resp.body.getReader();
    const chunks = [];
    let received = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      received += value.length;
      if (onProgress) onProgress(received, total);
    }
    const bytes = new Uint8Array(received);
    let pos = 0;
    for (const c of chunks) { bytes.set(c, pos); pos += c.length; }
    let bin = '';
    for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin);
  }
  async function ensurePdfFonts(doc, setStatus) {
    const ROBOTO_REG = 'https://cdn.jsdelivr.net/npm/roboto-fontface@0.10.0/fonts/roboto/Roboto-Regular.ttf';
    const ROBOTO_BOLD = 'https://cdn.jsdelivr.net/npm/roboto-fontface@0.10.0/fonts/roboto/Roboto-Bold.ttf';
    if (!pdfFontsLoaded) {
      setStatus('Prenašam font 1/2...', 0);
      const t0 = Date.now();
      const reg = await fetchFontBase64(ROBOTO_REG, (r, tot) => {
        const pct = tot ? Math.round(r / tot * 50) : 0;
        setStatus('Prenašam font 1/2...', pct);
      });
      setStatus('Prenašam font 2/2...', 50);
      const bold = await fetchFontBase64(ROBOTO_BOLD, (r, tot) => {
        const pct = tot ? 50 + Math.round(r / tot * 50) : 50;
        setStatus('Prenašam font 2/2...', pct);
      });
      window._pdfFontReg = reg;
      window._pdfFontBold = bold;
      pdfFontsLoaded = true;
    }
    doc.addFileToVFS('Roboto-Regular.ttf', window._pdfFontReg);
    doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
    doc.addFileToVFS('Roboto-Bold.ttf', window._pdfFontBold);
    doc.addFont('Roboto-Bold.ttf', 'Roboto', 'bold');
    doc.setFont('Roboto', 'normal');
  }

  function showPdfOverlay() {
    let el = document.getElementById('pdf-overlay');
    if (!el) {
      el = document.createElement('div');
      el.id = 'pdf-overlay';
      el.innerHTML = `
        <div class="pdf-overlay-box">
          <div class="pdf-spinner"></div>
          <div id="pdf-status" class="pdf-status">Pripravljam PDF...</div>
          <div class="pdf-progress-track"><div id="pdf-progress-bar" class="pdf-progress-bar"></div></div>
        </div>`;
      document.body.appendChild(el);
    }
    el.style.display = 'flex';
    return {
      set: (msg, pct) => {
        document.getElementById('pdf-status').textContent = msg;
        document.getElementById('pdf-progress-bar').style.width = `${Math.max(0, Math.min(100, pct || 0))}%`;
      },
      hide: () => { el.style.display = 'none'; },
    };
  }

  document.getElementById('btn-export-pdf').addEventListener('click', async () => {
    if (!filteredData.length) { toast('Ni podatkov za izvoz'); return; }
    if (!window.jspdf?.jsPDF) { toast('PDF knjižnica ni naložena'); return; }

    const btn = document.getElementById('btn-export-pdf');
    btn.disabled = true;
    const overlay = showPdfOverlay();
    overlay.set(pdfFontsLoaded ? 'Generiram PDF...' : 'Pripravljam PDF (prvi klic: prenos fonta ~400 KB)...', pdfFontsLoaded ? 80 : 5);

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    try {
      await ensurePdfFonts(doc, overlay.set);
    } catch (err) {
      overlay.hide();
      btn.disabled = false;
      toast('⚠ Font ni dosegljiv — preveri povezavo');
      return;
    }
    overlay.set('Sestavljam strani...', 90);
    const pageW = doc.internal.pageSize.getWidth();
    const margin = 15;
    let y = margin;

    // ── HEADER ────────────────────────────────────────────
    doc.setFont('Roboto', 'bold');
    doc.setFontSize(10);
    doc.text('MESTNA OBČINA MARIBOR', margin, y);
    doc.setFont('Roboto', 'normal');
    doc.setFontSize(9);
    y += 4;
    doc.text('Sektor za komunalo in promet', margin, y);
    y += 8;

    doc.setFont('Roboto', 'bold');
    doc.setFontSize(16);
    doc.text('Poročilo o kontroli JPP', margin, y);
    y += 8;

    // Filter summary
    const from = activeFilter.from || '—';
    const datumi = filteredData.map(r => r.datum).sort();
    const obdobje = datumi.length ? `${datumi[0]} – ${datumi[datumi.length-1]}` : '—';
    const filterLinija = activeFilter.linija || 'vse';
    const filterKontrolor = activeFilter.kontrolor || 'vsi';

    doc.setFont('Roboto', 'normal');
    doc.setFontSize(9);
    doc.text(`Obdobje: ${obdobje}   ·   Linija: ${filterLinija}   ·   Kontrolor: ${filterKontrolor}`, margin, y);
    y += 4;
    doc.text(`Generirano: ${new Date().toLocaleString('sl-SI')}   ·   Pripravil: ${window.APP.STATE.kontrolor?.ime || '—'}`, margin, y);
    y += 8;

    // ── POVZETEK KPI ──────────────────────────────────────
    const n = filteredData.length;
    const allDelays = filteredData.flatMap(r => (r.postanki || [])
      .filter(p => p.zamuda_arr !== null && !p.skip)
      .map(p => Number(p.zamuda_arr)));
    const avgDelay = allDelays.length ? (allDelays.reduce((a,b)=>a+b,0)/allDelays.length).toFixed(1) : '—';

    const kScores = filteredData.map(r => avgScore(r.kakovost || [])).filter(v => v !== null);
    const vnScores = filteredData.map(r => avgScoreAll(r.voznik || [])).filter(v => v !== null);
    const vzScores = filteredData.map(r => avgScoreAll(r.vozilo || [])).filter(v => v !== null);
    const dsScores = filteredData.map(r => avgScoreAll(r.dostopnost || [])).filter(v => v !== null);
    const pct = arr => arr.length ? (arr.reduce((a,b)=>a+b,0)/arr.length).toFixed(0) : '—';

    const zasedVals = filteredData.map(r => {
      const maxP = r.postanki ? Math.max(...r.postanki.map(p => (p.sedeci||0)+(p.stojeci||0)), 0) : 0;
      return r.kapaciteta ? maxP/r.kapaciteta*100 : null;
    }).filter(v => v !== null);
    const avgZased = zasedVals.length ? (zasedVals.reduce((a,b)=>a+b,0)/zasedVals.length).toFixed(0) : '—';
    const skupVstop = filteredData.reduce((s, r) => s + (r.skupaj_vstopili || (r.postanki ? r.postanki.reduce((ss,p)=>ss+(p.vstopili||0),0) : 0)), 0);

    doc.autoTable({
      startY: y,
      head: [['Kazalec', 'Vrednost']],
      body: [
        ['Število kontrol', String(n)],
        ['Povprečna zamuda', `${avgDelay} min`],
        ['Kakovost informacij', `${pct(kScores)} %`],
        ['Ocena voznika', `${pct(vnScores)} %`],
        ['Ocena vožnje', `${pct(vzScores)} %`],
        ['Dostopnost', `${pct(dsScores)} %`],
        ['Povp. zasedenost (max/vožnjo)', `${avgZased} %`],
        ['Skupaj vstopili', String(skupVstop)],
      ],
      theme: 'grid',
      headStyles: { fillColor: [60, 60, 70], textColor: 255, font: 'Roboto', fontStyle: 'bold' },
      styles: { fontSize: 9, font: 'Roboto' },
      margin: { left: margin, right: margin },
    });
    y = doc.lastAutoTable.finalY + 8;

    // ── PALETA PO VPRAŠANJIH ──────────────────────────────
    doc.setFont('Roboto', 'bold');
    doc.setFontSize(11);
    doc.text('Ocene po vprašanjih (povprečja)', margin, y);
    y += 2;

    const paletaRows = [];
    KAKOVOST_LBL.forEach((lbl, i) => {
      const a = avgByIndex(filteredData, 'kakovost', i);
      paletaRows.push(['Kakovost', lbl, a !== null ? a.toFixed(2) : '—']);
    });
    VOZNIK_LBL.forEach((lbl, i) => {
      const a = avgByIndex(filteredData, 'voznik', i);
      paletaRows.push(['Voznik', lbl, a !== null ? a.toFixed(2) : '—']);
    });
    VOZILO_LBL.forEach((lbl, i) => {
      const a = avgByIndex(filteredData, 'vozilo', i);
      paletaRows.push(['Vožnja', lbl, a !== null ? a.toFixed(2) : '—']);
    });
    DOSTOP_LBL.forEach((lbl, i) => {
      const a = avgByIndex(filteredData, 'dostopnost', i);
      paletaRows.push(['Dostopnost', lbl, a !== null ? a.toFixed(2) : '—']);
    });

    doc.autoTable({
      startY: y + 3,
      head: [['Kategorija', 'Element', 'Povp. (1–5)']],
      body: paletaRows,
      theme: 'striped',
      headStyles: { fillColor: [60, 60, 70], textColor: 255, font: 'Roboto', fontStyle: 'bold' },
      styles: { fontSize: 8, font: 'Roboto' },
      columnStyles: { 0: { cellWidth: 28 }, 2: { cellWidth: 22, halign: 'right' } },
      margin: { left: margin, right: margin },
    });
    y = doc.lastAutoTable.finalY + 8;

    // ── DETAJL KONTROL ────────────────────────────────────
    doc.addPage();
    y = margin;
    doc.setFont('Roboto', 'bold');
    doc.setFontSize(11);
    doc.text('Seznam kontrol', margin, y);
    y += 3;

    const detailRows = filteredData
      .slice()
      .sort((a, b) => (b.datum || '').localeCompare(a.datum || ''))
      .map(r => {
        const delays = (r.postanki || []).filter(p => p.zamuda_arr !== null && !p.skip).map(p => Number(p.zamuda_arr));
        const avgD = delays.length ? (delays.reduce((a,b)=>a+b,0)/delays.length).toFixed(1) : '—';
        const kP = avgScore(r.kakovost || []);
        const vnP = avgScoreAll(r.voznik || []);
        const nFoto = (r.foto_urls || []).length;
        return [
          r.datum || '',
          r.linija || '',
          r.kontrolor || '',
          r.reg_st || '',
          `${avgD} min`,
          kP !== null ? `${kP.toFixed(0)}%` : '—',
          vnP !== null ? `${vnP.toFixed(0)}%` : '—',
          nFoto ? String(nFoto) : '—',
        ];
      });

    doc.autoTable({
      startY: y + 3,
      head: [['Datum','Linija','Kontrolor','Vozilo','Zamuda','Kakovost','Voznik','Foto']],
      body: detailRows,
      theme: 'striped',
      headStyles: { fillColor: [60, 60, 70], textColor: 255, font: 'Roboto', fontStyle: 'bold' },
      styles: { fontSize: 8, font: 'Roboto' },
      margin: { left: margin, right: margin },
    });

    // ── FOOTER (vse strani) ───────────────────────────────
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFont('Roboto', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(120);
      doc.text(
        `Poročilo o kontroli JPP   ·   stran ${i}/${pageCount}`,
        pageW - margin, doc.internal.pageSize.getHeight() - 8,
        { align: 'right' }
      );
    }

    overlay.set('Shranjujem...', 100);
    const dstr = new Date().toISOString().slice(0,10);
    doc.save(`kontrola_jpp_porocilo_${dstr}.pdf`);
    overlay.hide();
    btn.disabled = false;
    toast('PDF izvožen');
  });

  // ── INIT ─────────────────────────────────────────────────────
  document.getElementById('dash-kontrolor').textContent = window.APP.STATE.kontrolor.ime;

  // Default: last 30 days
  const d30 = new Date();
  d30.setDate(d30.getDate() - 30);
  const fromVal = `${d30.getFullYear()}-${String(d30.getMonth()+1).padStart(2,'0')}-${String(d30.getDate()).padStart(2,'0')}`;
  document.getElementById('filter-from').value = fromVal;
  activeFilter.from = fromVal;

  await loadData(fromVal);
});
