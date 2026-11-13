// Audit every screen as Owner, Manager and Salesperson, on desktop and phone.
//   node checks/audit.mjs [page=index.html] [--only=slug,slug] [--roles=ceo,mgr,emp] [--vps=desktop,phone] [--out=audit]
// Needs the folder served at http://localhost:3000 (python3 -m http.server 3000).
// Writes <out>/shots/<role>-<vp>/<nn>-<slug>.png and <out>/results.json.
import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
import path from 'node:path';

const args = Object.fromEntries(process.argv.slice(2).map(a => a.startsWith('--') ? a.slice(2).split('=') : ['page', a]));
const PAGE = args.page || 'index.html';
const OUT = args.out || 'audit';
const BASE = args.base || 'http://localhost:3000';
const ROLES = (args.roles || 'ceo,mgr,emp').split(',');
const VPS = { desktop: { width: 1440, height: 900, deviceScaleFactor: 1 }, phone: { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true } };
const VP_KEYS = (args.vps || 'desktop,phone').split(',');
const CONC = +(args.conc || 6);
const ROLE_LAB = { ceo: 'Owner', mgr: 'Manager', emp: 'Salesperson' };

// Words left over from the software-company version of the demo
const LEFTOVER = /\b(v1\.[45]\b|Hetzner|seats|annual plan|Founders 30|feature freeze|release (notes|checklist|blockers|writer)|pull requests?|regression|QA\b|bugs?\b|changelog|roadmap|merged PRs?|GitHub|Jira|Linear|sprint|deploy\w*|staging|Safari)/gi;

// Runs in the page: measure what is on screen right now
function measure(LEFTOVER_SRC) {
  const re = new RegExp(LEFTOVER_SRC, 'gi');
  const W = innerWidth, H = innerHeight;
  const vis = e => { const r = e.getBoundingClientRect(); if (r.width < 1 || r.height < 1) return null; if (r.bottom < 0 || r.top > H || r.right < 0 || r.left > W) return null; const cs = getComputedStyle(e); if (cs.visibility === 'hidden' || +cs.opacity === 0) return null; return r; };
  const parse = c => { const m = c.match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number); return [p[0], p[1], p[2], p.length > 3 ? p[3] : 1]; };
  const lum = ([r, g, b]) => { const f = v => { v /= 255; return v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; }; return .2126 * f(r) + .7152 * f(g) + .0722 * f(b); };
  const bgOf = e => { let layers = []; for (let n = e; n && n.nodeType === 1; n = n.parentElement) { const c = parse(getComputedStyle(n).backgroundColor); if (c && c[3] > 0) { layers.push(c); if (c[3] >= .99) break; } } let base = [255, 255, 255]; for (const c of layers.reverse()) base = base.map((v, i) => v * (1 - c[3]) + c[i] * c[3]); return base; };
  const label = e => { const t = (e.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 60); const c = (e.className && e.className.baseVal === undefined ? e.className : '') || ''; return `${e.tagName.toLowerCase()}${c ? '.' + String(c).trim().split(/\s+/).slice(0, 2).join('.') : ''}${t ? ' "' + t + '"' : ''}`; };

  const out = { small: [], sizes: {}, radii: {}, shadows: {}, colors: {}, bgs: {}, contrast: [], overflow: [], leftover: [], icons: 0, unlabeled: [], weights: {}, fonts: {}, durations: {}, amberUses: [], accentUses: [] };
  const AMBER = new Set(['180,93,0', '242,166,74', '255,246,234', '138,75,5', '154,106,48']);
  const ACCENT = new Set(['26,115,232', '232,240,254', '198,218,252', '23,101,204']);
  const textEls = new Set();
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n; (n = walker.nextNode());) { if (n.nodeValue.trim().length && n.parentElement) textEls.add(n.parentElement); }
  for (const e of textEls) {
    const r = vis(e); if (!r) continue;
    if (e.closest('svg,script,style,[aria-hidden="true"]')) continue;
    const cs = getComputedStyle(e); const fs = parseFloat(cs.fontSize);
    const own = [...e.childNodes].filter(c => c.nodeType === 3).map(c => c.nodeValue).join(' ').trim().replace(/\s+/g, ' ');
    if (!own) continue;
    const k = fs.toFixed(1); out.sizes[k] = (out.sizes[k] || 0) + 1;
    out.weights[cs.fontWeight] = (out.weights[cs.fontWeight] || 0) + 1;
    const ff = cs.fontFamily.split(',')[0].replace(/"/g, ''); out.fonts[ff] = (out.fonts[ff] || 0) + 1;
    if (fs < 15 && out.small.length < 400) out.small.push({ fs: +k, t: own.slice(0, 50), el: label(e) });
    const fg = parse(cs.color); if (fg) { const key = fg.slice(0, 3).join(','); out.colors[key] = (out.colors[key] || 0) + 1;
      const bg = bgOf(e); const a = fg[3]; const mix = fg.slice(0, 3).map((v, i) => v * a + bg[i] * (1 - a));
      const L1 = lum(mix), L2 = lum(bg); const cr = (Math.max(L1, L2) + .05) / (Math.min(L1, L2) + .05);
      const large = fs >= 24 || (fs >= 18.66 && +cs.fontWeight >= 700);
      if (cr < (large ? 3 : 4.5) && out.contrast.length < 200) out.contrast.push({ cr: +cr.toFixed(2), fs: +k, t: own.slice(0, 40), el: label(e) });
      if (AMBER.has(key)) out.amberUses.push(own.slice(0, 40));
      if (ACCENT.has(key)) out.accentUses.push(own.slice(0, 40)); }
    const m = own.match(re); if (m) out.leftover.push({ hit: [...new Set(m)].join(', '), t: own.slice(0, 80) });
    if (r.right > W + 1 && cs.position !== 'fixed') out.overflow.push({ by: Math.round(r.right - W), el: label(e) });
  }
  for (const e of document.querySelectorAll('body *')) {
    const r = vis(e); if (!r) continue; const cs = getComputedStyle(e);
    if (cs.borderTopLeftRadius !== '0px' && r.width > 12) { out.radii[cs.borderTopLeftRadius] = (out.radii[cs.borderTopLeftRadius] || 0) + 1; }
    if (cs.boxShadow !== 'none') out.shadows[cs.boxShadow] = (out.shadows[cs.boxShadow] || 0) + 1;
    const bg = parse(cs.backgroundColor); if (bg && bg[3] > 0) { const key = bg.slice(0, 3).join(','); out.bgs[key] = (out.bgs[key] || 0) + 1; if (AMBER.has(key)) out.amberUses.push('bg: ' + label(e).slice(0, 50)); if (ACCENT.has(key)) out.accentUses.push('bg: ' + label(e).slice(0, 50)); }
    for (const d of [cs.transitionDuration, cs.animationDuration]) if (d && d !== '0s') d.split(',').forEach(x => { x = x.trim(); if (x !== '0s') out.durations[x] = (out.durations[x] || 0) + 1; });
  }
  out.icons = [...document.querySelectorAll('svg.i')].filter(vis).length;
  for (const e of document.querySelectorAll('button, a[href], [role="button"], input, select, textarea')) {
    if (!vis(e)) continue;
    const name = (e.getAttribute('aria-label') || e.getAttribute('title') || e.textContent || e.getAttribute('placeholder') || (e.labels && e.labels[0] && e.labels[0].textContent) || '').trim();
    if (!name) out.unlabeled.push(label(e).slice(0, 70) || e.outerHTML.slice(0, 70));
  }
  out.docOverflowX = document.documentElement.scrollWidth > W + 1;
  out.small = out.small.sort((a, b) => a.fs - b.fs);
  return out;
}

