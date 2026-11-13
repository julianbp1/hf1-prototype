
/* ================= Activity as a social feed =================
   Each item reads like a post from whoever did the work: who, when, what, a small embed, and an action bar.
   Click a post to open it (the full thread, conversation and composer), back returns to the same spot.
   Same data, same actions as before (approve, later, connect, OK, open, message); only the layout changes. */
IC.xreply = '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20.5l1.4-4.6A8 8 0 1 1 21 12z"/>';
IC.xclock = '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>';
IC.xeye = '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="2.8"/>';
const XS = { feed: 0, det: {} };
const xWho = t => t.who === 'johnny' ? 'HF1' : t.who && AGENTS[t.who] ? AGENTS[t.who].n : t.who && PEOPLE[t.who] ? nameOf(t.who) : t.kind === 'setup' ? 'Setup' : '';
const xHandle = t => t.who === 'johnny' ? 'Your agent' : t.who && AGENTS[t.who] ? AGENTS[t.who].job : t.who && PEOPLE[t.who] ? PEOPLE[t.who].role : 'Halloway Auto Group';
function xContext(t) {
  if (t.st === 'attention') return [ic('flag'), t.kind === 'teach' ? 'HF1 is learning from you' : t.kind === 'setup' ? 'Needs setup' : 'Waiting on you'];
  if (t.kind === 'live') return ['<span class="xp-live"></span>', 'Working now'];
  if (t.st === 'loop') return [ic('refresh'), 'Keeps running'];
  if (t.kind === 'story') return [ic('check'), 'After your decision'];
  if (t.kind === 'hf') return [hfOrb(12), 'You asked HF1'];
  return null;
}
function xEmbed(t) {
  if (t.kind === 'decision') { const it = t.it, ev = evCompact(it); return `<div class="xp-emb">${ev ? `<div class="xp-ev">${ev}</div>` : ''}${it.impact ? `<div class="xp-kv">${esc(it.impact)}</div>` : ''}</div>`; }
  if (t.kind === 'teach') return `<div class="xp-emb"><div class="xp-kv"><span>Rule</span>${esc(t.it.teach.rule)}</div></div>`;
  if (t.kind === 'live') { const p = liveProgress(t.a); return `<div class="xp-emb xp-prog"><span><b>${p}%</b>${esc(liveWho(t.a))}</span><span class="bar"><i style="width:${p}%"></i></span></div>`; }
  if ((t.kind === 'story' || t.kind === 'hf') && t.h && t.h.steps.length) {
    const S0 = t.h.steps, d = S0.filter(x => x.st === 'done').length, cur = S0.find(x => x.st === 'ask' || x.st === 'run');
    return `<div class="xp-emb xp-steps"><span class="xp-dots">${S0.map(x => `<i class="${x.st}"></i>`).join('')}</span><span>${cur ? esc(cur.t) : esc(S0[S0.length - 1].t)}</span><small>${d} of ${S0.length} steps</small></div>`;
  }
  return '';
}
function xActs(t) {
  const n = (S.tmsg[t.id] || []).filter(m => m.me).length, A = [];
  A.push(`<button type="button" class="xa" data-xa="reply" title="Reply">${ic('xreply')}<span>${n || ''}</span></button>`);
  if (t.kind === 'decision') { A.push(`<button type="button" class="xa ok" data-xa="approve">${ic('check')}<span>${esc(okLab(t.it))}</span></button>`); if (qState(t.it.id) !== 'later') A.push(`<button type="button" class="xa" data-xa="later">${ic('xclock')}<span>Later</span></button>`); }
  if (t.kind === 'teach') A.push(`<button type="button" class="xa ok" data-xa="teach1">${ic('check')}<span>${esc(t.it.teach.yes)}</span></button><button type="button" class="xa" data-xa="teach0">${ic('x')}<span>${esc(t.it.teach.no)}</span></button>`);
  if (t.kind === 'setup') { const k = (t.ref || '').startsWith('tool:') ? t.ref.slice(5) : null; A.push(k ? `<button type="button" class="xa ok" data-xa="connect" data-xk="${k}">${ic('zap')}<span>Connect ${esc(tname(k))}</span></button>` : `<button type="button" class="xa" data-xa="ref">${ic('right')}<span>Open</span></button>`); }
  if (t.kind === 'live') A.push(`<button type="button" class="xa" data-xa="watch">${ic('xeye')}<span>Watch</span></button>`);
  if ((t.kind === 'story' || t.kind === 'hf') && t.ref) A.push(`<button type="button" class="xa" data-xa="ref">${ic('right')}<span>See where</span></button>`);
  if (t.kind === 'event') { if (t.st !== 'done') A.push(`<button type="button" class="xa ok" data-xa="ok">${ic('check')}<span>OK</span></button>`); if (t.ref) A.push(`<button type="button" class="xa" data-xa="ref">${ic('right')}<span>Open</span></button>`); }
  return `<div class="xp-acts">${A.join('')}</div>`;
}
function xPost(t) {
  const c = xContext(t);
  return `<article class="xp${t.unread ? ' unread' : ''}${t.st === 'attention' ? ' att' : ''}" data-xopen="${esc(t.id)}" tabindex="0">
    ${c ? `<div class="xp-ctx">${c[0]}<span>${c[1]}</span></div>` : ''}
    <div class="xp-row"><div class="xp-av">${iAvatar(t, 40)}</div><div class="xp-main">
      <div class="xp-hd"><b>${esc(xWho(t))}</b><span class="xp-h">${esc(xHandle(t) || '')}</span><span class="xp-dot">·</span><span class="xp-tm">${esc(t.time || '')}</span>${t.unread ? '<i class="xp-ud" title="New"></i>' : ''}</div>
      <p class="xp-t">${esc(t.title)}</p>${t.line ? `<p class="xp-l">${esc(t.line)}</p>` : ''}
      ${xEmbed(t)}${xActs(t)}</div></div></article>`;
}
function xHead(t) {
  const c = xContext(t);
  return `<header class="xd-h" data-xone="1">${c ? `<div class="xp-ctx">${c[0]}<span>${c[1]}</span></div>` : ''}<div class="xd-a">${iAvatar(t, 44)}<span><b>${esc(xWho(t))}</b><small>${esc(xHandle(t) || '')}</small></span></div><h2 class="xd-t">${esc(t.title)}</h2>${t.line && t.kind !== 'decision' ? `<p class="xp-l">${esc(t.line)}</p>` : ''}<div class="xd-m">${esc(t.time || '')}${t.kind ? ' · ' + esc({ decision: 'Decision', teach: 'HF1 is learning', setup: 'Setup', story: 'Follow-up', hf: 'HF1 thread', live: 'Live work', event: 'Update' }[t.kind] || '') : ''}</div>${xActs(t)}</header>`;
}
feedHTML = function () {
  const all = inboxThreads(), f = S.inbox.f, sel = S.inbox.sel && all.find(t => t.id === S.inbox.sel);
  if (sel) {
    S.read.add(sel.id);
    return `<div class="ibx xf xf-det"><div class="ibx-detail"><div class="xf-col"><div class="xf-bar"><button type="button" class="ib" data-xback aria-label="Back to Activity">${ic('arrowL')}</button><b>Activity</b><span class="grow"></span></div>${xHead(sel)}<div class="xf-thread${['story', 'hf'].includes(sel.kind) ? '' : ' noacts'}">${threadHTML(sel)}</div></div></div></div>`;
  }
  const list = all.filter(t => imatch(t, f));
  const order = f === 'all' && S.ifx.sort === 'new' ? [t => t.st === 'attention', t => ['active', 'loop'].includes(t.st), t => ['done', 'info'].includes(t.st)].flatMap(fn => list.filter(fn)) : list;
  const cnt = k => all.filter(t => imatch(t, k)).length;
  return `<div class="ibx xf"><div class="ibx-rows"><div class="xf-col"><div class="xf-top"><div class="ibx-hd"><div class="ibx-tabs" role="tablist">${IFILT.map(([k, l]) => `<button type="button" role="tab" data-if="${k}" aria-selected="${f === k}">${l}<span>${cnt(k)}</span></button>`).join('')}</div></div></div>
    <div class="xf-list">${order.map(xPost).join('') || '<p class="fd-empty">Nothing here. You’re all caught up.</p>'}</div></div></div></div>`;
};
function xOpen(id, focus) {
  const r = $('.xf .ibx-rows'); if (r) XS.feed = r.scrollTop;
  S.inbox.sel = id; S.read.add(id); renderContent(); renderNav();
  const d = $('.xf .ibx-detail'); if (d) d.scrollTop = 0;
  if (focus) setTimeout(() => { const d2 = $('.xf .ibx-detail'); if (d2) d2.scrollTop = d2.scrollHeight; const x = $('#iCompIn'); if (x) x.focus(); }, 30);
}
function xBack() { S.inbox.sel = null; renderContent(); const r = $('.xf .ibx-rows'); if (r) r.scrollTop = XS.feed; }
/* keep your place when the page refreshes itself */
const _renderContentX = renderContent;
renderContent = function () {
  const was = S.page === 'inbox' && $('.xf'), r = was && $('.xf .ibx-rows'), d = was && $('.xf .ibx-detail');
  if (r) XS.feed = r.scrollTop; if (d && S.inbox.sel) XS.det[S.inbox.sel] = d.scrollTop;
  _renderContentX();
  if (S.page !== 'inbox' || !$('.xf')) return;
  const r2 = $('.xf .ibx-rows'), d2 = $('.xf .ibx-detail');
  if (r2) r2.scrollTop = XS.feed; if (d2 && S.inbox.sel && XS.det[S.inbox.sel] != null) d2.scrollTop = XS.det[S.inbox.sel];
};
window.addEventListener('click', e => {
  if (S.page !== 'inbox' || !e.target.closest('.xf')) return;
  if (e.target.closest('[data-xback]')) { e.stopImmediatePropagation(); xBack(); return; }
  const a = e.target.closest('[data-xa]'), post = e.target.closest('[data-xopen],[data-xone]');
  if (a && post) {
    e.preventDefault(); e.stopImmediatePropagation();
    const id = post.dataset.xopen || S.inbox.sel, t = inboxThreads().find(x => x.id === id); if (!t) return;
    const k = a.dataset.xa;
    if (k === 'reply') { xOpen(id, true); return; }
    if (k === 'approve') { doApprove(t.it); afterQ(); toast('Approved. It’s at the top of your feed as it runs.'); }
    else if (k === 'later') { hlogQueue(t.it, 'later'); S.q[t.it.id] = 'later'; afterQ(); toast('Moved to later.'); }
    else if (k === 'teach1' || k === 'teach0') { const btn = document.querySelector(`[data-qteach="${k === 'teach1' ? 'yes' : 'no'}"]`); if (btn) btn.click(); else { S.qTeach = null; afterQ(); } }
    else if (k === 'connect') { connect(a.dataset.xk, a); setTimeout(() => { renderContent(); renderNav(); }, 760); return; }
    else if (k === 'watch') { openEntity('org:oc-' + t.a.a); return; }
    else if (k === 'ref') { const ref = t.ref; if (ref.startsWith('page:')) go(ref.slice(5)); else openEntity(ref); return; }
    else if (k === 'ok') { S.okd.add(id); S.read.add(id); }
    if (S.inbox.sel && !inboxThreads().some(x => x.id === S.inbox.sel)) S.inbox.sel = null;
    renderContent(); renderNav(); return;
  }
  if (e.target.closest('button, a, input, textarea, select, label, form')) return;
  const p = e.target.closest('[data-xopen]'); if (p) { e.stopImmediatePropagation(); xOpen(p.dataset.xopen); }
}, true);
window.addEventListener('keydown', e => {
  if (S.page !== 'inbox') return;
  if (e.key === 'Enter' && e.target.matches && e.target.matches('[data-xopen]')) { e.preventDefault(); xOpen(e.target.dataset.xopen); }
  if (e.key === 'Escape' && S.inbox.sel && $('.xf-det') && !HFX.mode && !(typeof T2 !== 'undefined' && T2.mode) && !e.target.closest('input, textarea')) { e.stopImmediatePropagation(); xBack(); }
}, true);
