/**
 * apps_script.js — Google Apps Script backend
 * Deploy as: Web App → Execute as: Me → Who has access: Anyone
 *
 * SHEETS STRUCTURE:
 *   "Kontrolorji"   → A: ime, B: pin
 *   "Vozila"        → A: reg, B: kapaciteta, C: tip
 *   "Kontrole"      → auto-generated header + one row per kontrola
 *   "Postanki"      → auto-generated header + one row per postajališče
 */

const SS_ID = ''; // ← Paste your Google Spreadsheet ID here

// ── ENTRY POINTS ─────────────────────────────────────────────────

function doGet(e) {
  const params = e.parameter;
  let result;
  try {
    switch (params.action) {
      case 'login':   result = handleLogin(params); break;
      case 'vozilo':  result = handleVozilo(params); break;
      case 'data':    result = handleGetData(params); break;
      default:        result = { ok: false, msg: 'Neznan action' };
    }
  } catch(err) {
    result = { ok: false, msg: err.message };
  }
  return jsonResponse(result);
}

function doPost(e) {
  let result;
  try {
    const body = JSON.parse(e.postData.contents);
    if (body.action === 'save') {
      result = handleSave(body.data);
    } else {
      result = { ok: false, msg: 'Neznan action' };
    }
  } catch(err) {
    result = { ok: false, msg: err.message };
  }
  return jsonResponse(result);
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// ── HANDLERS ─────────────────────────────────────────────────────

/**
 * Login: check ime + pin against "Kontrolorji" sheet
 * GET ?action=login&ime=...&pin=...
 */
function handleLogin(params) {
  const ime = (params.ime || '').trim().toLowerCase();
  const pin = (params.pin || '').trim();
  if (!ime || !pin) return { ok: false, msg: 'Manjkajo parametri' };

  const ss = SpreadsheetApp.openById(SS_ID);
  const sheet = ss.getSheetByName('Kontrolorji');
  if (!sheet) return { ok: false, msg: 'Sheet Kontrolorji ne obstaja' };

  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    const rowIme = String(data[i][0] || '').trim().toLowerCase();
    const rowPin = String(data[i][1] || '').trim();
    if (rowIme === ime && rowPin === pin) {
      return { ok: true, ime: data[i][0] };
    }
  }
  return { ok: false, msg: 'Napačno ime ali PIN' };
}

/**
 * Vehicle lookup: get capacity by registration
 * GET ?action=vozilo&reg=...
 */
function handleVozilo(params) {
  const reg = (params.reg || '').trim().toUpperCase();
  if (!reg) return { kapaciteta: 50, tip: 'neznano' };

  const ss = SpreadsheetApp.openById(SS_ID);
  const sheet = ss.getSheetByName('Vozila');
  if (!sheet) return { kapaciteta: 50, tip: 'neznano' };

  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    const rowReg = String(data[i][0] || '').trim().toUpperCase();
    if (rowReg === reg) {
      return {
        ok: true,
        reg: data[i][0],
        kapaciteta: Number(data[i][1]) || 50,
        tip: data[i][2] || 'neznano',
      };
    }
  }
  return { kapaciteta: 50, tip: 'neznano', found: false };
}

/**
 * Save kontrola: write to "Kontrole" and "Postanki" sheets
 * POST { action: 'save', data: { ...payload } }
 */
function handleSave(payload) {
  if (!payload) throw new Error('Manjka payload');
  const ss = SpreadsheetApp.openById(SS_ID);

  // ── Kontrole sheet ──────────────────────────────────────────
  let sheetK = ss.getSheetByName('Kontrole');
  if (!sheetK) sheetK = ss.insertSheet('Kontrole');
  if (sheetK.getLastRow() === 0) {
    sheetK.appendRow([
      'id', 'datum', 'kontrolor', 'linija', 'smer', 'trip_id',
      'reg_st', 'kapaciteta', 'tip_dneva', 'vreme',
      'ura_zacetek', 'ura_konec',
      'kakovost_01','kakovost_02','kakovost_03','kakovost_04','kakovost_05',
      'kakovost_06','kakovost_07','kakovost_08','kakovost_09','kakovost_10',
      'kakovost_11','kakovost_12','kakovost_13','kakovost_14',
      'voznik_01','voznik_02','voznik_03','voznik_04','voznik_05',
      'vozilo_01','vozilo_02',
      'dostopnost_01','dostopnost_02','dostopnost_03','dostopnost_04',
      'opombe', 'timestamp',
    ]);
  }

  const id = Utilities.getUuid();
  const k = payload.kakovost || [];
  const v = payload.voznik || [];
  const voz = payload.vozilo || [];
  const dos = payload.dostopnost || [];

  sheetK.appendRow([
    id,
    payload.datum || '',
    payload.kontrolor || '',
    payload.linija || '',
    payload.smer || '',
    payload.trip_id || '',
    payload.reg_st || '',
    payload.kapaciteta || '',
    payload.tip_dneva || '',
    payload.vreme || '',
    payload.ura_zacetek || '',
    payload.ura_konec || '',
    k[0], k[1], k[2], k[3], k[4], k[5], k[6],
    k[7], k[8], k[9], k[10], k[11], k[12], k[13],
    v[0], v[1], v[2], v[3], v[4],
    voz[0], voz[1],
    dos[0], dos[1], dos[2], dos[3],
    payload.opombe || '',
    new Date().toISOString(),
  ]);

  // ── Postanki sheet ──────────────────────────────────────────
  const postanki = payload.postanki || [];
  if (postanki.length > 0) {
    let sheetP = ss.getSheetByName('Postanki');
    if (!sheetP) sheetP = ss.insertSheet('Postanki');
    if (sheetP.getLastRow() === 0) {
      sheetP.appendRow([
        'kontrola_id', 'datum', 'linija',
        'zap_st', 'stop_id', 'postaja',
        'nacrtovan_arr', 'dejanski_arr', 'zamuda_arr',
        'nacrtovan_dep', 'dejanski_dep',
        'sedeci', 'stojeci', 'vstopili', 'skip',
      ]);
    }

    const rows = postanki.map(p => [
      id,
      payload.datum || '',
      payload.linija || '',
      p.zap_st,
      p.stop_id || '',
      p.postaja || '',
      p.nacrtovan_arr || '',
      p.dejanski_arr || '',
      p.zamuda_arr !== undefined ? p.zamuda_arr : '',
      p.nacrtovan_dep || '',
      p.dejanski_dep || '',
      p.sedeci || 0,
      p.stojeci || 0,
      p.vstopili || 0,
      p.skip ? 1 : 0,
    ]);

    if (rows.length > 0) {
      const lastRow = sheetP.getLastRow() + 1;
      sheetP.getRange(lastRow, 1, rows.length, rows[0].length).setValues(rows);
    }
  }

  return { ok: true, id };
}

