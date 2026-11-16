/* ================= HF1 shell · tabs attached to the desktop, Motion everywhere =================
   The header is a light frame behind the desktop. The desktop is one rounded sheet; the active tab
   is cut from the same sheet, so it reads as attached. Motion (motion.dev, window.Motion) drives
   the tab, page changes, menus, toasts, the queue's full view and the gain flying into its goal. */
(() => {
  const doc = document, root = doc.documentElement;
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const M = () => (!RM && window.Motion && window.Motion.animate) ? window.Motion : null;
  const SPRING = { type: 'spring', stiffness: 420, damping: 38, mass: .9 };
  const SOFT = { type: 'spring', stiffness: 260, damping: 30 };
  const anim = (el, kf, o) => { const m = M(); if (!m || !el) return null; try { return m.animate(el, kf, Object.assign({}, SPRING, o)); } catch (e) { return null; } };
  const desk = () => innerWidth > 760 && !root.classList.contains('hf-ob');

  /* ---------- the frame ---------- */
  const NS = 'http://www.w3.org/2000/svg';
  const fr = doc.createElementNS(NS, 'svg'); fr.setAttribute('class', 'hf-frame'); fr.setAttribute('aria-hidden', 'true');
  fr.innerHTML = '<defs><filter id="hfFrBlur" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="7"/></filter><clipPath id="hfFrClip"><path class="fr-c" clip-rule="evenodd"/></clipPath></defs><path class="fr-bg" fill-rule="evenodd"/><g clip-path="url(#hfFrClip)"><path class="fr-sh" filter="url(#hfFrBlur)"/></g><path class="fr-edge"/>';
  doc.body.appendChild(fr);
  const P = { bg: fr.querySelector('.fr-bg'), c: fr.querySelector('.fr-c'), sh: fr.querySelector('.fr-sh'), edge: fr.querySelector('.fr-edge') };
  const G = { H: 54, m: 8, r: 20, top: 9, tr: 13, ir: 11 };
  const tab = { a: 0, b: 0, on: false };
  const hole = (W, H) => {
    const { H: T, m, r, top, tr, ir } = G, L = m, R = W - m, B = H - m;
    if (!tab.on || tab.b - tab.a < 20) return `M${L} ${T + r}Q${L} ${T} ${L + r} ${T}H${R - r}Q${R} ${T} ${R} ${T + r}V${B - r}Q${R} ${B} ${R - r} ${B}H${L + r}Q${L} ${B} ${L} ${B - r}Z`;
    const a = tab.a, b = tab.b;
    return `M${L} ${T + r}Q${L} ${T} ${L + r} ${T}H${a - ir}Q${a} ${T} ${a} ${T - ir}V${top + tr}Q${a} ${top} ${a + tr} ${top}H${b - tr}Q${b} ${top} ${b} ${top + tr}V${T - ir}Q${b} ${T} ${b + ir} ${T}H${R - r}Q${R} ${T} ${R} ${T + r}V${B - r}Q${R} ${B} ${R - r} ${B}H${L + r}Q${L} ${B} ${L} ${B - r}Z`;
  };
  const draw = () => {
    const W = innerWidth, H = innerHeight, h = hole(W, H), outer = `M0 0H${W}V${H}H0Z`;
    fr.setAttribute('viewBox', `0 0 ${W} ${H}`); fr.setAttribute('width', W); fr.setAttribute('height', H);
    P.bg.setAttribute('d', outer + h); P.c.setAttribute('d', outer + h); P.sh.setAttribute('d', h); P.edge.setAttribute('d', h);
  };
  let tabAnim = null;
  const moveTab = (instant) => {
    const cur = doc.querySelector('.hf-top .hf-nav button[aria-current="page"], .hf-top .hf-nav [data-hfmore][aria-current="page"]');
    if (!cur || !desk() || root.classList.contains('hf-swarming')) { if (tab.on) { tab.on = false; draw(); } return; }
    const r = cur.getBoundingClientRect(), a = Math.round(r.left), b = Math.round(r.right);
    if (tab.on && tab.a === a && tab.b === b) return;
    const m = M(); if (tabAnim) { try { tabAnim.stop(); } catch (e) {} tabAnim = null; }
    if (!tab.on || instant || !m) { tab.a = a; tab.b = b; tab.on = true; draw(); return; }
    const a0 = tab.a, b0 = tab.b;
    tabAnim = m.animate(0, 1, Object.assign({}, SPRING, { onUpdate: p => { tab.a = a0 + (a - a0) * p; tab.b = b0 + (b - b0) * p; draw(); } }));
  };
  addEventListener('resize', () => { tab.on = false; moveTab(true); });

  /* ---------- page changes: the content arrives, the tab slides ---------- */
  let lastPage = '', lastSel = '';
  const pageIn = () => {
    const pg = root.dataset.hfpage || '', sel = S.page === 'inbox' ? String(S.inbox && S.inbox.sel || '') : '';
    if (pg === lastPage && sel === lastSel) return;
    const first = !lastPage; lastPage = pg; lastSel = sel;
    moveTab(first);
    if (first) return;
    const pv = doc.getElementById('pv'), home = doc.querySelector('.area.home-mode .desk-in');
    const el = (pv && !pv.hidden && pv.getClientRects().length) ? pv : home;
    anim(el, { opacity: [0, 1], transform: ['translateY(10px)', 'translateY(0px)'] }, SOFT);
    anim(doc.getElementById('ptool'), { opacity: [0, 1] }, { duration: .3, type: 'tween' });
  };

  /* ---------- the queue's full view: the card comes to the centre, the rest steps away ---------- */
  let focused = false;
  const focus = () => {
    const d = doc.getElementById('desk'), on = !!(d && d.classList.contains('qfocus') && doc.querySelector('.hf-home'));
    root.classList.toggle('hf-qfocus', on);
    const col = doc.getElementById('stackcol'); if (!col) { focused = false; return; }
    if (on && !focused) {
      focused = true;
      const st = col.querySelector('#stack') || col, r = st.getBoundingClientRect();
      const dx = Math.round(innerWidth / 2 - (r.left + r.width / 2)), dy = Math.round(Math.max(0, (innerHeight - 100) / 2 - (r.top + Math.min(r.height, 560) / 2) + 20));
      col.style.setProperty('--qdx', dx + 'px'); col.style.setProperty('--qdy', dy + 'px');
    } else if (!on && focused) { focused = false; }
  };

  /* ---------- menus, popovers and toasts arrive on a spring ---------- */
  const seen = new WeakSet();
  const pops = () => {
    doc.querySelectorAll('.hf-menu, #popm.hf-pop, .hf-toast').forEach(el => {
      if (seen.has(el) || !el.getClientRects().length) return; seen.add(el);
      if (el.classList.contains('hf-toast')) anim(el, { opacity: [0, 1], transform: ['translateY(14px) scale(.96)', 'translateY(0px) scale(1)'] });
      else anim(el, { opacity: [0, 1], transform: ['translateY(-6px) scale(.97)', 'translateY(0px) scale(1)'] }, { stiffness: 520, damping: 34 });
    });
  };

  /* ---------- the gain flies into its goal ring next to your avatar ---------- */
  gainFly = function (it, r) {
    const g = GAIN[it.id]; if (!g) return;
    const ids = (TOPG[S.vas] || []), i = Math.max(0, it.goal ? ids.indexOf(it.goal.g) : 0);
    const rings = [...doc.querySelectorAll('.hf-top .hf-rings i')], tgt = rings[i] || rings[0] || doc.querySelector('.hf-top .hf-me');
    if (!tgt) return;
    const fly = doc.createElement('div'); fly.className = 'gfly'; fly.textContent = g[0];
    fly.style.left = r.left + 'px'; fly.style.top = r.top + 'px'; doc.body.appendChild(fly);
    const t = tgt.getBoundingClientRect(), fw = fly.getBoundingClientRect();
    const dx = t.left + t.width / 2 - r.left - fw.width / 2, dy = t.top + t.height / 2 - r.top - fw.height / 2;
    const m = M(), end = () => {
      fly.remove(); renderMeRings();
      const ring = [...doc.querySelectorAll('.hf-top .hf-rings i')][i] || tgt;
      if (m) m.animate(ring, { transform: ['scale(1)', 'scale(1.45)', 'scale(1)'] }, { duration: .6, ease: [.2, .9, .3, 1] });
      const pop = doc.createElement('span'); pop.className = 'hf-ringpop'; pop.textContent = g[0];
      const rr = ring.getBoundingClientRect(); pop.style.left = (rr.left + rr.width / 2) + 'px'; pop.style.top = (rr.bottom + 6) + 'px'; doc.body.appendChild(pop);
      if (m) m.animate(pop, { opacity: [0, 1, 1, 0], transform: ['translate(-50%, -4px)', 'translate(-50%, 0px)', 'translate(-50%, 0px)', 'translate(-50%, 6px)'] }, { duration: 1.4, ease: 'easeOut' }).then(() => pop.remove()); else setTimeout(() => pop.remove(), 1200);
    };
    if (!m) { fly.animate([{ transform: 'none' }, { transform: `translate(${dx}px, ${dy}px) scale(.3)`, opacity: .6 }], { duration: 900, easing: 'cubic-bezier(.5,0,.2,1)' }).finished.then(end, end); return; }
    m.animate(fly, { transform: ['translate(0px, 0px) scale(1)', `translate(${dx * .3}px, ${dy * .3 - 70}px) scale(1.18)`, `translate(${dx}px, ${dy}px) scale(.28)`], opacity: [1, 1, .7] }, { duration: 1.05, ease: [.45, 0, .2, 1], times: [0, .38, 1] }).then(end, end);
  };

  /* ---------- sync ---------- */
  const sync = () => {
    root.classList.toggle('hf-framed', desk());
    if (desk()) moveTab(false); else { tab.on = false; }
    pageIn(); focus(); pops();
  };
  let q = false;
  new MutationObserver(() => { if (q) return; q = true; requestAnimationFrame(() => { q = false; sync(); }); }).observe(doc.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'aria-current', 'data-hfpage'] });
  draw(); sync();
  window.__hfShell = { moveTab, draw };
})();
