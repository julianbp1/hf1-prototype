// Turn audit/results.json into the polishing backlog (audit/report.md) and a pass/fail gate.
//   node checks/report.mjs [--in=audit] [--gate]   (--gate exits 1 if any blocking check fails)
import fs from 'node:fs';
import path from 'node:path';

const args = Object.fromEntries(process.argv.slice(2).map(a => a.replace(/^--/, '').split('=')).map(([k, v]) => [k, v ?? true]));
const IN = args.in || 'audit';
const R = JSON.parse(fs.readFileSync(path.join(IN, 'results.json'), 'utf8'));
const MIN = 15;

const ok = R.filter(r => !r.failed);
const tally = (key) => { const t = {}; for (const r of ok) for (const [k, v] of Object.entries(r[key] || {})) t[k] = (t[k] || 0) + v; return Object.entries(t).sort((a, b) => b[1] - a[1]); };
const where = r => `${r.n} ${r.area} · ${r.name} (${r.roleLab || r.role}, ${r.vp})`;
const uniq = (arr, f) => { const m = new Map(); for (const x of arr) { const k = f(x); if (!m.has(k)) m.set(k, { ...x, n: 0, at: new Set() }); const e = m.get(k); e.n++; e.at.add(x.at); } return [...m.values()].sort((a, b) => b.n - a.n); };

const checks = [];
const add = (sev, id, title, items, blocking) => checks.push({ sev, id, title, items, blocking, count: items.length });

// 1. Broken: screens that failed to open or threw
add('critical', 'broken', 'Screens that fail to open or throw errors',
  R.filter(r => r.failed || r.screenError || (r.pageErrors || []).length).map(r => `${where(r)}: ${r.failed || r.screenError || r.pageErrors.join(' | ')}`), true);
// 2. Wrong person: the role link did not switch the view
add('critical', 'role', 'Screens that show the wrong person for the role',
  ok.filter(r => r.area !== 'Onboarding' && r.who && r.who.vas !== r.role).map(r => `${where(r)} shows ${r.who.me}`), true);
