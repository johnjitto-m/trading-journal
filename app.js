const STORAGE_KEY = 'john-trading-journal-v5';
const OLD_STORAGE_KEYS = ['john-trading-journal-v4', 'john-trading-journal-v3', 'john-trading-journal-v2', 'john-trading-journal-v1'];

// Replace these files with your own reference examples when ready.
// Keep the same file names, or update the paths here.
const exampleImages = {
  cleanCisd: 'assets/examples/clean-cisd.png',
  messyCisd: 'assets/examples/messy-cisd.png',
  irregularCisd: 'assets/examples/irregular-cisd.png',
  fvgInsideCisd: 'assets/examples/fvg-inside-cisd.png',
  fvgOutsideCisd: 'assets/examples/fvg-outside-cisd.png',
};

const htfToLtf = {
  '15m': '1m',
  '1H': '5m',
  '4H': '15m',
  '1D': '1H',
};

const defaultChartLinks = {
  htf: [
    { label: 'HTF before mitigation', url: '' },
    { label: 'HTF current mitigation', url: '' },
  ],
  ltf: [
    { label: 'LTF CISD setup', url: '' },
    { label: 'LTF mitigation', url: '' },
    { label: 'SL / BE / TP setup', url: '' },
  ],
};

const form = document.querySelector('#tradeForm');
const tableBody = document.querySelector('#tradesTable');
const rowTemplate = document.querySelector('#tradeRowTemplate');
const emptyState = document.querySelector('#emptyState');
const searchInput = document.querySelector('#searchInput');
const pairFilter = document.querySelector('#pairFilter');
const resultFilter = document.querySelector('#resultFilter');
const edgeSummary = document.querySelector('#edgeSummary');

const basicStep = document.querySelector('#basicStep');
const htfStep = document.querySelector('#htfStep');
const ltfStep = document.querySelector('#ltfStep');
const basicStepBtn = document.querySelector('#basicStepBtn');
const htfStepBtn = document.querySelector('#htfStepBtn');
const ltfStepBtn = document.querySelector('#ltfStepBtn');
const formTitle = document.querySelector('#formTitle');

const preview = {
  htf: {
    box: document.querySelector('#htfPreviewBox'),
    image: document.querySelector('#htfPreviewImage'),
    empty: document.querySelector('#htfPreviewEmpty'),
    linksContainer: document.querySelector('#htfChartLinks'),
    openLink: document.querySelector('#openHtfActiveLink'),
  },
  ltf: {
    box: document.querySelector('#ltfPreviewBox'),
    image: document.querySelector('#ltfPreviewImage'),
    empty: document.querySelector('#ltfPreviewEmpty'),
    linksContainer: document.querySelector('#ltfChartLinks'),
    openLink: document.querySelector('#openLtfActiveLink'),
  },
};

const fields = {
  tradeId: document.querySelector('#tradeId'),
  date: document.querySelector('#date'),
  day: document.querySelector('#day'),
  pair: document.querySelector('#pair'),
  direction: document.querySelector('#direction'),
  session: document.querySelector('#session'),
  htfTimeframe: document.querySelector('#htfTimeframe'),
  ltfTimeframe: document.querySelector('#ltfTimeframe'),
  htfImageUpload: document.querySelector('#htfImageUpload'),
  ltfImageUpload: document.querySelector('#ltfImageUpload'),
  risk: document.querySelector('#risk'),
  result: document.querySelector('#result'),
  rr: document.querySelector('#rr'),
  htfNotes: document.querySelector('#htfNotes'),
  notes: document.querySelector('#notes'),
};

const stats = {
  totalPnL: document.querySelector('#totalPnL'),
  winRate: document.querySelector('#winRate'),
  totalTrades: document.querySelector('#totalTrades'),
  avgRR: document.querySelector('#avgRR'),
};

let uploadedImages = { htf: '', ltf: '' };
let chartLinks = clone(defaultChartLinks);
let activeChartIndex = { htf: 0, ltf: 0 };
let trades = loadTrades();

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function loadTrades() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return (JSON.parse(saved) || []).map(migrateOldTrade);

    for (const key of OLD_STORAGE_KEYS) {
      const oldSaved = localStorage.getItem(key);
      if (oldSaved) return (JSON.parse(oldSaved) || []).map(migrateOldTrade);
    }

    return [];
  } catch (error) {
    console.error('Could not load trades:', error);
    return [];
  }
}

