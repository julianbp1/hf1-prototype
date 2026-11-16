/* ================= HF1 Live picture · the interactive canvas =================
   One live picture, in rings: one person → the team → the company → a partner.
   Zoom moves between rings (wheel, pinch, the ring switch or a click on a ring).
   Built from the agentic patterns in AffectUI (agent crew, agent trail, decision inbox,
   conflict radar, agent handoff, agent ledger, agent cursors, running now),
   redrawn in HF1's own language: pixel marks, bone and moss, one press to decide. */
(() => {
  const doc = document, root = doc.documentElement;
  const pix = (k, s) => (window.__hfPix ? window.__hfPix(k, s) : '');
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const W = 1440, H = 780, CX = 720, CY = 390;
  const LEVELS = [['me', 'You'], ['team', 'Team'], ['company', 'Company'], ['partners', 'Partners']];

  /* ---------- the picture's data: who is on which ring, what is moving ---------- */
  const TMN = { victor: 'Sales', ana: 'Used cars', julian: 'Service', iuliana: 'Marketing', corina: 'Office' };
  const TM = TEAMS.map(([lead, n]) => ({ lead, n: TMN[lead] || n }));
  const teamOf = id => { const p = PEOPLE[id] ? id : (AGENTS[id] && AGENTS[id].owner); if (!p) return null; const t = TM.find(t => t.lead === p || (PEOPLE[p] && PEOPLE[p].mgr === t.lead)); return t ? t.lead : null; };
  const members = lead => [lead, ...Object.keys(PEOPLE).filter(p => PEOPLE[p].mgr === lead)];
  const ownAgents = p => Object.keys(AGENTS).filter(a => isLocalA(a) && AGENTS[a].owner === p);
  const cloudAgents = lead => Object.keys(AGENTS).filter(a => a !== 'johnny' && !isLocalA(a) && members(lead).includes(AGENTS[a].owner));
  const PARTNER = { n: 'Summit Body Works', sub: 'Body shop partner · its own HF1' };

  const LT = [
    { id: 'SLS-14', sh: 'Follow-ups, 12 deals', t: 'Follow-ups for 12 open deals', who: 'mark', st: 'run', n: 3, of: 12, u: 'drafted',
      steps: [['Read the 12 open deals in VinSolutions', 'done'], ['Draft a follow-up for each', 'run'], ['Rick reads the drafts', 'gate'], ['Send from Rick’s Gmail', 'next']] },
    { id: 'SLS-15', sh: 'Inbound leads', t: 'Qualify this week’s inbound leads', who: 'iris', st: 'run', n: 9, of: 21, u: 'checked',
      steps: [['Pull the inbound leads', 'done'], ['Score each lead against the playbook', 'run'], ['Hand the hot ones to Jessica', 'next']] },
    { id: 'SRV-07', sh: 'Silverado goodwill repair', t: 'Goodwill repair on the 2022 Silverado', who: 'mike', st: 'need', amt: '$2,900',
      steps: [['Check the warranty claim', 'done'], ['Price the repair with the shop', 'done'], ['Over $2,500, Tom signs it off', 'gate'], ['Book the repair', 'next']] },
    { id: 'OPS-03', sh: '4 invoices for CDK', t: 'File 4 dealer invoices in CDK', who: 'penny', st: 'need', amt: '$18,240',
      steps: [['Match 4 invoices to purchase orders', 'done'], ['Prepare the CDK entries', 'done'], ['Tom approves the batch', 'gate'], ['File in CDK', 'next']] },
    { id: 'BF-11', sh: 'Black Friday posts', t: 'Schedule the Black Friday posts', who: 'alex', st: 'run', n: 6, of: 14, u: 'scheduled',
      steps: [['Read the creative from Raj', 'done'], ['Schedule the posts on Facebook', 'run'], ['Amira checks the calendar', 'next']] },
    { id: 'UC-31', sh: 'Recon brief', t: 'Recon brief from the workshop notes', who: 'sarah', st: 'run', n: 2, of: 5, u: 'sections',
      steps: [['Read the workshop notes', 'done'], ['Write the brief', 'run'], ['Karen reviews it', 'gate']] },
    { id: 'UC-34', sh: 'Tahoe body estimate', t: 'Body repair estimate for the Tahoe trade-in', who: 'ana', st: 'run', partner: true, n: 1, of: 3, u: 'steps',
      steps: [['Karen shares this one task with Summit', 'done'], ['Summit’s agent inspects the photos', 'run'], ['Estimate comes back to Karen', 'next']] }
  ];
  const DEC = [
    { id: 'OPS-03', who: 'penny', q: 'File 4 dealer invoices in CDK', d: '$18,240 · all four match their purchase orders', a: ['Approve', 'Not yet'], ok: 'Approved. Penny files them now.' },
    { id: 'SRV-07', who: 'mike', q: 'Goodwill repair on the 2022 Silverado', d: '$2,900 · over David’s $2,500 limit', a: ['Approve', 'Decline'], ok: 'Approved. Mike books the repair.' },
    { id: 'LINK', who: 'johnny', q: 'Link the Black Friday event to November sales', d: 'Both teams plan the same weekend. Rick already agreed.', a: ['Link them', 'Keep apart'], ok: 'Linked. Both boards now show the event.' }
  ];
  const LOG = [
    ['08:02', 'victor', 'Gave Mark the 12 open deals', 'person'],
    ['08:04', 'mark', 'Started drafting follow-ups on Rick’s computer', 'agent'],
    ['09:10', 'johnny', 'Drafted 5 tasks from the sales stand-up', 'hf', [['Read the call notes', 'done'], ['Matched each ask to a person or an agent', 'done'], ['Rick approved all five', 'done']]],
    ['09:12', 'victor', 'Approved the stand-up’s tasks', 'person'],
    ['10:30', 'otto', 'Wrote the v1.4 release notes', 'agent'],
    ['11:05', 'ana', 'Shared one task with Summit Body Works', 'person'],
    ['11:40', 'johnny', 'Caught Mark and Iris about to email Henderson twice', 'hf']
  ];
  const L = { lvl: 'company', team: 'victor', person: 'florin', tab: 'now', sel: null, dec: {}, conflict: 'open', log: LOG.map(r => ({ t: r[0], who: r[1], what: r[2], k: r[3], steps: r[4] })) };
  const firstOf = id => id === 'johnny' ? 'HF1' : AGENTS[id] ? AGENTS[id].n : first(id);
  const mark = (id, s) => id === 'johnny' ? hfOrb(s) : AGENTS[id] ? `<span class="lv-ag" style="--s:${s}px">${PX.svg(id)}</span>` : av(id, s);
  const taskOf = id => LT.find(t => t.who === id);
  const stLabel = t => t.st === 'need' ? 'Needs you' : t.st === 'done' ? 'Done' : 'Working now';
  const stMark = t => pix(t.st === 'need' ? 'needs' : t.st === 'done' ? 'done' : 'make', 12);
  const now = () => { const d = new Date(); return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; };
  const logIt = (who, what, k, extra) => L.log.push(Object.assign({ t: now(), who, what, k }, extra || {}));
  const openDec = () => DEC.filter(d => !L.dec[d.id]);

  /* ---------- canvas pieces ---------- */
  let EX = [];
  const node = (id, x, y, s, o = {}) => {
    const A = !!AGENTS[id], t = taskOf(id), own = o.sat ? ownAgents(id) : [];
    return `<div class="lv-n${A ? ' ag' : ''}${o.cls ? ' ' + o.cls : ''}${t && t.st === 'need' ? ' need' : ''}${t && t.st === 'run' ? ' busy' : ''}" style="left:${x}px;top:${y}px;--s:${s}px" data-lv="${o.act || (A ? 'agent' : 'person')}:${id}" role="button" tabindex="0" aria-label="${esc(firstOf(id))}${A ? ', ' + esc(AGENTS[id].job) : ''}">
      <span class="lv-b">${mark(id, s)}${own.map((a, i) => `<span class="lv-sat${taskOf(a) && taskOf(a).st === 'run' ? ' busy' : ''}" style="--i:${i}" title="${esc(AGENTS[a].n)} · on ${esc(first(id))}’s computer">${PX.svg(a)}</span>`).join('')}${t && A && !o.mini ? `<span class="lv-st">${stMark(t)}</span>` : ''}</span>
      ${o.lab === false ? '' : `<span class="lv-l"><b>${esc(firstOf(id))}${own.length && o.labAg ? `<i> + ${own.map(a => esc(AGENTS[a].n)).join(', ')}</i>` : ''}</b>${o.sub ? `<small>${esc(o.sub)}</small>` : ''}</span>`}
    </div>`;
  };
  /* a work card, tied to whoever is doing it by a thin leader */
  const CW = 248;
  const chip = (t, x, y, side = 'r', from, sm) => {
    if (from) { const ex = side === 'l' ? x : side === 't' ? x : x, ey = side === 't' ? y : y; const mx = (from[0] + ex) / 2; EX.push(`<path class="lv-lead${t.st === 'need' ? ' need' : ''}" d="M${from[0]} ${from[1]} C ${mx} ${from[1]}, ${mx} ${ey}, ${ex} ${ey}"/><circle class="lv-lead-o${t.st === 'need' ? ' need' : ''}" cx="${from[0]}" cy="${from[1]}" r="3"/>`); }
    const pct = t.of ? Math.round(100 * t.n / t.of) : 0;
    if (sm) return `<button type="button" class="lv-chip sm ${t.st} s-${side}${L.sel === t.id ? ' on' : ''}" style="left:${x}px;top:${y}px" data-lv="task:${t.id}">${mark(t.who, 26)}<span class="lv-cx"><span class="lv-cn">${esc(t.sh || t.t)}</span><span class="lv-cs">${stMark(t)}${t.st === 'need' ? `Needs you${t.amt ? ' · ' + t.amt : ''}` : `<span data-prog="${t.id}">${t.n} of ${t.of} ${esc(t.u)}</span>`}</span></span></button>`;
    return `<button type="button" class="lv-chip ${t.st} s-${side}${L.sel === t.id ? ' on' : ''}" style="left:${x}px;top:${y}px;width:${CW}px" data-lv="task:${t.id}">
      <span class="lv-ch">${mark(t.who, 22)}<b>${esc(firstOf(t.who))}</b><span class="lv-cs">${stMark(t)}${esc(stLabel(t))}</span></span>
      <span class="lv-cn">${esc(t.t)}</span>
      ${t.of ? `<span class="lv-cp"><span class="lv-bar"><i data-bar="${t.id}" style="width:${pct}%"></i></span><em data-prog="${t.id}">${t.n} of ${t.of} ${esc(t.u)}</em></span>` : t.amt ? `<span class="lv-cp"><em class="amt">${t.amt}</em><em>waiting for your OK</em></span>` : ''}
    </button>`;
  };
  const hfHub = (x, y, s, sub, o = {}) => `<div class="lv-n lv-hf${o.cls ? ' ' + o.cls : ''}" style="left:${x}px;top:${y}px;--s:${s}px"${o.cls === 'other' ? '' : ' data-lv="hf:johnny" role="button" tabindex="0" aria-label="Talk to HF1"'}><span class="lv-halo" aria-hidden="true"></span><span class="lv-b">${hfOrb(s)}</span><span class="lv-l pill"><b>${esc(o.name || 'HF1')}</b>${sub ? `<small>${esc(sub)}</small>` : ''}</span></div>`;
  const ring = (x, y, r, o = {}) => `<div class="lv-ring${o.cls ? ' ' + o.cls : ''}" style="left:${x}px;top:${y}px;--r:${r}px"${o.act ? ` data-lv="${o.act}" role="button" tabindex="0" aria-label="${esc(o.aria || '')}"` : ''}>${o.lab ? `<span class="lv-rl">${o.lead ? av(o.lead, 22) : ''}<span><b>${esc(o.lab)}</b>${o.sub ? `<small>${esc(o.sub)}</small>` : ''}</span></span>` : ''}</div>`;
  const around = (n, r, a0 = -Math.PI / 2, ry) => Array.from({ length: n }, (_, i) => { const a = a0 + i * 2 * Math.PI / n; return [Math.cos(a) * r, Math.sin(a) * (ry || r)]; });
  const wire = (x1, y1, x2, y2, cls = '', bend = .18) => { const mx = (x1 + x2) / 2 - (y2 - y1) * bend, my = (y1 + y2) / 2 + (x2 - x1) * bend; return `<path class="lv-wire ${cls}" d="M${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}"/>`; };

  /* ---------- the four rings ---------- */
  const lvMe = () => {
    const p = L.person, own = ownAgents(p), mine = LT.filter(t => t.who === p || own.includes(t.who) || (p === 'florin' && t.st === 'need'));
    const px = CX - 170, hx = CX + 170;
    let svg = wire(px + 70, CY, hx - 50, CY, 'live', 0);
    let html = ring(px, CY, 150, { cls: 'pod' }) + ring(px, CY, 104, { cls: 'track' }) + node(p, px, CY, 120, { sub: roleOf(p), act: 'open' })
      + own.map((a, i) => { const [dx, dy] = around(Math.max(own.length, 1), 104, -Math.PI / 4)[i]; return node(a, px + dx, CY + dy, 44, { sub: `On ${first(p)}’s computer`, cls: 'own' }); }).join('')
      + `<span class="lv-wtag" style="left:${CX}px;top:${CY - 22}px">${pix('done', 10)}HF1 on ${esc(first(p))}’s computer${own.length ? ' · ' + esc(own.map(a => AGENTS[a].n).join(', ')) + ' connected' : ''}</span>`
      + hfHub(hx, CY, 72, 'Knows your day');
    const slots = [[hx + 110, CY - 150], [hx + 110, CY + 40], [hx + 110, CY + 230], [px - 380, CY + 170]];
    mine.slice(0, 3).forEach((t, i) => { html += chip(t, slots[i][0], slots[i][1] - 50, 'r', [hx + 44, CY + (i - 1) * 24]); });
    return { svg, html };
  };
  const lvTeam = () => {
    const lead = L.team, ms = members(lead), cl = cloudAgents(lead), R = 250, r2 = 128;
    const pp = around(ms.length, R, -Math.PI / 2), ap = around(Math.max(cl.length, 1), r2, -Math.PI / 6);
    let html = ring(CX, CY, R + 70, { cls: 'pod big' }) + ring(CX, CY, R, { cls: 'track' }) + ring(CX, CY, r2, { cls: 'track inner' }) + hfHub(CX, CY, 64, 'In every stand-up');
    let svg = '';
    const pos = {};
    ms.forEach((m, i) => {
      const [dx, dy] = pp[i], x = CX + dx, y = CY + dy; pos[m] = [x, y];
      html += node(m, x, y, m === lead ? 64 : 52, { sat: true, labAg: true, sub: m === lead ? 'Leads ' + TM.find(t => t.lead === lead).n : roleOf(m), act: 'person' });
      ownAgents(m).forEach(a => { const t = taskOf(a); if (!t) return; const r = dx >= 0; html += chip(t, r ? CX + R + 120 : CX - R - 120, y - 6, r ? 'r' : 'l', [x + (r ? 40 : -40), y - 22]); pos[a] = [x + 34, y - 30]; });
    });
    cl.forEach((a, i) => { const [dx, dy] = ap[i]; html += node(a, CX + dx, CY + dy, 44, { sub: 'Cloud agent' }); svg += wire(CX, CY, CX + dx, CY + dy, 'faint', .1); const t = taskOf(a); if (t) html += chip(t, CX + R + 120, CY + dy + 150, 'r', [CX + dx + 26, CY + dy]); });
    if (lead === 'victor' && L.conflict === 'open' && pos.mark && pos.iris) {
      const [ax, ay] = pos.mark, [bx, by] = pos.iris; svg += wire(ax, ay, bx, by, 'clash', -.25);
      html += `<button type="button" class="lv-clash" style="left:${(ax + bx) / 2 + 10}px;top:${(ay + by) / 2 + 62}px" data-lv="clash:1"><span class="lv-pair">${mark('mark', 22)}${mark('iris', 22)}</span><span><b>About to double up</b><small>Mark and Iris, both emailing Henderson</small></span></button>`;
    }
    return { svg, html };
  };
  const lvCompany = () => {
    const n = TM.length, pos = around(n, 290, -Math.PI / 2, 236), rr = 96;
    let svg = '', html = hfHub(CX, CY, 84, 'One live picture');
    TM.forEach((t, i) => {
      const [dx, dy] = pos[i], x = CX + dx, y = CY + dy, ms = members(t.lead), cl = cloudAgents(t.lead), d = Math.hypot(dx, dy);
      const busyT = LT.some(k => teamOf(k.who) === t.lead && k.st === 'run');
      svg += wire(CX + dx * 56 / d, CY + dy * 56 / d, x - dx * (rr + 6) / d, y - dy * (rr + 6) / d, busyT ? 'live' : 'faint', .08);
      html += ring(x, y, rr, { cls: 'pod', lab: t.n, lead: t.lead, sub: `${ms.length} people · ${ms.flatMap(ownAgents).length + cl.length} agents`, act: `team:${t.lead}`, aria: `Open ${t.n}` }) + ring(x, y, rr - 30, { cls: 'track' });
      const all = [...ms, ...cl];
      around(all.length, rr - 30, -Math.PI / 2).forEach(([ax, ay], j) => { const id = all[j]; html += node(id, x + ax, y + ay, AGENTS[id] ? 24 : 28, { lab: false, cls: 'mini', sat: true, mini: true }); });
      const busy = LT.filter(k => teamOf(k.who) === t.lead && !k.partner).sort((a, b) => (a.st === 'need' ? -1 : 1) - (b.st === 'need' ? -1 : 1))[0];
      if (busy) { const r = dx >= -1; html += chip(busy, r ? x + rr + 28 : x - rr - 28, y - rr * .55, r ? 'r' : 'l', [x + (r ? rr : -rr) * .72, y - rr * .66], true); }
    });
    const a = pos[TM.findIndex(t => t.lead === 'iuliana')], b = pos[TM.findIndex(t => t.lead === 'victor')];
    if (a && b) { const made = L.dec.LINK === 'Link them', x1 = CX + a[0] - 20, y1 = CY + a[1] - 92, x2 = CX + b[0] - 96, y2 = CY + b[1] + 10, bend = -.3, qx = (x1 + x2) / 2 - (y2 - y1) * bend, qy = (y1 + y2) / 2 + (x2 - x1) * bend; svg += wire(x1, y1, x2, y2, 'link' + (made ? ' made' : ''), bend); html += `<span class="lv-wtag link${made ? ' made' : ''}" style="left:${.09 * x1 + .42 * qx + .49 * x2}px;top:${.09 * y1 + .42 * qy + .49 * y2}px">${made ? pix('done', 10) + 'Linked · Black Friday and November sales' : pix('needs', 10) + 'HF1 suggests a link'}</span>`; }
    if (L.conflict === 'open') html += `<button type="button" class="lv-clash sm s-l" style="left:${CX + pos[0][0] - rr - 18}px;top:${CY + pos[0][1] - 20}px" data-lv="clash:1"><span class="lv-pair">${mark('mark', 20)}${mark('iris', 20)}</span><span><b>About to double up</b></span></button>`;
    return { svg, html };
  };
  const lvPartners = () => {
    const lx = CX - 300, rx = CX + 440, t = LT.find(k => k.partner);
    let html = ring(lx, CY, 250, { cls: 'pod big', lab: 'Halloway Auto Group', sub: '5 teams · your HF1' }) + ring(lx, CY, 150, { cls: 'track' }) + hfHub(lx, CY, 56);
    const tp = around(TM.length, 150, -Math.PI / 2);
    tp.forEach(([dx, dy], i) => { const hot = TM[i].lead === 'ana'; html += ring(lx + dx, CY + dy, 46, { act: `team:${TM[i].lead}`, aria: TM[i].n, cls: 'pod tiny' + (hot ? ' hot' : '') }) + `<span class="lv-tl${hot ? ' hot' : ''}" style="left:${lx + dx}px;top:${CY + dy}px">${av(TM[i].lead, 26)}<b>${esc(TM[i].n)}</b></span>`; });
    html += ring(rx, CY, 150, { cls: 'pod partner', lab: PARTNER.n, sub: PARTNER.sub }) + ring(rx, CY, 96, { cls: 'track' }) + hfHub(rx, CY, 56, 'Sees one task only', { cls: 'other', name: 'Their HF1' })
      + `<div class="lv-n ag other" style="left:${rx}px;top:${CY - 118}px;--s:40px"><span class="lv-b"><span class="lv-ag" style="--s:40px">${PX.svg('otto')}</span></span><span class="lv-l"><b>Summit’s agent</b><small>Inspecting photos</small></span></div>`;
    const ana = tp[TM.findIndex(k => k.lead === 'ana')], sx = lx + ana[0] + 48, sy = CY + ana[1];
    const svg = `<path class="lv-wire cross" d="M${sx} ${sy} C ${sx + 200} ${sy}, ${rx - 320} ${CY - 60}, ${rx - 152} ${CY - 30}"/>`;
    html += `<div class="lv-hand" style="left:${(lx + 250 + rx - 150) / 2}px;top:${CY - 10}px" data-lv="task:${t.id}" role="button" tabindex="0">
      <span class="lv-hk">${ic('lock')}Shared · this task only</span>
      <b>${esc(t.t)}</b>
      <span class="lv-cp"><span class="lv-bar"><i data-bar="${t.id}" style="width:${Math.round(100 * t.n / t.of)}%"></i></span><em data-prog="${t.id}">${t.n} of ${t.of} ${esc(t.u)}</em></span>
      <span class="lv-hs">${av('ana', 20)}<small>Karen</small><span class="lv-arr">${ic('right')}</span><span class="lv-ag" style="--s:20px">${PX.svg('otto')}</span><small>Summit</small><span class="lv-live">${pix('make', 11)}Live status</span></span></div>`;
    return { svg, html };
  };
  const BUILD = { me: lvMe, team: lvTeam, company: lvCompany, partners: lvPartners };
  const TITLE = () => ({ me: `Around ${L.person === 'florin' ? 'you' : first(L.person)}`, team: `Around ${TM.find(t => t.lead === L.team).n}`, company: 'Across Halloway', partners: 'Beyond the company' })[L.lvl];
  const SUB = () => ({ me: 'Your agents, your day, HF1 beside you.', team: 'People, the agents on their computers, and HF1’s cloud agents.', company: 'Every team, every agent, one picture. Click a ring to step in.', partners: 'One task crosses. Nothing else does.' })[L.lvl];

  /* ---------- the rail: now / crew / on record ---------- */
  const decRow = d => {
    const ans = L.dec[d.id];
    return `<li class="lv-dec${ans ? ' done' : ''}" data-dec="${d.id}">${mark(d.who, 28)}<span class="lv-dt"><b>${esc(d.q)}</b><small>${esc(ans ? (ans === d.a[0] ? d.ok : 'Answered: ' + ans.toLowerCase() + '.') : d.d)}</small></span>
      ${ans ? `<button type="button" class="lv-undo" data-lvundo="${d.id}">${ic('undo')}Undo</button>` : `<span class="lv-da">${d.a.map((a, i) => `<button type="button" class="${i ? 'ghost' : 'pri'}" data-lvdec="${d.id}" data-a="${esc(a)}">${esc(a)}</button>`).join('')}</span>`}</li>`;
  };
  const trail = t => `<ol class="lv-trail">${t.steps.map(([s, k]) => `<li class="${k}"><span class="d">${k === 'done' ? pix('done', 11) : k === 'run' ? pix('make', 11) : k === 'gate' ? pix('needs', 11) : '<i></i>'}</span><span>${esc(s)}${k === 'run' && t.of ? ` <em data-prog="${t.id}">${t.n} of ${t.of} ${esc(t.u)}</em>` : ''}${k === 'gate' ? ' <small>approval</small>' : ''}</span></li>`).join('')}</ol>`;
  const railNow = () => {
    const run = LT.filter(t => t.st === 'run').length, need = openDec().length;
    const sel = L.sel && LT.find(t => t.id === L.sel);
    return `${sel ? `<section class="lv-card lv-sel"><header>${mark(sel.who, 30)}<span><b>${esc(sel.t)}</b><small>${esc(firstOf(sel.who))} · ${esc(stLabel(sel))}</small></span><button type="button" class="lv-x" data-lv="unsel:1" aria-label="Close">${ic('x')}</button></header>${trail(sel)}
      <form class="lv-steer" data-steer="${sel.id}"><input placeholder="Add a note for ${esc(firstOf(sel.who))}’s next step" aria-label="Note for the next step"><button type="submit" aria-label="Send note">${ic('send')}</button></form></section>` : ''}
      <section class="lv-card"><header class="lv-h"><b>Running now</b><span class="lv-run">${pix('make', 12)}${run} working<i></i>${pix('needs', 12)}${need} need you</span></header>
      <ul class="lv-runl">${LT.filter(t => t.st === 'run').map(t => `<li data-lv="task:${t.id}" role="button" tabindex="0">${mark(t.who, 22)}<span><b>${esc(t.t)}</b><small>${esc(firstOf(t.who))}${t.partner ? ' · at Summit' : ''}</small></span><em data-prog="${t.id}">${t.n} of ${t.of}</em></li>`).join('')}</ul></section>
      ${L.conflict === 'open' ? `<section class="lv-card lv-conf"><header class="lv-h"><b>${pix('needs', 12)}About to double up</b></header><p>Mark is drafting a follow-up to <b>Henderson</b>. Iris is about to send them a lead check. Same customer, same morning.</p>
        <div class="lv-pair">${mark('mark', 28)}<span class="lv-pl"><i></i></span>${mark('iris', 28)}</div><div class="lv-da"><button type="button" class="pri" data-lvconf="join">Iris joins Mark</button><button type="button" class="ghost" data-lvconf="keep">Keep both</button></div></section>`
        : L.conflict ? `<section class="lv-card lv-ok">${pix('done', 12)}<span>${L.conflict === 'join' ? 'Iris joined Mark. One email goes to Henderson.' : 'Both kept. HF1 will warn Rick before either sends.'}</span><button type="button" class="lv-undo" data-lvconf="undo">${ic('undo')}Undo</button></section>` : ''}
      <section class="lv-card"><header class="lv-h"><b>Decide</b><small>${need ? `${need} open · one press each` : 'All clear'}</small></header><ul class="lv-decs">${DEC.map(decRow).join('')}</ul></section>`;
  };
  const railCrew = () => {
    const lead = L.lvl === 'team' ? L.team : (teamOf(L.person) || 'victor'), t = TM.find(x => x.lead === lead), ms = members(lead), cl = cloudAgents(lead);
    return `<section class="lv-card"><header class="lv-h"><b>${esc(t.n)}</b><small>${ms.length} people · ${ms.flatMap(ownAgents).length + cl.length} agents</small></header>
      <h5>People, with their own agents</h5><ul class="lv-crew">${ms.map(m => `<li data-lv="person:${m}" role="button" tabindex="0">${av(m, 30)}<span><b>${esc(first(m))}</b><small>${esc(roleOf(m))}</small></span><span class="lv-own">${ownAgents(m).map(a => `<span class="lv-tag">${PX.svg(a)}${esc(AGENTS[a].n)}${taskOf(a) ? stMark(taskOf(a)) : ''}</span>`).join('') || '<small class="faint">No agent yet</small>'}</span></li>`).join('')}</ul>
      <h5>HF1’s cloud agents</h5><ul class="lv-crew">${cl.length ? cl.map(a => `<li data-lv="agent:${a}" role="button" tabindex="0">${mark(a, 30)}<span><b>${esc(AGENTS[a].n)}</b><small>${esc(AGENTS[a].job)} · works for ${esc(first(AGENTS[a].owner))}</small></span>${taskOf(a) ? `<span class="lv-tag">${stMark(taskOf(a))}${esc(stLabel(taskOf(a)))}</span>` : ''}</li>`).join('') : '<li class="faint">None on this team yet</li>'}</ul>
      <div class="lv-teams">${TM.map(x => `<button type="button" data-lv="team:${x.lead}" aria-pressed="${x.lead === lead}">${esc(x.n)}</button>`).join('')}</div></section>`;
  };
  const railRec = () => `<section class="lv-card"><header class="lv-h"><b>On record</b><small>Who did what, and when. Step by step.</small></header><ol class="lv-log">${L.log.slice().reverse().map((r, i) => `<li class="${r.k}">${mark(r.who, 22)}<span><b>${esc(firstOf(r.who))}</b> ${esc(r.what.charAt(0).toLowerCase() + r.what.slice(1))}<small>${esc(r.t)}${r.k === 'agent' ? ' · agent' : r.k === 'hf' ? ' · HF1' : ''}</small>${r.steps ? `<details><summary>Step by step</summary>${trail({ steps: r.steps })}</details>` : ''}</span></li>`).join('')}</ol></section>`;
  const rail = () => `<aside class="lv-rail" aria-label="Live picture details"><div class="lv-tabs" role="tablist">${[['now', 'Now'], ['crew', 'Crew'], ['rec', 'On record']].map(([k, l]) => `<button type="button" role="tab" data-lvtab="${k}" aria-selected="${L.tab === k}">${l}${k === 'now' && openDec().length ? ` <i>${openDec().length}</i>` : ''}</button>`).join('')}</div><div class="lv-rb">${{ now: railNow, crew: railCrew, rec: railRec }[L.tab]()}</div></aside>`;

  /* ---------- presence: who else is looking, which agents are moving ---------- */
  const CUR = [['victor', 'Rick'], ['corina', 'Linda'], ['mark', 'Mark']];
  const cursors = () => CUR.map(([id, n], i) => `<span class="lv-cur${AGENTS[id] ? ' ag' : ''}" data-cur="${i}" style="left:${300 + i * 250}px;top:${220 + i * 120}px" aria-hidden="true"><svg viewBox="0 0 18 18" width="18" height="18"><path d="M3 2.2 15.4 8.1l-5.6 1.7-2.4 5.4z"/></svg><span>${AGENTS[id] ? `<span class="lv-ag" style="--s:16px">${PX.svg(id)}</span>` : av(id, 16)}${esc(n)}</span></span>`).join('');

  const html = () => {
    EX = []; const b = BUILD[L.lvl](), li = LEVELS.findIndex(l => l[0] === L.lvl);
    return `<div class="lv" id="lv" data-lvl="${L.lvl}">
      <div class="lv-stage" id="lvStage">
        <div class="lv-world" id="lvW" style="width:${W}px;height:${H}px"><svg class="lv-svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" aria-hidden="true">${b.svg}${EX.join('')}</svg>${b.html}${L.lvl === 'company' || L.lvl === 'team' ? cursors() : ''}</div>
      </div>
      <header class="lv-head"><b>${esc(TITLE())}</b><span>${esc(SUB())}</span><span class="lv-hint">${pix('think', 11)}Live · ${li > 0 ? 'scroll in to step closer' : 'scroll out to see more'}, drag to move</span></header>
      <div class="lv-ctl"><div class="lv-zoom" role="group" aria-label="Zoom between rings">${LEVELS.map(([k, l]) => `<button type="button" data-lvlvl="${k}" aria-pressed="${k === L.lvl}">${l}</button>`).join('')}</div>
        <button type="button" class="lv-fit" data-lvfit aria-label="Fit to screen">${ic('expand')}</button></div>
      ${rail()}</div>`;
  };

  /* ---------- render, fit, zoom between rings ---------- */
  let dir = 0;
  const ro = window.ResizeObserver ? new ResizeObserver(() => fit()) : { disconnect() {}, observe() {} };
  const PAN = { x: 0, y: 0 };
  let BB = null;
  const measure = () => {
    const w = doc.getElementById('lvW'); if (!w) return null; const wr = w.getBoundingClientRect(), k = wr.width / W || 1;
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    w.querySelectorAll(':scope > .lv-ring, :scope > .lv-n, :scope > .lv-chip, :scope > .lv-hand, :scope > .lv-clash, :scope > .lv-wtag, :scope > .lv-tl').forEach(e => { const r = e.getBoundingClientRect(); x0 = Math.min(x0, (r.left - wr.left) / k); y0 = Math.min(y0, (r.top - wr.top) / k); x1 = Math.max(x1, (r.right - wr.left) / k); y1 = Math.max(y1, (r.bottom - wr.top) / k); });
    return x1 > x0 ? { x0: x0 - 24, y0: y0 - 24, x1: x1 + 24, y1: y1 + 24 } : null;
  };
  const fit = () => {
    const st = doc.getElementById('lvStage'), w = doc.getElementById('lvW'); if (!st || !w) return; const r = st.getBoundingClientRect(); if (r.width < 50 || r.height < 50) return;
    const ph = r.width < 760, top = ph ? 8 : 196, bot = ph ? 8 : 100, right = ph ? 0 : 412, aw = r.width - right, ah = r.height - top - bot;
    const b = BB || { x0: 0, y0: 0, x1: W, y1: H }, bw = b.x1 - b.x0, bh = b.y1 - b.y0;
    const k = ph ? Math.max(Math.min(aw / bw, ah / bh), .5) : Math.min(aw / bw, ah / bh, 1.08);
    w.style.transform = `translate(${(aw - bw * k) / 2 - b.x0 * k + PAN.x}px, ${top + (ah - bh * k) / 2 - b.y0 * k + PAN.y}px) scale(${k})`;
  };
  const paint = () => {
    const pv = doc.getElementById('pv'); if (!pv) return;
    pv.hidden = false; pv.classList.add('lv-pv'); pv.innerHTML = html(); BB = null; fit(); BB = measure(); fit(); requestAnimationFrame(fit); const st = doc.getElementById('lvStage'); if (st && window.ResizeObserver) { ro.disconnect(); ro.observe(st); }
    const w = doc.getElementById('lvW'); if (dir && w && !RM) { w.classList.add(dir > 0 ? 'from-in' : 'from-out'); requestAnimationFrame(() => requestAnimationFrame(() => w.classList.remove('from-in', 'from-out'))); }
    dir = 0;
  };
  const rail0 = () => { const r = doc.querySelector('.lv-rail'); if (r) r.outerHTML = rail(); };
  const setLvl = (k, d) => { if (k === L.lvl) return; PAN.x = PAN.y = 0; const a = LEVELS.findIndex(l => l[0] === L.lvl), b = LEVELS.findIndex(l => l[0] === k); dir = d || (b < a ? 1 : -1); L.lvl = k; paint(); };
  VIEW.live = ['Live', 'spark'];
  PAGES.org.t = 'Live picture';
  PAGES.org.views = ['live', 'map', 'db'];
  S.view.org = 'live';
  const _rc = renderContent;
  renderContent = function () { _rc(); const pv = doc.getElementById('pv'); if (S.page === 'org' && curView() === 'live') paint(); else if (pv) pv.classList.remove('lv-pv'); };
  addEventListener('resize', fit);

  let wheelAt = 0, wsum = 0;
  addEventListener('wheel', e => {
    const st = e.target.closest && e.target.closest('#lvStage'); if (!st) return;
    e.preventDefault(); wsum += e.deltaY; const t = Date.now(); if (t - wheelAt < 650 || Math.abs(wsum) < 60) return;
    const out = wsum > 0, i = LEVELS.findIndex(l => l[0] === L.lvl), j = Math.max(0, Math.min(LEVELS.length - 1, i + (out ? 1 : -1))); wsum = 0; wheelAt = t;
    if (j !== i) setLvl(LEVELS[j][0], out ? -1 : 1);
  }, { passive: false });
  let drag = null, dragged = false;
  addEventListener('pointerdown', e => { const st = e.target.closest && e.target.closest('#lvStage'); if (!st || e.target.closest('[data-lv], button')) return; drag = { x: e.clientX, y: e.clientY, px: PAN.x, py: PAN.y }; st.classList.add('drag'); });
  addEventListener('pointermove', e => { if (!drag) return; const dx = e.clientX - drag.x, dy = e.clientY - drag.y; if (Math.abs(dx) + Math.abs(dy) > 4) dragged = true; PAN.x = drag.px + dx; PAN.y = drag.py + dy; fit(); });
  addEventListener('pointerup', () => { if (!drag) return; drag = null; const st = doc.getElementById('lvStage'); if (st) st.classList.remove('drag'); setTimeout(() => { dragged = false; }, 0); });
  let pinch = null;
  addEventListener('touchstart', e => { if (e.touches.length === 2 && e.target.closest('#lvStage')) pinch = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY); }, { passive: true });
  addEventListener('touchmove', e => { if (!pinch || e.touches.length !== 2) return; const d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY), i = LEVELS.findIndex(l => l[0] === L.lvl); if (Math.abs(d - pinch) > 70) { const j = Math.max(0, Math.min(3, i + (d < pinch ? 1 : -1))); pinch = null; setLvl(LEVELS[j][0]); } }, { passive: true });
  addEventListener('touchend', () => { pinch = null; });

  addEventListener('click', e => {
    if (!e.target.closest || !e.target.closest('#lv')) return;
    let m;
    if ((m = e.target.closest('[data-lvlvl]'))) return setLvl(m.dataset.lvlvl);
    if (e.target.closest('[data-lvfit]')) { PAN.x = PAN.y = 0; const w = doc.getElementById('lvW'); if (w) { w.style.transition = 'transform .45s var(--hf-ease)'; fit(); setTimeout(() => { w.style.transition = ''; }, 460); } return; }
    if (dragged) { dragged = false; return; }
    if ((m = e.target.closest('[data-lvtab]'))) { L.tab = m.dataset.lvtab; return rail0(); }
    if ((m = e.target.closest('[data-lvdec]'))) {
      const d = DEC.find(x => x.id === m.dataset.lvdec); L.dec[d.id] = m.dataset.a;
      const t = LT.find(x => x.id === d.id); if (t && m.dataset.a === d.a[0]) { t.st = 'run'; t.steps = t.steps.map(([s, k]) => [s, k === 'gate' ? 'done' : k === 'next' ? 'run' : k]); t.n = 0; t.of = 1; t.u = 'step'; }
      logIt(S.meId || 'florin', `${m.dataset.a === d.a[0] ? 'Approved' : 'Answered “' + m.dataset.a + '” on'}: ${d.q.charAt(0).toLowerCase() + d.q.slice(1)}`, 'person');
      return paint();
    }
    if ((m = e.target.closest('[data-lvundo]'))) { const id = m.dataset.lvundo, d = DEC.find(x => x.id === id), t = LT.find(x => x.id === id); delete L.dec[id]; if (t) { const o = LT_INIT[id]; Object.assign(t, JSON.parse(JSON.stringify(o))); } logIt(S.meId || 'florin', `Took back the answer on ${d.q.charAt(0).toLowerCase() + d.q.slice(1)}`, 'person'); return paint(); }
    if ((m = e.target.closest('[data-lvconf]'))) {
      const v = m.dataset.lvconf; L.conflict = v === 'undo' ? 'open' : v;
      logIt('johnny', v === 'join' ? 'Had Iris join Mark on the Henderson follow-up' : v === 'keep' ? 'Kept Mark and Iris apart, with a warning to Rick' : 'Reopened the Henderson double-up', 'hf');
      return paint();
    }
    if ((m = e.target.closest('[data-lv]'))) {
      const [k, id] = m.dataset.lv.split(':');
      if (k === 'team') { L.team = id; L.tab = L.tab === 'rec' ? 'rec' : 'crew'; return L.lvl === 'team' ? paint() : setLvl('team', 1); }
      if (k === 'person') { L.person = id; L.tab = 'now'; return setLvl('me', 1); }
      if (k === 'open') { if (PEOPLE[id]) openProfile('p:' + id); return; }
      if (k === 'hf') { hfOpenChat(true); return; }
      if (k === 'agent') { const t = taskOf(id); if (t) { L.sel = t.id; L.tab = 'now'; return paint(); } openProfile('a:' + id); return; }
      if (k === 'task') { L.sel = id; L.tab = 'now'; return paint(); }
      if (k === 'unsel') { L.sel = null; return paint(); }
      if (k === 'clash') { L.tab = 'now'; L.sel = null; return paint(); }
    }
  }, true);
  addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && e.target.matches && e.target.matches('#lv [data-lv][role=button]')) { e.preventDefault(); e.target.click(); } });
  addEventListener('submit', e => {
    const f = e.target.closest && e.target.closest('[data-steer]'); if (!f) return; e.preventDefault();
    const v = f.querySelector('input').value.trim(); if (!v) return; const t = LT.find(x => x.id === f.dataset.steer);
    logIt(S.meId || 'florin', `Left ${firstOf(t.who)} a note: “${v}”`, 'person'); f.querySelector('input').value = ''; toast(`${firstOf(t.who)} reads it before the next step.`);
  }, true);
  const LT_INIT = Object.fromEntries(LT.map(t => [t.id, JSON.parse(JSON.stringify(t))]));

  /* ---------- live: progress ticks and moving cursors (paused when hidden or reduced motion) ---------- */
  const SPOTS = () => [...doc.querySelectorAll('#lvW .lv-n:not(.mini):not(.lv-hf)')].map(e => [parseFloat(e.style.left), parseFloat(e.style.top)]).filter(p => p[0] && p[1]);
  setInterval(() => {
    if (doc.hidden || !doc.getElementById('lv')) return;
    LT.forEach(t => { if (t.st === 'run' && t.of && Math.random() < .35 && t.n < t.of - 1) { t.n++; doc.querySelectorAll(`[data-prog="${t.id}"]`).forEach(e => { e.textContent = e.textContent.replace(/^\d+/, t.n); }); doc.querySelectorAll(`[data-bar="${t.id}"]`).forEach(e => { e.style.width = Math.round(100 * t.n / t.of) + '%'; }); } });
    if (RM) return; const sp = SPOTS(); if (!sp.length) return;
    doc.querySelectorAll('#lvW .lv-cur').forEach(c => { const [x, y] = sp[Math.floor(Math.random() * sp.length)]; c.style.left = (x + 18) + 'px'; c.style.top = (y + 14) + 'px'; });
  }, 2600);

  /* ---------- running now: replaces the "Happening now" label on Home, no container ---------- */
  const pill = () => {
    const h = doc.querySelector('.ap2-h'); if (!h) return;
    const run = LT.filter(t => t.st === 'run').length, need = openDec().length, txt = `${run} working · ${need} need you`;
    let p = h.querySelector('.hf-running');
    if (!p) {
      const lab = h.querySelector(':scope > b'); if (lab) lab.hidden = true; const lv = h.querySelector('.ap2-live'); if (lv) lv.hidden = true;
      p = doc.createElement('button'); p.type = 'button'; p.className = 'hf-running';
      p.addEventListener('click', () => { L.tab = 'now'; S.view.org = 'live'; go('org'); });
      h.prepend(p);
    }
    if (p.dataset.t !== txt) { p.dataset.t = txt; p.innerHTML = `${pix('make', 12)}<span>${run} working</span><i></i>${pix('needs', 12)}<span>${need} need you</span>`; p.setAttribute('aria-label', `Running now: ${txt}. Open the live picture.`); }
  };
  new MutationObserver(() => pill()).observe(doc.body, { childList: true, subtree: true });
  pill();
  /* Home: the catch-up line says only what finished, with Catch up as a link */
  const since = () => doc.querySelectorAll('button.ux-since').forEach(bt => {
    if (S.vas === 'mgr' || S.vas === 'emp') return;
    const m = bt.innerHTML.match(/finished <b>(\d+)<\/b>/); if (!m) return;
    const p = doc.createElement('p'); p.className = 'hf-since';
    p.innerHTML = `Since yesterday your team finished <b>${m[1]}</b> ${m[1] === '1' ? 'task' : 'tasks'}. <button type="button" class="hf-since-go" data-uxsince>Catch up</button>`;
    bt.replaceWith(p);
  });
  new MutationObserver(since).observe(doc.body, { childList: true, subtree: true }); since();
  /* Onboarding opener: not a summary of counts. HF1 shows it already sees the people, and what changes for them */
  try {
    const fn = id => first(id);
    const FACES = ['victor', 'corina', 'julian'];
    const faces = () => doc.querySelectorAll('#obx p:not([data-hfw])').forEach(p => {
      if (!/by hand\.$/.test(p.textContent.trim())) return; p.dataset.hfw = '1';
      let h = esc(p.textContent); FACES.forEach(id => { h = h.replace(esc(fn(id)), `<span class="hf-who">${av(id, 26)}${esc(fn(id))}</span>`); }); p.innerHTML = h;
    });
    new MutationObserver(faces).observe(doc.body, { childList: true, subtree: true, characterData: true });
    const who = id => fn(id);
    /* step one says hello and shows HF1 sees the team; connecting tools moves to step two */
    OBSAY.hello = [
      () => `Morning, ${S.me.name.split(' ')[0]}. I’ve been getting to know your people.`,
      () => `${who('victor')} is chasing 12 deals before month-end. ${who('corina')} is closing the books alone. ${who('julian')}’s techs retype every claim by hand.`,
      () => `With me, everyone sees the same picture, gets credit for what they do, and goes home on time.`
    ];
    OBSAY.tools = [() => { const t = SETUP_TOOLS[0] && TOOLS[SETUP_TOOLS[0][0]]; return `Let’s start with ${fn('julian')}’s team.${t ? ` Reconnect ${t.n} and their claims fill themselves.` : ''} Then pick anything else I should read.`; }];
    FR_N.hello = 1; FR_N.tools = 2; FR_N.widgets = 3; FR_N.build = 4;
    const _obc = obControls;
    obControls = function () {
      const h = _obc();
      if (S.fr.step === 'hello') {
        const { ag, pp } = uxTeam(), fc = ag.slice(0, 6).map(id => av(id, 30)).concat(pp.slice(0, 3).map(id => av(id, 30)));
        const known = `<div class="ux-known"><span class="ux-me">${av(S.meId, 40)}<span><b>${esc(S.me.name)}</b><small>${esc(S.me.role)} · ${esc(orgName())}</small></span></span><span class="ux-faces" title="Your team">${fc.map((f, i) => `<span style="--i:${i}">${f}</span>`).join('')}<small>+${Math.max(0, ag.length + pp.length - fc.length)}</small></span></div>`;
        return known + `<div class="ob-next"><button class="ob-go" type="button" data-hfhello>Show me how${ic('right')}</button></div>`; }
      if (S.fr.step === 'tools') { const i = h.indexOf('<div class="ob-tools">'); return i > 0 ? h.slice(i) : h; }
      return h;
    };
    addEventListener('click', e => { if (S.ob.done || !e.target.closest('[data-hfhello]')) return; e.stopImmediatePropagation(); S.obLog.push({ who: 'me', t: 'Show me how.', step: 'hello' }); S.fr.step = 'tools'; renderOb(); }, true);
    if (!S.ob.done && S.fr.step === 'tools' && !SETUP_TOOLS.some(([k]) => toolOk(k))) { S.fr.step = 'hello'; S.obLog = S.obLog.filter(m => m.step !== 'tools'); S.obStep = null; renderOb(); }
  } catch (e) {}
  /* onboarding: a re-render that says nothing new (a tool connecting) patches in place, no replayed fade */
  const _rob = renderOb;
  renderOb = function () {
    const ox = doc.getElementById('obx'), still = !!ox && S.obStep === S.fr.step && !S.obLog.some(m => m.n);
    _rob(); if (ox) ox.classList.toggle('still', still);
  };
  window.__hfLive = L;
})();
