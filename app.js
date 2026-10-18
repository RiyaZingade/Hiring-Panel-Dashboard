// Hiring Panel Studio — single-page app. State lives in this browser's
// localStorage; the /api routes run each reviewer through Claude.

const REPO_URL = 'https://github.com/RiyaZingade/Hiring-Panel';

const AGENTS = [
  { id: 'ats', name: 'Automated screen', desc: 'Keywords and hard requirements.', icon: 'bot' },
  { id: 'manager', name: 'Hiring manager', desc: 'Would they get an interview?', icon: 'brief' },
  { id: 'dayone', name: 'Day-one hiring manager', desc: 'Could you contribute week one?', icon: 'dayone' },
  { id: 'rival', name: 'Rival applicant', desc: 'Would they lose to you?', icon: 'rival' },
  { id: 'ceo', name: 'CEO', desc: 'Impact: what changed, and by how much.', icon: 'ceo' },
  { id: 'recruiter', name: 'Recruiter', desc: '30 seconds on the top third.', icon: 'search' },
  { id: 'teammate', name: 'Teammate', desc: 'How you work with others.', icon: 'team' }
];
const AGENT = Object.fromEntries(AGENTS.map((a) => [a.id, a]));

const I = {
  bot: 'M9 3v2M15 3v2M9 19v2M15 19v2M3 9h2M3 15h2M19 9h2M19 15h2M7 5h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2zM9 9h6v6H9z',
  brief: 'M4 7h16a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1zM9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M3 13h18',
  dayone: 'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2 21v-1a6 6 0 0 1 10.5-4M16 19l2 2 4-4',
  rival: 'M14.5 17.5 3 6V3h3l11.5 11.5M13 19l6-6M16 16l4 4M19 21l2-2M9.5 6.5 13 3h3v3l-3.5 3.5M5 14l4 4M7 17l-3 3M3 19l2 2',
  ceo: 'M3 19h18M4 19 3 7l5 4 4-6 4 6 5-4-1 12',
  search: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20 20l-3.5-3.5',
  team: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8',
  pass: 'M22 11.1V12a10 10 0 1 1-5.9-9.1M22 4 12 14l-3-3',
  interview: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
  hire: 'M7 10v12M15 5.9 14 10h5.8a2 2 0 0 1 2 2.3l-1.4 8A2 2 0 0 1 18.4 22H7V10l4-8a3 3 0 0 1 4 3.9z',
  maybe: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3M12 17h.01',
  no: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM15 9l-6 6M9 9l6 6',
  wording: 'M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z',
  missing: 'M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0zM12 9v4M12 17h.01',
  metric: 'M12 20V10M18 20V4M6 20v-4',
  keyword: 'M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L2 12V2h10l8.6 8.6a2 2 0 0 1 0 2.8zM7 7h.01',
  question: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 6v6l4 2',
  shipped: 'M21 16V8a2 2 0 0 0-1-1.7l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.7l7 4a2 2 0 0 0 2 0l7-4a2 2 0 0 0 1-1.7zM3.3 7 12 12l8.7-5M12 22V12',
  back: 'M15 18l-6-6 6-6',
  plus: 'M12 5v14M5 12h14',
  arrow: 'M5 12h14M13 6l6 6-6 6',
  rerun: 'M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7',
  code: 'm16 18 6-6-6-6M8 6l-6 6 6 6',
  chev: 'm6 9 6 6 6-6',
  clock: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 6v6l4 2',
  bolt: 'M13 2 3 14h9l-1 8 10-12h-9z',
  upload: 'M12 16V4M7 9l5-5 5 5M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3',
  note: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
  trash: 'M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14'
};
const icon = (key, size = 16, extra = '') =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra}><path d="${I[key] || key}"></path></svg>`;
const LOGO = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8AB4FF" stroke-width="1.6" aria-hidden="true"><circle cx="6" cy="8" r="2.5"></circle><circle cx="12" cy="6" r="2.5"></circle><circle cx="18" cy="8" r="2.5"></circle><path d="M3 19c.5-3 2-5 3-5M9 19c.5-4 2-6 3-6s2.5 2 3 6M21 19c-.5-3-2-5-3-5"></path></svg>';

// ---------- storage ----------
const KEY = 'hps.v1';
function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) { /* fall through to empty */ }
  return { apps: [], library: [] };
}
let db = load();
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (e) { toast('Could not save to this browser (storage full or blocked).'); }
}

// ---------- helpers ----------
const $app = document.getElementById('app');
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => Math.random().toString(36).slice(2, 10);
const findApp = (id) => db.apps.find((a) => a.id === id);
const latest = (app) => app.versions[app.versions.length - 1];
function ago(t) {
  if (!t) return '—';
  const s = Math.round((Date.now() - t) / 1000);
  if (s < 45) return 'now';
  if (s < 3600) return Math.round(s / 60) + ' min ago';
  if (s < 86400) return Math.round(s / 3600) + ' h ago';
  if (s < 172800) return 'Yesterday';
  return new Date(t).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}
function dur(ms) {
  if (!ms) return '—';
  const s = Math.round(ms / 1000);
  return s >= 60 ? Math.floor(s / 60) + ' m ' + (s % 60) + ' s' : s + ' s';
}
let toastTimer;
function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 3800);
}

// ---------- scoring ----------
const POINTS = { PASS_ats: 100, REJECT: 0, INTERVIEW: 100, NO: 0, HIRE: 100, MAYBE: 55, PASS: 10 };
function verdictKey(agentId, verdict) { return agentId === 'ats' && verdict === 'PASS' ? 'PASS_ats' : verdict; }
function verdictLabel(agentId, verdict) { return agentId !== 'ats' && verdict === 'PASS' ? 'NO HIRE' : verdict; }
function tone(agentId, verdict) {
  const k = verdictKey(agentId, verdict);
  if (k === 'HIRE' || k === 'PASS_ats') return { c: 'var(--good)', bg: 'var(--good-bg)', icon: k === 'HIRE' ? 'hire' : 'pass' };
  if (k === 'INTERVIEW') return { c: 'var(--accent)', bg: '#17202E', icon: 'interview' };
  if (k === 'MAYBE') return { c: 'var(--warn)', bg: 'var(--warn-bg)', icon: 'maybe' };
  return { c: 'var(--bad)', bg: 'var(--bad-bg)', icon: 'no' };
}
function doneReviews(v) {
  return Object.entries(v.reviews || {}).filter(([, r]) => r.status === 'done').map(([id, r]) => ({ id, ...r.data }));
}
function score(v) {
  const done = doneReviews(v);
  if (!done.length) return null;
  return Math.round(done.reduce((sum, r) => sum + (POINTS[verdictKey(r.id, r.verdict)] ?? 0), 0) / done.length);
}
function isRunning(v) {
  return v && (Object.values(v.reviews || {}).some((r) => r.status === 'run') || v.synth?.status === 'run');
}
function appStatus(app) {
  const v = latest(app);
  if (!v) return { label: 'Draft', c: '#5C5F68' };
  if (isRunning(v)) return { label: 'Panel running', c: 'var(--warn)' };
  const s = score(v);
  if (s != null && s >= (app.settings.target ?? 85)) return { label: 'Ready to apply', c: 'var(--good)' };
  if (app.versions.length > 1) return { label: 'Iterating', c: 'var(--text-2)' };
  return { label: 'Needs review', c: 'var(--accent)' };
}
function headline(app, v) {
  const done = doneReviews(v);
  const s = score(v);
  const positive = done.filter((r) => ['HIRE', 'INTERVIEW', 'PASS_ats'].includes(verdictKey(r.id, r.verdict))).length;
  const mgr = done.find((r) => r.id === 'manager');
  let word = 'Hold';
  if (s != null && s >= 70 && (!mgr || mgr.verdict === 'INTERVIEW')) word = 'Advance';
  else if (s != null && s >= 50) word = 'Borderline';
  return { word, sub: `${positive} / ${done.length} positive · score ${s ?? '—'}`, s };
}

// ---------- API ----------
// Served from the local server itself: call it directly. Served from the
// hosted site: reach the local server on this computer one of two ways.
//  - Direct: fetch http://localhost:3000. Chrome allows it (after asking once).
//  - Connector: Safari blocks https → http://localhost, so the user opens a
//    small window served by the local server, and calls go through it by
//    postMessage. Works in every browser.
const IS_LOCAL = ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname);
const LOCAL_BASES = ['http://localhost:3000', 'http://127.0.0.1:3000'];
const conn = { base: IS_LOCAL ? '' : null, state: IS_LOCAL ? 'local' : 'checking', win: null, origin: null };
const pending = new Map();

// Chrome only lets a public https page reach loopback when the request says so.
const LOOPBACK = { targetAddressSpace: 'loopback' };

function setConn(state) {
  if (conn.state !== state) { conn.state = state; render(); }
}
function bridgeCall(path, body) {
  return new Promise((resolve, reject) => {
    const id = uid();
    const timer = setTimeout(() => { pending.delete(id); reject(new Error('The connector window stopped answering.')); }, path === 'health' ? 4000 : 300000);
    pending.set(id, { resolve, reject, timer });
    conn.win.postMessage({ type: 'hps-call', id, path, body }, conn.origin);
  });
}
function dropBridge() {
  conn.win = null;
  for (const p of pending.values()) { clearTimeout(p.timer); p.reject(new Error('The connector window was closed. Click Connect in the sidebar, then retry.')); }
  pending.clear();
  setConn('offline');
}
window.addEventListener('message', (e) => {
  if (IS_LOCAL || !LOCAL_BASES.includes(e.origin) || !e.data || typeof e.data !== 'object') return;
  if (e.data.type === 'hps-bridge-ready') {
    // Also fires after this page reloads, so an open connector reattaches.
    if (conn.win === e.source && conn.state === 'connected') return;
    conn.win = e.source; conn.origin = e.origin; conn.base = null;
    probe();
  } else if (e.data.type === 'hps-reply' && e.source === conn.win) {
    const p = pending.get(e.data.id);
    if (!p) return;
    pending.delete(e.data.id); clearTimeout(p.timer);
    p.resolve({ status: e.data.status, data: e.data.data || {} });
  }
});
function openConnector() {
  const w = window.open(LOCAL_BASES[0] + '/bridge.html', 'hps-connector', 'popup,width=440,height=280');
  if (!w) { toast('Your browser blocked the connector window. Allow pop-ups for this site, then click Connect again.'); return; }
  setConn('checking');
  setTimeout(() => {
    if (conn.state === 'checking') { setConn('offline'); toast("Couldn't reach the server. Is npm run local running in Terminal?"); }
  }, 8000);
}

async function probe() {
  if (IS_LOCAL) return true;
  if (conn.win) {
    if (conn.win.closed) { dropBridge(); return false; }
    try {
      const { status } = await bridgeCall('health');
      setConn(status === 200 ? 'connected' : 'offline');
      return status === 200;
    } catch (e) { setConn('offline'); return false; }
  }
  for (const base of LOCAL_BASES) {
    try {
      const ctl = new AbortController();
      const timer = setTimeout(() => ctl.abort(), 2500);
      const res = await fetch(base + '/health', { ...LOOPBACK, signal: ctl.signal, cache: 'no-store' });
      clearTimeout(timer);
      if (res.ok && (await res.json()).ok) {
        if (conn.base !== base) { conn.base = base; render(); }
        setConn('connected');
        return true;
      }
    } catch (e) { /* try the next address */ }
  }
  if (!conn.win) { conn.base = null; setConn('offline'); }
  return false;
}
probe();
setInterval(() => {
  if (IS_LOCAL) return;
  if (conn.win?.closed) dropBridge();
  else if (!document.hidden) probe();
}, 8000);
document.addEventListener('visibilitychange', () => { if (!document.hidden) probe(); });

async function api(path, body) {
  if (!IS_LOCAL && conn.state !== 'connected' && !(await probe())) {
    throw new Error('Not connected to your computer. Start the local server (see Setup in the sidebar), then retry.');
  }
  let status, data;
  if (conn.win) {
    ({ status, data } = await bridgeCall(path, body));
  } else {
    let res;
    try {
      res = await fetch(conn.base + '/api/' + path, {
        ...(IS_LOCAL ? {} : LOOPBACK),
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body)
      });
    } catch (err) {
      if (!IS_LOCAL) probe();
      throw new Error('Lost the connection to your computer. Is the local server still running? See Setup in the sidebar.');
    }
    status = res.status;
    data = await res.json().catch(() => ({ error: `Server error ${res.status}` }));
  }
  if (status < 200 || status >= 300) {
    const err = new Error(data.error || `Server error ${status}`);
    err.code = data.code;
    throw err;
  }
  return data;
}

function connBadge() {
  const map = {
    local: ['var(--good)', 'Running on this computer'],
    connected: ['var(--good)', conn.win ? 'Connected through the connector' : 'Connected to your computer'],
    checking: ['var(--warn)', 'Looking for the local server…'],
    offline: ['var(--bad)', 'Not connected']
  };
  const [c, label] = map[conn.state];
  return `<div class="conn"><span class="dot" style="background:${c}"></span>${label}
    ${conn.state === 'offline' ? '<button type="button" class="btn sm" data-action="connect" style="margin-left:auto">Connect</button>' : ''}</div>`;
}

// ---------- running the panel ----------
const inflight = new Set();
function startVersion(app, resume) {
  const v = {
    n: app.versions.length + 1,
    resume,
    createdAt: Date.now(),
    startedAt: Date.now(),
    finishedAt: null,
    agents: [...app.settings.agents],
    reviews: Object.fromEntries(app.settings.agents.map((id) => [id, { status: 'run' }])),
    synth: { status: 'idle' },
    edits: {}
  };
  app.versions.push(v);
  app.updatedAt = Date.now();
  app.draft = resume;
  save();
  v.agents.forEach((id) => runReview(app.id, v.n, id));
  return v;
}
function refreshIfShowing(appId) {
  const r = route();
  if (r.name === 'apps' || (r.id === appId && r.name === 'results')) render();
}
async function runReview(appId, n, agentId) {
  const key = `${appId}:${n}:${agentId}`;
  if (inflight.has(key)) return;
  inflight.add(key);
  const app = findApp(appId);
  const v = app.versions.find((x) => x.n === n);
  v.reviews[agentId] = { status: 'run' };
  save();
  refreshIfShowing(appId);
  try {
    const data = await api('review', { agent: agentId, resume: v.resume, posting: app.posting, company: app.company, role: app.role });
    v.reviews[agentId] = { status: 'done', data };
  } catch (err) {
    v.reviews[agentId] = { status: 'error', error: err.message };
  }
  inflight.delete(key);
  app.updatedAt = Date.now();
  save();
  refreshIfShowing(appId);
  maybeSynthesize(appId, n);
}
async function maybeSynthesize(appId, n, force = false) {
  const app = findApp(appId);
  const v = app.versions.find((x) => x.n === n);
  const states = v.agents.map((id) => v.reviews[id]?.status);
  if (states.some((s) => s === 'run')) return;
  if (!doneReviews(v).length) { v.finishedAt = Date.now(); save(); refreshIfShowing(appId); return; }
  if (!force && v.synth.status !== 'idle') return;
  const key = `${appId}:${n}:synth`;
  if (inflight.has(key)) return;
  inflight.add(key);
  v.synth = { status: 'run' };
  save();
  refreshIfShowing(appId);
  try {
    const reviews = doneReviews(v).map((r) => ({ ...r, name: AGENT[r.id].name }));
    const data = await api('synthesize', {
      resume: v.resume, posting: app.posting, company: app.company, role: app.role,
      reviews, onePage: app.settings.onePage, autoRevise: app.settings.autoRevise
    });
    v.synth = { status: 'done', data };
  } catch (err) {
    v.synth = { status: 'error', error: err.message };
  }
  inflight.delete(key);
  v.finishedAt = Date.now();
  app.updatedAt = Date.now();
  save();
  refreshIfShowing(appId);
}
// A reload kills in-flight requests; mark them so the user can retry.
for (const app of db.apps) {
  for (const v of app.versions) {
    for (const [id, r] of Object.entries(v.reviews || {})) if (r.status === 'run') v.reviews[id] = { status: 'error', error: 'Interrupted by a page reload. Retry it.' };
    if (v.synth?.status === 'run') v.synth = { status: 'error', error: 'Interrupted by a page reload. Retry it.' };
  }
}
save();

// ---------- routing ----------
function route() {
  const parts = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  if (parts[0] === 'new') return { name: 'new' };
  if (parts[0] === 'library') return { name: 'library' };
  if (parts[0] === 'agents') return { name: 'agents' };
  if (parts[0] === 'app' && parts[1]) {
    if (parts[2] === 'edit') return { name: 'editor', id: parts[1] };
    return { name: 'results', id: parts[1], v: parts[2] ? Number(parts[2].replace('v', '')) : null };
  }
  return { name: 'apps' };
}
const go = (hash) => { location.hash = hash; };
window.addEventListener('hashchange', () => { ui.openRows = {}; render(); window.scrollTo(0, 0); });

// ---------- UI state ----------
const ui = {
  filter: 'All',
  search: '',
  openRows: {},
  form: null,
  editsCollapsed: (() => { try { return localStorage.getItem('hps.editsCollapsed') === '1'; } catch (e) { return false; } })()
};
function blankForm() {
  const base = db.library[db.library.length - 1];
  return {
    company: '', role: '', posting: '',
    mode: base ? 'saved' : 'latex',
    resume: '', fileName: '', savedId: base ? base.id : null,
    agents: AGENTS.map((a) => a.id), target: 85, onePage: true, autoRevise: true
  };
}

// ---------- shell ----------
function shell(active, content) {
  const base = db.library[db.library.length - 1];
  const link = (id, href, label, extra = '') => `<a href="${href}" class="${active === id ? 'on' : ''}">${label}${extra}</a>`;
  return `<div class="shell">
    <nav class="nav" aria-label="Main">
      <div class="brand">${LOGO}<span>Panel Studio</span></div>
      ${connBadge()}
      <div class="navlinks">
        ${link('apps', '#/', 'Applications', `<span class="count">${db.apps.length}</span>`)}
        ${link('new', '#/new', 'New application')}
        ${link('library', '#/library', 'Resume library', `<span class="count">${db.library.length}</span>`)}
        ${link('agents', '#/agents', 'Panel agents')}
      </div>
      <details class="setup" ${ui.setupOpen ?? conn.state === 'offline' ? 'open' : ''} data-setup>
        <summary>Setup${icon('chev', 14)}</summary>
        <p class="setup-note">Needs <a href="https://nodejs.org" target="_blank" rel="noopener">Node.js 20+</a> and <a href="https://claude.com/claude-code" target="_blank" rel="noopener">Claude Code</a>, installed and signed in. Panels run on your own Claude plan.</p>
        <ol>
          <li><b>First time only.</b> Get the code:<code>git clone ${REPO_URL}.git</code></li>
          <li><b>Each time.</b> In Terminal, start the server and leave the window open:<code>cd Hiring-Panel &amp;&amp; npm run local</code></li>
          <li><b>Connect.</b> Chrome finds it on its own; click <b>Allow</b> if it asks about your local network. In Safari, click <b>Connect</b> above and keep the small window that opens (you can minimize it). Or use <a href="http://localhost:3000">localhost:3000</a> directly.</li>
          <li><b>Done?</b> Press <kbd>Ctrl+C</kbd> in Terminal.</li>
        </ol>
      </details>
      <div class="basecard">
        <span style="font-size:12px" class="muted">Base resume</span>
        ${base ? `<span class="mono" style="font-size:13px">${esc(base.name)}</span><span style="font-size:12px" class="muted">Saved ${esc(ago(base.savedAt))}</span>`
               : `<span style="font-size:13px">None saved yet</span><a href="#/library" style="font-size:12px">Add one to the library</a>`}
      </div>
    </nav>
    <main class="main">${content}</main>
  </div>`;
}

// ---------- view: applications ----------
function viewApps() {
  const apps = [...db.apps].sort((a, b) => b.updatedAt - a.updatedAt);
  const scored = apps.map((a) => latest(a)).filter(Boolean).map(score).filter((s) => s != null);
  const running = apps.filter((a) => isRunning(latest(a))).length;
  const week = Date.now() - 7 * 86400000;
  const reruns = apps.reduce((n, a) => n + a.versions.filter((v) => v.n > 1 && v.createdAt > week).length, 0);
  const ready = apps.filter((a) => appStatus(a).label === 'Ready to apply').length;
  const stats = [
    ['Active applications', apps.length, `${running} panel${running === 1 ? '' : 's'} running now`],
    ['Average panel score', scored.length ? Math.round(scored.reduce((a, b) => a + b, 0) / scored.length) : '—', 'Across latest versions'],
    ['Iterations this week', reruns, 'Re-runs after edits'],
    ['Ready to apply', ready, 'Score at or above your bar']
  ];
  const map = { Running: 'Panel running', 'Needs review': 'Needs review', Iterating: 'Iterating', Ready: 'Ready to apply', Drafts: 'Draft' };
  const q = ui.search.trim().toLowerCase();
  const shown = apps.filter((a) => (ui.filter === 'All' || appStatus(a).label === map[ui.filter]) && (!q || (a.company + ' ' + a.role).toLowerCase().includes(q)));
  const rows = shown.map((a) => {
    const v = latest(a);
    const st = appStatus(a);
    const s = v ? score(v) : null;
    const bars = AGENTS.map((g) => {
      const r = v?.reviews?.[g.id];
      let c = '#2A2D35';
      if (r?.status === 'run') c = 'var(--warn)';
      else if (r?.status === 'error') c = 'var(--bad)';
      else if (r?.status === 'done') c = ['NO', 'REJECT'].includes(r.data.verdict) || (g.id !== 'ats' && r.data.verdict === 'PASS') ? 'var(--bad)' : 'var(--accent)';
      return `<span style="background:${c}" title="${esc(g.name)}"></span>`;
    }).join('');
    const finished = v ? Object.values(v.reviews).filter((r) => r.status === 'done').length : 0;
    return `<a class="trow" href="${v ? `#/app/${a.id}` : `#/app/${a.id}/edit`}">
      <span class="who"><span class="initial">${esc((a.company.replace(/[^A-Za-z]/g, '').charAt(0) || '?').toUpperCase())}</span>
        <span style="display:flex;flex-direction:column;gap:2px;min-width:0"><span style="font-weight:500">${esc(a.company)}</span><span class="role">${esc(a.role)}</span></span></span>
      <span style="display:inline-flex;align-items:center;gap:8px;font-size:13px"><span class="dot" style="background:${st.c}"></span>${st.label}</span>
      <span class="bars" aria-label="${finished} of ${v ? v.agents.length : 0} reviewers finished">${bars}</span>
      <span class="mono" style="font-size:13px">${s ?? '—'}</span>
      <span class="mono muted" style="font-size:13px">${v ? 'v' + v.n : '—'}</span>
      <span class="muted" style="font-size:13px">${esc(ago(a.updatedAt))}</span>
    </a>`;
  }).join('');
  return shell('apps', `
    <header style="display:flex;flex-wrap:wrap;align-items:flex-end;gap:16px">
      <div style="display:flex;flex-direction:column;gap:6px"><h1>Applications</h1>
        <p class="muted" style="margin:0">Each application runs its own panel. Open one to read the feedback and edit.</p></div>
      <a class="btn primary" href="#/new" style="margin-left:auto">${icon('plus')}New application</a>
    </header>
    <section class="stats" aria-label="Summary">${stats.map(([l, v, s]) => `<div class="stat"><span class="muted" style="font-size:12px">${l}</span><span class="v">${v}</span><span class="muted" style="font-size:12px">${s}</span></div>`).join('')}</section>
    <div class="toolbar">
      ${['All', 'Running', 'Needs review', 'Iterating', 'Ready', 'Drafts'].map((l) => `<button type="button" class="filter ${ui.filter === l ? 'on' : ''}" data-action="filter" data-v="${l}">${l}</button>`).join('')}
      <label class="search">${icon('search', 14)}<span class="sr">Search applications</span>
        <input type="search" placeholder="Search company or role" data-input="search" value="${esc(ui.search)}"></label>
    </div>
    <div class="table"><div class="inner">
      <div class="trow head"><span>Company · role</span><span>Status</span><span>Panel</span><span>Score</span><span>Version</span><span>Updated</span></div>
      ${rows || `<div class="empty">${db.apps.length ? 'Nothing matches that filter.' : 'No applications yet. Paste a job posting and a resume to run your first panel.'}${db.apps.length ? '' : `<a class="btn primary" href="#/new">${icon('plus')}New application</a>`}</div>`}
    </div></div>`);
}

// ---------- view: new application ----------
function viewNew() {
  if (!ui.form) ui.form = blankForm();
  const f = ui.form;
  const modes = [['upload', 'Upload'], ['latex', 'Paste LaTeX'], ['saved', 'Saved']];
  let resumePane = '';
  if (f.mode === 'upload') {
    resumePane = `<label class="dropzone" data-drop>
      ${icon('upload', 28)}
      <span style="color:var(--text);font-weight:500">${f.fileName ? esc(f.fileName) + ' loaded' : 'Drop a PDF, .tex or .txt file'}</span>
      <span style="font-size:12px">${f.fileName ? `${f.resume.length.toLocaleString()} characters read · click to replace` : 'or click to browse · PDFs are read as plain text'}</span>
      <input type="file" accept=".pdf,.tex,.txt" data-file class="sr">
    </label>`;
  } else if (f.mode === 'latex') {
    resumePane = `<label class="field">LaTeX or plain-text source
      <textarea class="textarea code" rows="16" spellcheck="false" data-input="resume" style="min-height:320px" placeholder="\\documentclass[letterpaper,11pt]{article}&#10;\\begin{document}&#10;…">${esc(f.resume)}</textarea></label>`;
  } else {
    resumePane = db.library.length
      ? `<div style="display:flex;flex-direction:column;gap:8px">${[...db.library].reverse().map((r) => `<button type="button" class="saved-item ${f.savedId === r.id ? 'on' : ''}" data-action="pick-saved" data-id="${r.id}">
          <span class="mono" style="font-size:13px">${esc(r.name)}</span><span class="muted" style="margin-left:auto;font-size:12px">${esc(r.meta || '')} · ${esc(ago(r.savedAt))}</span></button>`).join('')}</div>`
      : `<div class="empty">No saved resumes yet. Paste one, or add it to the <a href="#/library">library</a>.</div>`;
  }
  const count = f.agents.length;
  return shell('new', `
    <header class="crumbs"><a class="back" href="#/">${icon('back')}Applications</a><span class="slash">/</span><h1 class="sm">New application</h1></header>
    <div class="grid2">
      <section class="card" aria-labelledby="jp">
        <div class="card-head"><span class="step">01</span><h2 id="jp">Job posting</h2></div>
        <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px">
          <label class="field">Company<input class="input" type="text" data-input="company" value="${esc(f.company)}" placeholder="Voyager Technologies"></label>
          <label class="field">Role<input class="input" type="text" data-input="role" value="${esc(f.role)}" placeholder="Software Engineering Intern"></label>
        </div>
        <label class="field">Posting text<textarea class="textarea" rows="14" data-input="posting" style="min-height:320px" placeholder="Paste the full job description — responsibilities, qualifications, about the company…">${esc(f.posting)}</textarea></label>
        <span class="muted" style="font-size:12px">The panel reads the whole posting, so include qualifications and the company blurb.</span>
      </section>
      <section class="card" aria-labelledby="rs">
        <div class="card-head"><span class="step">02</span><h2 id="rs">Resume</h2>
          <div class="seg" role="group" aria-label="Resume source" style="margin-left:auto">${modes.map(([id, l]) => `<button type="button" class="${f.mode === id ? 'on' : ''}" aria-pressed="${f.mode === id}" data-action="mode" data-v="${id}">${l}</button>`).join('')}</div>
        </div>
        ${resumePane}
      </section>
    </div>
    <section class="card" aria-labelledby="pn">
      <div class="card-head"><span class="step">03</span><h2 id="pn">Panel</h2><span class="muted" style="font-size:12px">Reviewers run in parallel, then a synthesizer merges their verdicts.</span></div>
      <div class="agents">${AGENTS.map((g) => {
        const on = f.agents.includes(g.id);
        return `<button type="button" class="agent ${on ? 'on' : ''}" aria-pressed="${on}" data-action="toggle-agent" data-id="${g.id}">
          <span style="display:flex;align-items:center;gap:8px;width:100%"><span style="font-weight:500">${g.name}</span><span class="check" aria-hidden="true"></span></span>
          <span class="muted" style="font-size:12px;line-height:1.45">${g.desc}</span></button>`;
      }).join('')}</div>
      <div class="opts">
        <label>Target score<input class="input mono" type="number" min="0" max="100" data-input="target" value="${f.target}" style="width:76px;min-height:40px"></label>
        <label><input type="checkbox" data-check="onePage" ${f.onePage ? 'checked' : ''}>Keep page count at 1</label>
        <label><input type="checkbox" data-check="autoRevise" ${f.autoRevise ? 'checked' : ''}>Write a revised resume automatically</label>
      </div>
    </section>
    <footer style="display:flex;flex-wrap:wrap;align-items:center;gap:12px;justify-content:flex-end">
      <span class="muted" style="font-size:13px;margin-right:auto">${count} reviewer${count === 1 ? '' : 's'} selected · runs alongside your other applications</span>
      <button type="button" class="btn" data-action="save-draft">Save as draft</button>
      <button type="button" class="btn primary" data-action="run-new">Run panel${icon('arrow')}</button>
    </footer>`);
}
function formResume() {
  const f = ui.form;
  if (f.mode === 'saved') return db.library.find((r) => r.id === f.savedId)?.resume || '';
  return f.resume;
}
function createAppFromForm() {
  const f = ui.form;
  const resume = formResume().trim();
  if (!f.company.trim() || !f.role.trim()) { toast('Add the company and role.'); return null; }
  if (!f.posting.trim()) { toast('Paste the job posting.'); return null; }
  if (!resume) { toast('Add a resume: paste it, upload a file, or pick a saved one.'); return null; }
  const app = {
    id: uid(), company: f.company.trim(), role: f.role.trim(), posting: f.posting.trim(),
    settings: { agents: [...f.agents], target: Number(f.target) || 85, onePage: f.onePage, autoRevise: f.autoRevise },
    versions: [], draft: resume, createdAt: Date.now(), updatedAt: Date.now()
  };
  db.apps.push(app);
  save();
  return app;
}
async function readFile(file) {
  const f = ui.form;
  if (/\.pdf$/i.test(file.name)) {
    if (!window.pdfjsLib) { toast('The PDF reader did not load. Paste the text instead.'); return; }
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    const pdf = await window.pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;
    const pages = [];
    for (let p = 1; p <= pdf.numPages; p++) {
      const content = await (await pdf.getPage(p)).getTextContent();
      pages.push(content.items.map((it) => it.str + (it.hasEOL ? '\n' : ' ')).join(''));
    }
    f.resume = pages.join('\n\n').replace(/[ \t]+\n/g, '\n').trim();
  } else {
    f.resume = await file.text();
  }
  f.fileName = file.name;
  render();
}

// ---------- view: panel results ----------
function viewResults(r) {
  const app = findApp(r.id);
  if (!app) return shell('apps', `<div class="empty">That application no longer exists. <a href="#/">Back to applications</a></div>`);
  if (!app.versions.length) { go(`#/app/${app.id}/edit`); return ''; }
  const v = app.versions.find((x) => x.n === r.v) || latest(app);
  const done = doneReviews(v);
  const running = isRunning(v);
  const h = headline(app, v);
  const synth = v.synth?.status === 'done' ? v.synth.data : null;
  const total = v.agents.length;

  const counts = {};
  for (const d of done) { const k = verdictLabel(d.id, d.verdict); counts[k] = (counts[k] || 0) + 1; }
  const tallies = Object.entries(counts).map(([label, n]) => {
    const d = done.find((x) => verdictLabel(x.id, x.verdict) === label);
    const t = tone(d.id, d.verdict);
    return `<span class="tally" style="background:${t.bg};color:${t.c}">${icon(t.icon, 14)}<span class="mono" style="font-weight:600">${n}</span>${esc(label.toLowerCase())}</span>`;
  }).join('') || '<span class="muted" style="font-size:13px">Waiting for reviewers…</span>';

  const nameToCount = (names) => Math.min(total, (names || []).length);
  const fixFirst = synth ? synth.fixes.slice(0, 3).map((f) => `<div class="fix">${icon(f.kind, 15, 'style="color:var(--warn)"')}<span class="t">${esc(f.text)}</span>
      <span class="dots" aria-label="Flagged by ${nameToCount(f.reviewers)} of ${total}">${Array.from({ length: total }, (_, j) => `<span class="${j < nameToCount(f.reviewers) ? 'on' : ''}"></span>`).join('')}</span></div>`).join('')
    : `<span class="muted" style="font-size:13px">${v.synth?.status === 'run' ? '<span class="spin"></span> Merging verdicts…' : v.synth?.status === 'error' ? `<span class="err">${esc(v.synth.error)}</span> <button class="btn sm" data-action="retry-synth">Retry</button>` : running ? 'Appears when every reviewer is done.' : 'No synthesis yet.'}</span>`;

  const topNames = synth?.fixes?.[0]?.reviewers || [];
  const rows = v.agents.map((id, i) => {
    const g = AGENT[id];
    const rv = v.reviews[id] || { status: 'idle' };
    let verdictCell, hurtCell, full = '';
    if (rv.status === 'run') {
      verdictCell = '<span class="spin"></span><span class="muted" style="font-size:12px">Reading…</span>';
      hurtCell = '<span class="muted" style="font-size:13px">—</span>';
    } else if (rv.status === 'error') {
      verdictCell = '<span class="err">Failed</span>';
      hurtCell = `<span class="err" style="flex:1">${esc(rv.error)}</span><button class="btn sm" data-action="retry-review" data-id="${id}">Retry</button>`;
    } else if (rv.status === 'done') {
      const d = rv.data;
      const t = tone(id, d.verdict);
      verdictCell = `<span class="pill" style="background:${t.bg};color:${t.c}">${icon(t.icon, 14)}${esc(verdictLabel(id, d.verdict))}</span>${d.note ? `<span class="muted" style="font-size:12px">${esc(d.note)}</span>` : ''}`;
      const hot = topNames.some((n) => n.toLowerCase().includes(g.name.toLowerCase()) || g.name.toLowerCase().includes(n.toLowerCase()));
      hurtCell = (d.problems || []).map((p, j) => `<span class="chip ${hot && j === 0 ? 'hot' : ''}">${icon(p.kind, 13)}${esc(p.label)}</span>`).join('');
      full = `<p style="margin:0"><span class="muted">Hurt most:</span> <q>${esc(d.hurt_most?.quote)}</q> — ${esc(d.hurt_most?.why)}</p>
        <p style="margin:0">${esc(d.full)}</p>
        ${(d.problems || []).length ? `<ul class="list">${d.problems.map((p) => `<li><b>${esc(p.label)}.</b> ${esc(p.detail)}</li>`).join('')}</ul>` : ''}
        ${d.interview_questions?.length ? `<p style="margin:0" class="muted">Would ask:</p><ol class="list">${d.interview_questions.map((q) => `<li>${esc(q)}</li>`).join('')}</ol>` : ''}
        ${d.missing_terms?.length ? `<p style="margin:0"><span class="muted">Missing terms:</span> ${esc(d.missing_terms.join(', '))}</p>` : ''}
        ${d.matched_terms?.length ? `<p style="margin:0"><span class="muted">Matched terms:</span> ${esc(d.matched_terms.join(', '))}</p>` : ''}`;
    } else {
      verdictCell = '<span class="muted">—</span>';
      hurtCell = '';
    }
    const open = !!ui.openRows[id];
    return `<div class="rblock">
      <div class="rrow" role="row">
        <span class="rnum" role="cell">${i + 1}</span>
        <span class="rcell" role="cell"><span class="ricon">${icon(g.icon, 17, 'style="color:var(--text-2)"')}</span><span style="font-weight:500">${g.name}</span></span>
        <span class="rcell" role="cell">${verdictCell}</span>
        <span class="rcell" role="cell">${hurtCell}</span>
        <span role="cell" style="display:grid;place-items:center">${full ? `<button type="button" class="expander ${open ? 'open' : ''}" data-action="toggle-row" data-id="${id}" aria-expanded="${open}" aria-label="${open ? 'Hide' : 'Show'} full note from ${g.name}">${icon('chev')}</button>` : ''}</span>
      </div>
      ${open && full ? `<div class="rfull">${full}</div>` : ''}
    </div>`;
  }).join('');

  const elapsed = (v.finishedAt || Date.now()) - v.startedAt;
  const versionsSeg = app.versions.length > 1
    ? `<div class="seg" role="group" aria-label="Version">${app.versions.map((x) => `<button type="button" class="${x.n === v.n ? 'on' : ''} mono" data-action="pick-version" data-v="${x.n}" style="font-size:12px;min-width:44px">v${x.n}</button>`).join('')}</div>` : '';

  const details = synth ? `
    <section class="card"><h2>Summary</h2><p style="margin:0;color:var(--text-2);line-height:1.6">${esc(synth.summary)}</p></section>
    <section class="card"><h2>What is wrong, worst first</h2>
      <ol class="list" style="gap:12px">${synth.fixes.map((f) => `<li><b>${esc(f.text)}</b> <span class="muted">· ${esc((f.reviewers || []).join(', '))}</span>
        ${f.quote ? `<div style="margin-top:4px"><q>${esc(f.quote)}</q></div>` : ''}<div class="muted" style="margin-top:2px">${esc(f.why)}</div></li>`).join('')}</ol></section>
    ${synth.questions?.length ? `<section class="card"><h2>Questions to answer before sending</h2><ol class="list">${synth.questions.map((q) => `<li>${esc(q)}</li>`).join('')}</ol>
      <p class="muted" style="margin:0;font-size:12px">Delete any placeholder you can't fill truthfully.</p></section>` : ''}` : '';

  return `<div class="page"><div class="wrap">
    <header class="crumbs">
      <a class="back" href="#/">${icon('back')}Applications</a><span class="slash">/</span>
      <div style="display:flex;flex-direction:column;gap:2px">
        <h1 class="sm">${esc(app.company)} · ${esc(app.role)}</h1>
        <span class="meta"><span>${icon('clock', 13)}${esc(ago(v.createdAt))}</span><span>${icon('team', 13)}${total} reviewers</span><span>${icon('bolt', 13)}${running ? 'running · ' + dur(elapsed) : dur(elapsed)}</span></span>
      </div>
      <div style="margin-left:auto;display:flex;flex-wrap:wrap;gap:8px;align-items:center">
        ${versionsSeg}
        <button type="button" class="btn danger ghost" data-action="delete-app" aria-label="Delete application">${icon('trash')}</button>
        <a class="btn" href="#/app/${app.id}/edit">${icon('code')}Editor</a>
        <a class="btn primary" href="#/app/${app.id}/edit">${icon('rerun')}Fix &amp; re-run</a>
      </div>
    </header>
    <section class="verdicts" aria-label="Final verdict">
      <div class="vcard big"><span class="vicon">${running ? '<span class="spin" style="width:22px;height:22px"></span>' : icon('pass', 26, 'style="color:var(--accent)"')}</span>
        <span style="display:flex;flex-direction:column;gap:4px"><span class="muted" style="font-size:12px">Panel verdict</span>
        <span style="font-size:22px;font-weight:600;letter-spacing:-0.02em">${running && !done.length ? 'Running…' : h.word}</span>
        <span class="mono" style="font-size:12px;color:var(--good)">${esc(h.sub)} · target ${app.settings.target}</span></span></div>
      <div class="vcard"><span class="muted" style="font-size:12px">Tally · ${done.length} of ${total} in</span><div style="display:flex;flex-wrap:wrap;gap:8px">${tallies}</div></div>
      <div class="vcard" style="justify-content:flex-start"><span class="muted" style="font-size:12px">Fix first</span>${fixFirst}</div>
    </section>
    <section aria-label="Reviewer results" style="overflow-x:auto">
      <div class="rtable" role="table">
        <div class="rrow head" role="row"><span role="columnheader" style="text-align:center">#</span><span role="columnheader">Reviewer</span><span role="columnheader">Verdict</span><span role="columnheader">What hurt most</span><span role="columnheader"><span class="sr">Details</span></span></div>
        ${rows}
      </div>
    </section>
    <div class="legend">${[['wording', 'Weak wording'], ['missing', 'Missing'], ['metric', 'Needs a number'], ['keyword', 'Keywords'], ['shipped', 'Shipped work'], ['question', 'Open question']].map(([k, l]) => `<span>${icon(k, 13)}${l}</span>`).join('')}</div>
    ${details}
  </div></div>`;
}