function migrateOldTrade(trade) {
  const htfLinks = normalizeChartLinks(
    trade.htfChartLinks,
    'htf',
    [trade.tradingViewLink, trade.htfImageUrl, trade.screenshot].filter(Boolean)
  );
  const ltfLinks = normalizeChartLinks(trade.ltfChartLinks, 'ltf', []);

  return {
    ...trade,
    day: trade.day || getDayName(trade.date),
    htfTimeframe: trade.htfTimeframe || '1H',
    ltfTimeframe: trade.ltfTimeframe || '5m',
    htfImageUploadData: trade.htfImageUploadData || '',
    ltfImageUploadData: trade.ltfImageUploadData || '',
    htfChartLinks: htfLinks,
    ltfChartLinks: ltfLinks,
    tradingViewLink: trade.tradingViewLink || firstFilledUrl(htfLinks),
    htfImageUrl: trade.htfImageUrl || '',
    fvgOrder: trade.fvgOrder || '',
    cisdType: trade.cisdType || '',
    fvgLocation: trade.fvgLocation || '',
    htfRetracementTags: [...new Set([
      ...(Array.isArray(trade.htfRetracementTags) ? trade.htfRetracementTags : []),
      ...(Array.isArray(trade.ltfEntrySetupTags) ? trade.ltfEntrySetupTags : []),
    ])],
    ltfEntrySetupTags: [],
    ltfEntryLevelTags: Array.isArray(trade.ltfEntryLevelTags) ? trade.ltfEntryLevelTags : [],
    beLogic: trade.beLogic || '',
    result: trade.result === 'Win' ? 'TP' : trade.result === 'Loss' ? 'SL' : (trade.result || 'BE'),
    htfNotes: trade.htfNotes || '',
    notes: trade.notes || '',
    updatedAt: trade.updatedAt || new Date().toISOString(),
  };
}

function normalizeChartLinks(existingLinks, type, fallbackUrls = []) {
  const base = clone(defaultChartLinks[type]);
  if (Array.isArray(existingLinks) && existingLinks.length) {
    const cleaned = existingLinks.map((item, index) => ({
      label: item.label || base[index]?.label || `${type.toUpperCase()} reference ${index + 1}`,
      url: item.url || '',
    }));
    return cleaned.length ? cleaned : base;
  }

  fallbackUrls.forEach((url, index) => {
    if (!base[index]) base[index] = { label: `${type.toUpperCase()} reference ${index + 1}`, url: '' };
    base[index].url = url;
  });
  return base;
}

function firstFilledUrl(links = []) {
  return links.find((item) => item.url)?.url || '';
}

function saveTrades() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trades));
}

function money(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value || 0);
}

function getDayName(dateValue) {
  if (!dateValue) return '';
  const date = new Date(`${dateValue}T00:00:00`);
  return date.toLocaleDateString('en-US', { weekday: 'long' });
}

function calculatePnL(trade) {
  const risk = Number(trade.risk) || 0;
  const rr = Number(trade.rr) || 0;
  if (trade.result === 'TP' || trade.result === 'Win') return risk * rr;
  if (trade.result === 'SL' || trade.result === 'Loss') return -risk;
  return 0;
}

function setStep(step) {
  const states = {
    basic: step === 'basic',
    htf: step === 'htf',
    ltf: step === 'ltf',
  };

  basicStep.classList.toggle('active', states.basic);
  htfStep.classList.toggle('active', states.htf);
  ltfStep.classList.toggle('active', states.ltf);

  htfStep.setAttribute('aria-hidden', String(!states.htf));
  ltfStep.setAttribute('aria-hidden', String(!states.ltf));
  document.body.classList.toggle('modal-open', states.htf || states.ltf);

  basicStepBtn.classList.toggle('active', states.basic);
  htfStepBtn.classList.toggle('active', states.htf);
  ltfStepBtn.classList.toggle('active', states.ltf);

  if (states.basic) formTitle.textContent = 'Step 1 — Basic Info';
  if (states.htf) formTitle.textContent = 'Step 2 — HTF Analysis';
  if (states.ltf) formTitle.textContent = 'Step 3 — LTF Analysis';
}

function updateDayAndLtf() {
  fields.day.value = getDayName(fields.date.value);
  fields.ltfTimeframe.value = htfToLtf[fields.htfTimeframe.value] || '';
}

function getChecked(name) {
  return document.querySelector(`input[name="${name}"]:checked`)?.value || '';
}

