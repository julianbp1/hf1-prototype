/* ================= FLOW BUILDER =================
   Grounded in HF1's real flow page: a trigger and numbered steps, a router with branches and an Otherwise branch,
   a step's settings with data from earlier steps, Test / Test step, Publish, version history (View, Use as draft),
   See runs, Run now, Turn off, and the flow assistant on the left. Only the look is this prototype's. */
const fbOn = () => S.page === 'flows' && !!S.flow && !!FLOWS[S.flow] && !S.sub;
const FBS = {};
const FB_TOOL_TRIG = {
  qb: ['New deal or repair order event', [['ref', 'Deal or RO number', '51204'], ['customer', 'Customer', 'Maria Gonzalez'], ['vehicle', 'Vehicle', '2024 Chevrolet Traverse LT'], ['vin', 'VIN', '1GNERGKW8RJ214477']]],
  hubspot: ['New lead', [['lead', 'Lead', 'Sofia Lopez'], ['vehicle', 'Vehicle of interest', '2025 Equinox LT'], ['source', 'Source', 'Cars.com'], ['email', 'Email', 'sofia.lopez@gmail.com']]],
  figma: ['New appraisal', [['vehicle', 'Vehicle', '2021 Silverado 1500 LT'], ['vin', 'VIN', '3GCUYDED5MG214455'], ['value', 'Appraised value', '$31,400'], ['miles', 'Mileage', '48,210']]],
  github: ['Repair order closed', [['ro', 'Repair order', 'RO-55120'], ['vehicle', 'Vehicle', '2023 Chevrolet Tahoe'], ['tech', 'Technician', 'Jake Sullivan']]],
  gmail: ['New email', [['from', 'From', 'ap@bremenbrake.com'], ['subject', 'Subject', 'Invoice 30917'], ['body', 'Body', 'Please find the invoice attached.']]],
  slack: ['New message in a channel', [['channel', 'Channel', '#sales'], ['text', 'Message', 'Can someone call the Hendersons?'], ['user', 'From', 'Rick Alvarez']]],
  notion: ['New file in a folder', [['file', 'File', 'Recon standards 2026.pdf'], ['folder', 'Folder', 'Used cars']]],
  linkedin: ['New lead form entry', [['lead', 'Lead', 'Ashley Ward'], ['campaign', 'Campaign', 'Black Friday trucks']]],
  gcal: ['Event starts soon', [['event', 'Event', 'Henderson delivery'], ['start', 'Starts', '14:00']]]
};
const FB_TOOL_ACT = { qb: 'Update a record', hubspot: 'Update a lead', figma: 'Update a vehicle', github: 'Submit a warranty claim', gmail: 'Send email', slack: 'Send message', notion: 'Create a document', linkedin: 'Update a campaign', gcal: 'Create an event' };
const FB_APPS = {
  hf1: { n: 'HF1', cat: 'AI & Agents', acts: { run: { k: 'Action', n: 'Run an agent', d: 'Gives one of your agents a goal and waits for its answer' }, msg: { k: 'Action', n: 'Send agent message', d: 'An agent writes to someone in Slack' } } },
  ai: { n: 'AI', cat: 'AI & Agents', acts: { ask: { k: 'Action', n: 'Ask AI', d: 'Writes, sums up or extracts from text' } } },
  router: { n: 'Router', cat: 'Utility', acts: { route: { k: 'Action', n: 'Split into branches', d: 'Each branch has its own conditions' } } },
  code: { n: 'Code', cat: 'Utility', acts: { run: { k: 'Action', n: 'Run code', d: 'A short JavaScript step' } } },
  tables: { n: 'Tables', cat: 'Utility', acts: { find: { k: 'Action', n: 'Find rows', d: 'Looks up rows in one of the project’s tables' }, add: { k: 'Action', n: 'Insert a row', d: 'Adds a row to a table' } } },
  sched: { n: 'Schedule', cat: 'Utility', acts: { every: { k: 'Trigger', n: 'Run on a schedule', d: 'Starts the flow at set times' } } },
  hook: { n: 'Webhook', cat: 'Utility', acts: { catch: { k: 'Trigger', n: 'Catch a webhook', d: 'Starts when another system calls its address' } } },
  approval: { n: 'Approvals', cat: 'Approvals', acts: { links: { k: 'Action', n: 'Create approval links', d: 'Makes Approve and Disapprove links to send to someone' }, wait: { k: 'Action', n: 'Wait for approval', d: 'Pauses until someone opens one of the links' } } }
};
Object.keys(TOOLS).forEach(k => { FB_APPS[k] = { n: TOOLS[k].n, tool: true, cat: 'Apps', acts: { trig: { k: 'Trigger', n: FB_TOOL_TRIG[k][0], d: 'Starts the flow when this happens in ' + TOOLS[k].n }, do: { k: 'Action', n: FB_TOOL_ACT[k], d: 'Through the project’s ' + TOOLS[k].n + ' connection' } } }; });
const FB_CATS = ['All', 'AI & Agents', 'Apps', 'Utility', 'Approvals'];
const fbIsTrig = s => FB_APPS[s.app].acts[s.act].k === 'Trigger';
const fbActN = s => FB_APPS[s.app].acts[s.act].n;
const fbYou = () => S.meId || 'florin';

/* how a step looks: tools show their logo, agents and people their face */
function fbFace(s, size) {
  const A = FB_APPS[s.app];
  if (A.tool) return LOGOS[s.app] ? { bg: 'var(--panel)', fg: 'var(--ink)', h: ct(s.app) } : { bg: TCOL[s.app] || '#5d616b', fg: '#fff', h: `<span class="fb-ab">${esc(TOOLS[s.app].ab)}</span>` };
  if (s.app === 'hf1') { const who = s.vals.agent && AGENTS[s.vals.agent] ? s.vals.agent : null; return who ? { bg: 'var(--panel)', fg: 'var(--ink)', h: av(who, size || 62) } : { bg: 'var(--accent-bg)', fg: 'var(--accent)', h: ic('agent') }; }
  if (s.app === 'approval' && s.act === 'wait' && s.vals.who && PEOPLE[s.vals.who]) return { bg: 'var(--amber-bg)', fg: 'var(--amber)', h: av(s.vals.who, size || 62) };
  const M = { ai: ['var(--accent-bg)', 'var(--accent)', 'spark'], router: ['#eef0f4', 'var(--ink-2)', 'branch'], code: ['#24262d', '#fff', 'sliders'], tables: ['var(--gain-soft)', 'var(--gain-1)', 'table'], sched: ['#eef0f4', 'var(--ink-2)', 'clock'], hook: ['#eef0f4', 'var(--ink-2)', 'zap'], approval: ['var(--amber-bg)', 'var(--amber)', 'userck'] }[s.app] || ['var(--panel)', 'var(--ink)', 'flow'];
  return { bg: M[0], fg: M[1], h: ic(M[2]) };
}
const fbAppFace = k => { const A = FB_APPS[k]; if (A.tool) return fbFace({ app: k, act: 'do', vals: {} }); return fbFace({ app: k, act: Object.keys(A.acts)[0], vals: {} }); };

/* ---------- fields, outputs ---------- */
function fbFields(s) {
  const P = Object.keys(PEOPLE).filter(p => !PEOPLE[p].invited), AG = Object.keys(AGENTS);
  if (s.app === 'hf1' && s.act === 'run') return [['agent', 'Agent', 'agent', AG], ['ver', 'Agent version', 'select', ['Latest approved', 'Version 3', 'Version 2']], ['goal', 'Goal', 'long']];
  if (s.app === 'hf1' && s.act === 'msg') return [['agent', 'Agent', 'agent', AG], ['to', 'To', 'person', P], ['text', 'Message', 'long']];
  if (s.app === 'ai') return [['prompt', 'Prompt', 'long'], ['model', 'Model', 'select', ['Fast', 'Smart', 'Fast, zero retention']]];
  if (s.app === 'code') return [['inputs', 'Inputs', 'long'], ['code', 'Code', 'long']];
  if (s.app === 'tables') return [['table', 'Table', 'select', ['Deals delivered', 'Title checklist', 'Lead sources']], ['where', s.act === 'find' ? 'Where' : 'Values', 'long']];
  if (s.app === 'sched') return [['when', 'Run', 'select', ['Every Monday at 08:00', 'Every day at 08:00', 'Every hour', 'Every 15 minutes']]];
  if (s.app === 'hook') return [];
  if (s.app === 'approval') return [];
  if (s.app === 'router') return [];
  if (s.act === 'trig') return [['filter', 'Only when', 'text']];
  if (s.app === 'gmail') return [['to', 'To', 'text'], ['subject', 'Subject', 'text'], ['body', 'Body', 'long']];
  if (s.app === 'slack') return [['channel', 'Channel', 'select', ['#sales', '#service', '#used-cars', '#marketing', '#office']], ['text', 'Message', 'long']];
  return [['record', 'Record', 'text'], ['details', 'Details', 'long']];
}
function fbOuts(s) {
  if (s.act === 'trig') return FB_TOOL_TRIG[s.app][1];
  if (s.app === 'hf1' && s.act === 'run') return [['answer', 'Answer', 'Done. Summary attached.'], ['decision', 'Decision', 'Yes']];
  if (s.app === 'hf1' && s.act === 'msg') return [['sent', 'Sent to', 'Slack']];
  if (s.app === 'ai') return [['answer', 'Answer', 'Last week: 14 deliveries, 3 more than the week before.']];
  if (s.app === 'code') return [['result', 'Result', '{ "ok": true }']];
  if (s.app === 'tables') return [['rows', 'Rows', '1 row']];
  if (s.app === 'sched') return [['at', 'Started at', 'Mon 16 Nov, 08:00']];
  if (s.app === 'hook') return [['body', 'Body', '{ … }']];
  if (s.app === 'approval' && s.act === 'links') return [['approve', 'Approve link', 'https://cell-a.hf1.app/approve/…'], ['disapprove', 'Disapprove link', 'https://cell-a.hf1.app/disapprove/…']];
  if (s.app === 'approval') return [['approved', 'Approved', 'true']];
  if (s.app === 'router') return [];
  return [['id', 'Record ID', 'r_' + (s.num || 1) + '0471']];
}

