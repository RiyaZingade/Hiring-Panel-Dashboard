// Hiring Panel — single-page app. State lives in this browser's
// localStorage; the /api routes run each reviewer through Claude.

const REPO_URL = 'https://github.com/RiyaZingade/Hiring-Panel-Dashboard';

// `about` and `checks` describe each reviewer on the Panel agents page; they
// summarize the briefs in api/review.js, so keep the two in step.
const AGENTS = [
  { id: 'ats', name: 'Automated screen', desc: 'Keywords and hard requirements.', icon: 'bot', color: '#5FD4D0', verdicts: ['PASS', 'REJECT'],
    about: 'Plays the applicant-tracking system that decides whether a human ever sees your resume. It reads like software, not like a person.',
    checks: ['Text reads cleanly top to bottom (no columns, tables or images that break parsing)', 'Job titles, employers and dates are clear', "Which of the posting's key skills and terms appear, and which are missing", 'Contact details, length and filler'],
    extra: 'Also lists the matched and missing keywords.' },
  { id: 'manager', name: 'Hiring manager', desc: 'Would they get an interview?', icon: 'brief', color: '#8AB4FF', verdicts: ['INTERVIEW', 'NO'],
    about: 'The person who decides whether you get an interview. Makes the call in the first ten seconds, the way a busy manager really does.',
    checks: ['What stands out in the first ten seconds', 'Whether your experience matches what the team needs', 'The three weakest lines for this role'],
    extra: 'Also lists the questions it would ask you in the interview.' },
  { id: 'dayone', name: 'Day-one hiring manager', desc: 'Could you contribute week one?', icon: 'dayone', color: '#9BE3C4', verdicts: ['HIRE', 'MAYBE', 'NO HIRE'],
    about: 'A hiring manager reading for one thing: could you do the job on day one, without months of ramp-up?',
    checks: ["Skills the posting requires that you've already proven", 'Requirements you only mention but never show', 'Gaps you would have to learn on the job'] },
  { id: 'rival', name: 'Rival applicant', desc: 'Would they lose to you?', icon: 'rival', color: '#F58BA8', verdicts: ['HIRE', 'MAYBE', 'NO HIRE'],
    about: 'Another candidate who applied for the same job. Reads your resume as competition and looks for where a strong rival beats you.',
    checks: ['Tools, projects or results a typical strong applicant would show', 'Lines that sound weaker than they should', 'Where you lose a side-by-side comparison'] },
  { id: 'ceo', name: 'CEO', desc: 'Impact: what changed, and by how much.', icon: 'ceo', color: '#F2C66D', verdicts: ['HIRE', 'MAYBE', 'NO HIRE'],
    about: 'Reads for impact: what did you change, and by how much? Activity without outcomes reads as noise.',
    checks: ['Results with numbers: users, time saved, defects found, scale', 'Bullets that list duties instead of outcomes', 'Whether your work mattered to anyone'] },
  { id: 'recruiter', name: 'Recruiter', desc: '30 seconds on the top third.', icon: 'search', color: '#B9A3FF', verdicts: ['HIRE', 'MAYBE', 'NO HIRE'],
    about: 'Has 30 seconds and 100 resumes today. Reads only the top third of the page and decides whether to pass you to the hiring manager.',
    checks: ['Header and contact details', 'Education, graduation date and eligibility', 'Skills line and the first experience entry'] },
  { id: 'teammate', name: 'Teammate', desc: 'How you work with others.', icon: 'team', color: '#F0A35E', verdicts: ['HIRE', 'MAYBE', 'NO HIRE'],
    about: 'An engineer who would work next to you. Reads for what you would be like to build things with.',
    checks: ['Collaboration and communication', 'Code review, documentation and taking feedback', 'Ownership: seeing work through to the end'] }
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
  trash: 'M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14',
  home: 'M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z',
  library: 'M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20',
  botface: 'M12 3v3M7 6h10a3 3 0 0 1 3 3v7a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V9a3 3 0 0 1 3-3zM9 11.5v1.5M15 11.5v1.5M9.5 16h5M1.5 12v3M22.5 12v3',
  heart: 'M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .5-4.5 2-1.5-1.5-2.7-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7z',
  gear: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z'
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
db.prefs ||= { theme: 'dark', accent: 'blue', defaultResumeId: null };
db.profile ||= { shareWithAgents: true };

// ---------- theme ----------
// Accent presets: [dark-mode shade, light-mode shade].
const ACCENTS = {
  blue: ['#8AB4FF', '#2F6BED'], violet: ['#B9A3FF', '#7C5CE0'], teal: ['#5FD4D0', '#0E8F8A'],
  green: ['#9BE3C4', '#15936A'], pink: ['#F58BA8', '#D23C72'], orange: ['#F0A35E', '#C9650F']
};
const systemDark = window.matchMedia('(prefers-color-scheme: dark)');
function applyTheme() {
  const theme = db.prefs.theme === 'system' ? (systemDark.matches ? 'dark' : 'light') : db.prefs.theme;
  const root = document.documentElement;
  root.dataset.theme = theme;
  const [dark, light] = ACCENTS[db.prefs.accent] || ACCENTS.blue;
  root.style.setProperty('--accent', theme === 'light' ? light : dark);
  root.style.setProperty('--c-blue', theme === 'light' ? light : dark);
}
applyTheme();
systemDark.addEventListener?.('change', () => { if (db.prefs.theme === 'system') applyTheme(); });
const defaultResume = () => db.library.find((r) => r.id === db.prefs.defaultResumeId) || db.library[db.library.length - 1];
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (e) { toast('Could not save to this browser (storage full or blocked).'); }
}