// ---------- LaTeX preview ----------
function inline(s) {
  let t = esc(s);
  for (let i = 0; i < 3; i++) {
    t = t.replace(/\\add\{([^{}]*)\}/g, '<span class="addp">[ADD: $1]</span>')
      .replace(/\\href\{[^{}]*\}\{([^{}]*)\}/g, '$1')
      .replace(/\\textbf\{([^{}]*)\}/g, '<b>$1</b>')
      .replace(/\\textit\{([^{}]*)\}/g, '<i>$1</i>')
      .replace(/\\emph\{([^{}]*)\}/g, '<i>$1</i>')
      .replace(/\\underline\{([^{}]*)\}/g, '$1');
  }
  return t.replace(/\$\|\$/g, '|').replace(/\$\\sim\$/g, '~').replace(/\\\$/g, '$').replace(/\\&amp;/g, '&amp;').replace(/\\%/g, '%')
    .replace(/\\#/g, '#').replace(/\\_/g, '_').replace(/---/g, '—').replace(/--/g, '–').replace(/\\\\(\[[^\]]*\])?/g, ' ')
    .replace(/\\hfill/g, ' ').replace(/\\(LARGE|Large|large|small|footnotesize|bfseries|scshape|centering|noindent|raggedright)\b/g, '')
    .replace(/\\(vspace|hspace)\*?\{[^}]*\}/g, '').replace(/\\[a-zA-Z]+\*?/g, '').replace(/[{}]/g, '').replace(/~/g, ' ').trim();
}
function previewHtml(src) {
  const body = /\\begin\{document\}([\s\S]*?)(\\end\{document\}|$)/.exec(src);
  if (!body) return `<div style="white-space:pre-wrap;font-family:inherit">${esc(src)}</div>`;
  const lines = body[1].split('\n').map((l) => l.replace(/(^|[^\\])%.*$/, '$1')).map((l) => l.trim());
  let out = '', inCenter = false, header = [], inList = false;
  const closeList = () => { if (inList) { out += '</ul>'; inList = false; } };
  for (const l of lines) {
    if (!l) continue;
    if (/^\\begin\{center\}/.test(l)) { inCenter = true; header = []; continue; }
    if (/^\\end\{center\}/.test(l)) {
      inCenter = false;
      const [first, ...rest] = header;
      out += `<div class="ph">${inline(first || '')}</div><div class="pc">${inline(rest.join(' '))}</div>`;
      continue;
    }
    if (inCenter) { header.push(l); continue; }
    let m;
    if ((m = /^\\section\*?\{(.*)\}/.exec(l))) { closeList(); out += `<div class="ps">${inline(m[1])}</div>`; continue; }
    if ((m = /^\\(?:entry|resumeEntry)\{(.*?)\}\{(.*?)\}/.exec(l))) { closeList(); out += `<div class="pe"><span>${inline(m[1])}</span><span>${inline(m[2])}</span></div>`; continue; }
    if (/^\\begin\{itemize\}/.test(l)) { closeList(); out += '<ul>'; inList = true; continue; }
    if (/^\\end\{itemize\}/.test(l)) { closeList(); continue; }
    if ((m = /^\\item\s*(.*)/.exec(l))) { out += `<li>${inline(m[1])}</li>`; continue; }
    if (/^\\(documentclass|usepackage|input|pdfgentounicode|pagestyle|setlength|titleformat|titlespacing|setlist|newcommand|renewcommand|begin|end)\b/.test(l)) continue;
    const text = inline(l);
    if (!text) continue;
    if (inList) out += `<li style="list-style:none;margin-left:-12px">${text}</li>`;
    else out += `<p>${text}</p>`;
  }
  closeList();
  return out;
}