const run = async () => {
  const browser = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, args: ['--hide-scrollbars', '--force-color-profile=srgb', '--disable-background-timer-throttling', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows', '--disable-features=IntensiveWakeUpThrottling'] });
  const p0 = await browser.newPage(); await p0.goto(`${BASE}/${PAGE}`); await p0.waitForFunction('window.HF1_SCREENS');
  let screens = await p0.evaluate(() => window.HF1_SCREENS); await p0.close();
  if (args.only) { const o = args.only.split(','); screens = screens.filter(s => o.includes(s.slug) || o.includes(s.n)); }
  let jobs = [];
  for (const s of screens) for (const role of ROLES) for (const vp of VP_KEYS) {
    if (s.area === 'Onboarding' && role !== 'ceo') continue; // onboarding happens before a role
    jobs.push({ s, role, vp });
  }
  // --retry: keep earlier results and only redo the captures that failed
  let kept = [];
  if (args.retry) {
    const prev = JSON.parse(fs.readFileSync(path.join(OUT, 'results.json'), 'utf8'));
    const bad = new Set(prev.filter(r => r.failed).map(r => `${r.slug}|${r.role}|${r.vp}`));
    kept = prev.filter(r => !r.failed);
    jobs = jobs.filter(j => bad.has(`${j.s.slug}|${j.role}|${j.vp}`));
  }
  console.log(`${jobs.length} captures`);
  const results = [...kept]; let done = 0;
  const worker = async () => {
    const page = await browser.newPage();
    page.on('pageerror', e => { page.__errs = (page.__errs || []).concat(String(e.message).slice(0, 200)); });
    for (let job; (job = jobs.shift());) {
      const { s, role, vp } = job; page.__errs = [];
      try {
        await page.setViewport(VPS[vp]);
        await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }]);
        await page.goto(`${BASE}/${PAGE}?screen=${s.slug}&role=${role}`, { waitUntil: 'load' });
        await page.waitForFunction('window.__screenReady === true', { timeout: +(args.timeout || 120000) });
        await new Promise(r => setTimeout(r, 900));
        const dir = path.join(OUT, 'shots', `${role}-${vp}`); fs.mkdirSync(dir, { recursive: true });
        const file = path.join(dir, `${s.n}-${s.slug}.png`);
        await page.screenshot({ path: file });
        const m = await page.evaluate(measure, LEFTOVER.source);
        const err = await page.evaluate(() => window.__screenError || null);
        const who = await page.evaluate(() => window.__hfWho ? window.__hfWho() : null);
        results.push({ n: s.n, slug: s.slug, area: s.area, name: s.name, role, roleLab: ROLE_LAB[role], vp, file, who, screenError: err, pageErrors: page.__errs, ...m });
      } catch (e) { results.push({ n: s.n, slug: s.slug, area: s.area, name: s.name, role, vp, failed: String(e.message).slice(0, 200) }); }
      done++; if (done % 10 === 0) console.log(`${done} done`);
    }
    await page.close();
  };
  await Promise.all(Array.from({ length: CONC }, worker));
  await browser.close();
  results.sort((a, b) => (a.n + a.role + a.vp).localeCompare(b.n + b.role + b.vp));
  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(path.join(OUT, 'results.json'), JSON.stringify(results, null, 1));
  console.log(`Wrote ${results.length} results to ${OUT}/results.json`);
};
run().catch(e => { console.error(e); process.exit(1); });
