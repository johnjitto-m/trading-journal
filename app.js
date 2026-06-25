// Supabase Cloud Sync config
// Paste your own values here. Project URL is auto-built from Project ID.
// Do NOT paste service_role keys, secret keys, or database password here.
const SUPABASE_PROJECT_ID = 'wlkslzqjivvsemmyengj';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_KbjXNsBhWb0ZCDDR-74-KA_NjtwhVM6';

const STORAGE_KEY = 'john-trading-journal-v6-supabase';
const OLD_STORAGE_KEYS = ['john-trading-journal-v5', 'john-trading-journal-v4', 'john-trading-journal-v3', 'john-trading-journal-v2', 'john-trading-journal-v1'];

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
const researchTableBody = document.querySelector('#researchTradesTable');
const researchEmptyState = document.querySelector('#researchEmptyState');
const searchInput = document.querySelector('#searchInput');
const directionFilter = document.querySelector('#directionFilter');
const pairFilter = document.querySelector('#pairFilter');
const resultFilter = document.querySelector('#resultFilter');
const sessionFilter = document.querySelector('#sessionFilter');
const htfFilter = document.querySelector('#htfFilter');
const fvgFilter = document.querySelector('#fvgFilter');
const cisdFilter = document.querySelector('#cisdFilter');
const fvgLocationFilter = document.querySelector('#fvgLocationFilter');
const mitigationFilter = document.querySelector('#mitigationFilter');
const entryLevelFilter = document.querySelector('#entryLevelFilter');
const beLogicFilter = document.querySelector('#beLogicFilter');
const dateFromFilter = document.querySelector('#dateFromFilter');
const dateToFilter = document.querySelector('#dateToFilter');
const clearResearchFiltersBtn = document.querySelector('#clearResearchFiltersBtn');
const openResearchBtn = document.querySelector('#openResearchBtn');
const backDashboardBtn = document.querySelector('#backDashboardBtn');
const dashboardView = document.querySelector('#dashboardView');
const researchView = document.querySelector('#researchView');
const weekRangeLabel = document.querySelector('#weekRangeLabel');
const edgeSummary = document.querySelector('#edgeSummary');
const researchEdgeSummary = document.querySelector('#researchEdgeSummary');

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

const researchStats = {
  totalPnL: document.querySelector('#researchTotalPnL'),
  winRate: document.querySelector('#researchWinRate'),
  totalTrades: document.querySelector('#researchTotalTrades'),
  avgRR: document.querySelector('#researchAvgRR'),
};

const cloudUi = {
  status: document.querySelector('#cloudStatus'),
  authControls: document.querySelector('#authControls'),
  email: document.querySelector('#authEmail'),
  password: document.querySelector('#authPassword'),
  signInBtn: document.querySelector('#signInBtn'),
  signUpBtn: document.querySelector('#signUpBtn'),
  logoutBtn: document.querySelector('#logoutBtn'),
  title: document.querySelector('#cloudTitle'),
  signedInEmail: document.querySelector('#signedInEmail'),
  loadCloudBtn: document.querySelector('#loadCloudBtn'),
  uploadLocalBtn: document.querySelector('#uploadLocalBtn'),
};

const deleteModal = {
  root: document.querySelector('#deleteConfirmModal'),
  summary: document.querySelector('#deleteTradeSummary'),
  closeBtn: document.querySelector('#deleteModalCloseBtn'),
  cancelBtn: document.querySelector('#cancelDeleteBtn'),
  confirmBtn: document.querySelector('#confirmDeleteBtn'),
};

const detailsModal = {
  root: document.querySelector('#tradeDetailsModal'),
  title: document.querySelector('#detailsTradeTitle'),
  subtitle: document.querySelector('#detailsTradeSubtitle'),
  body: document.querySelector('#tradeDetailsBody'),
  closeBtn: document.querySelector('#detailsModalCloseBtn'),
  closeFooterBtn: document.querySelector('#detailsCloseBtn'),
  editBtn: document.querySelector('#detailsEditBtn'),
  deleteBtn: document.querySelector('#detailsDeleteBtn'),
};

let uploadedImages = { htf: '', ltf: '' };
let chartLinks = clone(defaultChartLinks);
let activeChartIndex = { htf: 0, ltf: 0 };
let trades = loadTrades();
let supabaseClient = null;
let currentUser = null;
let cloudReady = false;
let cloudBusy = false;
let pendingDeleteId = null;
let activeDetailsId = null;

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

function getSupabaseUrl() {
  const project = SUPABASE_PROJECT_ID.trim();
  if (!project || project === 'PASTE_YOUR_PROJECT_ID_HERE') return '';
  if (project.startsWith('https://')) return project.replace(/\/$/, '');
  return `https://${project}.supabase.co`;
}