function setChecked(name, value) {
  document.querySelectorAll(`input[name="${name}"]`).forEach((input) => {
    input.checked = input.value === value;
  });
}

function clearChecked(name) {
  document.querySelectorAll(`input[name="${name}"]`).forEach((input) => {
    input.checked = false;
  });
}

function getCheckedValues(name) {
  return [...document.querySelectorAll(`input[name="${name}"]:checked`)].map((input) => input.value);
}

function setCheckedValues(name, values = []) {
  const set = new Set(values);
  document.querySelectorAll(`input[name="${name}"]`).forEach((input) => {
    input.checked = set.has(input.value);
  });
}

function clearCheckedValues(name) {
  document.querySelectorAll(`input[name="${name}"]`).forEach((input) => {
    input.checked = false;
  });
}

function setExampleImages() {
  document.querySelectorAll('[data-example]').forEach((img) => {
    const key = img.dataset.example;
    img.src = exampleImages[key];
  });
}

function isLikelyImageUrl(url) {
  return /\.(png|jpe?g|webp|gif|svg)(\?.*)?$/i.test(url || '');
}

function getTradingViewSnapshotPreviewUrl(url) {
  const value = String(url || '').trim();
  if (!value) return '';

  try {
    const parsed = new URL(value);
    const host = parsed.hostname.replace(/^www\./, '').toLowerCase();
    const isTradingView = host === 'tradingview.com' || host.endsWith('.tradingview.com');
    const isSnapshotPath = /^\/x\/[A-Za-z0-9_-]+\/?$/.test(parsed.pathname);
    return isTradingView && isSnapshotPath ? value : '';
  } catch {
    return '';
  }
}

function getPreviewSrcFromUrl(url) {
  const value = String(url || '').trim();
  if (!value) return '';
  if (isLikelyImageUrl(value)) return value;
  return getTradingViewSnapshotPreviewUrl(value);
}

function setPreviewEmptyText(type, message) {
  preview[type].empty.textContent = message;
}

function renderChartLinks(type) {
  const container = preview[type].linksContainer;
  container.innerHTML = '';

  chartLinks[type].forEach((item, index) => {
    const row = document.createElement('div');
    row.className = `chart-link-row${index === activeChartIndex[type] ? ' active' : ''}`;
    row.innerHTML = `
      <div class="grid two">
        <label>
          Label
          <input class="chart-label-input" type="text" value="${escapeAttribute(item.label)}" placeholder="${type.toUpperCase()} chart label" />
        </label>
        <label>
          Link
          <input class="chart-url-input" type="url" value="${escapeAttribute(item.url)}" placeholder="https://www.tradingview.com/x/..." />
        </label>
      </div>
      <div class="row-actions">
        <button class="small preview-link-btn" type="button">Preview</button>
        <button class="small open-link-btn" type="button">Open</button>
        <button class="small danger remove-link-btn" type="button">Remove</button>
      </div>
    `;

    const labelInput = row.querySelector('.chart-label-input');
    const urlInput = row.querySelector('.chart-url-input');
    const previewBtn = row.querySelector('.preview-link-btn');
    const openBtn = row.querySelector('.open-link-btn');
    const removeBtn = row.querySelector('.remove-link-btn');

    labelInput.addEventListener('input', () => {
      chartLinks[type][index].label = labelInput.value;
    });

    urlInput.addEventListener('input', () => {
      chartLinks[type][index].url = urlInput.value.trim();
      activeChartIndex[type] = index;
      renderChartLinks(type);
      updateChartPreview(type);
    });

    previewBtn.addEventListener('click', () => {
      activeChartIndex[type] = index;
      renderChartLinks(type);
      updateChartPreview(type);
    });

    openBtn.addEventListener('click', () => {
      const url = chartLinks[type][index].url;
      if (url) window.open(url, '_blank', 'noreferrer');
    });

    removeBtn.addEventListener('click', () => {
      if (chartLinks[type].length === 1) {
        chartLinks[type][0] = { label: `${type.toUpperCase()} reference 1`, url: '' };
      } else {
        chartLinks[type].splice(index, 1);
      }
      activeChartIndex[type] = Math.max(0, Math.min(activeChartIndex[type], chartLinks[type].length - 1));
      renderChartLinks(type);
      updateChartPreview(type);
    });

    container.appendChild(row);
  });
}

function addChartLink(type) {
  chartLinks[type].push({ label: `${type.toUpperCase()} extra reference ${chartLinks[type].length + 1}`, url: '' });
  activeChartIndex[type] = chartLinks[type].length - 1;
  renderChartLinks(type);
  updateChartPreview(type);
}