/**
 * Get dashboard data
 * GET ?action=data&from=YYYY-MM-DD
 */
function handleGetData(params) {
  const fromDate = params.from || '';
  const ss = SpreadsheetApp.openById(SS_ID);

  const sheetK = ss.getSheetByName('Kontrole');
  if (!sheetK) return { rows: [] };

  const headers = sheetK.getRange(1, 1, 1, sheetK.getLastColumn()).getValues()[0];
  const allRows = sheetK.getDataRange().getValues();

  // Header index map
  const idx = {};
  headers.forEach((h, i) => { idx[h] = i; });

  // Get all postanki grouped by kontrola_id
  const postankiMap = {};
  const sheetP = ss.getSheetByName('Postanki');
  if (sheetP && sheetP.getLastRow() > 1) {
    const pHeaders = sheetP.getRange(1, 1, 1, sheetP.getLastColumn()).getValues()[0];
    const pidx = {};
    pHeaders.forEach((h, i) => { pidx[h] = i; });
    const pRows = sheetP.getDataRange().getValues().slice(1);

    pRows.forEach(row => {
      const kid = row[pidx['kontrola_id']];
      if (!postankiMap[kid]) postankiMap[kid] = [];
      postankiMap[kid].push({
        zap_st:       row[pidx['zap_st']],
        stop_id:      row[pidx['stop_id']],
        postaja:      row[pidx['postaja']],
        nacrtovan_arr: row[pidx['nacrtovan_arr']],
        dejanski_arr:  row[pidx['dejanski_arr']],
        zamuda_arr:    row[pidx['zamuda_arr']] !== '' ? Number(row[pidx['zamuda_arr']]) : null,
        nacrtovan_dep: row[pidx['nacrtovan_dep']],
        dejanski_dep:  row[pidx['dejanski_dep']],
        sedeci:   Number(row[pidx['sedeci']]) || 0,
        stojeci:  Number(row[pidx['stojeci']]) || 0,
        vstopili: Number(row[pidx['vstopili']]) || 0,
        skip:     row[pidx['skip']] == 1,
      });
    });
  }

  // Build result rows
  const rows = [];
  for (let i = 1; i < allRows.length; i++) {
    const row = allRows[i];
    const datum = String(row[idx['datum']] || '');
    if (fromDate && datum < fromDate) continue;

    const id = row[idx['id']];
    rows.push({
      id,
      datum,
      kontrolor:  row[idx['kontrolor']],
      linija:     row[idx['linija']],
      smer:       row[idx['smer']],
      trip_id:    row[idx['trip_id']],
      reg_st:     row[idx['reg_st']],
      kapaciteta: Number(row[idx['kapaciteta']]) || 50,
      tip_dneva:  row[idx['tip_dneva']],
      vreme:      row[idx['vreme']],
      ura_zacetek: row[idx['ura_zacetek']],
      ura_konec:   row[idx['ura_konec']],
      kakovost:   [
        row[idx['kakovost_01']], row[idx['kakovost_02']], row[idx['kakovost_03']],
        row[idx['kakovost_04']], row[idx['kakovost_05']], row[idx['kakovost_06']],
        row[idx['kakovost_07']], row[idx['kakovost_08']], row[idx['kakovost_09']],
        row[idx['kakovost_10']], row[idx['kakovost_11']], row[idx['kakovost_12']],
        row[idx['kakovost_13']], row[idx['kakovost_14']],
      ].map(v => v !== '' && v !== null ? Number(v) : null),
      voznik: [
        row[idx['voznik_01']], row[idx['voznik_02']], row[idx['voznik_03']],
        row[idx['voznik_04']], row[idx['voznik_05']],
      ].map(v => v !== '' && v !== null ? Number(v) : null),
      vozilo: [row[idx['vozilo_01']], row[idx['vozilo_02']]]
        .map(v => v !== '' && v !== null ? Number(v) : null),
      dostopnost: [
        row[idx['dostopnost_01']], row[idx['dostopnost_02']],
        row[idx['dostopnost_03']], row[idx['dostopnost_04']],
      ].map(v => v !== '' && v !== null ? Number(v) : null),
      opombe: row[idx['opombe']] || '',
      postanki: postankiMap[id] || [],
    });
  }

  return { ok: true, rows };
}