function hasCloudConfig() {
  return Boolean(
    getSupabaseUrl() &&
    SUPABASE_PUBLISHABLE_KEY &&
    SUPABASE_PUBLISHABLE_KEY !== 'PASTE_YOUR_PUBLISHABLE_KEY_HERE'
  );
}

function setCloudStatus(message, mode = 'neutral') {
  if (!cloudUi.status) return;
  cloudUi.status.textContent = message;
  cloudUi.status.dataset.mode = mode;
}

function setCloudBusy(isBusy) {
  cloudBusy = isBusy;
  [cloudUi.signInBtn, cloudUi.signUpBtn, cloudUi.logoutBtn, cloudUi.loadCloudBtn, cloudUi.uploadLocalBtn]
    .filter(Boolean)
    .forEach((button) => { button.disabled = isBusy; });
}

function setAuthUi(user) {
  const signedIn = Boolean(user);
  document.body.classList.toggle('auth-locked', !signedIn);
  document.body.classList.toggle('app-unlocked', signedIn);

  if (cloudUi.title) cloudUi.title.textContent = signedIn ? 'Supabase Connected' : 'Supabase Login';
  if (cloudUi.authControls) cloudUi.authControls.hidden = signedIn || !cloudReady;
  if (cloudUi.logoutBtn) cloudUi.logoutBtn.hidden = !signedIn;
  if (cloudUi.signedInEmail) {
    cloudUi.signedInEmail.hidden = !signedIn;
    cloudUi.signedInEmail.textContent = signedIn ? `Signed in as ${user.email}` : '';
  }
  if (signedIn && cloudUi.password) cloudUi.password.value = '';
}

function sanitizeTradeForCloud(trade) {
  const copy = clone(trade);
  delete copy.cloudUpdatedAt;
  return copy;
}

async function initCloudSync() {
  if (!cloudUi.status) return;

  if (!hasCloudConfig()) {
    cloudReady = false;
    setAuthUi(null);
    setCloudStatus('Cloud not configured. Paste your Supabase Project ID and publishable key in app.js, then push again.', 'warn');
    return;
  }

  if (!window.supabase?.createClient) {
    cloudReady = false;
    setAuthUi(null);
    setCloudStatus('Supabase library did not load. Check internet connection or CDN blocking.', 'warn');
    return;
  }

  cloudReady = true;
  supabaseClient = window.supabase.createClient(getSupabaseUrl(), SUPABASE_PUBLISHABLE_KEY);
  setAuthUi(null);
  setCloudStatus('Sign in to open your cloud trading journal.', 'neutral');

  supabaseClient.auth.onAuthStateChange((_event, session) => {
    handleAuthSession(session);
  });

  const { data, error } = await supabaseClient.auth.getSession();
  if (error) {
    setCloudStatus(`Auth check failed: ${error.message}`, 'warn');
    return;
  }
  await handleAuthSession(data.session);
}

async function handleAuthSession(session) {
  currentUser = session?.user || null;
  setAuthUi(currentUser);

  if (!currentUser) {
    setCloudStatus(cloudReady ? 'Sign in to open your cloud trading journal.' : 'Cloud not configured.', 'neutral');
    return;
  }

  setCloudStatus('Connected. Loading cloud trades...', 'good');
  await loadCloudTrades({ keepLocalIfEmpty: true });
}

async function signIn() {
  if (!supabaseClient || cloudBusy) return;
  const email = cloudUi.email.value.trim();
  const password = cloudUi.password.value;
  if (!email || !password) {
    alert('Enter email and password.');
    return;
  }

  setCloudBusy(true);
  setCloudStatus('Signing in...', 'neutral');
  const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
  setCloudBusy(false);

  if (error) {
    setCloudStatus(`Sign in failed: ${error.message}`, 'warn');
    alert(error.message);
  }
}

async function signUp() {
  if (!supabaseClient || cloudBusy) return;
  const email = cloudUi.email.value.trim();
  const password = cloudUi.password.value;
  if (!email || !password) {
    alert('Enter email and password.');
    return;
  }
  if (password.length < 6) {
    alert('Use at least 6 characters for password.');
    return;
  }

  setCloudBusy(true);
  setCloudStatus('Creating account...', 'neutral');
  const { data, error } = await supabaseClient.auth.signUp({ email, password });
  setCloudBusy(false);

  if (error) {
    setCloudStatus(`Sign up failed: ${error.message}`, 'warn');
    alert(error.message);
    return;
  }

  if (!data.session) {
    setCloudStatus('Account created. Check your email to confirm, then sign in.', 'good');
  } else {
    setCloudStatus(`Signed in as ${data.user?.email || email}.`, 'good');
  }
}

async function signOut() {
  if (!supabaseClient || cloudBusy) return;
  setCloudBusy(true);
  await supabaseClient.auth.signOut();
  setCloudBusy(false);
  currentUser = null;
  setAuthUi(null);
  setCloudStatus('Signed out. Sign in to open your trading journal.', 'neutral');
}

