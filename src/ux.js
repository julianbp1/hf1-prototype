
/* ================= First-minute experience =================
   Onboarding opens on what HF1 already knows; Home says what the team did since yesterday;
   HF1 names the page you're on everywhere. Wording, order and layout only: same data, same steps. */

/* 1. onboarding: recognition first, then only the gaps, the ones blocking someone first */
SETUP_TOOLS.sort((a, b) => (TOOLS[b[0]].expired ? 2 : /needs|paused/i.test(b[1]) ? 1 : 0) - (TOOLS[a[0]].expired ? 2 : /needs|paused/i.test(a[1]) ? 1 : 0));
const uxTeam = () => { const ag = Object.keys(AGENTS).filter(id => id !== 'johnny'), pp = Object.keys(PEOPLE).filter(p => p !== S.meId); return { ag, pp }; };
OBSAY.tools = [
  () => `Hi ${S.me.name.split(' ')[0]}. I’m HF1.`,
  () => { const { ag, pp } = uxTeam(), n = qOpen().length; return `I already know ${orgName()}: ${pp.length} people and ${ag.length} agents, and ${n} decision${n === 1 ? ' is' : 's are'} waiting for you. A few tools are missing, and the first ones are holding your team back.`; }
];
const _obControlsUX = obControls;
obControls = function () {
  const h = _obControlsUX();
  if (S.fr.step !== 'tools') return h;
  const { ag, pp } = uxTeam(), faces = ag.slice(0, 6).map(id => av(id, 30)).concat(pp.slice(0, 3).map(id => av(id, 30)));
  const known = `<div class="ux-known"><span class="ux-me">${av(S.meId, 40)}<span><b>${esc(S.me.name)}</b><small>${esc(S.me.role)} · ${esc(orgName())}</small></span></span><span class="ux-faces" title="Your team">${faces.map((f, i) => `<span style="--i:${i}">${f}</span>`).join('')}<small>+${Math.max(0, ag.length + pp.length - faces.length)}</small></span></div>`;
  return known + h;
};

/* 2. home: the first line is each role's aha moment (owner: the business ran; manager: my team is working;
   member: my agents did the boring part). Same items as Activity, only counted and named per role. */
const uxFaces = ids => ids.length ? `<span class="ux-faces sm">${ids.map((w, i) => `<span style="--i:${i}">${w === 'johnny' ? hfOrb(22) : av(w, 22)}</span>`).join('')}</span>` : '';
const uxNames = ids => { const n = ids.map(w => w === 'johnny' ? 'HF1' : AGENTS[w] ? AGENTS[w].n : first(w)); return n.length > 1 ? n.slice(0, -1).join(', ') + ' and ' + n[n.length - 1] : n[0] || ''; };
const uxPl = (n, one, many) => `<b>${n}</b> ${n === 1 ? one : many}`;
function uxSince() {
  const all = inboxThreads(), work = all.filter(t => !['setup', 'teach', 'decision'].includes(t.kind)), q = qOpen();
  let who = [], line = '', go = 'Catch up';
  if (S.vas === 'mgr') {
    const team = Object.keys(PEOPLE).filter(p => PEOPLE[p].mgr === S.meId), tAg = Object.keys(AGENTS).filter(a => a !== 'johnny' && (AGENTS[a].owner === S.meId || team.includes(AGENTS[a].owner)));
    const live = all.filter(t => t.kind === 'live' && (team.includes(t.who) || tAg.includes(t.who) || (t.a && tAg.includes(t.a.b))));
    who = [...new Set(live.flatMap(t => [t.who, t.a && t.a.b]).filter(w => w && (team.includes(w) || tAg.includes(w))))].slice(0, 5);
    const ex = q.filter(it => it.agent !== 'johnny').length;
    line = `${uxPl(who.length, 'person or agent', 'people and agents')} on your team ${who.length === 1 ? 'is' : 'are'} working right now${ex ? `, and ${uxPl(ex, 'exception comes', 'exceptions come')} with a draft ready` : ''}`;
    go = 'Watch them work';
  } else if (S.vas === 'emp') {
    const mine = [...new Set(q.map(it => it.agent).concat(Object.keys(AGENTS).filter(a => AGENTS[a].owner === S.meId)))].filter(a => a !== 'johnny' && AGENTS[a]);
    who = mine.slice(0, 4);
    const ready = q.filter(it => mine.includes(it.agent)).length;
    line = `Since yesterday ${esc(uxNames(mine))} got ${uxPl(ready, 'thing', 'things')} ready for you. You just finish ${ready === 1 ? 'it' : 'them'}`;
    go = 'See what they did';
  } else {
    const done = work.filter(t => ['done', 'info'].includes(t.st)).length, run = work.filter(t => ['active', 'loop'].includes(t.st)).length;
    if (!done && !run) return '';
    who = [...new Set(work.map(t => t.who).filter(w => w && w !== S.meId && (AGENTS[w] || PEOPLE[w])))].slice(0, 5);
    line = `Since yesterday your team finished ${uxPl(done, 'thing', 'things')} and ${uxPl(run, 'is', 'are')} running now`;
  }
  return `<button type="button" class="ux-since" data-uxsince>${uxFaces(who)}<span>${line}</span><span class="ux-go">${go}</span></button>`;
}
/* what each role sees first: the manager's first card is an agent's exception, the member's is their own agent's work */
{ const first = (k, fn) => { const L = QUEUES[k], i = L.findIndex(fn); if (i > 0) L.unshift(L.splice(i, 1)[0]); };
  first('mgr', it => it.agent !== 'johnny' && AGENTS[it.agent] && AGENTS[it.agent].owner === VIEWS.mgr.me);
  first('emp', it => AGENTS[it.agent] && AGENTS[it.agent].owner === VIEWS.emp.me); }
const _renderHomeUX = renderHome;
renderHome = function () {
  const h = _renderHomeUX();
  if (!S.ob.done || !h.includes('id="greetSub"')) return h;
  const i = h.indexOf('</header>');
  return i < 0 ? h : h.slice(0, i) + uxSince() + h.slice(i);
};
window.addEventListener('click', e => { if (e.target.closest('[data-uxsince]')) { e.stopImmediatePropagation(); openInbox(S.vas === 'mgr' ? 'active' : 'all'); } }, true);

/* 3. HF1 knows the page everywhere: the corner greeting names where you are and offers this page's suggestions */
const _renderHfxUX = renderHfx;
renderHfx = function (focus) {
  _renderHfxUX(focus);
  if (HFX.mode !== 'corner' || HFX.busy || (typeof fbOn === 'function' && fbOn())) return;
  for (let i = HFX.log.length - 1; i >= HFX.from; i--) if (HFX.log[i].who === 'me') return;
  const sum0 = PAGE_SUM[S.page], sum = sum0 && !/^That/.test(sum0) ? sum0 : '', sugs = hfSugs().slice(0, 3);
  $('#hxBody').innerHTML = `<div class="hx-hf"><div class="hx-t">You’re on ${esc(hfCtxName())}. ${sum ? esc(sum) : 'What should I do here?'}</div><div class="hx-acts">${sugs.map(x => `<button type="button" data-fbhs="${esc(x)}">${esc(x)}${ic('right')}</button>`).join('')}</div></div>`;
};
/* the first screen was drawn before these lines loaded: draw it again with the new opening */
if (!S.ob.done && S.fr.step === 'tools') { S.obLog = S.obLog.filter(m => m.step !== 'tools'); S.obStep = null; renderOb(); }
