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

    // Avg kakovost
    const kScores = rows
      .map(r => r.kakovost ? r.kakovost.filter(v => v !== null && v > 1) : [])
      .flat();
    const avgK = kScores.length
      ? Math.round(kScores.reduce((a,b)=>a+b,0) / kScores.length / 5 * 100)
      : null;
    document.getElementById('kpi-kakovost').textContent = avgK !== null ? `${avgK}%` : '—';

    // Avg zasedenost
    const zaseds = rows
      .map(r => {
        if (!r.postanki || !r.kapaciteta) return null;
        const max = Math.max(...r.postanki.map(p => (p.sedeci||0) + (p.stojeci||0)));
        return Math.round(max / r.kapaciteta * 100);
      })
      .filter(v => v !== null);
    const avgZ = zaseds.length
      ? Math.round(zaseds.reduce((a,b)=>a+b,0) / zaseds.length)
      : null;
    document.getElementById('kpi-zased').textContent = avgZ !== null ? `${avgZ}%` : '—';

    // Skupaj vstopili
    const totalVstopili = rows.reduce((sum, r) => {
      if (r.skupaj_vstopili != null) return sum + Number(r.skupaj_vstopili);
      if (r.postanki) return sum + r.postanki.reduce((s, p) => s + (p.vstopili || 0), 0);
      return sum;
    }, 0);
    document.getElementById('kpi-vstopili').textContent = totalVstopili || '—';
  }

  // ── CHARTS ───────────────────────────────────────────────────
  function renderCharts(rows) {
    renderDelayChart(rows);
    renderKakovostChart(rows);
    renderLinijeSummary(rows);
  }

  function destroyChart(id) {
    if (charts[id]) { charts[id].destroy(); delete charts[id]; }
  }

  function renderDelayChart(rows) {
    destroyChart('delay');
    const ctx = document.getElementById('chart-delay').getContext('2d');

    // Group by date, average delay
    const byDate = {};
    rows.forEach(r => {
      if (!r.postanki) return;
      r.postanki.forEach(p => {
        if (p.skip || p.zamuda_arr === null || p.zamuda_arr === undefined) return;
        if (!byDate[r.datum]) byDate[r.datum] = [];
        byDate[r.datum].push(Number(p.zamuda_arr));
      });
    });

    const labels = Object.keys(byDate).sort();
    const values = labels.map(d => {
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

  function renderKakovostChart(rows) {
    destroyChart('kakovost');
    const ctx = document.getElementById('chart-kakovost').getContext('2d');

    // Average score per checklist item
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
          x: {
            ticks: { color: '#9a94ac', callback: v => `${v}%` },
            grid: { color: 'rgba(255,255,255,0.05)' },
            max: 100,
          },
          y: { ticks: { color: '#e8e4f0', font: { size: 11 } }, grid: { display: false } },
        },
      },
    });
  }

  function renderLinijeSummary(rows) {
    destroyChart('linije');
    const ctx = document.getElementById('chart-linije').getContext('2d');

    // Count per linija
    const counts = {};
    rows.forEach(r => {
      counts[r.linija] = (counts[r.linija] || 0) + 1;
    });

    const sorted = Object.entries(counts).sort((a,b) => b[1]-a[1]);
    const labels = sorted.map(e => e[0]);
    const values = sorted.map(e => e[1]);

    charts['linije'] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Kontrole',
          data: values,
          backgroundColor: 'rgba(214,48,74,0.7)',
          borderColor: '#d6304a',
          borderWidth: 1,
          borderRadius: 4,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: '#9a94ac' }, grid: { color: 'rgba(255,255,255,0.05)' } },
          y: { ticks: { color: '#9a94ac' }, grid: { color: 'rgba(255,255,255,0.05)' }, beginAtZero: true },
        },
      },
    });
  }

  // ── TABLE ────────────────────────────────────────────────────
  function renderTable(rows) {
    const tbody = document.getElementById('table-body');
    tbody.innerHTML = '';

    if (!rows.length) {
      const tr = document.createElement('tr');
      tr.innerHTML = '<td colspan="7" style="text-align:center;color:var(--text-secondary);padding:32px">Ni podatkov</td>';
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

  // ── DETAIL MODAL ─────────────────────────────────────────────
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