function updateChartPreview(type) {
  const ui = preview[type];
  const active = chartLinks[type][activeChartIndex[type]] || chartLinks[type].find((item) => item.url) || { url: '' };
  const previewSrc = getPreviewSrcFromUrl(active.url) || uploadedImages[type];
  const activeUrl = active.url || '';

  ui.image.onload = null;
  ui.image.onerror = null;

  if (previewSrc) {
    ui.box.classList.remove('has-image');
    setPreviewEmptyText(type, 'Loading chart preview...');

    ui.image.onload = () => {
      ui.box.classList.add('has-image');
    };

    ui.image.onerror = () => {
      ui.image.removeAttribute('src');
      ui.box.classList.remove('has-image');
      setPreviewEmptyText(type, 'Preview unavailable. Use TradingView camera snapshot link, paste direct image URL, or upload screenshot.');
    };

    ui.image.src = previewSrc;
  } else {
    ui.image.removeAttribute('src');
    ui.box.classList.remove('has-image');
    setPreviewEmptyText(type, 'Paste TradingView snapshot links, image URLs, or upload a screenshot');
  }

  if (activeUrl) {
    ui.openLink.href = activeUrl;
    ui.openLink.style.display = 'block';
    ui.openLink.textContent = getTradingViewSnapshotPreviewUrl(activeUrl) ? `Open Active ${type.toUpperCase()} Snapshot` : `Open Active ${type.toUpperCase()} Chart`;
  } else {
    ui.openLink.removeAttribute('href');
    ui.openLink.style.display = 'none';
  }
}