async function fetchCloudTrades() {
  if (!supabaseClient || !currentUser) return [];
  const { data, error } = await supabaseClient
    .from('trades')
    .select('id, trade_data, updated_at')
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data || []).map((row) => ({
    ...migrateOldTrade({ ...row.trade_data, id: row.id }),
    id: row.id,
    cloudUpdatedAt: row.updated_at,
  }));
}

async function loadCloudTrades(options = {}) {
  if (!supabaseClient || !currentUser) return;
  setCloudBusy(true);
  try {
    const cloudTrades = await fetchCloudTrades();

    if (!cloudTrades.length && options.keepLocalIfEmpty && trades.length) {
      setCloudStatus(`Cloud is empty. Auto-syncing ${trades.length} local trade${trades.length === 1 ? '' : 's'}...`, 'neutral');
      for (const trade of trades) {
        await saveCloudTrade(trade);
      }
      setCloudStatus(`Connected. ${trades.length} local trade${trades.length === 1 ? '' : 's'} synced to cloud.`, 'good');
      return;
    }

    trades = cloudTrades;
    saveTrades();
    renderTable();
    setCloudStatus(`Connected. ${trades.length} trade${trades.length === 1 ? '' : 's'} synced.`, 'good');
  } catch (error) {
    console.error(error);
    setCloudStatus(`Cloud load failed: ${error.message}`, 'warn');
    alert(`Cloud load failed: ${error.message}`);
  } finally {
    setCloudBusy(false);
  }
}

