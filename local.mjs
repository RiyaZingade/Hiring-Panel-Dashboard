// Runs Hiring Panel Studio on this machine. Reviewers go through the
// signed-in Claude Code CLI, so no API key is needed. Start: npm run local
//
// The hosted site (hiring-panel-studio.vercel.app) also talks to this server
// from the browser, so it answers CORS requests from that one origin only.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

process.env.PANEL_BACKEND = 'claude-code';
const root = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT) || 3000;
const routes = {
  '/api/review': (await import('./api/review.js')).default,
  '/api/synthesize': (await import('./api/synthesize.js')).default,
  '/api/rewrite': (await import('./api/rewrite.js')).default,
  '/api/pdf': compilePdf
};

// Set HOSTED_ORIGIN if you deploy your own copy of the site.
const HOSTED_ORIGIN = process.env.HOSTED_ORIGIN || 'https://hiring-panel-studio.vercel.app';
const LOOPBACK_HOSTS = new Set([`localhost:${port}`, `127.0.0.1:${port}`, `[::1]:${port}`]);
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css' };
const STATIC = new Set(['/index.html', '/app.js', '/styles.css', '/bridge.html']);

// Compiles the resume with a LaTeX engine on this machine, if one is installed.
// Shell escape stays off, and each compile runs in its own temp folder.
const TEX_PATH = [process.env.PATH, '/Library/TeX/texbin', '/opt/homebrew/bin', '/usr/local/bin'].join(path.delimiter);
const ENGINES = [
  ['tectonic', ['--chatter', 'minimal', 'resume.tex']],
  ['pdflatex', ['-interaction=nonstopmode', '-halt-on-error', '-no-shell-escape', 'resume.tex']]
];
function run(bin, args, cwd) {
  return new Promise((resolve) => {
    const child = spawn(bin, args, { cwd, env: { ...process.env, PATH: TEX_PATH } });
    let out = '';
    child.stdout.on('data', (d) => { out += d; });
    child.stderr.on('data', (d) => { out += d; });
    const timer = setTimeout(() => child.kill(), 120000);
    child.on('error', () => { clearTimeout(timer); resolve({ missing: true }); });
    child.on('close', (code) => { clearTimeout(timer); resolve({ code, out }); });
  });
}
async function compilePdf(req, res) {
  const source = String(req.body.source || '');
  if (!/\\documentclass/.test(source)) return res.status(400).json({ code: 'not-latex', error: 'This resume isn\'t LaTeX.' });
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'panel-pdf-'));
  try {
    fs.writeFileSync(path.join(dir, 'resume.tex'), source);
    for (const [bin, args] of ENGINES) {
      const result = await run(bin, args, dir);
      if (result.missing) continue;
      const pdf = path.join(dir, 'resume.pdf');
      if (result.code === 0 && fs.existsSync(pdf)) return res.status(200).json({ pdf: fs.readFileSync(pdf).toString('base64'), engine: bin });
      const errors = result.out.split('\n').filter((l) => /^!|error/i.test(l)).slice(0, 4).join(' ');
      return res.status(422).json({ code: 'tex-error', error: `LaTeX couldn't compile it: ${errors || 'see the source for errors'}` });
    }
    return res.status(501).json({ code: 'no-tex', error: 'No LaTeX engine is installed on this computer.' });
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

function cors(req, res) {
  if (req.headers.origin === HOSTED_ORIGIN) {
    res.setHeader('Access-Control-Allow-Origin', HOSTED_ORIGIN);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'content-type');
    // Chrome's private/local network access preflight.
    res.setHeader('Access-Control-Allow-Private-Network', 'true');
    res.setHeader('Access-Control-Max-Age', '600');
  }
}

async function onRequest(req, res) {
  // Refuse anything not addressed to this machine by name (DNS rebinding) or
  // sent from a site other than ours or localhost itself.
  const origin = req.headers.origin;
  const allowedOrigin = !origin || origin === HOSTED_ORIGIN || /^http:\/\/(localhost|127\.0\.0\.1|\[::1\]):\d+$/.test(origin);
  if (!LOOPBACK_HOSTS.has(req.headers.host) || !allowedOrigin) {
    res.statusCode = 403;
    return res.end('Forbidden');
  }
  cors(req, res);
  if (req.method === 'OPTIONS') { res.statusCode = 204; return res.end(); }

  const url = new URL(req.url, 'http://localhost');
  if (url.pathname === '/health') {
    if (process.env.LOG_HEALTH) console.log(`health check from ${origin || 'no origin'} (${req.headers['user-agent']?.match(/(Chrome|Safari|Firefox)\/[\d.]+/)?.[0]})`);
    res.setHeader('content-type', 'application/json');
    return res.end(JSON.stringify({ ok: true, backend: 'claude-code' }));
  }
  const handler = routes[url.pathname];
  if (handler) {
    let raw = '';
    for await (const chunk of req) raw += chunk;
    try { req.body = raw ? JSON.parse(raw) : {}; } catch (e) { req.body = {}; }
    const shim = {
      status(code) { res.statusCode = code; return shim; },
      json(obj) { res.setHeader('content-type', 'application/json'); res.end(JSON.stringify(obj)); return shim; }
    };
    const started = Date.now();
    await handler(req, shim);
    console.log(`${url.pathname} ${req.body.agent || ''} → ${res.statusCode} in ${((Date.now() - started) / 1000).toFixed(1)} s`);
    return;
  }
  const file = url.pathname === '/' ? '/index.html' : url.pathname;
  if (!STATIC.has(file)) { res.statusCode = 404; return res.end('Not found'); }
  res.setHeader('content-type', types[path.extname(file)]);
  if (file === '/bridge.html') return res.end(fs.readFileSync(path.join(root, file), 'utf8').replaceAll('__HOSTED_ORIGIN__', HOSTED_ORIGIN));
  fs.createReadStream(path.join(root, file)).pipe(res);
}

// Listen on both IPv4 and IPv6 loopback: browsers may resolve "localhost" to either.
const v4 = http.createServer(onRequest).listen(port, '127.0.0.1', () => {
  console.log(`Hiring Panel Studio running at http://localhost:${port}`);
  console.log(`The hosted site can use it too: ${HOSTED_ORIGIN}`);
  console.log('Reviewers run through your Claude Code login. Press Ctrl+C to stop.');
});
v4.on('error', (err) => {
  console.error(err.code === 'EADDRINUSE' ? `Port ${port} is already in use. Is the server already running in another window?` : err.message);
  process.exit(1);
});
http.createServer(onRequest).listen(port, '::1').on('error', () => { /* no IPv6 loopback; IPv4 is enough */ });