// ---------- helpers ----------
const $app = document.getElementById('app');
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => Math.random().toString(36).slice(2, 10);
// A stable color per company name, for the avatar on each row.
const HUES = ['#8AB4FF', '#B9A3FF', '#5FD4D0', '#9BE3C4', '#F2C66D', '#F0A35E', '#F58BA8'];
const hue = (name) => HUES[[...String(name)].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7) % HUES.length];
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
  if (k === 'INTERVIEW') return { c: 'var(--accent)', bg: 'color-mix(in srgb, var(--accent) 15%, transparent)', icon: 'interview' };
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
  if (isRunning(v)) return { label: 'Panel running', c: 'var(--c-blue)' };
  const s = score(v);
  if (s != null && s >= (app.settings.target ?? 85)) return { label: 'Ready to apply', c: 'var(--good)' };
  if (app.versions.length > 1) return { label: 'Iterating', c: 'var(--c-violet)' };
  return { label: 'Needs review', c: 'var(--warn)' };
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
  if (status === 404) throw new Error("Your local server is out of date and doesn't have this feature yet. Press Ctrl+C in its Terminal window and run npm run local again.");
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
    ${conn.state === 'offline' ? (IS_LOCAL ? '' : '<button type="button" class="btn sm" data-action="connect" style="margin-left:auto">Connect</button>') : ''}</div>`;
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
  if (r.name === 'apps' || (r.id === appId && ['results', 'suggest', 'interview'].includes(r.name))) render();
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
  for (const key of ['interview', 'suggestions']) if (app[key]?.status === 'run') app[key] = { status: 'error', error: 'Interrupted by a page reload. Try again.' };
}
save();

// ---------- routing ----------
function route() {
  const parts = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  if (parts[0] === 'new') return { name: 'new' };
  if (parts[0] === 'library') return { name: 'library' };
  if (parts[0] === 'agents') return { name: 'agents' };
  if (parts[0] === 'setup') return { name: 'setup' };
  if (parts[0] === 'credits') return { name: 'credits' };
  if (parts[0] === 'settings') return { name: 'settings' };
  if (parts[0] === 'profile') return { name: 'profile' };
  if (parts[0] === 'app' && parts[1]) {
    if (parts[2] === 'edit') return { name: 'editor', id: parts[1] };
    if (parts[2] === 'suggestions') return { name: 'suggest', id: parts[1] };
    if (parts[2] === 'interview') return { name: 'interview', id: parts[1] };
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
  const base = defaultResume();
  return {
    company: '', role: '', posting: '',
    mode: base ? 'saved' : 'latex',
    resume: '', fileName: '', savedId: base ? base.id : null,
    agents: AGENTS.map((a) => a.id), target: 85, onePage: true, autoRevise: true
  };
}

// ---------- shell ----------
// Page frame: a slim top bar (brand, connection, Setup). Navigation lives
// in the dock at the bottom, which persists across renders so it can animate.
function shell(active, content) {
  return `<div class="shell">
    <header class="topbar">
      <a class="brand" href="#/">${LOGO}<span>Hiring Panel</span></a>
      <span class="topbar-right">${connBadge()}
        <a class="btn sm ${active === 'setup' ? 'on' : ''}" href="#/setup">${icon('code', 14)}Setup${conn.state === 'offline' ? '<span class="navdot" title="Not connected"></span>' : ''}</a>
        <a class="iconlink ${active === 'settings' ? 'on' : ''}" href="#/settings" aria-label="Settings" title="Settings">${icon('gear', 18)}</a>
        <a class="avatar ${active === 'profile' ? 'on' : ''}" href="#/profile" aria-label="Profile" title="Profile">${esc(initials(db.profile.name))}</a></span>
    </header>
    <main class="main">${content}</main>
  </div>`;
}

const initials = (name) => (String(name || '').trim().split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('')) || '?';

// ---------- dock (bottom navigation) ----------
// Pixel-art bot for Panel agents, drawn on a 16×10 grid; the eyes are cut out
// with a mask so the dock background shows through.
const PIXEL_BOT = `<svg width="24" height="15" viewBox="0 0 16 10" aria-hidden="true" shape-rendering="crispEdges">
  <defs><mask id="pixel-bot-eyes"><rect width="16" height="10" fill="#fff"/><rect x="4" y="2" width="1" height="2" fill="#000"/><rect x="11" y="2" width="1" height="2" fill="#000"/></mask></defs>
  <g fill="currentColor" mask="url(#pixel-bot-eyes)"><rect x="2" y="0" width="12" height="8"/><rect x="0" y="4" width="16" height="2"/>
    <rect x="3" y="8" width="1" height="2"/><rect x="5" y="8" width="1" height="2"/><rect x="10" y="8" width="1" height="2"/><rect x="12" y="8" width="1" height="2"/></g></svg>`;
const DOCK = [
  { key: 'apps', href: '#/', label: 'Applications', icon: 'home', color: 'var(--dock-green)' },
  { key: 'library', href: '#/library', label: 'Resume library', icon: 'library', color: 'var(--dock-red)' },
  { key: 'new', href: '#/new', label: 'New application', icon: 'plus', plus: true },
  { key: 'agents', href: '#/agents', label: 'Panel agents', svg: PIXEL_BOT, color: 'var(--dock-orange)' },
  { key: 'credits', href: '#/credits', label: 'Acknowledgements', icon: 'heart', color: 'var(--dock-pink)' }
];
const $dock = document.getElementById('dock');
$dock.innerHTML = `<span class="dock-ind" aria-hidden="true"></span>${DOCK.map((d) => `<a href="${d.href}" data-k="${d.key}" class="${d.plus ? 'dock-plus' : 'dock-item'}" aria-label="${d.label}"${d.color ? ` style="--dc:${d.color}"` : ''}>
  ${d.plus ? `<span class="plus-circle">${icon('plus', 22)}</span>` : d.svg || icon(d.icon, 21)}<span class="dock-tip">${d.label}</span></a>`).join('')}`;
function updateDock(r) {
  const key = { apps: 'apps', results: 'apps', suggest: 'apps', interview: 'apps', library: 'library', new: 'new', agents: 'agents', credits: 'credits' }[r.name];
  $dock.hidden = r.name === 'editor';
  $dock.querySelectorAll('a').forEach((a) => {
    const on = a.dataset.k === key;
    a.classList.toggle('on', on);
    if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
  });
  // The center button turns into × on New application and closes back home.
  const plus = $dock.querySelector('.dock-plus');
  plus.href = key === 'new' ? '#/' : '#/new';
  plus.setAttribute('aria-label', key === 'new' ? 'Close new application' : 'New application');
  plus.querySelector('.dock-tip').textContent = key === 'new' ? 'Close' : 'New application';
  const ind = $dock.querySelector('.dock-ind');
  const target = $dock.querySelector(`.dock-item[data-k="${key}"]`);
  if (target) {
    ind.style.transform = `translateX(${target.offsetLeft}px)`;
    ind.style.width = target.offsetWidth + 'px';
    ind.style.opacity = '1';
    $dock.style.setProperty('--active-dc', target.style.getPropertyValue('--dc'));
  } else ind.style.opacity = '0';
  requestAnimationFrame(() => $dock.classList.add('ready'));
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
      let c = 'var(--line-3)';
      if (r?.status === 'run') c = 'var(--warn)';
      else if (r?.status === 'error') c = 'var(--bad)';
      else if (r?.status === 'done') c = ['NO', 'REJECT'].includes(r.data.verdict) || (g.id !== 'ats' && r.data.verdict === 'PASS') ? 'var(--bad)' : r.data.verdict === 'MAYBE' ? 'var(--warn)' : 'var(--good)';
      return `<span style="background:${c}" title="${esc(g.name)}"></span>`;
    }).join('');
    const finished = v ? Object.values(v.reviews).filter((r) => r.status === 'done').length : 0;
    return `<a class="trow" href="${v ? `#/app/${a.id}` : `#/app/${a.id}/edit`}">
      <span class="who"><span class="initial" style="--ag:${hue(a.company)}">${esc((a.company.replace(/[^A-Za-z]/g, '').charAt(0) || '?').toUpperCase())}</span>
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
    <section class="stats" aria-label="Summary">${stats.map(([l, v, s], i) => `<div class="stat t${i + 1}"><span class="muted" style="font-size:12px">${l}</span><span class="v">${v}</span><span class="muted" style="font-size:12px">${s}</span></div>`).join('')}</section>
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
      <section class="card c1" aria-labelledby="jp">
        <div class="card-head"><span class="step">01</span><h2 id="jp">Job posting</h2></div>
        <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px">
          <label class="field">Company<input class="input" type="text" data-input="company" value="${esc(f.company)}" placeholder="Voyager Technologies"></label>
          <label class="field">Role<input class="input" type="text" data-input="role" value="${esc(f.role)}" placeholder="Software Engineering Intern"></label>
        </div>
        <label class="field">Posting text<textarea class="textarea" rows="14" data-input="posting" style="min-height:320px" placeholder="Paste the full job description — responsibilities, qualifications, about the company…">${esc(f.posting)}</textarea></label>
        <span class="muted" style="font-size:12px">The panel reads the whole posting, so include qualifications and the company blurb.</span>
      </section>
      <section class="card c2" aria-labelledby="rs">
        <div class="card-head"><span class="step">02</span><h2 id="rs">Resume</h2>
          <div class="seg" role="group" aria-label="Resume source" style="margin-left:auto">${modes.map(([id, l]) => `<button type="button" class="${f.mode === id ? 'on' : ''}" aria-pressed="${f.mode === id}" data-action="mode" data-v="${id}">${l}</button>`).join('')}</div>
        </div>
        ${resumePane}
      </section>
    </div>
    <section class="card c3" aria-labelledby="pn">
      <div class="card-head"><span class="step">03</span><h2 id="pn">Panel</h2><span class="muted" style="font-size:12px">Reviewers run in parallel, then a synthesizer merges their verdicts.</span></div>
      <div class="agents">${AGENTS.map((g) => {
        const on = f.agents.includes(g.id);
        return `<button type="button" class="agent ${on ? 'on' : ''}" style="--ag:${g.color}" aria-pressed="${on}" data-action="toggle-agent" data-id="${g.id}">
          <span style="display:flex;align-items:center;gap:8px;width:100%"><span class="ricon sm">${icon(g.icon, 14)}</span><span style="font-weight:500">${g.name}</span><span class="check" aria-hidden="true"></span></span>
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
      // Older results have one prose note (`full`); split it into sentences.
      const points = d.key_points?.length ? d.key_points : String(d.full || '').split(/(?<=[.!?])\s+(?=[A-Z"(])/).filter(Boolean);
      const sec = (label, body) => `<div class="rsec"><span class="rlabel">${label}</span>${body}</div>`;
      full = `<div class="rnote" style="--ag:${g.color}">
        ${d.hurt_most?.quote ? sec('Hurt most', `<q>${esc(d.hurt_most.quote)}</q><span class="muted">${esc(d.hurt_most.why)}</span>`) : ''}
        ${points.length ? sec('Key points', `<ul class="list">${points.map((k) => `<li>${esc(k)}</li>`).join('')}</ul>`) : ''}
        ${(d.problems || []).length ? sec('Problems', `<ul class="list">${d.problems.map((p) => `<li><b>${esc(p.label)}.</b> ${esc(p.detail)}</li>`).join('')}</ul>`) : ''}
        ${d.interview_questions?.length ? sec('Would ask in the interview', `<ol class="list">${d.interview_questions.map((q) => `<li>${esc(q)}</li>`).join('')}</ol>`) : ''}
        ${d.missing_terms?.length ? sec('Missing keywords', `<span class="terms">${d.missing_terms.map((t) => `<span class="term miss">${esc(t)}</span>`).join('')}</span>`) : ''}
        ${d.matched_terms?.length ? sec('Matched keywords', `<span class="terms">${d.matched_terms.map((t) => `<span class="term hit">${esc(t)}</span>`).join('')}</span>`) : ''}
      </div>`;
    } else {
      verdictCell = '<span class="muted">—</span>';
      hurtCell = '';
    }
    const open = !!ui.openRows[id];
    return `<div class="rblock">
      <div class="rrow" role="row">
        <span class="rnum" role="cell">${i + 1}</span>
        <span class="rcell" role="cell"><span class="ricon" style="--ag:${g.color}">${icon(g.icon, 17)}</span><span style="font-weight:500">${g.name}</span></span>
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

  const details = synth ? synthDetails(synth, total) : '';

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
      <div class="vside">${toolButton(app, 'suggest')}${toolButton(app, 'interview')}</div>
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

// ---------- interview prep ----------
const COACH = { name: 'Interview coach', color: '#7DD3FC', icon: 'interview' };
function interviewCard(app) {
  const iv = app.interview || { status: 'idle' };
  const head = (extra) => `<div class="card-head"><span class="ricon" style="--ag:${COACH.color}">${icon(COACH.icon, 16)}</span>
    <span style="font-size:13px;color:var(--text-2)">Questions this team is likely to ask, from the posting and your resume</span>${extra}</div>`;
  if (iv.status === 'run') return `<section class="card interview">${head('')}<span class="muted"><span class="spin"></span> The interview coach is reading the posting…</span></section>`;
  if (iv.status !== 'done') {
    return `<section class="card interview">${head('')}
      ${iv.status === 'error' ? `<span class="err">${esc(iv.error)}</span>` : '<p class="muted" style="margin:0;line-height:1.6">One more agent reads the job posting, including anything it says about the interview process, plus your resume, and writes technical, resume and behavioral questions with how to prepare for each. It runs only when you ask, as one Claude call.</p>'}
      <span><button type="button" class="btn primary" data-action="run-interview">${icon(COACH.icon)}${iv.status === 'error' ? 'Try again' : 'Generate interview questions'}</button></span></section>`;
  }
  const d = iv.data;
  const group = (label, items) => items?.length ? `<div class="iv-group"><h3>${label}</h3><ol class="iv-list">${items.map((x) => `<li>
      <span class="iv-q">${esc(x.q)}</span>
      <ul class="list iv-meta"><li><span class="muted">Why they'd ask:</span> ${esc(x.why)}</li><li><span class="muted">Prepare:</span> ${esc(x.prep)}</li></ul></li>`).join('')}</ol></div>` : '';
  const stale = latest(app) && iv.versionN !== latest(app).n ? ` · made for v${iv.versionN}` : '';
  return `<section class="card interview">${head(`<button type="button" class="btn sm" data-action="run-interview" style="margin-left:auto">${icon('rerun', 14)}Regenerate</button>`)}
    <div class="iv-top">
      <div class="rsec"><span class="rlabel">Interview process</span>${d.process?.stated && d.process.stages?.length
        ? `<span class="terms">${d.process.stages.map((st, i) => `<span class="term stage"><b>${i + 1}</b> ${esc(st)}</span>`).join('')}</span>`
        : `<span class="muted" style="font-size:13px">The posting doesn't describe the interview process, so these questions come from the role's requirements.</span>`}
        ${d.process?.notes?.length ? `<ul class="list" style="font-size:13px">${d.process.notes.map((n) => `<li>${esc(n)}</li>`).join('')}</ul>` : ''}</div>
      ${d.focus?.length ? `<div class="rsec"><span class="rlabel">Likely focus</span><span class="terms">${d.focus.map((f) => `<span class="term">${esc(f)}</span>`).join('')}</span></div>` : ''}
    </div>
    <div class="iv-groups">${group('Technical', d.technical)}${group('About your resume', d.resume)}${group('Behavioral', d.behavioral)}</div>
    ${d.ask_them?.length ? `<div class="rsec"><span class="rlabel">Questions to ask them</span><ul class="list">${d.ask_them.map((q) => `<li>${esc(q)}</li>`).join('')}</ul></div>` : ''}
    <span class="muted" style="font-size:12px">Generated ${esc(ago(iv.at))}${stale}. Prepare from what's really on your resume; never claim experience you don't have.</span>
  </section>`;
}
// Runs an on-demand agent (interview coach, gap advisor) for one application
// and stores the result on it under `key`.
async function runExtra(appId, key, path) {
  const app = findApp(appId);
  const v = latest(app);
  app[key] = { status: 'run' };
  save(); refreshIfShowing(appId);
  try {
    const data = await api(path, { resume: v ? v.resume : app.draft, posting: app.posting, company: app.company, role: app.role, profile: profileText() });
    app[key] = { status: 'done', data, at: Date.now(), versionN: v?.n };
  } catch (err) {
    app[key] = { status: 'error', error: err.message };
  }
  save(); refreshIfShowing(appId);
}

// ---------- suggestions ----------
const ADVISOR = { name: 'Gap advisor', color: '#A3E635', icon: 'metric' };
const SUGGEST_TYPES = { project: 'Project', class: 'Class', club: 'Club', certification: 'Certification', course: 'Online course', experience: 'Experience' };
function suggestCard(app) {
  const sg = app.suggestions || { status: 'idle' };
  const head = (extra) => `<div class="card-head"><span class="ricon" style="--ag:${ADVISOR.color}">${icon(ADVISOR.icon, 16)}</span>
    <span style="font-size:13px;color:var(--text-2)">Requirements you don't meet yet, and how to close each gap</span>${extra}</div>`;
  if (sg.status === 'run') return `<section class="card suggest">${head('')}<span class="muted"><span class="spin"></span> The gap advisor is comparing your resume with the requirements…</span></section>`;
  if (sg.status !== 'done') {
    return `<section class="card suggest">${head('')}
      ${sg.status === 'error' ? `<span class="err">${esc(sg.error)}</span>` : '<p class="muted" style="margin:0;line-height:1.6">One more agent checks every required and preferred qualification in this posting against your resume. For each one you\'re missing or only mention, it suggests personal projects, clubs, classes or certifications to close the gap. It runs only when you ask, as one Claude call.</p>'}
      <span><button type="button" class="btn primary" data-action="run-suggest">${icon(ADVISOR.icon)}${sg.status === 'error' ? 'Try again' : 'Find gaps and suggestions'}</button></span></section>`;
  }
  const d = sg.data;
  const stale = latest(app) && sg.versionN !== latest(app).n ? ` · made for v${sg.versionN}` : '';
  return `<section class="card suggest">${head(`<button type="button" class="btn sm" data-action="run-suggest" style="margin-left:auto">${icon('rerun', 14)}Regenerate</button>`)}
    ${d.summary ? `<p style="margin:0;color:var(--text-2);line-height:1.6">${esc(d.summary)}</p>` : ''}
    ${d.gaps?.length ? `<div class="gaps">${d.gaps.map((g) => `<div class="gap">
        <div class="gap-head"><span class="gap-req">${esc(g.requirement)}</span>
          <span class="badge ${g.level}">${g.level === 'required' ? 'Required' : 'Preferred'}</span><span class="badge ${g.status}">${g.status === 'missing' ? 'Missing' : 'Weak'}</span></div>
        <span class="muted" style="font-size:12.5px"><span class="rlabel" style="margin-right:6px">Now</span>${esc(g.evidence)}</span>
        <ul class="sugs">${(g.suggestions || []).map((x) => `<li>
          <span class="sug-type">${esc(SUGGEST_TYPES[x.type] || x.type)}</span>
          <span class="sug-body"><span>${esc(x.idea)}</span>
            <span class="muted" style="font-size:12px">${icon('clock', 12)} ${esc(x.time)} · <span class="faint">On your resume:</span> ${esc(x.shows)}</span></span></li>`).join('')}</ul>
      </div>`).join('')}</div>` : '<p class="muted" style="margin:0">No gaps found: your resume shows every listed requirement.</p>'}
    ${d.say_it?.length ? `<div class="rsec"><span class="rlabel">Already have it? Say so</span><ul class="list">${d.say_it.map((q) => `<li>${esc(q)}</li>`).join('')}</ul></div>` : ''}
    <span class="muted" style="font-size:12px">Generated ${esc(ago(sg.at))}${stale}. Only add something to your resume once you've actually done it.</span>
  </section>`;
}

// The merged summary, fixes and questions, kept short: a highlighted bottom
// line, bullets, and one compact row per fix. Older results (one prose
// summary) are split into sentences.
const hl = (text) => esc(text).replace(/\*\*(.+?)\*\*/g, '<mark class="hl">$1</mark>');
const sentences = (text) => String(text || '').split(/(?<=[.!?])\s+(?=[A-Z"(])/).filter(Boolean);
function synthDetails(synth, total) {
  const old = sentences(synth.summary);
  const bottom = synth.bottom_line || old[0] || '';
  const points = synth.summary_points?.length ? synth.summary_points : old.slice(1);
  const fixes = (synth.fixes || []).map((f, i) => {
    const n = Math.min(total, (f.reviewers || []).length);
    return `<li class="fixrow">
      <span class="fixnum">${i + 1}</span>
      <span class="fixbody">
        <span class="fixtitle">${icon(f.kind, 15)}<b>${esc(f.text)}</b>
          <span class="fixcount ${n >= Math.ceil(total / 2) ? 'many' : ''}" title="${esc((f.reviewers || []).join(', '))}">${n} of ${total} reviewers</span></span>
        <span class="muted">${esc(f.why)}</span>
        ${f.quote ? `<details class="fixquote"><summary>Show the line</summary><q>${inline(f.quote)}</q></details>` : ''}
      </span></li>`;
  }).join('');
  return `
    <section class="card summary"><h2>Summary</h2>
      ${bottom ? `<p class="bottomline">${hl(bottom)}</p>` : ''}
      ${points.length ? `<ul class="list sumlist">${points.map((p) => `<li>${hl(p)}</li>`).join('')}</ul>` : ''}
    </section>
    <section class="card"><h2>What to fix, worst first</h2><ol class="fixlist">${fixes}</ol></section>
    ${synth.questions?.length ? `<section class="card"><h2>Questions to answer before sending</h2><ol class="list qlist">${synth.questions.map((q) => `<li>${esc(q)}</li>`).join('')}</ol>
      <p class="muted" style="margin:0;font-size:12px">Delete any placeholder you can't fill truthfully.</p></section>` : ''}`;
}

// Buttons on the results page that open the Suggestions and Interview prep pages.
function toolButton(app, kind) {
  const t = kind === 'suggest'
    ? { ...ADVISOR, label: 'Suggestions', key: 'suggestions', path: 'suggestions', count: (d) => `${d.gaps?.length || 0} gap${d.gaps?.length === 1 ? '' : 's'} to close` }
    : { ...COACH, label: 'Interview prep', key: 'interview', path: 'interview', count: (d) => `${(d.technical?.length || 0) + (d.resume?.length || 0) + (d.behavioral?.length || 0)} questions` };
  const st = app[t.key] || { status: 'idle' };
  const sub = st.status === 'done' ? t.count(st.data) : st.status === 'run' ? '<span class="spin"></span> Running…' : st.status === 'error' ? 'Failed · open to retry' : 'Not generated yet';
  return `<a class="vbtn" href="#/app/${app.id}/${t.path}" style="--ag:${t.color}">
    <span class="ricon">${icon(t.icon, 16)}</span>
    <span style="display:flex;flex-direction:column;gap:2px;min-width:0"><span style="font-weight:600;color:var(--text)">${t.label}</span><span class="muted" style="font-size:12px">${sub}</span></span>
    ${icon('arrow', 16, 'style="margin-left:auto;color:var(--ag)"')}</a>`;
}
function viewExtra(r, kind) {
  const app = findApp(r.id);
  if (!app) return shell('apps', `<div class="empty">That application no longer exists. <a href="#/">Back to applications</a></div>`);
  const other = kind === 'suggest' ? ['interview', 'Interview prep'] : ['suggestions', 'Suggestions'];
  return `<div class="page"><div class="wrap">
    <header class="crumbs">
      <a class="back" href="#/app/${app.id}">${icon('back')}Panel results</a><span class="slash">/</span>
      <div style="display:flex;flex-direction:column;gap:2px"><h1 class="sm">${kind === 'suggest' ? 'Suggestions' : 'Interview prep'}</h1>
        <span class="muted" style="font-size:13px">${esc(app.company)} · ${esc(app.role)}</span></div>
      <a class="btn" href="#/app/${app.id}/${other[0]}" style="margin-left:auto">${other[1]}${icon('arrow')}</a>
    </header>
    ${kind === 'suggest' ? suggestCard(app) : interviewCard(app)}
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

// Marks where each letter-size page would end in the preview, so overflow
// onto a second page is visible. Approximate: real LaTeX spacing differs.
function markPages() {
  const paper = document.getElementById('paper');
  if (!paper) return;
  paper.querySelectorAll('.pbreak').forEach((el) => el.remove());
  paper.style.minHeight = '';
  const pageH = paper.clientWidth * 11 / 8.5;
  const pages = Math.max(1, Math.ceil((paper.scrollHeight - 2) / pageH));
  paper.style.minHeight = pages * pageH + 'px';
  for (let i = 1; i < pages; i++) {
    const line = document.createElement('div');
    line.className = 'pbreak';
    line.style.top = i * pageH + 'px';
    line.innerHTML = `<span>Page ${i + 1}</span>`;
    paper.appendChild(line);
  }
  const count = document.getElementById('pagecount');
  if (count) {
    count.textContent = pages === 1 ? '1 page' : `${pages} pages`;
    count.className = pages > 1 ? 'over' : '';
  }
}
window.addEventListener('resize', () => { if (route().name === 'editor') markPages(); });
document.fonts?.ready.then(() => { if (route().name === 'editor') markPages(); });

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
      <span class="slash" style="color:var(--line-3)">/</span>
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
        <div class="prev-head"><span class="pane-title">Preview</span><span class="mono" style="margin-left:auto"><span id="pagecount"></span> · approximate</span></div>
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
    <header style="display:flex;flex-direction:column;gap:6px"><h1>Resume library</h1><p class="muted" style="margin:0">Saved resumes stay in this browser only. Your default resume is selected for every new application; change it here or in <a href="#/settings">Settings</a>.</p></header>
    <section class="card">
      <h2>Add a resume</h2>
      <label class="field">Name<input class="input mono" data-input="libName" value="${esc(ui.libName || '')}" placeholder="resume_master.tex"></label>
      <label class="field">Source<textarea class="textarea code" rows="10" data-input="libText" placeholder="Paste LaTeX or plain text">${esc(ui.libText || '')}</textarea></label>
      <div style="display:flex;justify-content:flex-end"><button class="btn primary" type="button" data-action="lib-add">Save to library</button></div>
    </section>
    ${items.length ? `<div style="display:flex;flex-direction:column;gap:8px">${items.map((r) => `<div class="saved-item" style="cursor:default">
        <span class="mono" style="font-size:13px">${esc(r.name)}</span><span class="muted" style="font-size:12px">${esc(r.meta || '')}</span>
        ${defaultResume()?.id === r.id ? '<span class="badge preferred">Default</span>' : `<button class="btn sm ghost" type="button" data-action="set-default" data-id="${r.id}">Make default</button>`}
        <span class="muted" style="margin-left:auto;font-size:12px">${esc(ago(r.savedAt))}</span>
        <button class="btn sm" type="button" data-action="lib-copy" data-id="${r.id}">Copy</button>
        <button class="btn sm ghost danger" type="button" data-action="lib-del" data-id="${r.id}" aria-label="Delete ${esc(r.name)}">${icon('trash', 14)}</button></div>`).join('')}</div>`
      : '<div class="empty">Nothing saved yet.</div>'}`);
}
function viewAgents() {
  const pill = (agentId, v) => {
    const t = tone(agentId, v === 'NO HIRE' ? 'PASS' : v);
    return `<span class="pill" style="background:${t.bg};color:${t.c}">${esc(v)}</span>`;
  };
  // One expandable row per agent: summary line closed, full description open.
  const row = ({ color, iconKey, name, tag, desc, about, checks, checksLabel = 'Looks at', verdicts, id, extra }) => `<details class="agent-row" style="--ag:${color}">
      <summary><span class="ricon">${icon(iconKey, 17)}</span>
        <span class="agent-row-main"><span class="agent-row-name">${name}${tag ? `<span class="mono faint" style="font-size:11px;margin-left:8px">${tag}</span>` : ''}</span><span class="muted" style="font-size:13px">${esc(desc)}</span></span>
        ${verdicts ? `<span class="agent-row-verdicts">${verdicts.map((v) => pill(id, v)).join('')}</span>` : ''}
        <span class="agent-row-chev">${icon('chev', 16)}</span></summary>
      <div class="agent-detail">
        <p class="agent-about">${esc(about)}</p>
        <div class="agent-sec"><span class="agent-label">${checksLabel}</span><ul class="list">${checks.map((c) => `<li>${esc(c)}</li>`).join('')}</ul></div>
        ${extra ? `<p class="muted" style="margin:0;font-size:13px">${esc(extra)}</p>` : ''}
      </div></details>`;
  const reviewers = AGENTS.map((g, i) => row({ color: g.color, iconKey: g.icon, name: g.name, tag: `#${i + 1}`, desc: g.desc, about: g.about, checks: g.checks, verdicts: g.verdicts, id: g.id, extra: g.extra })).join('');
  const after = [
    row({ color: 'var(--text-2)', iconKey: 'bolt', name: 'Synthesizer', desc: 'Merges every verdict into ranked fixes.', checksLabel: 'Gives you',
      about: 'Runs after the seven reviewers. Reads all their verdicts together, merges duplicates and ranks what is wrong, worst first.',
      checks: ['A bottom line and a short summary', 'The ranked fixes, with how many reviewers flagged each one', 'Suggested edits you can accept one by one in the editor', 'A rebuilt resume, with [ADD: …] placeholders for facts only you know', 'Questions to answer before you send it'] }),
    row({ color: ADVISOR.color, iconKey: ADVISOR.icon, name: ADVISOR.name, tag: 'on demand', desc: 'Requirements you are missing, and how to close each gap.', checksLabel: 'Gives you',
      about: "Finds the requirements in a posting that your resume doesn't show yet. Open it with the Suggestions button on any results page.",
      checks: ['Each missing or weak requirement, marked required or preferred', 'Projects, clubs, classes, certifications or courses to close it, with rough time and how it would read on your resume', "Things you may already have done but haven't said"] }),
    row({ color: COACH.color, iconKey: COACH.icon, name: COACH.name, tag: 'on demand', desc: 'Likely interview questions, and how to prepare.', checksLabel: 'Gives you',
      about: 'Prepares you for the interview itself from the posting, including any interview process it describes, and your resume. Open it with the Interview prep button on any results page.',
      checks: ['The interview stages, if the posting lists them (it never invents a process)', 'The topics the interview will likely focus on', "Technical, resume and behavioral questions, each with why they'd ask it and how to prepare", 'Good questions to ask the interviewer'] })
  ].join('');
  return shell('agents', `
    <header style="display:flex;flex-direction:column;gap:6px"><h1>Panel agents</h1><p class="muted" style="margin:0;max-width:720px;line-height:1.6">Seven reviewers read your resume against the job posting, each alone and as a different person. Click any agent to see what it does.</p></header>
    <section class="agent-list" aria-label="Reviewers"><h2 class="agent-list-title">The panel</h2>${reviewers}</section>
    <section class="agent-list" aria-label="After the panel"><h2 class="agent-list-title">After the panel</h2>${after}</section>
    <section class="card"><h2>What every reviewer returns</h2><p class="muted" style="margin:0;line-height:1.6">A verdict, the single line that hurt most (quoted exactly), up to three problems tagged as weak wording, missing, needs a number, keywords, shipped work or open question, and 2 to 5 key points.</p></section>
    <section class="card"><h2>Verdicts and score</h2><p class="muted" style="margin:0;line-height:1.6">The score averages every verdict: positive verdicts (PASS, INTERVIEW, HIRE) count 100, MAYBE 55, NO HIRE 10, REJECT and NO 0. Reviewers are told never to invent facts. This is a second opinion from language models, not a guarantee of an interview.</p></section>`);
}

// ---------- view: setup + acknowledgements ----------
function cmd(text) {
  return `<div class="cmd"><code>${esc(text)}</code><button type="button" class="btn sm" data-action="copy-cmd" data-cmd="${esc(text)}">Copy</button></div>`;
}
function viewSetup() {
  const status = {
    local: ['good', "You're on localhost, so you're already connected."],
    connected: ['good', conn.win ? 'Connected through the connector window.' : 'Connected to the server on your computer.'],
    checking: ['warn', 'Looking for the local server…'],
    offline: ['bad', IS_LOCAL ? 'The server stopped. Start it again (step 2).' : 'Not connected yet. Start the server (step 2), then connect (step 3).']
  }[conn.state];
  const reqs = [
    ['Node.js 20 or newer', 'Runs the local server.', 'node --version', 'https://nodejs.org'],
    ['Claude Code, installed', 'Runs each reviewer.', 'claude --version', 'https://claude.com/claude-code'],
    ['Signed in to Claude Code', 'Run claude once and finish the login.', 'claude', null]
  ];
  return shell('setup', `
    <header style="display:flex;flex-direction:column;gap:6px"><h1>Setup</h1>
      <p class="muted" style="margin:0;max-width:720px;line-height:1.6">Hiring Panel runs on your own computer, through your own Claude Code login. There's no API key and nothing to pay beyond your Claude plan. Setup takes about two minutes.</p></header>
    <div class="status-banner ${status[0]}"><span class="dot"></span><span>${status[1]}</span>
      ${conn.state === 'offline' && !IS_LOCAL ? '<button type="button" class="btn sm" data-action="connect" style="margin-left:auto">Connect</button>' : ''}</div>
    <section class="card c1"><div class="card-head"><span class="step">00</span><h2>Before you start</h2></div>
      <p class="muted" style="margin:0">You need all three, or the panel won't run.</p>
      <div class="reqs">${reqs.map(([t, d, c, url]) => `<div class="req"><span style="font-weight:600">${url ? `<a href="${url}" target="_blank" rel="noopener">${t}</a>` : t}</span><span class="muted" style="font-size:13px">${d}</span>${cmd(c)}</div>`).join('')}</div>
    </section>
    <section class="card c2"><div class="card-head"><span class="step">01</span><h2>Get the code</h2><span class="muted" style="font-size:12px">First time only</span></div>
      ${cmd(`git clone ${REPO_URL}.git`)}
      <p class="muted" style="margin:0;font-size:13px">There's nothing to install: the app has no dependencies.</p>
    </section>
    <section class="card c3"><div class="card-head"><span class="step">02</span><h2>Start the server</h2><span class="muted" style="font-size:12px">Each time you use it</span></div>
      <p class="muted" style="margin:0">Open Terminal, run this, and leave the window open while you work:</p>
      ${cmd('cd Hiring-Panel-Dashboard && npm run local')}
    </section>
    <section class="card c4"><div class="card-head"><span class="step">03</span><h2>Connect this page</h2></div>
      <div class="browsers">
        <div class="browser"><span style="font-weight:600">Chrome</span><span class="muted" style="font-size:13px;line-height:1.55">Connects on its own. If Chrome asks to let the site access devices on your local network, click <b>Allow</b>.</span></div>
        <div class="browser"><span style="font-weight:600">Safari and others</span><span class="muted" style="font-size:13px;line-height:1.55">Click <b>Connect</b>. A small window opens; keep it open (you can minimize it). If nothing opens, allow pop-ups for this site.</span></div>
        <div class="browser"><span style="font-weight:600">Any browser</span><span class="muted" style="font-size:13px;line-height:1.55">Skip connecting and open <a href="http://localhost:3000">localhost:3000</a>, served straight from the server.</span></div>
      </div>
      <p class="muted" style="margin:0;font-size:13px">Applications are saved separately for each address, so pick one and stick with it.</p>
    </section>
    <section class="card c5"><div class="card-head"><span class="step">04</span><h2>When you're done</h2></div>
      <p class="muted" style="margin:0">Press <kbd>Ctrl+C</kbd> in the Terminal window, or close it.</p>
    </section>
    <section class="card note"><h2>Good to know</h2><ul class="list">
      <li><b>Usage:</b> one full panel is about 9 Claude calls, all on your own plan, plus one more each time you generate interview questions or suggestions. On the Pro plan, several panels in a row can hit your usage limit, so space them out or turn off reviewers you don't need.</li>
      <li><b>Exact PDFs:</b> install a LaTeX engine (<code class="inline">brew install tectonic</code>) and Download PDF compiles your real LaTeX. Without one, it prints the approximate preview.</li>
      <li><b>"Port 3000 is already in use":</b> the server is already running in another Terminal window. Use that one.</li>
      <li><b>"claude: command not found":</b> install Claude Code, then open a new Terminal window.</li>
      <li><b>Privacy:</b> resumes stay in this browser and go only to your local server, then to Anthropic through your Claude Code session.</li>
    </ul></section>`);
}
function viewCredits() {
  return shell('credits', `
    <header style="display:flex;flex-direction:column;gap:6px"><h1>Acknowledgements</h1>
      <p class="muted" style="margin:0">The people behind Hiring Panel.</p></header>
    <section class="card credit" style="--ag:#F2C66D">
      <span class="agent-label">Panel design</span>
      <h2>Alex Chen</h2>
      <p class="muted" style="margin:0;line-height:1.6">The seven-reviewer panel comes from Alex Chen's <a href="https://github.com/alexyc9381/hiring-panel-skill" target="_blank" rel="noopener">hiring-panel skill</a> for Claude Code: an automated screen, a hiring manager and five readers who each judge your resume alone, followed by a rebuild with every mistake fixed. Hiring Panel turns that skill into a dashboard. It's used under the MIT license.</p>
      <span style="display:flex;flex-wrap:wrap;gap:8px"><a class="btn sm" href="https://github.com/alexyc9381/hiring-panel-skill" target="_blank" rel="noopener">hiring-panel skill</a><a class="btn sm" href="https://chen.media" target="_blank" rel="noopener">chen.media</a></span>
    </section>
    <section class="card credit" style="--ag:#8AB4FF">
      <span class="agent-label">Dashboard</span>
      <h2>Riya Zingade</h2>
      <p class="muted" style="margin:0;line-height:1.6">Riya, a computer science student at Cal Poly San Luis Obispo, built the Hiring Panel dashboard: the interface, the editor, and running the panel locally through Claude Code so it's free to use.</p>
      <span style="display:flex;flex-wrap:wrap;gap:8px"><a class="btn sm" href="https://github.com/riyazingade" target="_blank" rel="noopener">GitHub</a><a class="btn sm" href="https://www.linkedin.com/in/riya-zingade/" target="_blank" rel="noopener">LinkedIn</a><a class="btn sm" href="${REPO_URL}" target="_blank" rel="noopener">Source code</a></span>
    </section>
    <p class="muted" style="margin:0;font-size:12px">Reviewers run on <a href="https://claude.com/claude-code" target="_blank" rel="noopener">Claude Code</a> by Anthropic.</p>`);
}

// ---------- view: settings + profile ----------
function viewSettings() {
  const p = db.prefs;
  const themes = [['dark', 'Dark'], ['light', 'Light'], ['system', 'Match system']];
  const def = defaultResume();
  return shell('settings', `
    <header style="display:flex;flex-direction:column;gap:6px"><h1>Settings</h1>
      <p class="muted" style="margin:0">Saved in this browser.</p></header>
    <section class="card c1"><div class="card-head"><h2>Appearance</h2></div>
      <div class="setrow"><span class="setlabel">Theme</span>
        <div class="seg" role="group" aria-label="Theme">${themes.map(([v, l]) => `<button type="button" class="${p.theme === v ? 'on' : ''}" aria-pressed="${p.theme === v}" data-action="set-theme" data-v="${v}">${l}</button>`).join('')}</div></div>
      <div class="setrow"><span class="setlabel">Accent color</span>
        <div class="swatches" role="group" aria-label="Accent color">${Object.entries(ACCENTS).map(([k, [d, l]]) => `<button type="button" class="swatch ${p.accent === k ? 'on' : ''}" style="--sw:${document.documentElement.dataset.theme === 'light' ? l : d}" aria-pressed="${p.accent === k}" aria-label="${k}" title="${k[0].toUpperCase() + k.slice(1)}" data-action="set-accent" data-v="${k}"></button>`).join('')}</div></div>
    </section>
    <section class="card c2"><div class="card-head"><h2>Default resume</h2></div>
      <p class="muted" style="margin:0;line-height:1.6">New applications start with this resume selected. You can still paste or upload a different one for any application.</p>
      ${db.library.length ? `<label class="field">Resume
        <select class="input" data-pref="defaultResumeId">
          <option value="" ${!p.defaultResumeId ? 'selected' : ''}>Newest saved resume${db.library.length ? ` (${esc(db.library[db.library.length - 1].name)})` : ''}</option>
          ${[...db.library].reverse().map((r) => `<option value="${r.id}" ${p.defaultResumeId === r.id ? 'selected' : ''}>${esc(r.name)} · ${esc(r.meta || '')} · ${esc(ago(r.savedAt))}</option>`).join('')}
        </select></label>
        ${def ? `<span class="muted" style="font-size:13px">Using <span class="mono">${esc(def.name)}</span>.</span>` : ''}`
      : `<div class="empty" style="padding:24px">No saved resumes yet. <a class="btn sm" href="#/library">Add one to the library</a></div>`}
    </section>
    <section class="card c3"><div class="card-head"><h2>Profile</h2></div>
      <p class="muted" style="margin:0;line-height:1.6">Your school, graduation date, work authorization and target roles. ${db.profile.shareWithAgents ? 'Shared with the Suggestions and Interview prep agents.' : 'Not shared with any agent.'}</p>
      <span><a class="btn sm" href="#/profile">Edit profile${icon('arrow', 14)}</a></span>
    </section>`);
}
const PROFILE_FIELDS = [
  ['name', 'Full name', 'Your name'], ['email', 'Email', 'you@example.com'],
  ['school', 'School', 'Your university'], ['degree', 'Degree and major', 'B.S. Computer Science'],
  ['graduation', 'Expected graduation', 'May 2028'], ['standing', 'Year or standing', 'Junior'],
  ['location', 'Location', 'City, State'], ['authorization', 'Work authorization', 'e.g. U.S. citizen, permanent resident, needs sponsorship'],
  ['targets', 'Target roles', 'e.g. Embedded software, backend, data'], ['links', 'Links', 'GitHub, LinkedIn, portfolio']
];
function viewProfile() {
  const pr = db.profile;
  return shell('profile', `
    <header class="profile-head"><span class="avatar big">${esc(initials(pr.name))}</span>
      <span style="display:flex;flex-direction:column;gap:4px;min-width:0"><h1>${esc(pr.name || 'Your profile')}</h1>
        <span class="muted">${esc([pr.degree, pr.school].filter(Boolean).join(' · ') || 'Add your details below. They save as you type.')}</span></span></header>
    <section class="card c2"><div class="card-head"><h2>About you</h2><span class="muted" style="font-size:12px">Saved in this browser as you type</span></div>
      <div class="pgrid">${PROFILE_FIELDS.map(([k, label, ph]) => `<label class="field">${label}<input class="input" data-profile="${k}" value="${esc(pr[k] || '')}" placeholder="${esc(ph)}"></label>`).join('')}</div>
      <label class="field">Notes for the agents<textarea class="textarea" rows="4" data-profile="notes" placeholder="Anything true about you that isn't on your resume: classes in progress, clubs, what you're learning, constraints like start dates.">${esc(pr.notes || '')}</textarea></label>
    </section>
    <section class="card c4"><div class="card-head"><h2>How agents use this</h2></div>
      <label class="checkrow"><input type="checkbox" data-profile-check="shareWithAgents" ${pr.shareWithAgents ? 'checked' : ''}>
        <span>Share my profile with the <b>Suggestions</b> and <b>Interview prep</b> agents</span></label>
      <p class="muted" style="margin:0;line-height:1.6;font-size:13px">They use it to tailor advice, for example suggesting classes for your year or flagging a work-authorization requirement. The seven panel reviewers never see it: they judge your resume alone, like a real screener would.</p>
    </section>`);
}
function profileText() {
  const pr = db.profile;
  if (!pr.shareWithAgents) return '';
  const lines = PROFILE_FIELDS.filter(([k]) => k !== 'email' && pr[k]?.trim()).map(([k, label]) => `${label}: ${pr[k].trim()}`);
  if (pr.notes?.trim()) lines.push(`Notes: ${pr.notes.trim()}`);
  return lines.join('\n');
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
  else if (r.name === 'suggest' || r.name === 'interview') html = viewExtra(r, r.name);
  else if (r.name === 'editor') html = viewEditor(r);
  else if (r.name === 'library') html = viewLibrary();
  else if (r.name === 'agents') html = viewAgents();
  else if (r.name === 'setup') html = viewSetup();
  else if (r.name === 'credits') html = viewCredits();
  else if (r.name === 'settings') html = viewSettings();
  else if (r.name === 'profile') html = viewProfile();
  if (html) $app.innerHTML = html;
  updateDock(r);
  if (r.name === 'editor') markPages();
  if (focusKey) {
    const el = $app.querySelector(`[data-input="${focusKey}"]`);
    if (el) { el.focus(); try { el.setSelectionRange(selStart, selEnd); } catch (e) { /* not a text field */ } }
  }
  document.title = { apps: 'Applications', new: 'New application', results: 'Panel results', suggest: 'Suggestions', interview: 'Interview prep', editor: 'Resume editor', library: 'Resume library', agents: 'Panel agents', setup: 'Setup', credits: 'Acknowledgements', settings: 'Settings', profile: 'Profile' }[r.name] + ' · Hiring Panel';
}

// ---------- events ----------
let previewTimer;
$app.addEventListener('input', (e) => {
  if (e.target.dataset.profile) {
    db.profile[e.target.dataset.profile] = e.target.value;
    save();
    const av = $app.querySelector('.topbar .avatar');
    if (av) av.textContent = initials(db.profile.name);
    return;
  }
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
    previewTimer = setTimeout(() => { save(); const p = document.getElementById('paper'); if (p) { p.innerHTML = previewHtml(app.draft); markPages(); } }, 250);
    return;
  }
  if (ui.form && key in ui.form) ui.form[key] = key === 'target' ? Number(val) : val;
});
$app.addEventListener('change', (e) => {
  if (e.target.dataset.pref) { db.prefs[e.target.dataset.pref] = e.target.value || null; save(); render(); toast('Default resume updated.'); return; }
  if (e.target.dataset.profileCheck) { db.profile[e.target.dataset.profileCheck] = e.target.checked; save(); return; }
  if (e.target.dataset.check && ui.form) ui.form[e.target.dataset.check] = e.target.checked;
  if (e.target.matches('[data-file]') && e.target.files[0]) readFile(e.target.files[0]).catch((err) => toast('Could not read that file: ' + err.message));
});
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
    case 'set-theme': db.prefs.theme = el.dataset.v; save(); applyTheme(); render(); break;
    case 'set-accent': db.prefs.accent = el.dataset.v; save(); applyTheme(); render(); break;
    case 'set-default': db.prefs.defaultResumeId = el.dataset.id; save(); render(); toast('Set as your default resume.'); break;
    case 'run-interview': runExtra(app.id, 'interview', 'interview'); break;
    case 'run-suggest': runExtra(app.id, 'suggestions', 'suggest'); break;
    case 'copy-cmd':
      try { await navigator.clipboard.writeText(el.dataset.cmd); toast('Copied. Paste it into Terminal.'); } catch (err) { toast('Copy failed. Select the command and copy it by hand.'); }
      break;
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