async function saveCloudTrade(trade) {
  if (!supabaseClient || !currentUser) return;

  const payload = {
    id: trade.id,
    trade_data: sanitizeTradeForCloud(trade),
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabaseClient
    .from('trades')
    .upsert(payload, { onConflict: 'id' });

  if (error) throw error;
}

async function deleteCloudTrade(id) {
  if (!supabaseClient || !currentUser) return;

  const { error } = await supabaseClient
    .from('trades')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

async function uploadLocalToCloud() {
  if (!supabaseClient || !currentUser || cloudBusy) return;
  if (!trades.length) {
    alert('No local trades to upload.');
    return;
  }

  const ok = confirm(`Upload ${trades.length} local trade${trades.length === 1 ? '' : 's'} to Supabase cloud?`);
  if (!ok) return;

  setCloudBusy(true);
  setCloudStatus('Uploading local trades to cloud...', 'neutral');

  try {
    for (const trade of trades) {
      await saveCloudTrade(trade);
    }
    setCloudStatus(`Uploaded ${trades.length} trade${trades.length === 1 ? '' : 's'} to cloud.`, 'good');
  } catch (error) {
    console.error(error);
    setCloudStatus(`Cloud upload failed: ${error.message}`, 'warn');
    alert(`Cloud upload failed: ${error.message}`);
  } finally {
    setCloudBusy(false);
  }
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

function getLocalDate(dateValue) {
  if (!dateValue) return null;
  return new Date(`${dateValue}T00:00:00`);
}

function getCurrentWeekRange() {
  const now = new Date();
  const todayLocal = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const day = todayLocal.getDay(); // Sunday = 0, Monday = 1
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const start = new Date(todayLocal);
  start.setDate(todayLocal.getDate() + diffToMonday);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return { start, end };
}

function formatShortDate(date) {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function isTradeInRange(trade, start, end) {
  const tradeDate = getLocalDate(trade.date);
  if (!tradeDate) return false;
  return tradeDate >= start && tradeDate <= end;
}

function getCurrentWeekTrades() {
  const { start, end } = getCurrentWeekRange();
  return trades
    .filter((trade) => isTradeInRange(trade, start, end))
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

function getFilteredTrades() {
  const query = searchInput?.value.trim().toLowerCase() || '';
  const direction = directionFilter?.value || 'All';
  const pair = pairFilter?.value || 'All';
  const result = resultFilter?.value || 'All';
  const session = sessionFilter?.value || 'All';
  const htf = htfFilter?.value || 'All';
  const fvg = fvgFilter?.value || 'All';
  const cisd = cisdFilter?.value || 'All';
  const fvgLocation = fvgLocationFilter?.value || 'All';
  const mitigation = mitigationFilter?.value || 'All';
  const entryLevel = entryLevelFilter?.value || 'All';
  const beLogic = beLogicFilter?.value || 'All';
  const dateFrom = dateFromFilter?.value || '';
  const dateTo = dateToFilter?.value || '';

  return trades
    .filter((trade) => (direction === 'All' ? true : trade.direction === direction))
    .filter((trade) => (pair === 'All' ? true : trade.pair === pair))
    .filter((trade) => (result === 'All' ? true : trade.result === result))
    .filter((trade) => (session === 'All' ? true : trade.session === session))
    .filter((trade) => (htf === 'All' ? true : trade.htfTimeframe === htf))
    .filter((trade) => (fvg === 'All' ? true : trade.fvgOrder === fvg))
    .filter((trade) => (cisd === 'All' ? true : trade.cisdType === cisd))
    .filter((trade) => (fvgLocation === 'All' ? true : trade.fvgLocation === fvgLocation))
    .filter((trade) => (mitigation === 'All' ? true : (trade.htfRetracementTags || []).includes(mitigation)))
    .filter((trade) => (entryLevel === 'All' ? true : (trade.ltfEntryLevelTags || []).includes(entryLevel)))
    .filter((trade) => (beLogic === 'All' ? true : (trade.beLogic || 'None') === beLogic))
    .filter((trade) => (dateFrom ? trade.date >= dateFrom : true))
    .filter((trade) => (dateTo ? trade.date <= dateTo : true))
    .filter((trade) => {
      if (!query) return true;
      return [
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
        ...(trade.htfRetracementTags || []),
        ...(trade.ltfEntryLevelTags || []),
        trade.beLogic,
        trade.result,
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

function renderStats(list = trades, target = stats) {
  const total = list.length;
  const wins = list.filter((trade) => trade.result === 'TP' || trade.result === 'Win').length;
  const losses = list.filter((trade) => trade.result === 'SL' || trade.result === 'Loss').length;
  const totalPnL = list.reduce((sum, trade) => sum + calculatePnL(trade), 0);
  const rrTrades = list.filter((trade) => trade.result !== 'BE');
  const avgRR = rrTrades.length
    ? rrTrades.reduce((sum, trade) => sum + Number(trade.rr || 0), 0) / rrTrades.length
    : 0;
  const winRate = wins + losses ? (wins / (wins + losses)) * 100 : 0;

  if (!target?.totalPnL) return;
  target.totalPnL.textContent = money(totalPnL);
  target.totalPnL.className = totalPnL >= 0 ? 'pnl-positive' : 'pnl-negative';
  target.winRate.textContent = `${winRate.toFixed(1)}%`;
  target.totalTrades.textContent = total;
  target.avgRR.textContent = `${avgRR.toFixed(2)}R`;
}

function isWin(trade) {
  return trade.result === 'TP' || trade.result === 'Win';
}

function isLoss(trade) {
  return trade.result === 'SL' || trade.result === 'Loss';
}

function summarizeBy(fieldName, list = trades) {
  const groups = new Map();
  list.forEach((trade) => {
    const rawValues = Array.isArray(trade[fieldName]) ? trade[fieldName] : [trade[fieldName]];
    const values = rawValues.filter(Boolean).length ? rawValues.filter(Boolean) : ['Not tagged'];
    values.forEach((key) => {
      const current = groups.get(key) || { total: 0, wins: 0, losses: 0, be: 0, pnl: 0 };
      current.total += 1;
      if (isWin(trade)) current.wins += 1;
      if (isLoss(trade)) current.losses += 1;
      if (trade.result === 'BE') current.be += 1;
      current.pnl += calculatePnL(trade);
      groups.set(key, current);
    });
  });

  return [...groups.entries()]
    .map(([key, item]) => ({
      key,
      ...item,
      winRate: item.wins + item.losses ? (item.wins / (item.wins + item.losses)) * 100 : 0,
    }))
    .sort((a, b) => b.winRate - a.winRate || b.total - a.total || b.pnl - a.pnl);
}

function getSimilarityItems(list, resultType) {
  const filtered = list.filter((trade) => (resultType === 'win' ? isWin(trade) : isLoss(trade)));
  const total = filtered.length;
  if (!total) return [];

  const fieldsToCheck = [
    { label: 'FVG order', field: 'fvgOrder' },
    { label: 'CISD type', field: 'cisdType' },
    { label: 'FVG location', field: 'fvgLocation' },
    { label: 'Mitigation', field: 'htfRetracementTags' },
    { label: 'Entry level', field: 'ltfEntryLevelTags' },
    { label: 'BE logic', field: 'beLogic' },
    { label: 'Session', field: 'session' },
    { label: 'Pair', field: 'pair' },
    { label: 'Direction', field: 'direction' },
    { label: 'HTF', field: 'htfTimeframe' },
  ];

  return fieldsToCheck
    .map(({ label, field }) => {
      const top = summarizeBy(field, filtered).filter((item) => item.key !== 'Not tagged')[0];
      if (!top) return null;
      return {
        label,
        value: top.key,
        total: top.total,
        pct: total ? (top.total / total) * 100 : 0,
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.pct - a.pct || b.total - a.total)
    .slice(0, 5);
}

function renderSimilarityCard(title, list, resultType) {
  const items = getSimilarityItems(list, resultType);
  const count = list.filter((trade) => (resultType === 'win' ? isWin(trade) : isLoss(trade))).length;
  const tone = resultType === 'win' ? 'winning' : 'losing';

  if (!count) {
    return `<article class="edge-card similarity-card ${tone}"><span>${title}</span><strong>No ${resultType === 'win' ? 'TP' : 'SL'} trades yet</strong><small>More trades are needed to detect similarities.</small></article>`;
  }

  return `
    <article class="edge-card similarity-card ${tone}">
      <span>${title}</span>
      <strong>${count} ${resultType === 'win' ? 'TP' : 'SL'} trade${count === 1 ? '' : 's'}</strong>
      <ul>
        ${items.map((item) => `<li><b>${item.pct.toFixed(0)}%</b> ${escapeHtml(item.label)}: ${escapeHtml(item.value)}</li>`).join('')}
      </ul>
    </article>
  `;
}

function getBestAndWorst(fieldName, list) {
  const items = summarizeBy(fieldName, list).filter((item) => item.key !== 'Not tagged' && item.total > 0);
  if (!items.length) return { best: null, worst: null };
  const meaningful = items.filter((item) => item.wins + item.losses > 0);
  const source = meaningful.length ? meaningful : items;
  const best = [...source].sort((a, b) => b.winRate - a.winRate || b.pnl - a.pnl || b.total - a.total)[0];
  const worst = [...source].sort((a, b) => a.winRate - b.winRate || a.pnl - b.pnl || b.total - a.total)[0];
  return { best, worst };
}

function renderConditionCard(title, item, mode = 'best') {
  if (!item) return `<article class="edge-card condition-card"><span>${title}</span><strong>-</strong><small>No tagged data yet.</small></article>`;
  const klass = mode === 'worst' ? 'worst' : 'best';
  return `
    <article class="edge-card condition-card ${klass}">
      <span>${title}</span>
      <strong>${escapeHtml(item.key)}</strong>
      <small>${item.total} trade${item.total === 1 ? '' : 's'} · ${item.winRate.toFixed(1)}% win rate · ${money(item.pnl)} P/L</small>
    </article>
  `;
}

function renderEdgeSummary(list = trades, target = edgeSummary) {
  if (!target) return;
  const total = list.length;
  if (!total) {
    target.innerHTML = `
      <article class="edge-card"><span>Status</span><strong>No data yet</strong><small>Add tagged trades to see similarities.</small></article>
      <article class="edge-card"><span>Goal</span><strong>Find your repeatable setup</strong><small>First/Second FVG, CISD quality, mitigation/retracement, entry level and BE logic.</small></article>
      <article class="edge-card"><span>Minimum</span><strong>30–50 trades</strong><small>That is when the patterns become more useful.</small></article>
    `;
    return;
  }

  const cisd = getBestAndWorst('cisdType', list);
  const fvgOrder = getBestAndWorst('fvgOrder', list);
  const fvgLocation = getBestAndWorst('fvgLocation', list);
  const mitigation = getBestAndWorst('htfRetracementTags', list);
  const entry = getBestAndWorst('ltfEntryLevelTags', list);
  const be = getBestAndWorst('beLogic', list);

  target.innerHTML = [
    renderSimilarityCard('Winning Trade Similarities', list, 'win'),
    renderSimilarityCard('Losing Trade Similarities', list, 'loss'),
    renderConditionCard('Best CISD Type', cisd.best, 'best'),
    renderConditionCard('Worst CISD Type', cisd.worst, 'worst'),
    renderConditionCard('Best FVG Order', fvgOrder.best, 'best'),
    renderConditionCard('Best FVG Location', fvgLocation.best, 'best'),
    renderConditionCard('Best Mitigation Tag', mitigation.best, 'best'),
    renderConditionCard('Worst Mitigation Tag', mitigation.worst, 'worst'),
    renderConditionCard('Best Entry Level', entry.best, 'best'),
    renderConditionCard('Best BE Logic', be.best, 'best'),
  ].join('');
}

function renderTradeRows(list, targetBody, targetEmpty) {
  if (!targetBody) return;
  targetBody.innerHTML = '';
  if (targetEmpty) targetEmpty.style.display = list.length ? 'none' : 'block';

  list.forEach((trade) => {
    const row = rowTemplate.content.cloneNode(true);

    row.querySelector('.date-cell').innerHTML = `${escapeHtml(trade.date)}<br><small>${escapeHtml(trade.day || getDayName(trade.date))}</small>`;
    row.querySelector('.pair-cell').textContent = trade.pair || '-';
    row.querySelector('.direction-cell').innerHTML = `<span class="direction-badge ${String(trade.direction || '').toLowerCase()}">${escapeHtml(trade.direction || '-')}</span>`;
    row.querySelector('.setup-cell').textContent = trade.fvgOrder || '-';
    row.querySelector('.cisd-cell').textContent = trade.cisdType || '-';

    const resultPill = row.querySelector('.result-pill');
    resultPill.textContent = trade.result || '-';
    resultPill.classList.add(`result-${getResultClass(trade.result)}`);

    row.querySelector('.view-btn').addEventListener('click', () => viewTrade(trade.id));
    row.querySelector('.edit-btn').addEventListener('click', () => editTrade(trade.id));
    row.querySelector('.delete-btn').addEventListener('click', () => deleteTrade(trade.id));

    targetBody.appendChild(row);
  });
}

function renderDashboard() {
  const { start, end } = getCurrentWeekRange();
  if (weekRangeLabel) weekRangeLabel.textContent = `${formatShortDate(start)} – ${formatShortDate(end)} · Monday to Sunday`;
  const weeklyTrades = getCurrentWeekTrades();
  renderStats(weeklyTrades, stats);
  renderEdgeSummary(weeklyTrades, edgeSummary);
  renderTradeRows(weeklyTrades, tableBody, emptyState);
}

function renderResearch() {
  const filteredTrades = getFilteredTrades();
  renderStats(filteredTrades, researchStats);
  renderEdgeSummary(filteredTrades, researchEdgeSummary);
  renderTradeRows(filteredTrades, researchTableBody, researchEmptyState);
}

function renderTable() {
  renderDashboard();
  renderResearch();
}

function setAppView(view) {
  const showResearch = view === 'research';
  if (dashboardView) dashboardView.hidden = showResearch;
  if (researchView) researchView.hidden = !showResearch;
  document.body.classList.toggle('research-mode', showResearch);
  if (showResearch) {
    renderResearch();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else {
    renderDashboard();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

function clearResearchFilters() {
  if (searchInput) searchInput.value = '';
  [directionFilter, pairFilter, resultFilter, sessionFilter, htfFilter, fvgFilter, cisdFilter, fvgLocationFilter, mitigationFilter, entryLevelFilter, beLogicFilter].forEach((filter) => {
    if (filter) filter.value = 'All';
  });
  if (dateFromFilter) dateFromFilter.value = '';
  if (dateToFilter) dateToFilter.value = '';
  renderResearch();
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


function viewTrade(id) {
  const trade = trades.find((item) => item.id === id);
  if (!trade || !detailsModal.root) return;

  activeDetailsId = id;
  const pnl = calculatePnL(trade);
  if (detailsModal.title) detailsModal.title.textContent = `${trade.pair || '-'} ${trade.direction || ''}`.trim();
  if (detailsModal.subtitle) {
    detailsModal.subtitle.textContent = `${trade.date || '-'} · ${trade.day || getDayName(trade.date)} · ${trade.session || '-'} · ${trade.htfTimeframe || '-'} → ${trade.ltfTimeframe || '-'}`;
  }
  if (detailsModal.body) detailsModal.body.innerHTML = buildTradeDetails(trade, pnl);

  detailsModal.root.hidden = false;
  detailsModal.root.setAttribute('aria-hidden', 'false');
  document.body.classList.add('details-modal-open');
}

function closeTradeDetails() {
  if (!detailsModal.root) return;
  activeDetailsId = null;
  detailsModal.root.hidden = true;
  detailsModal.root.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('details-modal-open');
}

function buildTradeDetails(trade, pnl) {
  const htfLinks = filledLinks(normalizeChartLinks(trade.htfChartLinks, 'htf'));
  const ltfLinks = filledLinks(normalizeChartLinks(trade.ltfChartLinks, 'ltf'));
  return `
    <section class="details-overview-grid">
      ${detailMetric('Result', `<span class="result-pill result-${getResultClass(trade.result)}">${escapeHtml(trade.result || '-')}</span>`, true)}
      ${detailMetric('Risk', `$${Number(trade.risk || 0).toFixed(2)}`)}
      ${detailMetric('RR', `${Number(trade.rr || 0).toFixed(2)}R`)}
      ${detailMetric('P/L', `<span class="${pnl >= 0 ? 'pnl-positive' : 'pnl-negative'}">${money(pnl)}</span>`, true)}
    </section>

    <section class="details-section">
      <div class="details-section-head">
        <p class="section-kicker">Basic Info</p>
        <h3>Trade Context</h3>
      </div>
      <div class="details-grid">
        ${detailItem('Date', `${trade.date || '-'} · ${trade.day || getDayName(trade.date)}`)}
        ${detailItem('Pair', trade.pair || '-')}
        ${detailItem('Direction', trade.direction || '-')}
        ${detailItem('Session', trade.session || '-')}
        ${detailItem('HTF', trade.htfTimeframe || '-')}
        ${detailItem('Auto LTF', trade.ltfTimeframe || '-')}
      </div>
    </section>

    <section class="details-section">
      <div class="details-section-head">
        <p class="section-kicker">HTF Analysis</p>
        <h3>FVG POI</h3>
      </div>
      <div class="details-grid">
        ${detailItem('FVG Order', trade.fvgOrder || '-')}
        ${detailItem('CISD Type', trade.cisdType || '-')}
        ${detailItem('FVG Location', trade.fvgLocation || '-')}
        ${detailItem('Mitigation / Retracement', renderTagList(trade.htfRetracementTags), true)}
      </div>
      ${trade.htfNotes ? `<div class="details-note"><span>HTF Notes</span><p>${escapeHtml(trade.htfNotes)}</p></div>` : ''}
      ${renderDetailChartLinks('HTF Chart Links', htfLinks)}
    </section>

    <section class="details-section">
      <div class="details-section-head">
        <p class="section-kicker">LTF Analysis</p>
        <h3>Execution</h3>
      </div>
      <div class="details-grid">
        ${detailItem('Entry Level', renderTagList(trade.ltfEntryLevelTags), true)}
        ${detailItem('BE Logic', trade.beLogic || '-')}
      </div>
      ${renderDetailChartLinks('LTF Chart Links', ltfLinks)}
    </section>
  `;
}

function detailMetric(label, value, raw = false) {
  return `<article class="details-metric"><span>${escapeHtml(label)}</span><strong>${raw ? value : escapeHtml(value)}</strong></article>`;
}

function detailItem(label, value, raw = false) {
  return `<div class="detail-item"><span>${escapeHtml(label)}</span><strong>${raw ? value : escapeHtml(value)}</strong></div>`;
}

function renderTagList(values = []) {
  const list = Array.isArray(values) ? values.filter(Boolean) : [values].filter(Boolean);
  if (!list.length) return '<em>-</em>';
  return `<div class="detail-tags">${list.map((item) => `<span>${escapeHtml(item)}</span>`).join('')}</div>`;
}

function renderDetailChartLinks(title, links = []) {
  if (!links.length) {
    return `
      <div class="details-links-block empty-links">
        <span>${escapeHtml(title)}</span>
        <p>No chart links saved.</p>
      </div>
    `;
  }

  return `
    <div class="details-links-block">
      <span>${escapeHtml(title)}</span>
      <div class="details-link-list">
        ${links.map((item, index) => `
          <a href="${escapeAttribute(item.url)}" target="_blank" rel="noreferrer">
            <strong>${escapeHtml(item.label || `Chart ${index + 1}`)}</strong>
            <small>${escapeHtml(item.url)}</small>
          </a>
        `).join('')}
      </div>
    </div>
  `;
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

  setAppView('dashboard');
  setStep('basic');
  if (formTitle) formTitle.textContent = 'Editing Trade — Basic Info';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function deleteTrade(id) {
  openDeleteConfirm(id);
}

function openDeleteConfirm(id) {
  const trade = trades.find((item) => item.id === id);
  if (!trade || !deleteModal.root) return;

  pendingDeleteId = id;
  if (deleteModal.summary) deleteModal.summary.innerHTML = buildDeleteTradeSummary(trade);
  if (deleteModal.confirmBtn) {
    deleteModal.confirmBtn.disabled = false;
    deleteModal.confirmBtn.textContent = 'Delete Trade';
  }

  deleteModal.root.hidden = false;
  deleteModal.root.setAttribute('aria-hidden', 'false');
  document.body.classList.add('delete-modal-open');
}

function closeDeleteConfirm() {
  if (!deleteModal.root) return;
  pendingDeleteId = null;
  deleteModal.root.hidden = true;
  deleteModal.root.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('delete-modal-open');
}

function buildDeleteTradeSummary(trade) {
  const pnl = calculatePnL(trade);
  return `
    <div class="delete-summary-main">
      <strong>${escapeHtml(trade.pair || '-')} ${escapeHtml(trade.direction || '')}</strong>
      <span>${escapeHtml(trade.date || '-')} · ${escapeHtml(trade.day || getDayName(trade.date))} · ${escapeHtml(trade.session || '-')}</span>
    </div>
    <div class="delete-summary-grid">
      <div><span>HTF → LTF</span><strong>${escapeHtml(trade.htfTimeframe || '-')} → ${escapeHtml(trade.ltfTimeframe || '-')}</strong></div>
      <div><span>FVG Order</span><strong>${escapeHtml(trade.fvgOrder || '-')}</strong></div>
      <div><span>CISD</span><strong>${escapeHtml(trade.cisdType || '-')}</strong></div>
      <div><span>FVG Location</span><strong>${escapeHtml(trade.fvgLocation || '-')}</strong></div>
      <div><span>Result</span><strong>${escapeHtml(trade.result || '-')}</strong></div>
      <div><span>RR</span><strong>${Number(trade.rr || 0).toFixed(2)}R</strong></div>
      <div><span>P/L</span><strong class="${pnl >= 0 ? 'pnl-positive' : 'pnl-negative'}">${money(pnl)}</strong></div>
    </div>
  `;
}

async function confirmDeleteTrade() {
  if (!pendingDeleteId) return;
  const id = pendingDeleteId;

  try {
    if (deleteModal.confirmBtn) {
      deleteModal.confirmBtn.disabled = true;
      deleteModal.confirmBtn.textContent = 'Deleting...';
    }

    if (currentUser) {
      setCloudStatus('Deleting trade from cloud...', 'neutral');
      await deleteCloudTrade(id);
    }

    trades = trades.filter((item) => item.id !== id);
    saveTrades();
    renderTable();
    closeDeleteConfirm();

    if (currentUser) {
      setCloudStatus(`Connected. Trade deleted. ${trades.length} trade${trades.length === 1 ? '' : 's'} synced.`, 'good');
    }
  } catch (error) {
    console.error(error);
    if (deleteModal.confirmBtn) {
      deleteModal.confirmBtn.disabled = false;
      deleteModal.confirmBtn.textContent = 'Delete Trade';
    }
    setCloudStatus(`Delete failed: ${error.message}`, 'warn');
    alert(`Delete failed: ${error.message}. The trade was not removed because cloud delete failed.`);
  }
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
  reader.onload = async () => {
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
      if (currentUser) {
        setCloudStatus('Imported backup locally. Auto-syncing imported trades to cloud...', 'neutral');
        for (const trade of trades) {
          await saveCloudTrade(trade);
        }
        setCloudStatus(`Connected. Imported ${trades.length} trade${trades.length === 1 ? '' : 's'} synced to cloud.`, 'good');
      }
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
  return true;
}

async function saveTradeFromModal() {
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
  renderTable();

  try {
    await saveCloudTrade(trade);
    if (currentUser) setCloudStatus('Connected. Trade saved to cloud automatically.', 'good');
  } catch (error) {
    console.error(error);
    setCloudStatus(`Saved locally, but cloud save failed: ${error.message}`, 'warn');
    alert(`Saved locally, but cloud save failed: ${error.message}`);
  }

  resetForm();
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

searchInput?.addEventListener('input', renderResearch);
directionFilter?.addEventListener('change', renderResearch);
pairFilter?.addEventListener('change', renderResearch);
resultFilter?.addEventListener('change', renderResearch);
sessionFilter?.addEventListener('change', renderResearch);
htfFilter?.addEventListener('change', renderResearch);
fvgFilter?.addEventListener('change', renderResearch);
cisdFilter?.addEventListener('change', renderResearch);
fvgLocationFilter?.addEventListener('change', renderResearch);
mitigationFilter?.addEventListener('change', renderResearch);
entryLevelFilter?.addEventListener('change', renderResearch);
beLogicFilter?.addEventListener('change', renderResearch);
dateFromFilter?.addEventListener('change', renderResearch);
dateToFilter?.addEventListener('change', renderResearch);
clearResearchFiltersBtn?.addEventListener('click', clearResearchFilters);
openResearchBtn?.addEventListener('click', () => setAppView('research'));
backDashboardBtn?.addEventListener('click', () => setAppView('dashboard'));
document.querySelector('#resetFormBtn').addEventListener('click', resetForm);
document.querySelector('#exportJsonBtn').addEventListener('click', exportJson);
document.querySelector('#exportCsvBtn').addEventListener('click', exportCsv);
document.querySelector('#importJsonInput').addEventListener('change', importJson);

detailsModal.closeBtn?.addEventListener('click', closeTradeDetails);
detailsModal.closeFooterBtn?.addEventListener('click', closeTradeDetails);
detailsModal.editBtn?.addEventListener('click', () => {
  const id = activeDetailsId;
  closeTradeDetails();
  if (id) editTrade(id);
});
detailsModal.deleteBtn?.addEventListener('click', () => {
  const id = activeDetailsId;
  closeTradeDetails();
  if (id) deleteTrade(id);
});
detailsModal.root?.addEventListener('click', (event) => {
  if (event.target?.matches?.('[data-details-close]')) closeTradeDetails();
});

deleteModal.closeBtn?.addEventListener('click', closeDeleteConfirm);
deleteModal.cancelBtn?.addEventListener('click', closeDeleteConfirm);
deleteModal.confirmBtn?.addEventListener('click', confirmDeleteTrade);
deleteModal.root?.addEventListener('click', (event) => {
  if (event.target?.matches?.('[data-delete-cancel]')) closeDeleteConfirm();
});
document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  if (deleteModal.root && !deleteModal.root.hidden) closeDeleteConfirm();
  if (detailsModal.root && !detailsModal.root.hidden) closeTradeDetails();
});

cloudUi.signInBtn?.addEventListener('click', signIn);
cloudUi.signUpBtn?.addEventListener('click', signUp);
cloudUi.logoutBtn?.addEventListener('click', signOut);

setExampleImages();
resetForm();
renderTable();
initCloudSync();