/* ---------- from the prototype's flow to HF1 steps ---------- */
const FB_SAMPLES = {
  deal: [['Appraisal 88213 · 2021 Silverado 1500', 'Offer $31,000, $400 under book', 'Yes'], ['Appraisal 88219 · 2019 F-150', 'Offer $27,500, $1,650 over book', 'No']],
  leads: [['Sofia Lopez · 2025 Equinox LT', 'Pre-approved and wants to buy this week', 'Yes'], ['James Carter · Silverado', 'Browsing, no timeline yet', 'No']],
  notes: [['2021 Silverado 1500 LT · 48,210 mi', 'Recon order: front brakes, full detail, windshield chip. $1,240']],
  relnotes: [['RO-55120 · 2023 Tahoe', 'We replaced the front brake pads and rotors and topped up the coolant.']],
  triage: [['RO-55120 · 2023 Tahoe', 'Labor code 1210 doesn’t match the photos', 'Yes'], ['RO-55133 · 2022 Malibu', 'Nothing GM would reject', 'No']],
  metrics: [['Week of 9 Nov', 'Cars.com 41 leads and 9 sales. Facebook 22 leads and 3 sales.']],
  invoices: [['Deal 51204 · Maria Gonzalez', 'Payoff letter is missing', 'Yes'], ['Deal 51207 · Dwayne Hollis', 'Nothing missing', 'No']]
};
function fbBlank(k) { return { k, root: null, seq: 0, steps: {}, ver: 0, versions: [], dirty: false, res: {}, lst: {}, sample: 0, runs: [], view: null, run: null, viewing: null, sel: null }; }
function fbNew(k, A) { const s = { id: 's' + (++A.seq), num: 0, app: null, act: null, name: '', kids: [], vals: {}, br: null, skip: false, retry: false }; return s; }
function fbMk(A, app, act, name, vals, extra) { const s = fbNew(A.k, A); Object.assign(s, { app, act, name: name || fbActN({ app, act }), vals: vals || {} }, extra || {}); A.steps[s.id] = s; return s; }
function fbFromProto(k) {
  const f = FLOWS[k], A = fbBlank(k), span = {};
  const p = (sid, key) => [sid, key];
  f.nodes.filter(n => !n.hide || true).forEach(n => {
    let a, b;
    if (n.k === 'trigger') { a = b = n.tool ? fbMk(A, n.tool, 'trig', n.t, { filter: '' }) : fbMk(A, 'sched', 'every', n.t, { when: /monday/i.test(n.t) ? 'Every Monday at 08:00' : 'Every day at 08:00' }); }
    else if (n.k === 'agent') { a = b = fbMk(A, 'hf1', 'run', n.t, { agent: n.actor, ver: 'Latest approved', goal: n.t }); }
    else if (n.k === 'check') { a = b = fbMk(A, 'router', 'route', n.t, {}, { mode: 'first' }); }
    else if (n.k === 'person') {
      if (/approv|check/i.test(n.t)) { a = fbMk(A, 'approval', 'links', 'Create approval links', {}, { helper: true }); const m = fbMk(A, 'hf1', 'msg', 'Send the links to ' + first(n.actor), { agent: f.by, to: n.actor, text: '' }, { helper: true }); b = fbMk(A, 'approval', 'wait', n.t, { who: n.actor }); a.kids = [m.id]; m.kids = [b.id]; m.vals.text = [n.t + '. Approve: ', [a.id, 'approve'], ' Disapprove: ', [a.id, 'disapprove']]; }
      else { a = b = fbMk(A, 'hf1', 'msg', n.t, { agent: f.by, to: n.actor, text: n.t }); }
    } else { a = b = n.tool ? fbMk(A, n.tool, 'do', n.t, {}) : fbMk(A, 'code', 'run', n.t, {}); }
    a.pid = n.id; b.pid = n.id; span[n.id] = [a.id, b.id];
  });
  A.root = span[f.nodes[0].id][0];
  f.edges.forEach(([x, y, lab]) => {
    const from = A.steps[span[x][1]], to = A.steps[span[y][0]];
    from.kids.push(to.id);
    if (from.app === 'router') to.br = { name: lab ? lab.split(' · ')[0] : 'Branch', conds: [], other: false, lab0: lab || '' };
  });
  /* fill fields with data from earlier steps, the way HF1 maps them */
  const trig = A.steps[A.root], tOut = fbOuts(trig)[0];
  Object.values(A.steps).forEach(s => {
    const prev = fbAncestors(A, s.id), ag = prev.filter(x => x.app === 'hf1' && x.act === 'run').pop();
    if (s.app === 'hf1' && s.act === 'run' && trig.act === 'trig') s.vals.goal = [s.name + ' for ', [trig.id, tOut[0]], '.'];
    if (s.app === 'router') { const ks = s.kids.map(x => A.steps[x]); ks.forEach((c, i) => { if (i === ks.length - 1 && ks.length > 1) { c.br.other = true; } else c.br.conds = [{ a: ag ? [[ag.id, 'decision']] : [[trig.id, tOut[0]]], op: 'Is equal to', b: 'Yes' }]; }); }
    if (FB_APPS[s.app].tool && s.act === 'do') { if (s.app === 'slack') { s.vals.channel = (s.name.match(/#[\w-]+/) || ['#sales'])[0]; s.vals.text = ag ? [[ag.id, 'answer']] : s.name; } else if (s.app === 'gmail') { s.vals.to = trig.app === 'hubspot' ? [[trig.id, 'email']] : ''; s.vals.subject = s.name; s.vals.body = ag ? [[ag.id, 'answer']] : ''; } else { s.vals.record = trig.act === 'trig' ? [[trig.id, tOut[0]]] : ''; s.vals.details = ag ? [[ag.id, 'answer']] : s.name; } }
    if (s.app === 'hf1' && s.act === 'msg' && !s.helper) s.vals.text = ag ? [s.name + '. ', [ag.id, 'answer']] : s.name;
  });
  fbNumber(A);
  const st = flowStatus(k), own = AGENTS[f.by] ? AGENTS[f.by].owner : fbYou();
  A.ver = f.draft ? 0 : 3;
  if (A.ver) { const snap3 = fbSnap(A), snap2 = fbSnap(A), leaf = fbLastLeaf(snap2); if (leaf && Object.keys(snap2.steps).length > 3) fbDrop(snap2, leaf); const snap1 = fbSnap(A); if (Object.keys(snap1.steps).length > 3) { let l = fbLastLeaf(snap1); fbDrop(snap1, l); l = fbLastLeaf(snap1); if (Object.keys(snap1.steps).length > 3) fbDrop(snap1, l); }
    A.versions = [{ v: 3, when: '9 Nov, 16:20', who: own, pub: true, snap: snap3 }, { v: 2, when: '3 Nov, 11:05', who: own, snap: snap2 }, { v: 1, when: '28 Oct, 09:40', who: own, snap: snap1 }]; }
  A.samples = (FB_SAMPLES[k] || [['Sample 1', 'Done']]).map(x => ({ lab: x[0], ans: x[1], dec: x[2] || 'Yes' }));
  void st; return A;
}
function fbState(k) { if (!FBS[k]) FBS[k] = FLOWS[k].nodes && FLOWS[k].nodes.length && !FLOWS[k].fbNew ? fbFromProto(k) : Object.assign(fbBlank(k), { samples: [{ lab: 'Sample 1', ans: 'Done', dec: 'Yes' }] }); return FBS[k]; }
function fbAncestors(A, id) { const r = []; let p = fbParent(A, id); while (p) { r.unshift(p); p = fbParent(A, p.id); } return r; }
function fbParent(A, id) { return Object.values(A.steps).find(s => s.kids.includes(id)); }
function fbNumber(A) { let n = 0; const walk = id => { const s = A.steps[id]; if (!s) return; s.num = ++n; s.kids.forEach(walk); }; if (A.root) walk(A.root); }
function fbSnap(A) { return JSON.parse(JSON.stringify({ root: A.root, seq: A.seq, steps: A.steps })); }
function fbLastLeaf(sn) { let id = sn.root; while (id && sn.steps[id].kids.length) id = sn.steps[id].kids[sn.steps[id].kids.length - 1]; if (id === sn.root) return null; const p = Object.values(sn.steps).find(s => s.kids.includes(id)); return p && p.app === 'router' ? null : id; }
function fbDrop(sn, id) { if (!id) return; const p = Object.values(sn.steps).find(s => s.kids.includes(id)); if (p) p.kids = p.kids.filter(x => x !== id); delete sn.steps[id]; }
const fbCur = () => fbState(S.flow);
function fbEdit(A) { A.dirty = true; A.res = {}; A.lst = {}; fbNumber(A); }

/* ---------- canvas ---------- */
const FB_COL = 190, FB_ROW = 150, FB_OX = 120, FB_OY = 150;
function fbLayout(A, src) {
  const T = src || A, pos = {}, ends = []; let row = 0;
  if (!T.root) return { pos, ends, w: 0, h: 0 };
  const walk = (id, d) => { const s = T.steps[id]; if (!s.kids.length) { pos[id] = { x: d * FB_COL, y: row * FB_ROW }; if (s.app !== 'router') ends.push({ after: id, x: (d + 1) * FB_COL - 70, y: row * FB_ROW }); row++; return; } const ys = s.kids.map(k => { walk(k, d + 1); return pos[k].y; }); pos[id] = { x: d * FB_COL, y: (Math.min(...ys) + Math.max(...ys)) / 2 }; };
  walk(T.root, 0);
  let w = 0, h = 0; Object.values(pos).forEach(p => { w = Math.max(w, p.x); h = Math.max(h, p.y); }); ends.forEach(e => { w = Math.max(w, e.x); });
  return { pos, ends, w, h };
}
function fbCanvasHTML(A) {
  const T = A.viewing ? A.viewing.snap : A, L = fbLayout(A, T), P = id => ({ x: L.pos[id].x + FB_OX, y: L.pos[id].y + FB_OY });
  let svg = '', h = '';
  if (!T.root) return `<div class="fb-first" style="left:${FB_OX + 80}px;top:${FB_OY + 40}px"><button class="fb-end" type="button" data-fbadd="" data-fbtrig="1" aria-label="Choose a trigger">${ic('plus')}</button><b>Your flow appears here</b><small>Pick what starts it, or describe the flow to the flow assistant.</small></div>`;
  Object.values(T.steps).forEach(s => s.kids.forEach(k => {
    const a = P(s.id), b = P(k), c = T.steps[k];
    const r1 = s.app === 'router' ? 22 : 32, r2 = c.app === 'router' ? 22 : 32;
    const x1 = a.x + r1 + 6, y1 = a.y, x2 = b.x - r2 - 6, y2 = b.y, flat = Math.abs(y1 - y2) < 1;
    svg += `<path class="${A.viewing ? '' : (A.lst[k] || '')}" d="${flat ? `M${x1},${y1} L${x2},${y2}` : `M${x1},${y1} C${x1 + 55},${y1} ${x2 - 70},${y2} ${x2},${y2}`}"/>`;
    const mx = flat ? (x1 + x2) / 2 : x2 - 44, my = y2;
    if (c.br) h += `<button class="fb-br${c.br.other ? ' fb-other' : ''}" type="button" data-fbbr="${s.id}" style="left:${flat ? mx : x1 + 46}px;top:${flat ? my - 18 : (y1 + y2) / 2 + (y2 > y1 ? 6 : -6)}px">${esc(c.br.name)}${c.br.other ? ' · otherwise' : ''}</button>`;
    if (!A.viewing) h += `<button class="fb-add" type="button" data-fbins="${k}" style="left:${mx}px;top:${my + (c.br && flat ? 0 : 0)}px" aria-label="Add a step before step ${c.num}">${ic('plus')}</button>`;
  }));
  if (!A.viewing) L.ends.forEach(e => { h += `<button class="fb-end" type="button" data-fbadd="${e.after}" style="left:${e.x + FB_OX}px;top:${e.y + FB_OY}px" aria-label="Add a step after step ${T.steps[e.after].num}">${ic('plus')}</button>`; });
  Object.values(T.steps).forEach(s => {
    const p = P(s.id), F = fbFace(s), r = A.viewing ? null : A.res[s.id], tr = fbIsTrig(s);
    const cls = ['fb-step', FB_APPS[s.app].tool && !toolOk(s.app) && !r ? 'off' : '', s.app === 'router' ? 'router' : '', A.sel === s.id ? 'sel' : '', s.skip ? 'skip' : '', r ? r.st : '', A.fresh === s.id ? 'fresh' : ''].join(' ');
    const badge = r && r.st === 'ok' ? `<span class="fb-res">${ic('check')}</span>` : r && r.st === 'wait' ? `<span class="fb-res wait">${ic('clock')}</span>` : r && r.st === 'bad' ? `<span class="fb-res bad">${ic('x')}</span>` : '';
    const lab = s.app === 'router' ? `<b>${esc(s.name)}</b><small>Router · ${s.kids.length} branches</small>` : `<b>${s.num}. ${esc(s.name.length > 46 ? s.name.slice(0, 44) + '…' : s.name)}</b><small>${esc(FB_APPS[s.app].n)}${s.skip ? ' · skipped' : ''}</small>`;
    h += `<div class="${cls}" data-fbstep="${s.id}" style="left:${p.x}px;top:${p.y}px"><button class="fb-bub" type="button" data-fbopen="${s.id}" style="--bg:${F.bg};--fg:${F.fg}" aria-label="Step ${s.num}: ${esc(s.name)}">${F.h}${tr ? `<span class="fb-trig" title="Trigger">${ic(s.app === 'sched' ? 'clock' : 'zap')}</span>` : ''}${s.app === 'router' ? '' : `<span class="fb-num">${s.num}</span>`}${badge}</button><div class="fb-lab">${lab}</div></div>`;
  });
  const W = L.w + FB_OX + 360, H = L.h + FB_OY + 260;
  return `<svg class="fb-links" width="${W}" height="${H}">${svg}</svg>${h}`;
}
function fbDraw() { const A = fbCur(), w = $('#fbWorld'); if (!w) return; w.innerHTML = fbCanvasHTML(A); fbApply(); A.fresh = null; }
function fbApply() { const A = fbCur(), w = $('#fbWorld'); if (!w || !A.view) return; w.style.transform = `translate(${A.view.x}px,${A.view.y}px) scale(${A.view.z})`; const z = $('#fbZ'); if (z) z.textContent = Math.round(A.view.z * 100) + '%'; }
function fbFit() {
  const A = fbCur(), st = $('#fbStage'); if (!st) return;
  const r = st.getBoundingClientRect(), L = fbLayout(A, A.viewing ? A.viewing.snap : A);
  const left = 16, right = S.panel && r.width > 760 ? 360 : 16;
  const bw = A.root ? L.w + FB_OX + 200 : 420, bh = A.root ? L.h + FB_OY + 140 : 300;
  const aw = Math.max(200, r.width - left - right), ah = r.height - 60;
  const z = A.root ? Math.max(.5, Math.min(1, aw / bw, ah / bh)) : 1;
  A.view = { z, x: bw * z > aw ? left - 30 * z : left + (aw - bw * z) / 2, y: (ah - bh * z) / 2 + 6, auto: true };
  fbApply();
}
function fbZoom(f) { const A = fbCur(), st = $('#fbStage'); if (!st || !A.view) return; const r = st.getBoundingClientRect(), px = r.width / 2, py = r.height / 2, z = Math.max(.3, Math.min(1.6, A.view.z * f)); A.view.x = px - (px - A.view.x) * z / A.view.z; A.view.y = py - (py - A.view.y) * z / A.view.z; A.view.z = z; A.view.auto = false; fbApply(); }

/* ---------- page parts ---------- */
function fbPage() {
  const A = fbCur();
  return `<div class="fb noasst" id="fb"><div class="fb-stage" id="fbStage"><div class="fb-world" id="fbWorld"></div></div>
    ${A.viewing ? `<div class="fb-banner">Viewing version #${A.viewing.v}<button class="btn btn-s sm" type="button" data-fbusev="${A.viewing.v}">Use as draft</button><button class="btn btn-p sm" type="button" data-fbunview>Back to the draft</button></div>` : ''}
    <div class="fb-ui"><div class="zoom"><button type="button" data-fbz="out" aria-label="Zoom out">${ic('min')}</button><output id="fbZ">100%</output><button type="button" data-fbz="in" aria-label="Zoom in">${ic('plus')}</button><button type="button" data-fbz="fit" aria-label="Fit to screen">${ic('expand')}</button></div><button class="fb-hfhint" type="button" data-fbhf title="HF1 knows which flow and step you’re on">${hfOrb(16)}<span>${A.root ? 'Ask HF1 about this flow' : 'Tell HF1 what to automate'}</span><kbd>${/Mac/.test(navigator.platform) ? '⌘' : 'Ctrl '}K</kbd></button></div></div>`;
}
function fbToolbar() {
  const k = S.flow, f = FLOWS[k], A = fbCur(), st = flowStatus(k);
  const live = A.ver ? `version #${A.ver} published` : 'not published yet';
  return `<button type="button" class="pt-back" data-fbback>${ic('arrowL')}Flows</button>
    <input class="fb-name" id="fbName" value="${esc(f.n)}" aria-label="Flow name" autocomplete="off">
    <span class="chip ${chipCls(st)}">${FST[st][0]}</span>
    <span class="fb-meta fb-mstage"><span class="pdot" style="--pc:var(--accent)"></span>${esc(PROJ[f.p].n)} · Building stage</span>
    <span class="fb-meta fb-msave${A.dirty ? ' dirty' : ''}">${!A.ver ? ic('check') + 'Saved · not published yet' : A.dirty ? ic('pencil') + 'Unpublished changes · version #' + A.ver + ' is running' : ic('check') + 'Saved · ' + live}</span>
    <span class="grow"></span>
    <button class="btn btn-s" type="button" data-fbtest>${ic('play')}<span class="fb-tl">Test</span></button>
    <button class="btn btn-p" type="button" data-fbpub>Publish</button>
    <button class="ib" type="button" data-fbmore aria-label="More actions for ${esc(f.n)}">${ic('dots')}</button>`;
}
function fbMount() {
  const pv = $('#pv'); pv.hidden = false; pv.classList.add('fbx'); pv.innerHTML = fbPage();
  const A = fbCur(); fbDraw();
  if (!A.view) setTimeout(fbFit, 30); else fbApply();
  const st = $('#fbStage'); if (st && window.ResizeObserver) { let w0 = 0; new ResizeObserver(en => { const w = Math.round(en[0].contentRect.width); if (w && w !== w0) { w0 = w; const B = fbOn() && fbCur(); if (B && (!B.view || B.view.auto)) fbFit(); } }).observe(st); }
  if (!A.root && !A.greeted && S.ob.done) { A.greeted = true; setTimeout(() => { if (fbOn() && !fbCur().root) fbHfOpen(); }, 350); }
}

/* ---------- right panel ---------- */
function fbHead(s, extra) { const F = fbFace(s, 30); return `<div class="fb-ph"><span class="mini" style="--bg:${F.bg};--fg:${F.fg}">${F.h}</span><input id="fbStepName" value="${esc(s.name)}" aria-label="Step name">${extra || ''}<button class="ib" type="button" data-fbx aria-label="Close">${ic('x')}</button></div>`; }
function fbPillHTML(A, sid, key) { const s = A.steps[sid]; if (!s) return ''; const o = fbOuts(s).find(x => x[0] === key); return `<span class="fb-pill" contenteditable="false" data-ref="${sid}:${key}">${s.num}. ${esc(o ? o[1] : key)}</span>`; }
function fbVal(A, v) { if (v == null) return ''; if (typeof v === 'string') return esc(v); return v.map(p => typeof p === 'string' ? esc(p) : fbPillHTML(A, p[0], p[1])).join(''); }
function fbParts(el) { const out = []; el.childNodes.forEach(c => { if (c.nodeType === 3) out.push(c.textContent); else if (c.dataset && c.dataset.ref) out.push(c.dataset.ref.split(':')); else out.push(c.textContent); }); return out.filter(x => x !== ''); }
function fbText(A, v, data) { if (v == null) return ''; if (typeof v === 'string') return v; return v.map(p => typeof p === 'string' ? p : ((data[p[0]] || {})[p[1]] != null ? data[p[0]][p[1]] : '…')).join(''); }
function fbField(A, s, f) {
  const [key, lab, type, opts] = f, v = s.vals[key];
  if (type === 'select' || type === 'agent' || type === 'person') {
    const o = type === 'agent' ? opts.map(a => [a, AGENTS[a].n + ' · ' + AGENTS[a].job]) : type === 'person' ? opts.map(p => [p, nameOf(p)]) : opts.map(x => [x, x]);
    return `<div class="field"><label for="fbf-${key}">${lab}</label><select class="inp" id="fbf-${key}" data-fbf="${key}">${o.map(([a, b]) => `<option value="${esc(a)}"${a === (v || o[0][0]) ? ' selected' : ''}>${esc(b)}</option>`).join('')}</select></div>`;
  }
  return `<div class="field"><span class="lab" id="fbl-${key}">${lab}</span><div class="fb-ce${type === 'long' ? ' long' : ''}" contenteditable="true" role="textbox" aria-labelledby="fbl-${key}" data-fbf="${key}" data-ph="Type, or pick data from an earlier step">${fbVal(A, v)}</div></div>`;
}
function fbStepPanel(A, s) {
  const order = Object.values(A.steps).sort((a, b) => a.num - b.num), i = order.indexOf(s);
  const nav = `<button class="ib" type="button" data-fbnav="${order[i - 1] ? order[i - 1].id : ''}" aria-label="Previous step"${order[i - 1] ? '' : ' disabled'}>${ic('back')}</button><button class="ib" type="button" data-fbnav="${order[i + 1] ? order[i + 1].id : ''}" aria-label="Next step"${order[i + 1] ? '' : ' disabled'}>${ic('right')}</button><button class="ib" type="button" data-fbsmenu="${s.id}" aria-label="Step actions">${ic('dots')}</button>`;
  const T = FB_APPS[s.app].tool, ok = T && toolOk(s.app);
  const conn = T ? `<div class="field"><span class="lab">Connection</span><div class="fb-conn${ok ? '' : ' off'}">${ct(s.app)}<span class="grow"><b>${esc(tname(s.app))}</b><small>${ok ? 'The project’s connection · Connected' : 'Not connected yet'}</small></span>${ok ? '' : `<button class="btn btn-s sm" type="button" data-connect="${s.app}">Connect</button>`}</div></div>` : '';
  let body = conn;
  if (s.app === 'router') return fbRouterPanel(A, s, nav);
  if (s.act === 'trig' || s.app === 'sched' || s.app === 'hook') {
    body += fbFields(s).map(f => fbField(A, s, f)).join('');
    body += `<div class="sect"><div class="sect-h">Sample data</div><p class="pn-lead" style="margin:0;font-size:var(--t-1)">Test runs the flow with the sample you pick.</p>${A.samples.map((x, j) => `<button type="button" class="fb-samp" role="radio" aria-checked="${A.sample === j}" data-fbsamp="${j}"><span class="rd"></span><span><b style="font-weight:500">${esc(x.lab)}</b><small>Loaded from ${esc(FB_APPS[s.app].n)} · ${j ? 'yesterday' : 'today'}</small></span></button>`).join('')}</div>`;
  } else {
    body += fbFields(s).map(f => fbField(A, s, f)).join('') || (s.app === 'approval' && s.act === 'wait' ? `<div class="note">${ic('clock')}<span>The flow pauses here until someone opens one of the links from step ${(fbAncestors(A, s.id).find(x => x.act === 'links') || { num: '?' }).num}. ${s.vals.who ? esc(first(s.vals.who)) + ' gets them in Slack.' : ''}</span></div>` : s.app === 'approval' ? `<div class="note">${ic('userck')}<span>Makes an Approve and a Disapprove link. Send them to someone in the next step.</span></div>` : '');
    if (s.app === 'hf1') body += `<div class="note">${ic('lock')}<span>The agent works within its own rules and apps. Anything it sends outside the company still asks first.</span></div>`;
    body += `<div class="sect"><div class="sect-h">Error handling</div><button type="button" class="fb-tog" role="switch" aria-checked="${!!s.retry}" data-fbretry="${s.id}"><span class="sw"><i></i></span><span>Retry on failure<small>Retries up to 4 times before the step fails.</small></span></button></div>`;
  }
  const r = A.res[s.id];
  const io = r && r.out ? `<div class="sect"><div class="sect-h">Last test</div><div class="fb-io">${fbOuts(s).map(o => `<span>${esc(o[1])}</span><span>${esc(r.out[o[0]] != null ? r.out[o[0]] : '—')}</span>`).join('')}</div></div>` : '';
  return fbHead(s, nav) + `<div class="fb-sub">${esc(FB_APPS[s.app].n)} · ${esc(fbActN(s))}</div><div class="pn-b">${body}${io}</div><div class="pn-f"><button class="btn btn-s" type="button" data-fbtone="${s.id}">${ic('play')}${fbIsTrig(s) ? 'Test trigger' : 'Test step'}</button><span class="grow"></span><button class="btn btn-p" type="button" data-fbx>Done</button></div>`;
}
const FB_OPS = ['Is equal to', 'Is not equal to', 'Contains', 'Does not contain', 'Is greater than', 'Is less than', 'Exists', 'Does not exist'];
function fbRouterPanel(A, s, nav) {
  const brs = s.kids.map(k => A.steps[k]);
  const card = c => c.br.other ? `<div class="fb-branch other"><b style="color:var(--ink);font-weight:500">${esc(c.br.name)} · Otherwise</b><span>Runs when no other branch matches. Goes to step ${c.num}.</span></div>`
    : `<div class="fb-branch"><div class="fb-branch-h"><input class="inp" value="${esc(c.br.name)}" data-fbbname="${c.id}" aria-label="Branch name"><button class="ib" type="button" data-fbbdel="${c.id}" aria-label="Delete branch">${ic('trash')}</button></div>
      ${c.br.conds.map((q, i) => `<div class="fb-cond"><div class="fb-ce" contenteditable="true" role="textbox" aria-label="First value" data-fbcf="${c.id}:${i}:a" data-ph="Pick data from an earlier step">${fbVal(A, q.a)}</div><select class="inp" data-fbcop="${c.id}:${i}" aria-label="Condition">${FB_OPS.map(o => `<option${o === q.op ? ' selected' : ''}>${o}</option>`).join('')}</select><div class="fb-ce" contenteditable="true" role="textbox" aria-label="Second value" data-fbcf="${c.id}:${i}:b" data-ph="A value">${fbVal(A, q.b)}</div></div>`).join('')}
      <button class="btn btn-g sm" type="button" data-fbcadd="${c.id}" style="align-self:flex-start">${ic('plus')}Add a condition</button><small class="faint" style="font-size:var(--t-1)">Goes to step ${c.num}.</small></div>`;
  return fbHead(s, nav) + `<div class="fb-sub">Router · ${brs.length} branches</div><div class="pn-b">
    <div class="field"><label for="fbMode">Run</label><select class="inp" id="fbMode" data-fbmode="${s.id}"><option value="first"${s.mode !== 'all' ? ' selected' : ''}>Only the first branch that matches</option><option value="all"${s.mode === 'all' ? ' selected' : ''}>Every branch that matches</option></select></div>
    <div class="sect"><div class="sect-h">Branches</div>${brs.filter(c => !c.br.other).map(card).join('')}${brs.filter(c => c.br.other).map(card).join('')}</div>
    <button class="btn btn-s" type="button" data-fbbadd="${s.id}" style="align-self:flex-start">${ic('plus')}Add a branch</button></div>
    <div class="pn-f"><span class="grow"></span><button class="btn btn-p" type="button" data-fbx>Done</button></div>`;
}
function fbRunPanel(A) {
  const R = A.run; if (!R) return fbHead2('Test run') + '<div class="pn-b"><p class="pn-lead">No test yet. Press Test at the top to run the flow with the sample from the trigger.</p></div>';
  const lab = { run: 'Running', ok: 'Succeeded', bad: 'Failed', wait: 'Waiting', stop: 'Stopped' }[R.st], cls = { run: 'run', ok: '', bad: 'amber', wait: 'amber', stop: '' }[R.st];
  const order = Object.values(A.steps).sort((a, b) => a.num - b.num).filter(s => A.res[s.id] && A.res[s.id].st !== 'notrun');
  const icon = st => st === 'ok' ? stIcon('done') : st === 'run' ? stIcon('progress') : st === 'wait' ? stIcon('wait') : st === 'bad' ? `<span class="fb-badx">${ic('x')}</span>` : stIcon('todo');
  const rows = order.map(s => { const r = A.res[s.id]; const open = R.open === s.id; const data = {}; Object.keys(A.res).forEach(id => { if (A.res[id] && A.res[id].out) data[id] = A.res[id].out; });
    return `<div><div class="h">${icon(r.st)}<span class="grow">${s.num}. ${esc(s.name)}</span><small>${r.t || ''}</small>${r.out || r.st === 'bad' ? `<button type="button" data-fbio="${s.id}">${open ? 'Hide' : 'See input and output'}</button>` : ''}</div>${open ? `<div class="fb-io">${fbFields(s).filter(f => s.vals[f[0]] != null && s.vals[f[0]] !== '').map(f => `<span>${esc(f[1])}</span><span>${esc(fbText(A, s.vals[f[0]], data).slice(0, 300))}</span>`).join('')}${r.out ? fbOuts(s).map(o => `<span>→ ${esc(o[1])}</span><span>${esc(r.out[o[0]] != null ? r.out[o[0]] : '—')}</span>`).join('') : ''}</div>` : ''}</div>`; }).join('');
  const bad = R.st === 'bad' ? `<div class="fb-err"><b>${ic('warn')}Why it failed</b><span>${esc(R.err)}</span>${R.need && !toolOk(R.need) ? `<div class="row" style="display:flex;gap:6px"><button class="btn btn-s sm" type="button" data-connect="${R.need}">Connect ${esc(TOOLS[R.need].n)}</button></div>` : ''}${!R.need || toolOk(R.need) ? `<div style="display:flex;gap:6px"><button class="btn btn-p sm" type="button" data-fbreplay="${R.failAt}">${ic('refresh')}Replay from the failed step</button></div>` : ''}</div>` : '';
  const wait = R.st === 'wait' ? `<div class="attn"><div class="attn-t"><span class="dot"></span>Waiting for ${esc(R.waitWho ? nameOf(R.waitWho) : 'an approval')}</div><div style="font-size:var(--t-1);color:var(--ink-2)">The approval links went to ${esc(R.waitWho ? first(R.waitWho) : 'them')} in Slack. The run carries on when one of them is opened.</div><div style="display:flex;gap:6px;flex-wrap:wrap"><button class="btn btn-p sm" type="button" data-fbappr="yes">Approve${R.waitWho && R.waitWho !== fbYou() ? ' as ' + esc(first(R.waitWho)) : ''}</button><button class="btn btn-s sm" type="button" data-fbappr="no">Disapprove</button></div><small class="faint" style="font-size:10.5px">Prototype control: in HF1 the decision comes from the link.</small></div>` : '';
  return fbHead2((R.kind || 'Test run')) + `<div class="pn-b"><div class="psum"><div class="psum-l" style="display:flex;gap:8px;align-items:center;flex-wrap:wrap"><span class="chip ${cls}">${lab}</span><span class="faint" style="font-size:var(--t-1)">${esc(A.samples[R.sample].lab)}${R.took ? ' · ' + R.took : ''}</span></div></div>${bad}${wait}<div class="sect"><div class="sect-h">Step by step</div><div class="fb-rs">${rows || '<p class="pn-lead">Starting…</p>'}</div></div></div>`;
}
function fbHead2(t) { return `<div class="pn-h"><span class="grow">${t}</span><button class="ib" type="button" data-fbx aria-label="Close panel">${ic('x')}</button></div>`; }
function fbRunsPanel(A) {
  const f = FLOWS[S.flow];
  const mine = A.runs.map((r, i) => `<button type="button" class="vs vs-b" data-fbrunopen="${i}" style="width:100%">${r.st === 'ok' ? stIcon('done') : r.st === 'wait' ? stIcon('wait') : `<span class="fb-badx">${ic('x')}</span>`}<span class="grow"><b>${esc(r.kind)} · ${esc(r.when)}</b><small>${esc(r.lab)}</small></span></button>`).join('');
  const old = (f.runs ? RUNS.slice(0, Math.min(4, f.runs)) : []).map(([w, r]) => `<div class="vs">${stIcon('done')}<span class="grow"><b>${w}</b><small>${r}</small></span></div>`).join('');
  return fbHead2('Runs') + `<div class="pn-b"><p class="pn-lead" style="margin:0">Every time this flow ran, whether it worked, and what it did step by step.</p><div class="vsteps">${mine}${old}</div>${!mine && !old ? '<p class="pn-lead">No runs yet.</p>' : ''}</div>`;
}
function fbVerPanel(A) {
  const rows = (A.dirty || !A.ver ? `<div class="fb-ver"><span class="vd dr" title="Draft"></span><span class="grow"><b>Draft</b><small>${A.dirty ? 'Unpublished changes' : 'Not published yet'}</small></span></div>` : '') + A.versions.map(v => `<div class="fb-ver"><span class="vd ${v.pub ? 'pub' : ''}" title="${v.pub ? 'Published' : ''}" style="${v.pub ? '' : 'background:var(--line-2)'}"></span><span class="grow"><b>Version #${v.v}</b><small>${esc(v.when)} · ${esc(first(v.who))}${v.pub ? ' · published' : ''}</small></span><button class="ib" type="button" data-fbvmenu="${v.v}" aria-label="Version ${v.v} actions">${ic('dots')}</button></div>`).join('');
  return fbHead2('Version history') + `<div class="pn-b"><div>${rows || '<p class="pn-lead">Nothing published yet.</p>'}</div></div>`;
}
function fbPanel() {
  const A = fbCur(), P = S.panel;
  if (P === 'fbstep') { const s = A.steps[A.sel]; if (!s) { S.panel = null; return; } panel.innerHTML = fbStepPanel(A, s); }
  else if (P === 'fbrun') panel.innerHTML = fbRunPanel(A);
  else if (P === 'fbruns') panel.innerHTML = fbRunsPanel(A);
  else if (P === 'fbver') panel.innerHTML = fbVerPanel(A);
}

/* ---------- data selector ---------- */
let fbFocus = null;
const fbDS = document.createElement('section'); fbDS.className = 'fb-ds'; fbDS.hidden = true; fbDS.setAttribute('aria-label', 'Data from earlier steps');
function fbDSOpen(el) {
  const A = fbCur(); fbFocus = el;
  const sid = S.panel === 'fbstep' ? A.sel : null; if (!sid) return;
  const prev = fbAncestors(A, sid).filter(s => fbOuts(s).length);
  fbDS.innerHTML = `<div class="fb-ds-h">${ic('flow')}<b>Data from earlier steps</b><span class="faint">Click to add</span></div><div class="fb-ds-b">${prev.length ? prev.map(s => { const F = fbFace(s, 16), r = A.res[s.id]; return `<div class="fb-ds-g"><div>${FB_APPS[s.app].tool ? ct(s.app) : s.app === 'hf1' && s.vals.agent ? av(s.vals.agent, 16) : `<span class="ct" style="--tc:#5d616b">${s.num}</span>`}${s.num}. ${esc(s.name)}</div>${fbOuts(s).map(o => `<button type="button" class="fb-ds-i" data-fbmap="${s.id}:${o[0]}"><span>${esc(o[1])}</span><small>${esc((r && r.out && r.out[o[0]]) || o[2])}</small></button>`).join('')}</div>`; }).join('') : '<p class="faint" style="padding:8px;margin:0;font-size:var(--t-1)">This is the first step, so there’s no earlier data.</p>'}</div>`;
  if (!fbDS.isConnected) $('#area').appendChild(fbDS);
  fbDS.hidden = false;
}
function fbDSHide() { fbDS.hidden = true; fbFocus = null; }
fbDS.addEventListener('mousedown', e => e.preventDefault());
fbDS.addEventListener('click', e => {
  const b = e.target.closest('[data-fbmap]'); if (!b || !fbFocus) return;
  const [sid, key] = b.dataset.fbmap.split(':'), A = fbCur();
  const t = document.createElement('span'); t.innerHTML = fbPillHTML(A, sid, key); const pill = t.firstChild;
  const sel = getSelection();
  if (sel.rangeCount && fbFocus.contains(sel.getRangeAt(0).startContainer)) { const r = sel.getRangeAt(0); r.deleteContents(); r.insertNode(pill); r.setStartAfter(pill); r.collapse(true); sel.removeAllRanges(); sel.addRange(r); } else fbFocus.appendChild(pill);
  fbFocus.dispatchEvent(new Event('input', { bubbles: true })); fbFocus.focus();
});

/* ---------- editing ---------- */
function fbOpenStep(id) { const A = fbCur(); if (A.viewing) return; A.sel = id; S.panel = 'fbstep'; S.sel = null; fbDraw(); renderPanel(); }
function fbClose() { const A = fbCur(); A.sel = null; S.panel = null; fbDSHide(); fbDraw(); renderPanel(); if (A.view && A.view.auto) fbFit(); }
function fbAdd(A, opt, app, act) {
  const s = fbMk(A, app, act, null, {});
  fbFields(s).forEach(f => { if (f[2] === 'agent') s.vals[f[0]] = FLOWS[S.flow].by; if (f[2] === 'person') s.vals[f[0]] = fbYou(); });
  if (opt.trig) { A.root = s.id; }
  else if (opt.before) { const p = fbParent(A, opt.before), c = A.steps[opt.before]; p.kids[p.kids.indexOf(opt.before)] = s.id; s.kids = [opt.before]; s.br = c.br; c.br = null; if (app === 'router') { c.br = { name: 'Branch 1', conds: [], other: false }; const o = fbMk(A, 'code', 'run', 'Nothing to do yet', {}); o.br = { name: 'Otherwise', conds: [], other: true }; s.kids.push(o.id); } }
  else { const p = A.steps[opt.after]; if (p.app === 'router') { s.br = { name: 'Branch ' + p.kids.length, conds: [], other: false }; const oth = p.kids.findIndex(k => A.steps[k].br && A.steps[k].br.other); if (oth >= 0) p.kids.splice(oth, 0, s.id); else p.kids.push(s.id); } else { s.kids = p.kids; p.kids = [s.id]; } }
  if (app === 'router' && !opt.before) { const b1 = fbMk(A, 'code', 'run', 'Nothing to do yet', {}); b1.br = { name: 'Branch 1', conds: [], other: false }; s.kids.forEach(k => { if (!A.steps[k].br) A.steps[k].br = { name: 'Otherwise', conds: [], other: true }; }); s.kids.unshift(b1.id); if (s.kids.length === 1) { const o = fbMk(A, 'code', 'run', 'Nothing to do yet', {}); o.br = { name: 'Otherwise', conds: [], other: true }; s.kids.push(o.id); } }
  fbEdit(A); A.fresh = s.id; return s;
}
function fbRemove(A, id) {
  const s = A.steps[id]; if (!s) return;
  if (id === A.root && s.kids.length) { toast('Replace the trigger instead. A flow always starts with one.'); return; }
  const p = fbParent(A, id), drop = x => { A.steps[x].kids.forEach(drop); delete A.steps[x]; };
  if (s.app === 'router' || !p) { const keep = s.app === 'router' ? (s.kids.map(k => A.steps[k]).find(c => !c.br.other) || null) : null; if (p) { const i = p.kids.indexOf(id); if (keep) { s.kids.filter(k => k !== keep.id).forEach(drop); p.kids[i] = keep.id; keep.br = s.br; } else { drop(id); p.kids.splice(i, 1); } if (keep) delete A.steps[id]; } else { drop(id); A.root = null; } }
  else { const i = p.kids.indexOf(id); const c = s.kids[0] ? A.steps[s.kids[0]] : null; if (c) c.br = s.br; p.kids.splice(i, 1, ...s.kids); delete A.steps[id]; }
  if (A.sel === id) { A.sel = null; S.panel = null; }
  fbEdit(A); fbDraw(); renderPanel(); renderPtool(); toast(`Deleted step ${s.num}.`);
}
let fbClip = null;
function fbStepMenu(id, anchor) {
  const A = fbCur(), s = A.steps[id];
  popMenu(anchor, `${s.num}. ${esc(s.name)}`, [
    { t: 'Replace', ic: ic('refresh'), fn: () => fbPick({ replace: id, trig: fbIsTrig(s) }) },
    { t: 'Copy', ic: ic('copy'), fn: () => { fbClip = JSON.parse(JSON.stringify({ app: s.app, act: s.act, name: s.name, vals: s.vals })); toast(`Copied step ${s.num}.`); } },
    ...(fbIsTrig(s) || s.app === 'router' ? [] : [{ t: 'Duplicate', ic: ic('copy'), fn: () => { const n = fbAdd(A, { after: id }, s.app, s.act); n.name = s.name + ' (copy)'; n.vals = JSON.parse(JSON.stringify(s.vals)); fbDraw(); renderPtool(); fbOpenStep(n.id); } }]),
    ...(fbIsTrig(s) ? [] : [{ t: s.skip ? 'Don’t skip' : 'Skip', ic: ic('pause'), fn: () => { s.skip = !s.skip; fbEdit(A); fbDraw(); renderPtool(); toast(s.skip ? `Step ${s.num} is skipped. Runs go straight past it.` : `Step ${s.num} runs again.`); } }]),
    { t: 'Copy reference', ic: ic('flow'), fn: () => toast(`Copied a reference to step ${s.num}. Paste it into a field to use its data.`) },
    ...(fbClip && s.app !== 'router' ? [{ t: 'Paste after', ic: ic('plus'), fn: () => { const n = fbAdd(A, { after: id }, fbClip.app, fbClip.act); n.name = fbClip.name; n.vals = JSON.parse(JSON.stringify(fbClip.vals)); fbDraw(); renderPtool(); fbOpenStep(n.id); } }] : []),
    { t: 'Delete', ic: ic('trash'), fn: () => fbRemove(A, id) }]);
}

/* ---------- step picker ---------- */
const FBP = { opt: null, app: null, cat: 'All', q: '' };
const fbScrim = document.createElement('div'); fbScrim.className = 'fb-scrim'; fbScrim.hidden = true; document.body.appendChild(fbScrim);
function fbPick(opt) { Object.assign(FBP, { opt, app: opt.replace ? fbCur().steps[opt.replace].app : null, cat: 'All', q: '' }); if (opt.replace && Object.values(FB_APPS[FBP.app].acts).filter(a => (a.k === 'Trigger') === !!opt.trig).length < 2) FBP.app = null; fbPickRender(); fbScrim.hidden = false; setTimeout(() => { const i = $('#fbQ'); if (i) i.focus(); }, 30); }
function fbPickRender() {
  const trig = !!FBP.opt.trig, q = FBP.q.toLowerCase();
  let body;
  if (!FBP.app) {
    const apps = Object.keys(FB_APPS).filter(k => { const A = FB_APPS[k], acts = Object.values(A.acts).filter(a => (a.k === 'Trigger') === trig); return acts.length && (FBP.cat === 'All' || A.cat === FBP.cat) && (!q || A.n.toLowerCase().includes(q) || acts.some(a => a.n.toLowerCase().includes(q))); });
    body = `<div class="fb-apps">${apps.map(k => { const F = fbAppFace(k); return `<button type="button" class="fb-app" data-fbpapp="${k}"><i style="--bg:${F.bg};--fg:${F.fg}">${F.h}</i><span>${esc(FB_APPS[k].n)}</span><small>${FB_APPS[k].tool ? (toolOk(k) ? 'Connected' : 'Not connected') : esc(FB_APPS[k].cat)}</small></button>`; }).join('') || '<p class="faint">Nothing matches. Try another word.</p>'}</div>`;
  } else {
    const A = FB_APPS[FBP.app], F = fbAppFace(FBP.app);
    body = `<div style="display:flex;align-items:center;gap:8px;padding:2px 2px 8px"><button class="btn btn-g sm" type="button" data-fbpback>${ic('back')}All</button><span class="fb-app" style="flex-direction:row;padding:0;gap:8px"><i style="--bg:${F.bg};--fg:${F.fg};width:28px;height:28px">${F.h}</i><b>${esc(A.n)}</b></span></div><div class="fb-acts">${Object.entries(A.acts).filter(([, a]) => (a.k === 'Trigger') === trig).map(([id, a]) => `<button type="button" class="fb-act" data-fbpact="${id}"><span class="k">${a.k}</span><span><b style="font-weight:500">${esc(a.n)}</b><small>${esc(a.d)}</small></span></button>`).join('')}</div>`;
  }
  fbScrim.innerHTML = `<section class="fb-pick" role="dialog" aria-label="${trig ? 'Choose a trigger' : 'Add a step'}"><div class="fb-pick-h">${ic('search')}<input id="fbQ" value="${esc(FBP.q)}" placeholder="${trig ? 'Search triggers' : 'Search apps and actions'}" autocomplete="off"><button class="ib" type="button" data-fbpx aria-label="Close">${ic('x')}</button></div>${FBP.app ? '' : `<div class="fb-cats">${FB_CATS.map(c => `<button type="button" data-fbpcat="${c}" aria-pressed="${FBP.cat === c}">${c}</button>`).join('')}</div>`}<div class="fb-pick-b">${body}</div></section>`;
}
function fbPickDone(act) {
  const A = fbCur(), o = FBP.opt, app = FBP.app; fbScrim.hidden = true;
  if (o.replace) { const s = A.steps[o.replace]; s.app = app; s.act = act; s.name = fbActN(s); s.vals = {}; fbFields(s).forEach(f => { if (f[2] === 'agent') s.vals[f[0]] = FLOWS[S.flow].by; }); fbEdit(A); fbDraw(); renderPtool(); fbOpenStep(s.id); return; }
  const s = fbAdd(A, o, app, act); fbDraw(); renderPtool(); fbOpenStep(s.id);
  requestAnimationFrame(() => { const el = document.querySelector(`[data-fbstep="${s.id}"]`), st = $('#fbStage'); if (el && st) { const r = el.getBoundingClientRect(), q = st.getBoundingClientRect(); if (r.right > q.right - 360 || r.left < q.left + 330 || r.bottom > q.bottom) fbFit(); } });
}
fbScrim.addEventListener('click', e => {
  const t = e.target; let b;
  if (t === fbScrim || t.closest('[data-fbpx]')) { fbScrim.hidden = true; return; }
  if ((b = t.closest('[data-fbpcat]'))) { FBP.cat = b.dataset.fbpcat; fbPickRender(); return; }
  if ((b = t.closest('[data-fbpapp]'))) { FBP.app = b.dataset.fbpapp; const acts = Object.entries(FB_APPS[FBP.app].acts).filter(([, a]) => (a.k === 'Trigger') === !!FBP.opt.trig); if (acts.length === 1) { fbPickDone(acts[0][0]); return; } fbPickRender(); return; }
  if (t.closest('[data-fbpback]')) { FBP.app = null; fbPickRender(); return; }
  if ((b = t.closest('[data-fbpact]'))) { fbPickDone(b.dataset.fbpact); return; }
});
fbScrim.addEventListener('input', e => { if (e.target.id === 'fbQ') { FBP.q = e.target.value; const p = e.target.selectionStart; fbPickRender(); const i = $('#fbQ'); i.focus(); i.setSelectionRange(p, p); } });

/* ---------- test runs ---------- */
const fbSleep = ms => new Promise(r => setTimeout(r, ms));
function fbOut(A, s, sm) {
  const o = Object.fromEntries(fbOuts(s).map(x => [x[0], x[2]])), x = A.samples[sm];
  if (s.act === 'trig') { const k0 = fbOuts(s)[0][0]; o[k0] = x.lab.split(' · ')[0].replace(/^(Deal|Appraisal) /, ''); if (fbOuts(s)[1]) o[fbOuts(s)[1][0]] = x.lab.split(' · ')[1] || o[fbOuts(s)[1][0]]; }
  if (s.app === 'hf1' && s.act === 'run') { o.answer = x.ans; o.decision = x.dec; }
  if (s.app === 'hf1' && s.act === 'msg') o.sent = s.vals.to && PEOPLE[s.vals.to] ? first(s.vals.to) + ' in Slack' : 'Slack';
  return o;
}
function fbMarkNot(A, id) { A.res[id] = { st: 'notrun' }; A.lst[id] = 'off'; A.steps[id].kids.forEach(k => fbMarkNot(A, k)); }
async function fbRun(kind, from) {
  const A = fbCur(), k = S.flow;
  if (!A.root) { toast('Add a trigger first.'); return 'none'; }
  if (A.run && ['run', 'wait'].includes(A.run.st)) { toast('A test is already running.'); return 'busy'; }
  if (!from) { A.res = {}; A.lst = {}; }
  const R = A.run = { st: 'run', kind: kind || 'Test run', sample: A.sample, t0: performance.now(), open: null };
  S.panel = 'fbrun'; A.sel = null; renderPanel(); fbDraw();
  const res = await fbVisit(A, from || A.root, R);
  if (S.flow !== k) return res;
  R.took = ((performance.now() - R.t0) / 1000).toFixed(1) + ' s';
  if (res === 'ok') R.st = 'ok';
  A.runs.unshift({ kind: R.kind.replace(' run', ''), when: 'Just now', st: R.st === 'ok' ? 'ok' : 'bad', lab: A.samples[R.sample].lab + (R.st === 'ok' ? '' : ' · failed'), snap: { res: JSON.parse(JSON.stringify(A.res)), run: JSON.parse(JSON.stringify(R)), lst: JSON.parse(JSON.stringify(A.lst)) } });
  if (fbOn()) { fbDraw(); if (S.panel === 'fbrun') renderPanel(); renderPtool(); }
  if (R.st === 'ok') toast(`${R.kind} succeeded in ${R.took}.`);
  return res;
}
async function fbVisit(A, id, R) {
  const s = A.steps[id], k = S.flow; if (!s) return 'ok';
  if (s.skip) { A.res[id] = { st: 'notrun' }; A.lst[id] = 'off'; for (const c of s.kids) { const r = await fbVisit(A, c, R); if (r !== 'ok') return r; } return 'ok'; }
  if (fbParent(A, id)) A.lst[id] = 'go';
  A.res[id] = { st: 'run' }; if (fbOn() && S.flow === k) { fbDraw(); if (S.panel === 'fbrun') renderPanel(); }
  await fbSleep(s.app === 'hf1' && s.act === 'run' ? 1300 : s.app === 'router' ? 420 : 750);
  if (S.flow !== k) return 'gone';
  const T = FB_APPS[s.app].tool;
  if (T && !toolOk(s.app)) {
    A.res[id] = { st: 'bad', t: '0.2 s' }; A.lst[id] = 'bad'; R.st = 'bad'; R.failAt = id; R.need = s.app;
    R.err = `${tname(s.app)} isn’t connected, so ${fbIsTrig(s) ? 'the trigger can’t load data' : 'step ' + s.num + ' can’t run'}. Connect it, then replay from this step.`;
    s.kids.forEach(c => fbMarkNot(A, c)); if (fbOn()) { fbDraw(); renderPanel(); } return 'bad';
  }
  const out = fbOut(A, s, R.sample);
  if (s.app === 'approval' && s.act === 'wait') {
    A.res[id] = { st: 'wait', out: null }; R.st = 'wait'; R.waitWho = s.vals.who || null; if (fbOn()) { fbDraw(); renderPanel(); }
    const d = await new Promise(res => { R.decide = res; });
    R.decide = null; R.st = 'run';
    A.res[id] = { st: 'ok', out: { approved: d === 'yes' ? 'true' : 'false' }, t: 'waited' };
    if (d !== 'yes') { s.kids.forEach(c => fbMarkNot(A, c)); A.lst[id] = 'ok'; R.st = 'ok'; R.note = 'Disapproved'; if (fbOn()) { fbDraw(); renderPanel(); } return 'ok'; }
  } else A.res[id] = { st: 'ok', out, t: (s.app === 'hf1' && s.act === 'run' ? 1.3 : s.app === 'router' ? .1 : .7).toFixed(1) + ' s' };
  if (fbParent(A, id)) A.lst[id] = 'ok';
  if (fbOn()) { fbDraw(); if (S.panel === 'fbrun') renderPanel(); }
  if (s.app === 'router') {
    const kids = s.kids.map(c => A.steps[c]), dec = A.samples[R.sample].dec;
    const match = kids.filter(c => !c.br.other && (c.br.conds.length ? c.br.conds.every(q => { const v = fbText(A, q.a, Object.fromEntries(Object.entries(A.res).filter(([, r]) => r && r.out).map(([i, r]) => [i, r.out]))), w = fbText(A, q.b, {}); return q.op === 'Is equal to' ? v === w : q.op === 'Is not equal to' ? v !== w : q.op === 'Contains' ? v.toLowerCase().includes(w.toLowerCase()) : q.op === 'Exists' ? !!v : true; }) : dec === 'Yes'));
    const go = (s.mode === 'all' ? match : match.slice(0, 1)); if (!go.length) { const o = kids.find(c => c.br.other); if (o) go.push(o); }
    kids.forEach(c => { if (!go.includes(c)) fbMarkNot(A, c.id); });
    for (const c of go) { const r = await fbVisit(A, c.id, R); if (r !== 'ok') return r; }
    return 'ok';
  }
  for (const c of s.kids) { const r = await fbVisit(A, c, R); if (r !== 'ok') return r; }
  return 'ok';
}
async function fbTestOne(id) {
  const A = fbCur(), s = A.steps[id], T = FB_APPS[s.app].tool;
  A.res[id] = { st: 'run' }; fbDraw(); await fbSleep(700);
  if (T && !toolOk(s.app)) { A.res[id] = { st: 'bad' }; fbDraw(); renderPanel(); toast(`${tname(s.app)} isn’t connected. Connect it to test this step.`); return; }
  A.res[id] = { st: 'ok', out: fbOut(A, s, A.sample) }; fbDraw(); renderPanel(); toast(`Step ${s.num} worked. Its output is in the step’s settings.`);
}

/* ---------- publish, versions ---------- */
function fbPublish(quiet) {
  const A = fbCur(), k = S.flow, f = FLOWS[k];
  if (!A.root) { toast('Add a trigger first.'); return false; }
  if (A.ver && !A.dirty) { toast(`Version #${A.ver} is already the published one.`); return false; }
  A.ver = (A.versions[0] ? A.versions[0].v : 0) + 1; A.versions.forEach(v => v.pub = false);
  A.versions.unshift({ v: A.ver, when: 'Just now', who: fbYou(), pub: true, snap: fbSnap(A) }); A.dirty = false;
  fbSyncBack(k); f.draft = false; if (S.fpause) S.fpause[k] = false;
  renderAll(); if (!quiet) toast(`Published. Version #${A.ver} runs from now on.`); return true;
}
function fbSyncBack(k) {
  const A = FBS[k], f = FLOWS[k], old = {}; (f.nodes || []).forEach(n => { old[n.id] = n; });
  const nodes = [], edges = [], idOf = {}; let row = 0;
  const kind = s => s.act === 'trig' || s.app === 'sched' || s.app === 'hook' ? 'trigger' : s.app === 'hf1' && s.act === 'run' ? 'agent' : s.app === 'router' ? 'check' : s.app === 'approval' && s.act === 'wait' ? 'person' : 'action';
  const walk = (id, d, r) => { const s = A.steps[id]; const nid = s.pid && !s.helper && !Object.values(idOf).includes(s.pid) ? s.pid : 'x' + s.id; idOf[id] = nid; const o = old[s.pid] || {};
    nodes.push(Object.assign({}, s.pid ? o : {}, { id: nid, c: d, r, k: kind(s), t: s.name, tool: FB_APPS[s.app].tool ? s.app : undefined, actor: s.app === 'hf1' ? s.vals.agent : s.app === 'approval' && s.act === 'wait' ? s.vals.who : kind(s) === 'action' ? f.by : undefined, hide: !!s.helper || undefined }));
    s.kids.forEach((c, i) => { const rr = s.kids.length > 1 ? r + (i - (s.kids.length - 1) / 2) * 2 : r; walk(c, d + 1, rr); edges.push([nid, idOf[c], A.steps[c].br ? (A.steps[c].br.lab0 && A.steps[c].br.lab0.split(' · ')[0] === A.steps[c].br.name ? A.steps[c].br.lab0 : A.steps[c].br.name) : undefined].filter(x => x !== undefined)); }); };
  if (A.root) walk(A.root, 0, 0); void row;
  f.nodes = nodes; f.edges = edges; f.tools = [...new Set(Object.values(A.steps).filter(s => FB_APPS[s.app].tool).map(s => s.app))];
}
function fbVerMenu(v, anchor) {
  const A = fbCur(), V = A.versions.find(x => x.v === v);
  popMenu(anchor, `Version #${v}`, [
    { t: 'View', ic: ic('search'), fn: () => { A.viewing = { v, snap: V.snap }; A.sel = null; S.panel = 'fbver'; renderAll(); requestAnimationFrame(fbFit); } },
    { t: 'Use as draft', ic: ic('pencil'), fn: () => fbUseDraft(v) }]);
}
function fbUseDraft(v) { const A = fbCur(), V = A.versions.find(x => x.v === v); const s = JSON.parse(JSON.stringify(V.snap)); A.root = s.root; A.steps = s.steps; A.seq = Math.max(A.seq, s.seq); A.viewing = null; A.sel = null; fbEdit(A); A.dirty = !V.pub; renderAll(); requestAnimationFrame(fbFit); toast(V.pub ? `Your draft matches version #${v} again.` : `Version #${v} is your draft now. Publish to make it run.`); }

/* ---------- HF1 in the flow builder ----------
   No separate assistant UI: the same HF1 presence (Cmd/Ctrl K, the orb, its cards and cursor) knows it's on a flow,
   which step is open, and what can be done here. Its abilities stay inside HF1's real flow assistant:
   explain, test, failure emails, build a flow from a description, add a step. */
const FB_STARTERS = [
  { t: 'New internet leads to Slack', d: 'When a lead comes in from VinSolutions, Iris drafts a reply and the lead goes to #sales.', k: 'leads' },
  { t: 'Weekly deliveries summary', d: 'Every Monday at 08:00, find last week’s deliveries in CDK and email me a summary.', k: 'deliv' }];
const FB_BUILDS = {
  leads: { name: 'New internet leads to Slack', steps: [['hubspot', 'trig', 'A new lead comes in', {}], ['hf1', 'run', 'Check stock and draft a reply', { agent: 'iris', ver: 'Latest approved', goal: ['Check stock for ', ['$0', 'vehicle'], ' and draft a reply to ', ['$0', 'lead'], '.'] }], ['slack', 'do', 'Post the lead in #sales', { channel: '#sales', text: ['New lead: ', ['$0', 'lead'], ' wants a ', ['$0', 'vehicle'], ' (', ['$0', 'source'], '). Iris drafted: ', ['$1', 'answer']] }]], samples: [{ lab: 'Sofia Lopez · 2025 Equinox LT', ans: 'Two Equinox LT in stock. Draft reply ready with a Saturday test-drive slot.', dec: 'Yes' }], test: 'Posts one message to #sales.' },
  deliv: { name: 'Weekly deliveries summary', steps: [['sched', 'every', 'Every Monday at 08:00', { when: 'Every Monday at 08:00' }], ['qb', 'do', 'Find last week’s deliveries', { record: 'Deliveries, last 7 days', details: '' }], ['ai', 'ask', 'Write the summary', { prompt: ['Sum up these deliveries for the dealer principal in five lines: ', ['$1', 'id']], model: 'Fast' }], ['gmail', 'do', 'Email me the summary', { to: 'tom@hallowayauto.com', subject: 'Last week’s deliveries', body: [['$2', 'answer']] }]], samples: [{ lab: 'Week of 9 Nov', ans: '', dec: 'Yes' }], test: 'Sends one real email to tom@hallowayauto.com.' }
};
function fbExplain(A) {
  const order = Object.values(A.steps).sort((a, b) => a.num - b.num).filter(s => !s.helper);
  const tr = A.steps[A.root];
  return `<p>It starts when ${esc(tr.name.charAt(0).toLowerCase() + tr.name.slice(1))} (${esc(FB_APPS[tr.app].n)}).</p><ul>${order.slice(1).map(s => `<li>${s.num}. ${esc(s.name)}${s.app === 'router' ? ': ' + s.kids.map(c => esc(A.steps[c].br.name) + (A.steps[c].br.other ? ' (otherwise)' : '')).join(' or ') : s.app === 'hf1' && s.vals.agent ? ' · ' + esc(AGENTS[s.vals.agent] ? AGENTS[s.vals.agent].n : '') : ''}</li>`).join('')}</ul>`;
}
/* where you are, in one line, and what HF1 can do from here */
function fbCtx() {
  const A = fbCur(), f = FLOWS[S.flow], s = A.sel && A.steps[A.sel];
  if (A.viewing) return { say: `You’re looking at version #${A.viewing.v} of ${esc(f.n)}. It can’t be edited; use it as your draft to change it.`, sugs: ['Explain what this flow does'] };
  if (!A.root) return { say: `This is a new flow in ${esc(PROJ[f.p].n)}. Tell me what you’d like to automate and I’ll build it here, step by step, then test it with you.`, sugs: FB_STARTERS.map(x => x.d) };
  if (s) return { say: `You’re on step ${s.num}, ${esc(s.name)} (${esc(FB_APPS[s.app].n)}).`, sugs: [s.app === 'router' ? 'Explain this router' : 'Explain this step', ...(A.root !== s.id && s.app !== 'router' ? ['Test this step only'] : []), 'Test this flow'] };
  const n = Object.values(A.steps).filter(x => !x.helper).length;
  return { say: `You’re in ${esc(f.n)}: ${n} steps, ${A.ver ? (A.dirty ? 'with changes that aren’t published' : 'version #' + A.ver + ' is running') : 'not published yet'}.`, sugs: ['Explain what this flow does', 'Test this flow', 'Also email me when this flow fails'] };
}
const fbHf = (html, acts) => hfReply(html, acts && acts.map(t => ({ l: t, fn: () => hfSend(t) })));
async function fbHfTest() {
  const A = fbCur(); let v;
  await hfRun(`I’ll run every step with the sample “${esc(A.samples[A.sample].lab)}”.`, async m => {
    v = await hfAsk('[data-fbtest]', { title: 'Test the flow', body: A.building && FB_BUILDS[A.building] ? esc(FB_BUILDS[A.building].test) : 'Steps that write to apps really write. Messages may go out.', ok: 'Test it', back: () => {} });
    if (v === 'ok') { hfTrace(m, 'Starting the test'); await hfSleep(300); hfTraceDone(m); }
  });
  if (v !== 'ok') { hfReply('Okay, nothing ran.'); return; }
  const r = await fbRun('Test run'); if (!fbOn()) return;
  if (r === 'ok' && fbCur().building) { await hfReply('The test worked. Open any step to see what went in and what came out.'); fbHfPublish(); return; }
  hfReply(r === 'ok' ? 'The test worked. Open any step to see what went in and what came out.' : r === 'bad' ? 'The test stopped at a step that couldn’t run. The panel on the right says why.' : r === 'wait' ? 'The test is waiting for someone. The panel on the right shows who.' : 'The test didn’t start.');
}
async function fbHfPublish() {
  const k = S.flow; let v;
  await hfRun('', async () => { v = await hfAsk('[data-fbpub]', { title: `Publish “${FLOWS[k].n}”`, body: `Version #1 goes to the Building stage of ${esc(PROJ[FLOWS[k].p].n)} and starts running.`, ok: 'Publish' }); });
  if (v !== 'ok' || S.flow !== k) { hfReply('Okay. It stays a draft until you publish.'); return; }
  if (fbPublish(true)) { fbCur().building = false; hfReply(`Published version #1. ${esc(FLOWS[k].n)} is running.`); toast('Published. Version #1 runs from now on.'); }
}
async function fbHfMail() {
  const p = PROJ[FLOWS[S.flow].p].n; let v;
  await hfRun(`Failure emails are set for the whole project. I can add you to the people who get one when a flow in ${esc(p)} fails, outside test runs.`, async () => { v = await hfAsk('[data-fbmore]', { title: 'Add you to failure emails', body: 'Project: ' + esc(p), ok: 'Add me' }); });
  hfReply(v === 'ok' ? `Done. You’ll get an email when a flow in ${esc(p)} fails.` : 'Okay, nothing changed.');
}
async function fbHfBuild(key) {
  const A = fbCur(), B = FB_BUILDS[key], k = S.flow; let ok = false;
  await hfRun('Building it now. Each step appears on the canvas as I add it.', async m => {
    FLOWS[k].n = B.name; renderPtool(); renderTop();
    const ids = [];
    for (let i = 0; i < B.steps.length; i++) {
      const [app, act, name, vals] = B.steps[i];
      hfTrace(m, `Adding ${FB_APPS[app].n} · ${name}`); await hfSleep(700); if (S.flow !== k) return;
      const s = i ? fbAdd(A, { after: ids[i - 1] }, app, act) : fbAdd(A, { trig: true }, app, act);
      s.name = name; const v = JSON.parse(JSON.stringify(vals)); Object.keys(v).forEach(x => { if (Array.isArray(v[x])) v[x] = v[x].map(p => Array.isArray(p) ? [ids[+p[0].slice(1)], p[1]] : p); }); Object.assign(s.vals, v); ids.push(s.id);
      fbDraw(); fbFit(); await hfMove(`[data-fbopen="${s.id}"]`);
    }
    hfTraceDone(m); A.samples = B.samples; A.sample = 0; A.building = key; renderContent(); renderPtool(); ok = true;
  });
  if (!ok) return;
  await hfReply(`It has ${B.steps.length} steps, each filled with data from the step before. Open any step to check it.`);
  fbHfTest();
}
async function fbHfAddSlack(ch) {
  const A = fbCur(); let leaf = A.root; while (A.steps[leaf].kids.length) leaf = A.steps[leaf].kids[0];
  let v;
  await hfRun(`I’ll add a Slack step after step ${A.steps[leaf].num}.`, async () => { v = await hfAsk(`[data-fbopen="${leaf}"]`, { title: `Add Slack · Send message to ${ch}`, body: 'Edits the draft. The running version doesn’t change until you publish.', ok: 'Add it' }); });
  if (v !== 'ok') { hfReply('Okay, the flow stays as it is.'); return; }
  const s = fbAdd(A, { after: leaf }, 'slack', 'do'); s.name = 'Post in ' + ch; s.vals = { channel: ch, text: 'Update from ' + FLOWS[S.flow].n }; fbDraw(); renderPtool();
  hfReply(`Added step ${s.num}. It’s in your draft; publish to make it run.`);
}
function fbIntent(q) {
  const A = fbCur(), t = q.toLowerCase(), s = A.sel && A.steps[A.sel];
  if (!A.root) {
    const st = /lead/.test(t) ? 'leads' : /deliver|summary/.test(t) ? 'deliv' : '';
    if (st) return () => fbHfBuild(st);
    return () => fbHf('I can build either of these from a description in this prototype, or add steps yourself with the + on the canvas.', FB_STARTERS.map(x => x.d));
  }
  if (s && /this (step|router)|explain (it|this)$/.test(t) && /explain|what/.test(t)) return () => fbHf(`<p>Step ${s.num} · ${esc(s.name)} uses ${esc(FB_APPS[s.app].n)}.</p>` + (s.app === 'router' ? `<p>It sends the run down the first branch whose conditions match: ${s.kids.map(c => esc(A.steps[c].br.name)).join(', ')}.</p>` : `<p>Its settings are in the panel on the right, filled with data from earlier steps.</p>`), A.root !== s.id && s.app !== 'router' ? ['Test this step only'] : []);
  if (s && /test this step/.test(t)) return () => { fbTestOne(s.id); hfReply(`Testing step ${s.num} on its own with data from the last run. The panel shows what went in and came out.`); };
  if (/explain|what does|what is this/.test(t)) return () => fbHf(fbExplain(A), ['Test this flow']);
  if (/\btest\b/.test(t)) return fbHfTest;
  if (/fail/.test(t)) return fbHfMail;
  if (/publish/.test(t)) return () => fbHf('Publish is at the top right. It makes your draft the running version.');
  const m = t.match(/slack|#[\w-]+/); if (m) return () => fbHfAddSlack((t.match(/#[\w-]+/) || ['#office'])[0]);
  return null;
}
const _hfIntentFB = hfIntent;
hfIntent = function (q) { if (fbOn()) { const f = fbIntent(q); if (f) return f; } return _hfIntentFB(q); };
const _hfFallbackFB = hfFallback;
hfFallback = function () { if (!fbOn()) return _hfFallbackFB(); const c = fbCtx(); fbHf('On this flow I can explain it, test it, add a step, or set up failure emails. In HF1 I can change any part of it.', c.sugs); };
const _hfSugsFB = hfSugs;
hfSugs = function () { return fbOn() ? fbCtx().sugs.slice(0, 3) : _hfSugsFB(); };
/* the corner greeting knows where you are */
const _renderHfxFB = renderHfx;
renderHfx = function (focus) {
  _renderHfxFB(focus);
  if (!fbOn() || HFX.mode !== 'corner' || HFX.busy) return;
  for (let i = HFX.log.length - 1; i >= HFX.from; i--) if (HFX.log[i].who === 'me') return;
  const c = fbCtx();
  $('#hxBody').innerHTML = `<div class="hx-hf"><div class="hx-t">${c.say}</div><div class="hx-acts">${c.sugs.map(x => `<button type="button" data-fbhs="${esc(x)}">${esc(x)}${ic('right')}</button>`).join('')}</div></div>`;
};
hfx.addEventListener('click', e => { const b = e.target.closest('[data-fbhs]'); if (b) hfSend(b.dataset.fbhs); });
function fbHfOpen() { if (HFX.mode) renderHfx(false); else hfOpenChat(true); }

/* ---------- events ---------- */
document.addEventListener('click', e => {
  const t = e.target; let b;
  if ((b = t.closest('[data-pact="flows"]'))) { e.stopPropagation(); e.preventDefault(); fbNewFlow(); return; }
}, true);
function fbNewFlow() {
  const id = 'nf' + Date.now().toString(36);
  FLOWS[id] = { n: 'Untitled flow', p: S.proj, by: 'johnny', people: [fbYou()], tools: [], kn: [], runs: 0, draft: true, fbNew: true, nodes: [{ id: 'a', c: 0, r: 0, k: 'trigger', t: 'No trigger yet' }], edges: [] };
  FLOW_ORDER.push(id);
  S.page = 'flows'; S.sub = null; S.flow = id; S.panel = null; S.sel = null; renderAll();
}
document.addEventListener('click', e => {
  if (!fbOn() && !e.target.closest('.fb-scrim')) return;
  const t = e.target, A = fbOn() ? fbCur() : null; let b;
  if (!A) return;
  if (t.closest('[data-fbback]')) { S.flow = null; S.panel = null; S.sel = null; fbDSHide(); renderAll(); fitIfNew(); return; }
  if ((b = t.closest('[data-fbopen]'))) { fbOpenStep(b.dataset.fbopen); return; }
  if ((b = t.closest('[data-fbbr]'))) { fbOpenStep(b.dataset.fbbr); return; }
  if ((b = t.closest('[data-fbadd]'))) { fbPick(b.dataset.fbtrig ? { trig: true } : { after: b.dataset.fbadd }); return; }
  if ((b = t.closest('[data-fbins]'))) { fbPick({ before: b.dataset.fbins }); return; }
  if ((b = t.closest('[data-fbz]'))) { const z = b.dataset.fbz; if (z === 'fit') fbFit(); else fbZoom(z === 'in' ? 1.15 : 1 / 1.15); return; }
  if (t.closest('[data-fbhf]')) { fbHfOpen(); return; }
  if (t.closest('[data-fbx]')) { fbClose(); return; }
  if ((b = t.closest('[data-fbnav]'))) { if (b.dataset.fbnav) fbOpenStep(b.dataset.fbnav); return; }
  if ((b = t.closest('[data-fbsmenu]'))) { fbStepMenu(b.dataset.fbsmenu, b); return; }
  if ((b = t.closest('[data-fbsamp]'))) { A.sample = +b.dataset.fbsamp; A.res = {}; A.lst = {}; fbDraw(); renderPanel(); return; }
  if ((b = t.closest('[data-fbretry]'))) { const s = A.steps[b.dataset.fbretry]; s.retry = !s.retry; fbEdit(A); renderPanel(); renderPtool(); return; }
  if ((b = t.closest('[data-fbtone]'))) { fbTestOne(b.dataset.fbtone); return; }
  if ((b = t.closest('[data-fbcadd]'))) { const c = A.steps[b.dataset.fbcadd]; c.br.conds.push({ a: [], op: 'Is equal to', b: '' }); fbEdit(A); renderPanel(); renderPtool(); return; }
  if ((b = t.closest('[data-fbbdel]'))) { const c = A.steps[b.dataset.fbbdel], p = fbParent(A, c.id); if (p.kids.filter(x => !A.steps[x].br.other).length < 2) { toast('A router needs at least one branch with conditions.'); return; } const drop = x => { A.steps[x].kids.forEach(drop); delete A.steps[x]; }; p.kids = p.kids.filter(x => x !== c.id); drop(c.id); fbEdit(A); fbDraw(); renderPanel(); renderPtool(); return; }
  if ((b = t.closest('[data-fbbadd]'))) { const p = A.steps[b.dataset.fbbadd]; const n = fbMk(A, 'code', 'run', 'Nothing to do yet', {}); n.br = { name: 'Branch ' + p.kids.length, conds: [{ a: [], op: 'Is equal to', b: '' }], other: false }; const o = p.kids.findIndex(k => A.steps[k].br.other); if (o >= 0) p.kids.splice(o, 0, n.id); else p.kids.push(n.id); fbEdit(A); A.fresh = n.id; fbDraw(); renderPanel(); renderPtool(); toast('Added a branch. Replace its first step with what it should do.'); return; }
  if (t.closest('[data-fbtest]')) { fbRun('Test run'); return; }
  if (t.closest('[data-fbpub]')) { fbPublish(); return; }
  if ((b = t.closest('[data-fbmore]'))) { fbMore(b); return; }
  if ((b = t.closest('[data-fbio]'))) { A.run.open = A.run.open === b.dataset.fbio ? null : b.dataset.fbio; renderPanel(); return; }
  if ((b = t.closest('[data-fbappr]'))) { if (A.run && A.run.decide) A.run.decide(b.dataset.fbappr); return; }
  if ((b = t.closest('[data-fbreplay]'))) { const from = b.dataset.fbreplay; A.res[from] = null; A.steps[from].kids.forEach(function un(k) { A.res[k] = null; A.lst[k] = ''; A.steps[k].kids.forEach(un); }); fbRun('Replay', from); return; }
  if ((b = t.closest('[data-fbrunopen]'))) { const r = A.runs[+b.dataset.fbrunopen]; A.res = JSON.parse(JSON.stringify(r.snap.res)); A.lst = JSON.parse(JSON.stringify(r.snap.lst)); A.run = JSON.parse(JSON.stringify(r.snap.run)); S.panel = 'fbrun'; fbDraw(); renderPanel(); return; }
  if ((b = t.closest('[data-fbvmenu]'))) { fbVerMenu(+b.dataset.fbvmenu, b); return; }
  if ((b = t.closest('[data-fbusev]'))) { fbUseDraft(+b.dataset.fbusev); return; }
  if (t.closest('[data-fbunview]')) { A.viewing = null; renderAll(); requestAnimationFrame(fbFit); return; }
});
function fbMore(anchor) {
  const k = S.flow, A = fbCur(), off = S.fpause && S.fpause[k];
  popMenu(anchor, '', [
    { t: 'Test', ic: ic('play'), fn: () => fbRun('Test run') },
    { t: 'Save as template', ic: ic('copy'), fn: () => toast('Templates aren’t part of this prototype yet.') },
    { t: 'Version history', ic: ic('hist'), fn: () => { S.panel = 'fbver'; A.sel = null; fbDraw(); renderPanel(); } },
    { t: 'See runs', ic: ic('activity'), fn: () => { S.panel = 'fbruns'; A.sel = null; fbDraw(); renderPanel(); } },
    ...(A.ver ? [{ t: 'Run now', ic: ic('zap'), fn: () => fbRun('Run') }] : []),
    ...(A.ver ? [{ t: off ? 'Turn on' : 'Turn off', ic: ic(off ? 'play' : 'pause'), fn: () => { S.fpause[k] = !off; renderAll(); toast(off ? `${FLOWS[k].n} is on.` : `${FLOWS[k].n} is off. Nothing was deleted.`); } }] : []),
    { t: 'Ask HF1 about this flow', ic: hfOrb(14), fn: fbHfOpen },
    { t: 'Move to a folder or download', ic: ic('folder'), fn: () => toast('Folders and downloads aren’t part of this prototype yet.') },
    { t: 'Delete flow…', ic: ic('trash'), fn: () => toast('Deleting a flow isn’t part of this prototype.') }]);
}
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !fbScrim.hidden) { fbScrim.hidden = true; e.stopPropagation(); } }, true);
document.addEventListener('change', e => {
  if (!fbOn()) return; const t = e.target, A = fbCur();
  if (t.id === 'fbName') { const v = t.value.trim() || 'Untitled flow'; FLOWS[S.flow].n = v; renderTop(); toast('Renamed.'); return; }
  if (t.id === 'fbStepName') { const s = A.steps[A.sel]; if (s) { s.name = t.value.trim() || fbActN(s); fbEdit(A); fbDraw(); renderPtool(); } return; }
  if (t.dataset.fbf && t.tagName === 'SELECT') { const s = A.steps[A.sel]; s.vals[t.dataset.fbf] = t.value; fbEdit(A); fbDraw(); renderPtool(); return; }
  if (t.dataset.fbmode) { A.steps[t.dataset.fbmode].mode = t.value; fbEdit(A); renderPtool(); return; }
  if (t.dataset.fbcop) { const [cid, i] = t.dataset.fbcop.split(':'); A.steps[cid].br.conds[+i].op = t.value; fbEdit(A); renderPtool(); return; }
  if (t.dataset.fbbname) { A.steps[t.dataset.fbbname].br.name = t.value.trim() || 'Branch'; fbEdit(A); fbDraw(); renderPtool(); }
});
document.addEventListener('input', e => {
  if (!fbOn()) return; const t = e.target, A = fbCur();
  if (t.dataset && t.dataset.fbf && t.classList.contains('fb-ce')) { const s = A.steps[A.sel]; if (s) { s.vals[t.dataset.fbf] = fbParts(t); if (!A.dirty) { A.dirty = true; renderPtool(); } } }
  if (t.dataset && t.dataset.fbcf) { const [cid, i, side] = t.dataset.fbcf.split(':'); A.steps[cid].br.conds[+i][side] = fbParts(t); if (!A.dirty) { A.dirty = true; renderPtool(); } }
});
document.addEventListener('focusin', e => { if (!fbOn()) return; const t = e.target; if (t.classList && t.classList.contains('fb-ce') && t.closest('#panel')) fbDSOpen(t); else if (!t.closest('.fb-ds')) fbDSHide(); });
let fbDrag = null;
document.addEventListener('pointerdown', e => { const st = e.target.closest('#fbStage'); if (!st || e.target.closest('button')) return; const A = fbCur(); if (!A.view) return; fbDrag = { x: e.clientX, y: e.clientY, vx: A.view.x, vy: A.view.y, moved: false }; A.view.auto = false; st.classList.add('drag'); });
document.addEventListener('pointermove', e => { if (!fbDrag) return; const A = fbCur(); const dx = e.clientX - fbDrag.x, dy = e.clientY - fbDrag.y; if (Math.abs(dx) + Math.abs(dy) > 3) fbDrag.moved = true; A.view.x = fbDrag.vx + dx; A.view.y = fbDrag.vy + dy; fbApply(); });
document.addEventListener('pointerup', () => { if (!fbDrag) return; const st = $('#fbStage'); if (st) st.classList.remove('drag'); const moved = fbDrag.moved; fbDrag = null; if (!moved && fbOn() && S.panel === 'fbstep') fbClose(); });
document.addEventListener('wheel', e => { const st = e.target.closest('#fbStage'); if (!st) return; e.preventDefault(); const A = fbCur(); if (!A.view) return; if (e.ctrlKey || e.metaKey) { const r = st.getBoundingClientRect(), px = e.clientX - r.left, py = e.clientY - r.top, z = Math.max(.3, Math.min(1.6, A.view.z * (e.deltaY < 0 ? 1.08 : .93))); A.view.x = px - (px - A.view.x) * z / A.view.z; A.view.y = py - (py - A.view.y) * z / A.view.z; A.view.z = z; } else { A.view.x -= e.deltaX; A.view.y -= e.deltaY; } A.view.auto = false; fbApply(); }, { passive: false });
document.addEventListener('contextmenu', e => { const s = e.target.closest('[data-fbstep]'); if (!s || !fbOn()) return; e.preventDefault(); fbStepMenu(s.dataset.fbstep, s.querySelector('.fb-bub')); });

/* ---------- plug into the prototype's render chain ---------- */
const _renderContentFB = renderContent;
renderContent = function () {
  _renderContentFB();
  const pv = $('#pv');
  if (fbOn()) { stage.hidden = true; $('#cvui').hidden = true; flowPin.hidden = true; fbMount(); }
  else { pv.classList.remove('fbx'); fbDSHide(); }
};
const _renderPtoolFB = renderPtool;
renderPtool = function () { if (fbOn()) { $('#ptool').innerHTML = fbToolbar(); return; } _renderPtoolFB(); };
const _renderPanelFB = renderPanel;
renderPanel = function () {
  const isFB = S.panel && String(S.panel).startsWith('fb');
  if (fbOn()) {
    if (S.panel === 'detail' && S.sel && /^(f|n|fi):/.test(S.sel)) { S.panel = null; S.sel = null; }
    if (isFB) { hfPlace(); panel.classList.remove('closed'); $('#pv').classList.toggle('withpanel', true); fbPanel(); if (S.panel !== 'fbstep') fbDSHide(); const A = fbCur(); if (A.view && A.view.auto && !A.view.withPanel) { fbFit(); A.view.withPanel = true; } return; }
  } else if (isFB) { S.panel = null; }
  fbDSHide();
  return _renderPanelFB();
};
/* the step a person opens from a flow's step list lands on that step in the builder */
const _openEntityFB = openEntity;
openEntity = function (key) { const r = _openEntityFB(key); if (fbOn() && String(key).startsWith('flowpage:')) { S.panel = null; S.sel = null; renderAll(); } return r; };