// ---------- line diff ----------
function lineDiff(a, b) {
  const A = a.split('\n'), B = b.split('\n');
  const n = A.length, m = B.length;
  const dp = Array.from({ length: n + 1 }, () => new Uint16Array(m + 1));
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) dp[i][j] = A[i] === B[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  const out = [];
  let i = 0, j = 0;
  while (i < n && j < m) {
    if (A[i] === B[j]) { out.push([' ', A[i]]); i++; j++; }
    else if (dp[i + 1][j] >= dp[i][j + 1]) out.push(['-', A[i++]]);
    else out.push(['+', B[j++]]);
  }
  while (i < n) out.push(['-', A[i++]]);
  while (j < m) out.push(['+', B[j++]]);
  return out;
}

// ---------- view: editor ----------
function viewEditor(r) {
  const app = findApp(r.id);
  if (!app) return shell('apps', `<div class="empty">That application no longer exists. <a href="#/">Back to applications</a></div>`);
  const v = latest(app);
  if (app.draft == null) app.draft = v ? v.resume : '';
  const synth = v?.synth?.status === 'done' ? v.synth.data : null;
  const edits = synth ? synth.edits.map((e, i) => {
    const state = v.edits[i] || (app.draft.includes(e.find) ? 'Open' : 'Not found');
    return { ...e, i, state };
  }) : [];
  const openCount = edits.filter((e) => e.state === 'Open').length;
  const changed = v && app.draft !== v.resume;
  const nextN = app.versions.length + 1;
  const collapsed = ui.editsCollapsed;
  return `<div class="editor">
    <header class="ebar">
      <a class="crumbs back" href="${v ? `#/app/${app.id}` : '#/'}" style="display:inline-flex;align-items:center;gap:6px;min-height:44px;color:var(--muted)">${icon('back')}${v ? 'Panel results' : 'Applications'}</a>
      <span class="slash" style="color:#3A3D45">/</span>
      <span style="font-weight:600">${esc(app.company)}</span>
      <span class="tag">${esc(app.role)} · ${v ? (changed ? `v${nextN} draft` : `v${v.n}`) : 'draft'}</span>
      <span class="muted" style="font-size:12px">${synth ? `${edits.filter((e) => e.state === 'Applied').length} of ${edits.length} edits applied` : v ? 'No suggested edits yet' : 'Not run yet'}${changed ? ' · unsaved changes' : ''}</span>
      <div style="margin-left:auto;display:flex;flex-wrap:wrap;gap:8px">
        ${v ? `<button type="button" class="btn tone-src" data-action="compare">Compare with v${v.n}</button>` : ''}
        ${synth?.improved_resume ? `<button type="button" class="btn tone-edit" data-action="use-rebuilt">Use panel's rebuilt resume</button>` : ''}
        <button type="button" class="btn tone-export" data-action="copy">Copy</button>
        <button type="button" class="btn tone-export" data-action="download">Download .tex</button>
        <button type="button" class="btn tone-export" data-action="download-pdf" ${ui.pdfBusy ? 'disabled' : ''}>${ui.pdfBusy ? '<span class="spin"></span> Building PDF…' : 'Download PDF'}</button>
        <button type="button" class="btn" data-action="save-library">Save to library</button>
        <button type="button" class="btn primary" data-action="rerun">${icon('rerun')}${v ? `Run panel on v${nextN}` : 'Run panel'}</button>
      </div>
    </header>
    <div class="panes">
      <section class="pane-src" aria-label="Resume source">
        <div class="pane-head"><span class="pane-title">Source</span><span class="mono" style="margin-left:auto">${app.draft.split('\n').length} lines · edit freely</span></div>
        <textarea class="src" spellcheck="false" data-input="draft" aria-label="Resume source">${esc(app.draft)}</textarea>
      </section>
      <section class="pane-prev ${collapsed ? 'wide' : ''}" aria-label="Preview">
        <div class="prev-head"><span class="pane-title">Preview</span><span class="mono" style="margin-left:auto">approximate · compile in Overleaf</span></div>
        <div class="paper" id="paper">${previewHtml(app.draft)}</div>
      </section>
      ${collapsed ? `<aside class="pane-edits collapsed" aria-label="Suggested edits">
        <button type="button" class="vtoggle" data-action="toggle-edits" aria-expanded="false">${icon('back', 16)}<span>Show suggested edits · ${openCount} open</span></button>
      </aside>` : `<aside class="pane-edits" aria-label="Suggested edits">
        <div class="pane-head"><span class="pane-title">Suggested edits</span><span class="mono" style="margin-left:auto">${openCount} open</span>
          <button type="button" class="btn sm" data-action="toggle-edits" aria-expanded="true" title="Hide this panel to make the preview bigger">Hide${icon('M9 18l6-6-6-6', 14)}</button></div>
        <div class="edits">
          ${edits.length ? edits.map((e) => `<div class="edit ${e.state === 'Applied' ? 'done' : ''} ${e.state === 'Dismissed' ? 'dismissed' : ''} ${e.state === 'Open' ? 'open' : ''}">
              <span style="display:flex;align-items:center;gap:8px;font-size:12px" class="muted"><span class="ecode">${e.i + 1}</span>${esc(e.where)}<span style="margin-left:auto;color:${e.state === 'Applied' ? 'var(--good)' : e.state === 'Open' ? 'var(--warn)' : 'var(--faint)'}">${e.state}</span></span>
              <span style="line-height:1.5;color:var(--text-2)">${esc(e.text)}</span>
              ${e.state === 'Open' || e.state === 'Not found' ? `<details><summary class="muted" style="font-size:12px;cursor:pointer">Show change</summary>
                <div class="diff" style="margin-top:8px"><div class="d">${esc(e.find)}</div><div class="a">${esc(e.replace)}</div></div></details>` : ''}
              ${e.state === 'Open' ? `<span style="display:flex;gap:8px"><button type="button" class="btn sm accept" data-action="accept-edit" data-i="${e.i}">Accept</button><button type="button" class="btn sm" data-action="dismiss-edit" data-i="${e.i}">Dismiss</button></span>` : ''}
              ${e.state === 'Not found' ? `<span class="muted" style="font-size:12px">The text it targets isn't in the draft anymore. Apply it by hand or dismiss it.</span><span><button type="button" class="btn sm ghost" data-action="dismiss-edit" data-i="${e.i}">Dismiss</button></span>` : ''}
            </div>`).join('')
            : `<div class="muted" style="font-size:13px;padding:6px">${v ? (v.synth?.status === 'run' ? 'The panel is still merging verdicts.' : 'Run the panel to get suggested edits.') : 'Run the panel to get suggested edits.'}</div>`}
          ${synth?.questions?.length ? `<div class="edit done"><span class="muted" style="font-size:12px">Questions to fill the placeholders</span><ol class="list" style="font-size:13px">${synth.questions.map((q) => `<li>${esc(q)}</li>`).join('')}</ol></div>` : ''}
        </div>
        <label class="askbox">Tell the panel what to change
          <textarea rows="3" data-input="ask" placeholder="e.g. Shorten PolySat to three bullets and keep it on one page">${esc(ui.ask || '')}</textarea>
          <span style="display:flex;justify-content:flex-end"><button type="button" class="btn sm primary" data-action="rewrite" ${ui.rewriting ? 'disabled' : ''}>${ui.rewriting ? '<span class="spin"></span> Rewriting…' : 'Rewrite'}</button></span>
        </label>
      </aside>`}
    </div>
  </div>`;
}

// ---------- view: library + agents ----------
function viewLibrary() {
  const items = [...db.library].reverse();
  return shell('library', `
    <header style="display:flex;flex-direction:column;gap:6px"><h1>Resume library</h1><p class="muted" style="margin:0">Saved resumes stay in this browser only. The newest one is your base resume.</p></header>
    <section class="card">
      <h2>Add a resume</h2>
      <label class="field">Name<input class="input mono" data-input="libName" value="${esc(ui.libName || '')}" placeholder="resume_master.tex"></label>
      <label class="field">Source<textarea class="textarea code" rows="10" data-input="libText" placeholder="Paste LaTeX or plain text">${esc(ui.libText || '')}</textarea></label>
      <div style="display:flex;justify-content:flex-end"><button class="btn primary" type="button" data-action="lib-add">Save to library</button></div>
    </section>
    ${items.length ? `<div style="display:flex;flex-direction:column;gap:8px">${items.map((r) => `<div class="saved-item" style="cursor:default">
        <span class="mono" style="font-size:13px">${esc(r.name)}</span><span class="muted" style="font-size:12px">${esc(r.meta || '')}</span>
        <span class="muted" style="margin-left:auto;font-size:12px">${esc(ago(r.savedAt))}</span>
        <button class="btn sm" type="button" data-action="lib-copy" data-id="${r.id}">Copy</button>
        <button class="btn sm ghost danger" type="button" data-action="lib-del" data-id="${r.id}" aria-label="Delete ${esc(r.name)}">${icon('trash', 14)}</button></div>`).join('')}</div>`
      : '<div class="empty">Nothing saved yet.</div>'}`);
}
function viewAgents() {
  return shell('agents', `
    <header style="display:flex;flex-direction:column;gap:6px"><h1>Panel agents</h1><p class="muted" style="margin:0">Each reviewer reads alone, then a synthesizer merges their notes into ranked fixes and edits. Placeholders mark facts only you can supply.</p></header>
    <div class="agents">${AGENTS.map((g) => `<div class="agent on" style="cursor:default"><span style="display:flex;align-items:center;gap:10px"><span class="ricon">${icon(g.icon, 17, 'style="color:var(--text-2)"')}</span><span style="font-weight:500">${g.name}</span></span><span class="muted" style="font-size:12px">${g.desc}</span></div>`).join('')}</div>
    <section class="card"><h2>Verdicts and score</h2><p class="muted" style="margin:0;line-height:1.6">The automated screen says PASS or REJECT; the hiring manager says INTERVIEW or NO; the other five say HIRE, MAYBE or NO HIRE. The score averages them: positive verdicts count 100, MAYBE 55, NO HIRE 10, REJECT and NO 0. This is a second opinion from language models, not a guarantee of an interview.</p></section>`);
}

// ---------- render ----------
function render() {
  const r = route();
  const active = document.activeElement;
  const focusKey = active?.dataset?.input;
  const selStart = active?.selectionStart, selEnd = active?.selectionEnd;
  let html = '';
  if (r.name === 'apps') html = viewApps();
  else if (r.name === 'new') html = viewNew();
  else if (r.name === 'results') html = viewResults(r);
  else if (r.name === 'editor') html = viewEditor(r);
  else if (r.name === 'library') html = viewLibrary();
  else if (r.name === 'agents') html = viewAgents();
  if (html) $app.innerHTML = html;
  if (focusKey) {
    const el = $app.querySelector(`[data-input="${focusKey}"]`);
    if (el) { el.focus(); try { el.setSelectionRange(selStart, selEnd); } catch (e) { /* not a text field */ } }
  }
  document.title = { apps: 'Applications', new: 'New application', results: 'Panel results', editor: 'Resume editor', library: 'Resume library', agents: 'Panel agents' }[r.name] + ' · Hiring Panel Studio';
}

// ---------- events ----------
let previewTimer;
$app.addEventListener('input', (e) => {
  const key = e.target.dataset.input;
  if (!key) return;
  const r = route();
  const val = e.target.value;
  if (key === 'search') { ui.search = val; render(); return; }
  if (key === 'ask') { ui.ask = val; return; }
  if (key === 'libName') { ui.libName = val; return; }
  if (key === 'libText') { ui.libText = val; return; }
  if (key === 'draft') {
    const app = findApp(r.id);
    app.draft = val;
    clearTimeout(previewTimer);
    previewTimer = setTimeout(() => { save(); const p = document.getElementById('paper'); if (p) p.innerHTML = previewHtml(app.draft); }, 250);
    return;
  }
  if (ui.form && key in ui.form) ui.form[key] = key === 'target' ? Number(val) : val;
});
$app.addEventListener('change', (e) => {
  if (e.target.dataset.check && ui.form) ui.form[e.target.dataset.check] = e.target.checked;
  if (e.target.matches('[data-file]') && e.target.files[0]) readFile(e.target.files[0]).catch((err) => toast('Could not read that file: ' + err.message));
});
// Remember whether Setup is expanded across re-renders.
$app.addEventListener('toggle', (e) => { if (e.target.matches('[data-setup]')) ui.setupOpen = e.target.open; }, true);
$app.addEventListener('dragover', (e) => { const z = e.target.closest('[data-drop]'); if (z) { e.preventDefault(); z.classList.add('over'); } });
$app.addEventListener('dragleave', (e) => { const z = e.target.closest('[data-drop]'); if (z) z.classList.remove('over'); });
$app.addEventListener('drop', (e) => {
  const z = e.target.closest('[data-drop]');
  if (!z) return;
  e.preventDefault();
  const file = e.dataTransfer.files[0];
  if (file) readFile(file).catch((err) => toast('Could not read that file: ' + err.message));
});

function download(name, data, type = 'text/plain') {
  const url = URL.createObjectURL(new Blob([data], { type }));
  const a = Object.assign(document.createElement('a'), { href: url, download: name });
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'resume';
async function copyText(text) {
  try { await navigator.clipboard.writeText(text); toast('Copied. Paste it into Overleaf.'); } catch (e) { toast('Copy failed. Select the source and copy it by hand.'); }
}
const draftName = (app) => `${slug(app.company)}-v${app.versions.length + (latest(app) && app.draft !== latest(app).resume ? 1 : 0) || 1}`;

// Compiles the real LaTeX on the local server when a TeX engine is installed
// there. Otherwise prints the preview, where the browser can save a PDF.
async function downloadPdf(app) {
  if (!/\\documentclass/.test(app.draft)) { printPreview('This resume is plain text, so the PDF comes from the preview.'); return; }
  ui.pdfBusy = true; render();
  try {
    const out = await api('pdf', { source: app.draft });
    const bytes = Uint8Array.from(atob(out.pdf), (c) => c.charCodeAt(0));
    download(draftName(app) + '.pdf', bytes, 'application/pdf');
    toast('PDF downloaded.');
  } catch (err) {
    if (err.code === 'no-tex') printPreview('No LaTeX engine on this computer, so the PDF comes from the preview. Install one for an exact PDF (see the README).');
    else toast('PDF failed: ' + err.message);
  }
  ui.pdfBusy = false; render();
}
function printPreview(note) {
  toast(note + ' Choose "Save as PDF" in the print dialog.');
  setTimeout(() => window.print(), 300);
}

// In-app replacement for confirm(): resolves true on the confirm button,
// false on Cancel, Escape or a click outside.
function confirmDialog({ title, body, ok = 'Continue', danger = false }) {
  return new Promise((resolve) => {
    const wrap = document.createElement('div');
    wrap.className = 'overlay';
    wrap.innerHTML = `<div class="dialog confirm" role="alertdialog" aria-modal="true" aria-labelledby="cd-title" aria-describedby="cd-body">
      <h2 id="cd-title">${esc(title)}</h2>
      <p id="cd-body">${esc(body)}</p>
      <div class="confirm-actions"><button class="btn" type="button" data-no>Cancel</button>
        <button class="btn ${danger ? 'danger-solid' : 'primary'}" type="button" data-yes>${esc(ok)}</button></div>
    </div>`;
    const done = (value) => { document.removeEventListener('keydown', onKey); wrap.remove(); resolve(value); };
    const onKey = (e) => { if (e.key === 'Escape') done(false); };
    wrap.addEventListener('click', (e) => {
      if (e.target.closest('[data-yes]')) done(true);
      else if (e.target === wrap || e.target.closest('[data-no]')) done(false);
    });
    document.addEventListener('keydown', onKey);
    document.body.appendChild(wrap);
    wrap.querySelector(danger ? '[data-no]' : '[data-yes]').focus();
  });
}

function showDialog(html) {
  const wrap = document.createElement('div');
  wrap.className = 'overlay';
  wrap.innerHTML = `<div class="dialog">${html}<div style="display:flex;justify-content:flex-end"><button class="btn" type="button" data-close>Close</button></div></div>`;
  wrap.addEventListener('click', (e) => { if (e.target === wrap || e.target.closest('[data-close]')) wrap.remove(); });
  document.body.appendChild(wrap);
}

$app.addEventListener('click', async (e) => {
  const el = e.target.closest('[data-action]');
  if (!el) return;
  const action = el.dataset.action;
  const r = route();
  const app = r.id ? findApp(r.id) : null;
  switch (action) {
    case 'filter': ui.filter = el.dataset.v; render(); break;
    case 'mode': ui.form.mode = el.dataset.v; render(); break;
    case 'pick-saved': ui.form.savedId = el.dataset.id; render(); break;
    case 'toggle-agent': {
      const id = el.dataset.id, list = ui.form.agents;
      ui.form.agents = list.includes(id) ? list.filter((x) => x !== id) : AGENTS.map((a) => a.id).filter((x) => x === id || list.includes(x));
      render();
      break;
    }
    case 'save-draft': {
      const created = createAppFromForm();
      if (created) { ui.form = null; toast('Saved as a draft.'); go('#/'); }
      break;
    }
    case 'run-new': {
      if (!ui.form.agents.length) { toast('Pick at least one reviewer.'); break; }
      const created = createAppFromForm();
      if (!created) break;
      ui.form = null;
      startVersion(created, created.draft);
      go(`#/app/${created.id}`);
      break;
    }
    case 'toggle-row': ui.openRows[el.dataset.id] = !ui.openRows[el.dataset.id]; render(); break;
    case 'pick-version': go(`#/app/${app.id}/v${el.dataset.v}`); break;
    case 'retry-review': {
      const v = app.versions.find((x) => x.n === (r.v || latest(app).n));
      if (v.synth.status !== 'run') v.synth = { status: 'idle' };
      runReview(app.id, v.n, el.dataset.id);
      break;
    }
    case 'retry-synth': {
      const v = app.versions.find((x) => x.n === (r.v || latest(app).n));
      v.synth = { status: 'idle' };
      maybeSynthesize(app.id, v.n, true);
      break;
    }
    case 'delete-app':
      if (await confirmDialog({ title: `Delete ${app.company} · ${app.role}?`, body: "This deletes the application and all its versions from this browser. It can't be undone.", ok: 'Delete', danger: true })) {
        db.apps = db.apps.filter((a) => a.id !== app.id); save(); go('#/');
      }
      break;
    case 'accept-edit': {
      const v = latest(app), ed = v.synth.data.edits[Number(el.dataset.i)];
      if (!app.draft.includes(ed.find)) { toast("That text isn't in the draft anymore."); render(); break; }
      app.draft = app.draft.replace(ed.find, ed.replace);
      v.edits[el.dataset.i] = 'Applied';
      save(); render();
      break;
    }
    case 'dismiss-edit': latest(app).edits[el.dataset.i] = 'Dismissed'; save(); render(); break;
    case 'use-rebuilt':
      if (await confirmDialog({ title: "Use the panel's rebuilt resume?", body: 'This replaces your current draft, and any edits you made to it will be lost.', ok: 'Replace draft' })) {
        const v = latest(app);
        app.draft = v.synth.data.improved_resume;
        v.synth.data.edits.forEach((_, i) => { v.edits[i] = 'Applied'; });
        save(); render(); toast('Rebuilt resume loaded. Fill the red placeholders before re-running.');
      }
      break;
    case 'compare': {
      const v = latest(app);
      const diff = lineDiff(v.resume, app.draft);
      const changes = diff.filter(([s]) => s !== ' ').length;
      showDialog(`<h2>Draft vs v${v.n}</h2><p class="muted" style="margin:0">${changes ? `${changes} changed line${changes === 1 ? '' : 's'}.` : 'No changes yet.'}</p>
        <div class="diff">${diff.map(([s, t]) => `<div class="${s === '+' ? 'a' : s === '-' ? 'd' : ''}">${s} ${esc(t) || ' '}</div>`).join('')}</div>`);
      break;
    }
    case 'copy': copyText(app.draft); break;
    case 'download': download(draftName(app) + '.tex', app.draft); break;
    case 'download-pdf': downloadPdf(app); break;
    case 'toggle-edits':
      ui.editsCollapsed = !ui.editsCollapsed;
      try { localStorage.setItem('hps.editsCollapsed', ui.editsCollapsed ? '1' : '0'); } catch (err) { /* not remembered */ }
      render();
      break;
    case 'connect': openConnector(); break;
    case 'save-library': {
      const name = `${slug(app.company)}_v${app.versions.length + (latest(app) && app.draft !== latest(app).resume ? 1 : 0) || 1}.tex`;
      const s = latest(app) ? score(latest(app)) : null;
      db.library.push({ id: uid(), name, resume: app.draft, meta: `${app.company}${s != null ? ' · score ' + s : ''}`, savedAt: Date.now() });
      save(); toast(`Saved ${name} to the library.`);
      break;
    }
    case 'rerun': {
      if (!app.draft.trim()) { toast('The resume is empty.'); break; }
      if (/\\add\{|\[ADD:/.test(app.draft) && !(await confirmDialog({ title: 'Run with placeholders left?', body: 'The draft still has [ADD: …] placeholders. Reviewers ignore them, so every blank counts against you. Fill or delete them first for a fair score.', ok: 'Run anyway' }))) break;
      startVersion(app, app.draft);
      go(`#/app/${app.id}`);
      break;
    }
    case 'rewrite': {
      const instruction = (ui.ask || '').trim();
      if (!instruction) { toast('Say what to change first.'); break; }
      ui.rewriting = true; render();
      try {
        const out = await api('rewrite', { resume: app.draft, instruction, posting: app.posting });
        app.draft = out.resume;
        ui.ask = '';
        save();
        toast(out.changes?.length ? 'Changed: ' + out.changes.slice(0, 3).join('; ') : 'Rewritten.');
      } catch (err) { toast('Rewrite failed: ' + err.message); }
      ui.rewriting = false; render();
      break;
    }
    case 'lib-add': {
      const text = (ui.libText || '').trim();
      if (!text) { toast('Paste a resume first.'); break; }
      db.library.push({ id: uid(), name: (ui.libName || '').trim() || 'resume_master.tex', resume: text, meta: 'Base', savedAt: Date.now() });
      ui.libName = ''; ui.libText = '';
      save(); render(); toast('Saved to the library.');
      break;
    }
    case 'lib-copy': copyText(db.library.find((x) => x.id === el.dataset.id)?.resume || ''); break;
    case 'lib-del':
      if (await confirmDialog({ title: 'Delete this saved resume?', body: "It's removed from your library in this browser. Applications that used it keep their own copy.", ok: 'Delete', danger: true })) { db.library = db.library.filter((x) => x.id !== el.dataset.id); save(); render(); }
      break;
  }
});

// Keep "running" timers fresh while a panel is in progress.
setInterval(() => {
  const r = route();
  if (r.name === 'results') { const app = findApp(r.id); if (app && isRunning(latest(app))) render(); }
}, 1000);

render();
