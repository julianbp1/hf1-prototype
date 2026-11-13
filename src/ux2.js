
/* ================= Plan changes 4–8: read like sentences, show faces, not icons =================
   Flows read as one sentence. Agents carry a poster header and their track record. Tools say who is blocked.
   Files are grouped by the work they came from. Approval rules read aloud. Same data and actions throughout. */
const uxList = a => a.length > 1 ? a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1] : a[0] || '';
const uxWhen = w => /Just now/.test(w) ? 4 : /Today/.test(w) ? 3 : /Yesterday/.test(w) ? 2 : 1;

/* 4. a flow is a sentence: when this happens, this agent does that */
function uxFlowSentence(k) {
  const f = FLOWS[k], trig = f.nodes.find(n => n.k === 'trigger') || f.nodes[0], d = flowDesc(k).split(/(?<=\.)\s+/);
  const t = lc1(trig.t), every = /^(every|each)\b/.test(t);
  const head = every ? t.charAt(0).toUpperCase() + t.slice(1) : 'When ' + (/^new\b/.test(t) ? 'there’s a ' + t : t);
  return `${esc(head)}, <b>${esc(AGENTS[f.by].n)}</b> ${esc(lc1(d[0] || ''))}${d[1] ? ' ' + esc(d.slice(1).join(' ')) : ''}`;
}
flowCard = function (k) {
  const f = FLOWS[k], st = flowStatus(k), why = flowWhy(k), ow = flowOwner(k);
  return `<div class="fcard f3 ux-fc ${st === 'needs' ? 'needs' : ['paused', 'setup', 'draft'].includes(st) ? 'off' : ''}" id="fc-${k}" data-flow="${k}" role="button" tabindex="0" aria-label="${esc(f.n)}. ${FST[st][0]}">
    <div class="ux-fc-n">${esc(f.n)}</div>
    <p class="ux-fc-s">${uxFlowSentence(k)}</p>
    ${why ? `<div class="fc-why ${why[0]}">${esc(why[1])}</div>` : ''}
    <div class="fc-inv"><span class="avs">${[f.by].concat(f.people).map(p => av(p, 22)).join('')}</span><span class="fc-names">${esc(AGENTS[f.by].n)} with ${f.people.map(p => esc(first(p))).join(', ')}</span><span class="grow"></span><span class="fc-tools">${f.tools.map(ct).join('')}</span></div>
    <div class="fc-f"><span>${f.runs ? `Ran ${f.runs} times · last ${esc(lc1(flowLast(k)))}` : esc(flowLast(k))}</span><span class="grow"></span><span class="cell">${av(ow, 16)}${esc(first(ow))} owns it</span></div></div>`;
};

/* 5. an agent's profile opens like a contact poster, with its track record under its name */
const _renderProfileUX = renderProfile;
renderProfile = function () {
  const h = _renderProfileUX(), [k, id] = (S.prof || '').split(':');
  if (k !== 'a' || !AGENTS[id] || id === 'johnny' || !h.includes('<header class="prf-h">')) return h;
  const X = axOf(id), runs = FLOW_ORDER.filter(f => FLOWS[f].by === id).reduce((s, f) => s + FLOWS[f].runs, 0);
  const rec = [X.okTot ? `You approved <b>${X.okRun} of its last ${X.okTot}</b> requests without changes` : '', runs ? `<b>${runs}</b> flow runs` : ''].filter(Boolean).join(' · ');
  let out = h.replace('<header class="prf-h">', `<header class="prf-h ux-poster" style="--pc:${PX.color(id)}">`).replace('<span class="agtag">Agent</span>', '');
  const e = out.indexOf('</p>', out.indexOf('ux-poster'));
  if (rec && e > 0) out = out.slice(0, e + 4) + `<p class="ux-rec">${rec}</p>` + out.slice(e + 4);
  return out;
};

/* 6. tools: a tile says who is blocked, not an error code; connected tiles stay quiet */
toolCard = function (k) {
  const T = TOOLS[k], ok = toolOk(k), users = Object.keys(AGENTS).filter(a => AGENTS[a].tools.includes(k)), fl = FLOW_ORDER.filter(f => FLOWS[f].tools.includes(k)).length;
  const blockedA = users.filter(a => AGENTS[a].needs === k), blockedF = FLOW_ORDER.filter(f => FLOWS[f].need === k).length;
  const say = ok ? `Connected by ${T.by ? esc(first(T.by)) : 'you'}`
    : blockedA.length || blockedF ? `${esc(uxList(blockedA.map(a => AGENTS[a].n)))}${blockedA.length && blockedF ? ' and ' : ''}${blockedF ? `${blockedF} flow${blockedF === 1 ? '' : 's'}` : ''} ${blockedA.length + blockedF === 1 ? 'is' : 'are'} ${T.expired ? 'paused' : 'waiting'}`
    : `${esc(uxList(users.map(a => AGENTS[a].n)))} would use it`;
  const sub = ok ? `Used by ${users.length} agent${users.length === 1 ? '' : 's'}${fl ? ` and ${fl} flow${fl === 1 ? '' : 's'}` : ''}` : T.expired ? 'The sign-in expired yesterday' : 'Not connected yet';
  return `<div class="ccard ux-tc${ok ? '' : ' off'}${!ok && (blockedA.length || blockedF) ? ' blocks' : ''}${S.sel === 'tool:' + k ? ' sel' : ''}" data-ent="tool:${k}" id="tc-${k}" role="button" tabindex="0" aria-label="${esc(tname(k))}">
    <span class="cc-top"><span class="ct logo big${ok ? '' : ' off'}">${LOGOS[k] || T.ab}</span><span class="grow"></span><span class="avs">${(ok ? users : blockedA.length ? blockedA : users).slice(0, 4).map(a => av(a, 22)).join('')}</span></span>
    <b>${esc(tname(k))}</b><span class="ux-say">${say}</span><small>${esc(sub)}</small>
    ${ok ? '' : `<span class="cc-f"><button class="btn ${T.expired || blockedA.length ? 'btn-p' : 'btn-s'} sm" type="button" data-cconnect="${k}">${T.expired ? 'Reconnect' : 'Connect'}</button></span>`}</div>`;
};