function getFilteredTrades() {
  const query = searchInput.value.trim().toLowerCase();
  const pair = pairFilter.value;
  const result = resultFilter.value;

  return trades
    .filter((trade) => (pair === 'All' ? true : trade.pair === pair))
    .filter((trade) => (result === 'All' ? true : trade.result === result))
    .filter((trade) => {
      if (!query) return true;
      return [
        trade.pair,
        trade.direction,
        trade.session,
        trade.htfTimeframe,
        trade.ltfTimeframe,
        trade.fvgOrder,
        trade.cisdType,
        trade.fvgLocation,
        ...(trade.htfRetracementTags || []),
        ...(trade.ltfEntryLevelTags || []),
        trade.beLogic,
        ...(trade.htfChartLinks || []).flatMap((item) => [item.label, item.url]),
        ...(trade.ltfChartLinks || []).flatMap((item) => [item.label, item.url]),
        trade.htfNotes,
        trade.notes,
      ]
        .join(' ')
        .toLowerCase()
        .includes(query);
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

function renderStats(list = trades) {
  const total = list.length;
  const wins = list.filter((trade) => trade.result === 'TP' || trade.result === 'Win').length;
  const losses = list.filter((trade) => trade.result === 'SL' || trade.result === 'Loss').length;
  const totalPnL = list.reduce((sum, trade) => sum + calculatePnL(trade), 0);
  const rrTrades = list.filter((trade) => trade.result !== 'BE');
  const avgRR = rrTrades.length
    ? rrTrades.reduce((sum, trade) => sum + Number(trade.rr || 0), 0) / rrTrades.length
    : 0;
  const winRate = wins + losses ? (wins / (wins + losses)) * 100 : 0;

  stats.totalPnL.textContent = money(totalPnL);
  stats.totalPnL.className = totalPnL >= 0 ? 'pnl-positive' : 'pnl-negative';
  stats.winRate.textContent = `${winRate.toFixed(1)}%`;
  stats.totalTrades.textContent = total;
  stats.avgRR.textContent = `${avgRR.toFixed(2)}R`;
}

function summarizeBy(fieldName) {
  const groups = new Map();
  trades.forEach((trade) => {
    const values = Array.isArray(trade[fieldName]) ? trade[fieldName] : [trade[fieldName] || 'Not tagged'];
    values.forEach((key) => {
      const current = groups.get(key) || { total: 0, wins: 0, losses: 0 };
      current.total += 1;
      if (trade.result === 'TP' || trade.result === 'Win') current.wins += 1;
      if (trade.result === 'SL' || trade.result === 'Loss') current.losses += 1;
      groups.set(key, current);
    });
  });

  return [...groups.entries()]
    .map(([key, item]) => ({
      key,
      ...item,
      winRate: item.wins + item.losses ? (item.wins / (item.wins + item.losses)) * 100 : 0,
    }))
    .sort((a, b) => b.winRate - a.winRate || b.total - a.total);
}

function renderEdgeSummary() {
  const total = trades.length;
  if (!total) {
    edgeSummary.innerHTML = `
      <article class="edge-card"><span>Status</span><strong>No data yet</strong><small>Add HTF + LTF tagged trades to see similarities.</small></article>
      <article class="edge-card"><span>Goal</span><strong>Find your repeatable setup</strong><small>First/Second FVG, CISD quality, mitigation/retracement, entry level and BE logic.</small></article>
      <article class="edge-card"><span>Minimum</span><strong>30–50 trades</strong><small>That is when the patterns become more useful.</small></article>
    `;
    return;
  }

  const fvg = summarizeBy('fvgOrder')[0];
  const retracement = summarizeBy('htfRetracementTags')[0];
  const be = summarizeBy('beLogic')[0];

  edgeSummary.innerHTML = [
    buildEdgeCard('Best FVG Order', fvg),
    buildEdgeCard('Best Mitigation Tag', retracement),
    buildEdgeCard('Best BE Logic', be),
  ].join('');
}

function buildEdgeCard(title, item) {
  if (!item) return `<article class="edge-card"><span>${title}</span><strong>-</strong><small>No data yet.</small></article>`;
  return `
    <article class="edge-card">
      <span>${title}</span>
      <strong>${escapeHtml(item.key)}</strong>
      <small>${item.total} trade${item.total === 1 ? '' : 's'} · ${item.winRate.toFixed(1)}% win rate</small>
    </article>
  `;
}

function renderTable() {
  const filteredTrades = getFilteredTrades();
  tableBody.innerHTML = '';
  emptyState.style.display = filteredTrades.length ? 'none' : 'block';

  filteredTrades.forEach((trade) => {
    const row = rowTemplate.content.cloneNode(true);
    const pnl = calculatePnL(trade);
    const htfLinks = normalizeChartLinks(trade.htfChartLinks, 'htf');
    const ltfLinks = normalizeChartLinks(trade.ltfChartLinks, 'ltf');
    const htfFilledLinks = filledLinks(htfLinks);
    const ltfFilledLinks = filledLinks(ltfLinks);

    row.querySelector('.date-cell').innerHTML = `${escapeHtml(trade.date)}<br><small>${escapeHtml(trade.day || getDayName(trade.date))}</small>`;
    row.querySelector('.pair-cell').textContent = trade.pair;
    row.querySelector('.direction-cell').textContent = trade.direction;
    row.querySelector('.timeframe-cell').innerHTML = `${escapeHtml(trade.htfTimeframe || '-')} → ${escapeHtml(trade.ltfTimeframe || '-')}`;

    row.querySelector('.pattern-cell').innerHTML = `
      <div class="pattern-meta">
        <strong>${escapeHtml(trade.fvgOrder || '-')}</strong>
        <small>HTF: ${escapeHtml(trade.cisdType || '-')} · ${escapeHtml(trade.fvgLocation || '-')}</small>
        <small>Mitigation: ${escapeHtml(shortList(trade.htfRetracementTags))}</small>
        <small>Entry level: ${escapeHtml(shortList(trade.ltfEntryLevelTags))}</small>
        <small>BE: ${escapeHtml(trade.beLogic || '-')}</small>
        ${renderTradeChartLinks('HTF', htfFilledLinks)}
        ${renderTradeChartLinks('LTF', ltfFilledLinks)}
      </div>
    `;

    const resultPill = row.querySelector('.result-pill');
    resultPill.textContent = trade.result;
    resultPill.classList.add(`result-${getResultClass(trade.result)}`);

    row.querySelector('.rr-cell').textContent = `${Number(trade.rr || 0).toFixed(2)}R`;
    const pnlCell = row.querySelector('.pnl-cell');
    pnlCell.textContent = money(pnl);
    pnlCell.classList.add(pnl >= 0 ? 'pnl-positive' : 'pnl-negative');

    row.querySelector('.edit-btn').addEventListener('click', () => editTrade(trade.id));
    row.querySelector('.delete-btn').addEventListener('click', () => deleteTrade(trade.id));

    tableBody.appendChild(row);
  });

  renderStats(filteredTrades);
  renderEdgeSummary();
}

function shortList(values = []) {
  if (!Array.isArray(values) || !values.length) return '-';
  if (values.length <= 2) return values.join(', ');
  return `${values.slice(0, 2).join(', ')} +${values.length - 2}`;
}

function filledLinks(links = []) {
  return (links || []).filter((item) => item && item.url);
}

function renderTradeChartLinks(title, links = []) {
  if (!links.length) return '';
  const anchors = links
    .map((item) => `<a href="${escapeAttribute(item.url)}" target="_blank" rel="noreferrer">${escapeHtml(item.label || title + ' chart')}</a>`)
    .join(' · ');
  return `<div class="trade-links"><small>${escapeHtml(title)}:</small> ${anchors}</div>`;
}

function getResultClass(result) {
  const value = String(result || '').toLowerCase();
  if (value === 'tp' || value === 'win') return 'tp';
  if (value === 'sl' || value === 'loss') return 'sl';
  return 'be';
}

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function escapeAttribute(value = '') {
  return escapeHtml(value).replaceAll('`', '&#096;');
}

function resetForm() {
  form.reset();
  uploadedImages = { htf: '', ltf: '' };
  chartLinks = clone(defaultChartLinks);
  activeChartIndex = { htf: 0, ltf: 0 };
  fields.tradeId.value = '';
  fields.date.value = today();
  fields.pair.value = 'EURUSD';
  fields.direction.value = 'Long';
  fields.session.value = 'London';
  fields.htfTimeframe.value = '1H';
  fields.risk.value = 25;
  fields.rr.value = 1;
  setChecked('tradeOutcome', 'BE');
  clearChecked('fvgOrder');
  clearChecked('cisdType');
  clearChecked('fvgLocation');
  clearChecked('beLogic');
  clearChecked('tradeOutcome');
  setChecked('tradeOutcome', 'BE');
  clearCheckedValues('htfRetracementTags');
  clearCheckedValues('ltfEntryLevelTags');
  updateDayAndLtf();
  renderChartLinks('htf');
  renderChartLinks('ltf');
  updateChartPreview('htf');
  updateChartPreview('ltf');
  setStep('basic');
}


function mergeLegacyRetracementTags(trade = {}) {
  const combined = [
    ...(trade.htfRetracementTags || []),
    ...(trade.ltfEntrySetupTags || []),
  ].filter(Boolean);
  return [...new Set(combined)];
}

function getFormTrade() {
  const htfLinks = chartLinks.htf.map((item) => ({ label: item.label.trim(), url: item.url.trim() }));
  const ltfLinks = chartLinks.ltf.map((item) => ({ label: item.label.trim(), url: item.url.trim() }));

  return {
    id: fields.tradeId.value || crypto.randomUUID(),
    date: fields.date.value,
    day: fields.day.value,
    pair: fields.pair.value,
    direction: fields.direction.value,
    session: fields.session.value,
    htfTimeframe: fields.htfTimeframe.value,
    ltfTimeframe: fields.ltfTimeframe.value,
    htfImageUploadData: uploadedImages.htf,
    ltfImageUploadData: uploadedImages.ltf,
    htfChartLinks: htfLinks,
    ltfChartLinks: ltfLinks,
    tradingViewLink: firstFilledUrl(htfLinks),
    htfImageUrl: firstFilledUrl(htfLinks),
    fvgOrder: getChecked('fvgOrder'),
    cisdType: getChecked('cisdType'),
    fvgLocation: getChecked('fvgLocation'),
    htfRetracementTags: getCheckedValues('htfRetracementTags'),
    ltfEntrySetupTags: [],
    ltfEntryLevelTags: getCheckedValues('ltfEntryLevelTags'),
    beLogic: getChecked('beLogic'),
    risk: Number(fields.risk.value),
    result: getChecked('tradeOutcome') || 'BE',
    rr: Number(fields.rr.value),
    htfNotes: fields.htfNotes.value.trim(),
    notes: fields.notes.value.trim(),
    updatedAt: new Date().toISOString(),
  };
}

function editTrade(id) {
  const trade = trades.find((item) => item.id === id);
  if (!trade) return;

  fields.tradeId.value = trade.id;
  fields.date.value = trade.date;
  fields.day.value = trade.day || getDayName(trade.date);
  fields.pair.value = trade.pair || 'EURUSD';
  fields.direction.value = trade.direction || 'Long';
  fields.session.value = trade.session || 'London';
  fields.htfTimeframe.value = trade.htfTimeframe || '1H';
  fields.ltfTimeframe.value = trade.ltfTimeframe || htfToLtf[fields.htfTimeframe.value];
  uploadedImages.htf = trade.htfImageUploadData || '';
  uploadedImages.ltf = trade.ltfImageUploadData || '';
  chartLinks.htf = normalizeChartLinks(trade.htfChartLinks, 'htf', [trade.tradingViewLink, trade.htfImageUrl].filter(Boolean));
  chartLinks.ltf = normalizeChartLinks(trade.ltfChartLinks, 'ltf');
  activeChartIndex = { htf: 0, ltf: 0 };
  setChecked('fvgOrder', trade.fvgOrder || '');
  setChecked('cisdType', trade.cisdType || '');
  setChecked('fvgLocation', trade.fvgLocation || '');
  setChecked('beLogic', trade.beLogic || '');
  setCheckedValues('htfRetracementTags', mergeLegacyRetracementTags(trade));
  setCheckedValues('ltfEntryLevelTags', trade.ltfEntryLevelTags || []);
  fields.risk.value = trade.risk ?? 0;
  setChecked('tradeOutcome', trade.result === 'Win' ? 'TP' : trade.result === 'Loss' ? 'SL' : (trade.result || 'BE'));
  fields.rr.value = trade.rr ?? 0;
  fields.htfNotes.value = trade.htfNotes || '';
  fields.notes.value = trade.notes || '';
  updateDayAndLtf();
  renderChartLinks('htf');
  renderChartLinks('ltf');
  updateChartPreview('htf');
  updateChartPreview('ltf');
  setStep('htf');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function deleteTrade(id) {
  const trade = trades.find((item) => item.id === id);
  if (!trade) return;
  const ok = confirm(`Delete ${trade.pair} trade from ${trade.date}?`);
  if (!ok) return;

  trades = trades.filter((item) => item.id !== id);
  saveTrades();
  renderTable();
}

function exportJson() {
  const payload = JSON.stringify({ exportedAt: new Date().toISOString(), version: 5, trades }, null, 2);
  downloadFile(payload, `trading-journal-backup-${today()}.json`, 'application/json');
}

function exportCsv() {
  const headers = [
    'Date', 'Day', 'Pair', 'Direction', 'Session', 'HTF', 'Auto LTF', 'FVG Order',
    'CISD Type', 'FVG Location', 'HTF Mitigation / Entry Behavior Tags',
    'LTF Entry Level Tags', 'BE Logic', 'Risk', 'Result', 'RR', 'PnL',
    'HTF Chart Links', 'LTF Chart Links', 'HTF Notes', 'General Notes'
  ];
  const rows = trades.map((trade) => [
    trade.date,
    trade.day,
    trade.pair,
    trade.direction,
    trade.session,
    trade.htfTimeframe,
    trade.ltfTimeframe,
    trade.fvgOrder,
    trade.cisdType,
    trade.fvgLocation,
    (trade.htfRetracementTags || []).join(' | '),
    (trade.ltfEntryLevelTags || []).join(' | '),
    trade.beLogic,
    trade.risk,
    trade.result,
    trade.rr,
    calculatePnL(trade),
    serializeLinks(trade.htfChartLinks),
    serializeLinks(trade.ltfChartLinks),
    trade.htfNotes,
    trade.notes,
  ]);

  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell ?? '').replaceAll('"', '""')}"`).join(','))
    .join('\n');

  downloadFile(csv, `trading-journal-${today()}.csv`, 'text/csv');
}

function serializeLinks(links = []) {
  return links.map((item) => `${item.label}: ${item.url}`).join(' | ');
}

function downloadFile(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function importJson(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      const importedTrades = Array.isArray(parsed) ? parsed : parsed.trades;
      if (!Array.isArray(importedTrades)) throw new Error('Invalid backup format');

      trades = importedTrades.map((trade) => ({
        ...migrateOldTrade(trade),
        id: trade.id || crypto.randomUUID(),
        updatedAt: trade.updatedAt || new Date().toISOString(),
      }));
      saveTrades();
      renderTable();
      alert('Journal imported successfully.');
    } catch (error) {
      alert('Could not import this JSON file.');
      console.error(error);
    }
  };
  reader.readAsText(file);
}

function validateBasicStep() {
  const required = [fields.date, fields.pair, fields.direction, fields.session, fields.htfTimeframe];
  const invalid = required.find((field) => !field.value);
  if (invalid) {
    invalid.reportValidity();
    return false;
  }
  return true;
}

function validateHtfStep() {
  const requiredGroups = [
    { name: 'fvgOrder', label: 'First FVG or Second FVG' },
    { name: 'cisdType', label: 'CISD type' },
    { name: 'fvgLocation', label: 'FVG location' },
  ];

  const missing = requiredGroups.find((group) => !getChecked(group.name));
  if (missing) {
    alert(`Please select: ${missing.label}`);
    return false;
  }
  if (!getCheckedValues('htfRetracementTags').length) {
    alert('Please select at least one HTF mitigation / retracement tag. Choose None if nothing applies.');
    return false;
  }
  return true;
}

function validateLtfStep() {
  if (!getCheckedValues('ltfEntryLevelTags').length) {
    alert('Please select at least one LTF entry level tag.');
    return false;
  }
  if (!getChecked('beLogic')) {
    alert('Please select BE logic. Choose None if no BE logic applies.');
    return false;
  }
  if (!getChecked('tradeOutcome')) {
    alert('Please select trade outcome: BE, SL, or TP.');
    return false;
  }
  return true;
}

function saveTradeFromModal() {
  if (!validateBasicStep()) {
    setStep('basic');
    return;
  }
  if (!validateHtfStep()) {
    setStep('htf');
    return;
  }
  if (!validateLtfStep()) return;

  const trade = getFormTrade();
  const existingIndex = trades.findIndex((item) => item.id === trade.id);

  if (existingIndex >= 0) {
    trades[existingIndex] = trade;
  } else {
    trades.push(trade);
  }

  saveTrades();
  resetForm();
  renderTable();
}

function wireNoneOption(groupName) {
  document.querySelectorAll(`input[name="${groupName}"]`).forEach((input) => {
    input.addEventListener('change', () => {
      const none = document.querySelector(`input[name="${groupName}"][data-none-option]`);
      if (!none) return;

      if (input === none && input.checked) {
        document.querySelectorAll(`input[name="${groupName}"]`).forEach((other) => {
          if (other !== none) other.checked = false;
        });
        return;
      }

      if (input !== none && input.checked) none.checked = false;
    });
  });
}

function setupImageUpload(type, input) {
  input.addEventListener('change', (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      uploadedImages[type] = reader.result;
      updateChartPreview(type);
    };
    reader.readAsDataURL(file);
  });
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  if (validateBasicStep()) setStep('htf');
});