// 3. Leftover software-company content
const left = uniq(ok.flatMap(r => (r.leftover || []).map(l => ({ t: l.t, hit: l.hit, at: `${r.n} ${r.name}` }))), x => x.t);
add('high', 'leftover', 'Content left over from the software-company demo', left.map(l => `"${l.t}" (${l.hit}) · on ${[...l.at].slice(0, 4).join(', ')}${l.at.size > 4 ? ` +${l.at.size - 4}` : ''}`), true);
// 4. Phone: content cut off past the right edge
const ovf = ok.filter(r => r.vp === 'phone' && (r.overflow || []).length);
add('high', 'phone-overflow', 'Phone screens with content cut off at the right edge', ovf.map(r => `${where(r)}: ${r.overflow.length} elements, worst ${Math.max(...r.overflow.map(o => o.by))}px, e.g. ${r.overflow[0].el}`), true);
// 5. Contrast
const con = uniq(ok.flatMap(r => (r.contrast || []).map(c => ({ ...c, at: `${r.n} ${r.name}` }))), x => x.el.replace(/".*"/, '') + x.cr);
add('high', 'contrast', 'Text below WCAG AA contrast', con.slice(0, 40).map(c => `${c.cr}:1 at ${c.fs}px, ${c.el} · ${c.n} places`), true);
// 6. Unlabelled controls
const unl = uniq(ok.flatMap(r => (r.unlabeled || []).map(u => ({ u, at: `${r.n} ${r.name}` }))), x => x.u);
add('high', 'labels', 'Buttons and fields with no name for screen readers', unl.map(u => `${u.u} · ${u.n} places`), true);
// 7. Text below the 15px minimum
const small = ok.filter(r => r.vp === 'desktop').flatMap(r => (r.small || []).map(s => ({ ...s, at: `${r.n} ${r.name}` })));
const smallBySize = {}; for (const s of small) smallBySize[s.fs] = (smallBySize[s.fs] || 0) + 1;
const smallEls = uniq(small, s => s.el.replace(/ ".*"/, '') + '|' + s.fs);
add('high', 'small-text', `Text smaller than ${MIN}px (desktop)`, [`By size: ${Object.entries(smallBySize).sort((a, b) => a[0] - b[0]).map(([k, v]) => `${k}px × ${v}`).join(', ')}`, ...smallEls.slice(0, 30).map(s => `${s.fs}px ${s.el.replace(/ ".*"/, '')} e.g. "${s.t}" · ${s.n}×`)], false);
// 8. Too many type sizes, radii, shadows, colours, durations
const sizes = tally('sizes'), radii = tally('radii'), shadows = tally('shadows'), colors = tally('colors'), bgs = tally('bgs'), durs = tally('durations'), weights = tally('weights');
add('medium', 'type-scale', `${sizes.length} different text sizes in use (aim: 6)`, sizes.map(([k, v]) => `${k}px × ${v}`), false);
add('medium', 'radii', `${radii.length} different corner radii (aim: 4)`, radii.slice(0, 25).map(([k, v]) => `${k} × ${v}`), false);
add('medium', 'shadows', `${shadows.length} different shadows (aim: 3)`, shadows.slice(0, 20).map(([k, v]) => `${k} × ${v}`), false);
add('medium', 'colors', `${colors.length} text colours and ${bgs.length} background colours`, [...colors.slice(0, 15).map(([k, v]) => `text rgb(${k}) × ${v}`), ...bgs.slice(0, 15).map(([k, v]) => `bg rgb(${k}) × ${v}`)], false);
add('medium', 'weights', `${weights.length} font weights`, weights.map(([k, v]) => `${k} × ${v}`), false);
add('medium', 'motion', `${durs.length} different animation timings (aim: 3)`, durs.slice(0, 25).map(([k, v]) => `${k} × ${v}`), false);
// 9. Colour meaning: amber and accent uses
const amber = uniq(ok.flatMap(r => (r.amberUses || []).map(t => ({ t, at: r.n }))), x => x.t);
add('medium', 'amber', 'Everything drawn in amber (should only mean "needs you")', amber.slice(0, 40).map(a => `${a.t} · ${a.n}×`), false);
const accent = uniq(ok.flatMap(r => (r.accentUses || []).map(t => ({ t, at: r.n }))), x => x.t);
add('medium', 'accent', 'Everything drawn in accent blue (should only mean "something is happening")', accent.slice(0, 40).map(a => `${a.t} · ${a.n}×`), false);
// 10. Standard icons
const icons = ok.filter(r => r.vp === 'desktop').map(r => [r, r.icons]).sort((a, b) => b[1] - a[1]);
add('medium', 'icons', `Standard line icons on screen (${icons.reduce((a, [, n]) => a + n, 0)} across desktop captures)`, icons.slice(0, 20).map(([r, n]) => `${where(r)}: ${n}`), false);

const order = { critical: 0, high: 1, medium: 2, low: 3 };
checks.sort((a, b) => order[a.sev] - order[b.sev]);
const lines = [`# HF1 polish audit`, ``, `${R.length} captures · ${new Set(R.map(r => r.slug)).size} screens × Owner, Manager, Salesperson × desktop (1440×900) and phone (390×844). Onboarding is captured once, as Owner.`, ``,
  `| Severity | Check | Count | Blocks publish |`, `| --- | --- | --- | --- |`, ...checks.map(c => `| ${c.sev} | ${c.title} | ${c.count} | ${c.blocking ? 'yes' : 'no'} |`), ``];
for (const c of checks) { lines.push(`## ${c.sev}: ${c.title}`, ``, ...(c.items.length ? c.items.slice(0, 60).map(i => `- ${i}`) : ['- None']), ``); }
fs.writeFileSync(path.join(IN, 'report.md'), lines.join('\n'));
const failing = checks.filter(c => c.blocking && c.count);
console.log(checks.map(c => `${c.blocking && c.count ? 'FAIL' : c.count ? 'note' : 'ok  '} ${c.sev.padEnd(8)} ${c.title}: ${c.count}`).join('\n'));
console.log(`Wrote ${IN}/report.md`);
if (args.gate && failing.length) { console.error(`Gate: ${failing.length} blocking checks fail`); process.exit(1); }