/* 7. files: grouped by the work they came from, newest work first; folders stay one tap away */
const _renderFilesUX = renderFiles;
renderFiles = function () {
  if (S.fdir || curView() === 'db') return _renderFilesUX();
  const g = {};
  FILES.forEach(f => { const k = f.scope && PROJ[f.scope] ? f.scope : 'shared'; (g[k] = g[k] || []).push(f); });
  const groups = Object.entries(g).map(([k, fs]) => [k, fs.slice().sort((a, b) => uxWhen(fileCur(b).when) - uxWhen(fileCur(a).when))])
    .sort((a, b) => uxWhen(fileCur(b[1][0]).when) - uxWhen(fileCur(a[1][0]).when));
  const col = k => PROJ[k] ? PCOL[k][0] : '#5d616b', nm = k => PROJ[k] ? PROJ[k].n : 'Shared with everyone';
  const sec = groups.map(([k, fs]) => {
    const who = [...new Set(fs.map(f => fileCur(f).who))].filter(w => AGENTS[w] || PEOPLE[w]).slice(0, 4);
    return `<section class="ux-fg"><header><span class="ux-pdot" style="--c:${col(k)}"></span><b>${esc(nm(k))}</b><span class="avs">${who.map(w => av(w, 18)).join('')}</span><span class="grow"></span><button type="button" class="ux-more" data-fdir="${k}">All ${fs.length}</button></header><div class="fgrid files-g">${fs.slice(0, 4).map(fileCard).join('')}</div></section>`;
  }).join('');
  const FD = folders();
  const chips = FD.map(d => `<button type="button" class="ux-fchip" data-fdir="${d.id}"><span class="ux-pdot" style="--c:${d.col}"></span>${esc(d.n)}<small>${d.kb ? d.kb.length : d.files.length}</small></button>`).join('');
  return `<div class="files f3 ux-files"><p class="ux-lead">Files from the work they came from, newest first.</p>${sec}<div class="fl-sec">Every folder</div><div class="ux-fchips">${chips}</div></div>`;
};

/* 8. approval rules you can read aloud, with the faces each decision passes through */
const RSAY = [
  [['mark', 'victor', 'florin'], 'Mark can offer up to $1,000 over book. Rick can add $1,000 more. Anything above that comes to Tom.'],
  [['mark', 'florin'], 'Mark can give up to $500 off a new car. The general sales manager can go to $1,500. Anything above that comes to Tom.'],
  [['corina', 'florin'], 'Payments over $25,000 need two signatures: Linda first, then Tom.'],
  [['mike', 'julian', 'florin'], 'Mike checks the claim. David can approve goodwill up to $2,500. Anything above that comes to Tom.'],
  [['nova', 'iuliana', 'florin'], 'Nova suggests ad budget moves. Amira can approve up to $1,000. Anything above that comes to Tom.'],
  [['victor', 'florin'], 'A manager proposes a goal or target change. Tom approves it.']
];
const _renderSettingsUX = renderSettings;
renderSettings = function () {
  const h = _renderSettingsUX();
  const old = `<div class="rules-l">${RULES.map(([t, d, k]) => `<div class="rl">${kbi(k, 22)}<span class="grow"><b>${esc(t)}</b><small>${esc(d)}</small></span></div>`).join('')}</div>`;
  if (!h.includes(old)) return h;
  const neu = `<div class="rules-l ux-rules">${RULES.map(([t], i) => { const [path, say] = RSAY[i] || [[], '']; return `<div class="rl"><span class="ux-path">${path.map((w, j) => (isAgent(w) ? av(w, 22) : av(w, 22)) + (j < path.length - 1 ? '<i></i>' : '')).join('')}</span><span class="grow"><b>${esc(t)}</b><span class="ux-rs">${esc(say)}</span></span></div>`; }).join('')}</div>`;
  return h.replace(old, neu);
};