fields.date.addEventListener('change', updateDayAndLtf);
fields.htfTimeframe.addEventListener('change', updateDayAndLtf);
setupImageUpload('htf', fields.htfImageUpload);
setupImageUpload('ltf', fields.ltfImageUpload);

basicStepBtn.addEventListener('click', () => setStep('basic'));
htfStepBtn.addEventListener('click', () => {
  if (validateBasicStep()) setStep('htf');
});
ltfStepBtn.addEventListener('click', () => {
  if (validateBasicStep() && validateHtfStep()) setStep('ltf');
});
document.querySelector('#continueHtfBtn').addEventListener('click', () => {
  if (validateBasicStep()) setStep('htf');
});
document.querySelector('#continueLtfBtn').addEventListener('click', () => {
  if (validateBasicStep() && validateHtfStep()) setStep('ltf');
});
document.querySelector('#backBasicBtn').addEventListener('click', () => setStep('basic'));
document.querySelector('#backHtfBtn').addEventListener('click', () => setStep('htf'));
document.querySelector('#closeHtfModalBtn').addEventListener('click', () => setStep('basic'));
document.querySelector('#closeLtfModalBtn').addEventListener('click', () => setStep('basic'));
document.querySelector('#saveTradeBtn').addEventListener('click', saveTradeFromModal);
document.querySelector('#addHtfChartLinkBtn').addEventListener('click', () => addChartLink('htf'));
document.querySelector('#addLtfChartLinkBtn').addEventListener('click', () => addChartLink('ltf'));
wireNoneOption('htfRetracementTags');

searchInput.addEventListener('input', renderTable);
pairFilter.addEventListener('change', renderTable);
resultFilter.addEventListener('change', renderTable);
document.querySelector('#resetFormBtn').addEventListener('click', resetForm);
document.querySelector('#exportJsonBtn').addEventListener('click', exportJson);
document.querySelector('#exportCsvBtn').addEventListener('click', exportCsv);
document.querySelector('#importJsonInput').addEventListener('change', importJson);

setExampleImages();
resetForm();
renderTable();
