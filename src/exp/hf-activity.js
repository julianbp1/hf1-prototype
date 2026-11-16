/* ================= HF1 Activity · the organisation's ledger =================
   One header row like every page (title left, actions right), a feed of posts with one preview shape,
   an outcome strip attached under the preview, the task each post came from, an Unread tab for what
   happened while you were away, a live pixel mark, faces that open the person or agent. */
(() => {
  const doc = document, root = doc.documentElement;
  const pix = (k, s) => (window.__hfPix ? window.__hfPix(k, s) : '');
  const q = s => doc.querySelector(s), qa = s => [...doc.querySelectorAll(s)];
  const P_UP = '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="M7 17 17 7M9 7h8v8" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const P_TASK = '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="5" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="m8.5 12 2.4 2.4 4.6-4.8" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  /* Unread: what happened while you were away */
  if (!IFILT.some(f => f[0] === 'unread')) IFILT.splice(1, 0, ['unread', 'Unread']);

  /* which task a post belongs to: its own reference, or the task its agent or person is working on */
  const taskOf = t => {
    if (!t) return null;
    const ref = t.ref || (t.it && t.it.ref) || '';
    if (ref.startsWith('t:')) return TASKS.find(k => k.id === ref.slice(2)) || null;
    const txt = [t.title, t.line, t.it && t.it.why].join(' '), m = txt.match(/\b([A-Z]{2,4}-\d{2,3})\b/);
    if (m) { const k = TASKS.find(x => x.id === m[1]); if (k) return k; }
    if (t.who && ['live', 'story'].includes(t.kind)) return TASKS.find(k => k.o === t.who && k.s !== 'done') || null;
    return null;
  };
  const taskChip = k => k ? `<button type="button" class="xp-task" data-xtask="${esc(k.id)}" title="Open the task">${P_TASK}<span><em>${esc(k.id)}</em>${esc(k.t)}</span></button>` : '';
  const thread = id => inboxThreads().find(t => t.id === id);
  const outcome = t => t && t.kind === 'decision' && t.it && t.it.impact ? t.it.impact : null;
  /* only work that moves a KPI gets the green strip: the gain, and the pyramid it climbs (member, project, business) */
  const gainOf = t => t && t.kind === 'decision' && t.it && typeof GAIN !== 'undefined' && GAIN[t.it.id] ? GAIN[t.it.id] : null;
  const pyramid = it => {
    const own = AGENTS[it.agent] && AGENTS[it.agent].owner, pr = own && Object.values(PROJ).find(p => p.lead === own || (p.members || []).includes(own));
    let biz = 'Halloway goals'; try { if (it.goal && it.goal.g) biz = gOf(it.goal.g).t; } catch (e) {}
    return [[own && PEOPLE[own] ? `${first(own)}’s target` : null, 'Member'], [pr ? pr.n : null, 'Project'], [biz, 'Business']].filter(x => x[0]);
  };
  const kpi = t => { const g = gainOf(t); if (!g) return ''; return `<span class="kp-v">${esc(g[0])}</span><span class="kp-l">${esc(g[1])}</span><span class="kp-path">${pyramid(t.it).map(([n, l]) => `<span><em>${l}</em>${esc(n)}</span>`).join('<i aria-hidden="true">›</i>')}</span>`; };

  /* the new mark: one green pixel that goes 3 seconds after you've seen it */
  const io = 'IntersectionObserver' in window ? new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting || e.target._t) return; const el = e.target;
    el._t = setTimeout(() => { io.unobserve(el); S.read.add(el.dataset.id); const m = window.Motion; if (m && m.animate) m.animate(el, { opacity: 0, transform: 'scale(.2)' }, { duration: .4 }).then(() => el.remove()); else el.remove(); }, 3000);
  }), { threshold: .6 }) : null;
  const seeNew = (el, id) => { if (!el) return; el.dataset.id = id; if (io) io.observe(el); };

  /* ---------- feed: decorate each post once ---------- */
  const decorate = () => {
    qa('.xf .xp:not([data-hfa])').forEach(p => {
      p.dataset.hfa = '1'; const t = thread(p.dataset.xopen); if (!t) return;
      const av = p.querySelector('.xp-av');
      if (av && !av.querySelector('.xp-avb') && t.who && (AGENTS[t.who] || PEOPLE[t.who])) av.innerHTML = `<button type="button" class="xp-avb" data-xwho="${esc(t.who)}" aria-label="Open ${esc(xWho(t))}">${av.innerHTML}</button>`;
      if (t.unread && !p.querySelector('.xp-new')) { const tm = p.querySelector('.xp-tm'); if (tm) { tm.insertAdjacentHTML('afterend', '<i class="xp-new" title="New" aria-label="New"></i>'); seeNew(p.querySelector('.xp-new'), t.id); } }
      const nm = p.querySelector('.xp-hd b'); if (nm && t.who && (AGENTS[t.who] || PEOPLE[t.who])) { nm.dataset.xwho = t.who; nm.classList.add('xp-who'); }
      const kv = p.querySelector('.xp-kv'), k0 = kpi(t);
      if (k0) { const emb = p.querySelector('.xp-emb'); if (emb && !emb.querySelector('.xp-kpi')) emb.insertAdjacentHTML('beforeend', `<div class="xp-kpi">${k0}</div>`); }
      const k = taskOf(t), acts = p.querySelector('.xp-acts');
      if (k && acts && !acts.querySelector('.xp-task')) acts.insertAdjacentHTML('afterbegin', taskChip(k));
      const live = p.querySelector('.xp-ctx .xp-live'); if (live) live.outerHTML = pix('live', 12);
      const bar = p.querySelector('.xp-prog'); if (bar) bar.classList.add('hf-prog');
    });
    /* detail page */
    const det = q('.xf-det');
    if (det && !det.dataset.hfa) {
      det.dataset.hfa = '1'; const t = thread(S.inbox.sel); if (!t) return;
      const a = det.querySelector('.xd-a');
      if (a && t.who && (AGENTS[t.who] || PEOPLE[t.who])) a.outerHTML = `<button type="button" class="xd-a xp-avb" data-xwho="${esc(t.who)}" aria-label="Open ${esc(xWho(t))}">${a.innerHTML}</button>`;
      const live = det.querySelector('.xp-ctx .xp-live'); if (live) live.outerHTML = pix('live', 12);
      const k = taskOf(t), h = det.querySelector('.xd-h');
      if (k && h && !h.querySelector('.xp-task')) { const m = h.querySelector('.xd-m'); (m || h).insertAdjacentHTML('afterend', `<div class="xd-task">${taskChip(k)}</div>`); }
      const g = det.querySelector('.dd-gain'), k1 = kpi(t);
      if (g) g.remove();
      if (k1 && h && !det.querySelector('.xd-out')) h.insertAdjacentHTML('beforeend', `<div class="xp-kpi xd-out">${k1}</div>`);
      /* the outcome attaches under the preview, the same as in the feed */
      const out = det.querySelector('.xd-out'), prev = det.querySelector('.dd-sec .qd-ev, .dd-sec .ev');
      if (out && prev) { const w = doc.createElement('div'); w.className = 'xd-prev'; prev.replaceWith(w); w.appendChild(prev); w.appendChild(out); }
    }
  };

  /* ---------- header row: title left, search and filters on the same row, a fade under it ---------- */
  const header = () => {
    const tool = q('#ptool'); if (!tool) return;
    const inbox = S.page === 'inbox', det = inbox && S.inbox.sel;
    root.classList.toggle('hf-xdet', !!det);
    let back = tool.querySelector('.hf-back');
    if (det && !back) { tool.querySelector('.pt').insertAdjacentHTML('afterbegin', `<button type="button" class="hf-back" data-hfback aria-label="Back to Activity"><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M15 5 8 12l7 7" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></button>`); }
    if (!det && back) back.remove();
    const ifx = q('.xf-top .ifx');
    if (inbox && !det && ifx) {
      const was = doc.activeElement && doc.activeElement.id === 'ifxQ', pos = was ? doc.activeElement.selectionStart : 0;
      tool.querySelectorAll(':scope > .ifx, :scope > .hf-readall').forEach(e => e.remove());
      tool.appendChild(ifx); const un = inboxThreads().filter(t => t.unread).length;
      tool.insertAdjacentHTML('beforeend', `<button type="button" class="btn btn-s hf-readall" data-hfreadall${un ? '' : ' disabled'}>Mark all read</button>`);
      if (was) { const i = q('#ifxQ'); if (i) { i.focus(); try { i.setSelectionRange(pos, pos); } catch (e) {} } }
    }
    if (!inbox || det) tool.querySelectorAll(':scope > .ifx, :scope > .hf-readall').forEach(e => e.remove());
  };

  /* ---------- the ledger aside: while you were away, today, working now ---------- */
  const aside = () => {
    const rows = q('.xf .ibx-rows') || q('.xf .ibx-detail'); if (!rows) return;
    const all = inboxThreads(), un = all.filter(t => t.unread), live = all.filter(t => t.kind === 'live').slice(0, 4);
    const n = k => all.filter(t => imatch(t, k)).length;
    const sig = [un.length, live.length, n('attention'), n('done')].join(',');
    let a = rows.querySelector('.xf-side'); if (a && a.dataset.sig === sig) return;
    const h = `<aside class="xf-side" data-sig="${sig}" aria-label="Ledger summary">
      <section class="xs-card"><header><b>While you were away</b><small>since 18:40 yesterday</small></header>
        ${un.length ? `<ul class="xs-un">${un.slice(0, 3).map(t => `<li data-xopen="${esc(t.id)}" role="button" tabindex="0">${iAvatar(t, 26)}<span><b>${esc(xWho(t))}</b>${esc(t.title)}</span></li>`).join('')}</ul>
        <button type="button" class="xs-go" data-if="unread">See all ${un.length} unread</button>` : '<p class="xs-calm">Nothing new. You’re caught up.</p>'}</section>
      <section class="xs-card"><header><b>The ledger, today</b><small>every action on record</small></header>
        <div class="xs-stats"><span><b>${n('attention')}</b>need you</span><span><b>${n('active')}</b>in progress</span><span><b>${n('done')}</b>done</span><span><b>${all.length}</b>on record</span></div></section>
      ${live.length ? `<section class="xs-card"><header><b>Working now</b>${pix('live', 12)}</header><ul class="xs-live">${live.map(t => `<li data-xopen="${esc(t.id)}" role="button" tabindex="0">${iAvatar(t, 26)}<span><b>${esc(xWho(t))}</b>${esc(t.title)}</span></li>`).join('')}</ul></section>` : ''}
    </aside>`;
    if (a) a.outerHTML = h; else rows.insertAdjacentHTML('beforeend', h);
  };

  const sync = () => { if (S.page !== 'inbox') { root.classList.remove('hf-xdet'); const t = q('#ptool'); if (t) t.querySelectorAll(':scope > .ifx, :scope > .hf-readall, .hf-back').forEach(e => e.remove()); return; } header(); decorate(); aside(); };
  let queued = false;
  new MutationObserver(() => { if (queued) return; queued = true; requestAnimationFrame(() => { queued = false; sync(); }); }).observe(doc.body, { childList: true, subtree: true });

  /* clicks: avatars and names open the profile, the task chip opens the task, back, mark all read */
  addEventListener('click', e => {
    let m;
    if ((m = e.target.closest('[data-xwho]'))) { e.preventDefault(); e.stopImmediatePropagation(); const id = m.dataset.xwho; if (id === 'johnny') { hfOpenChat(true); return; } openProfile((AGENTS[id] ? 'a:' : 'p:') + id); return; }
    if ((m = e.target.closest('[data-xtask]'))) { e.preventDefault(); e.stopImmediatePropagation(); openEntity('t:' + m.dataset.xtask); return; }
    if (e.target.closest('[data-hfback]')) { e.preventDefault(); e.stopImmediatePropagation(); xBack(); return; }
    if (e.target.closest('[data-hfreadall]')) { e.preventDefault(); e.stopImmediatePropagation(); inboxThreads().forEach(t => S.read.add(t.id)); renderContent(); renderNav(); toast('Everything is marked as read.'); return; }
    if ((m = e.target.closest('.xf-side [data-xopen]'))) { e.preventDefault(); e.stopImmediatePropagation(); xOpen(m.dataset.xopen); return; }
    if ((m = e.target.closest('.xf-side [data-if]'))) { e.preventDefault(); e.stopImmediatePropagation(); S.inbox.f = m.dataset.if; S.inbox.sel = null; renderContent(); }
  }, true);

  /* ---------- the task page lists the activity that came from it ---------- */
  const taskActs = () => {
    const pn = q('#panel .pn-b'); if (!pn || S.panel !== 'detail' || !String(S.sel || '').startsWith('t:')) return;
    const k = TASKS.find(x => x.id === S.sel.slice(2)); if (!k || pn.querySelector('.hf-tacts')) return;
    const posts = inboxThreads().filter(t => taskOf(t) === k).slice(0, 5); if (!posts.length) return;
    pn.insertAdjacentHTML('beforeend', `<section class="hf-tacts"><h4>Activity from this task</h4><ul>${posts.map(t => `<li data-hftopen="${esc(t.id)}" role="button" tabindex="0">${iAvatar(t, 26)}<span><b>${esc(xWho(t))}</b>${esc(t.title)}<small>${esc(t.time || '')}</small></span></li>`).join('')}</ul></section>`);
  };
  new MutationObserver(() => requestAnimationFrame(taskActs)).observe(doc.body, { childList: true, subtree: true });
  addEventListener('click', e => { const m = e.target.closest('[data-hftopen]'); if (!m) return; e.stopImmediatePropagation(); S.panel = null; S.sel = null; S.inbox.sel = m.dataset.hftopen; go('inbox'); }, true);

  if (PAGES.flows) PAGES.flows.t = 'Workflows';
  window.__hfAct = { taskOf, decorate };
})();
