/* ================= HF1 design system v2 · shell and Home =================
   New markup for the frame (top pill nav, ask bar, ground). Every control reuses the
   prototype's own handlers: nav buttons carry data-nav, the rest re-click the old control. */
(() => {
  const doc = document, root = doc.documentElement;
  root.classList.add('hf');
  const font = doc.createElement('link');
  font.rel = 'stylesheet'; font.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap';
  doc.head.appendChild(font);
  root.style.setProperty('--hf-grain', `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`);

  /* ground */
  const ground = doc.createElement('div');
  ground.className = 'hf-ground'; ground.setAttribute('aria-hidden', 'true');
  ground.innerHTML = '<i class="l1"></i><i class="l2"></i><i class="l3"></i><svg><filter id="hfg"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter><rect width="100%" height="100%" filter="url(#hfg)"/></svg>';
  doc.body.prepend(ground);

  /* top: brand · pill nav · search, goals, you */
  const PH = (d, s = 18) => `<svg viewBox="0 0 256 256" width="${s}" height="${s}" aria-hidden="true"><path d="${d}"/></svg>`;
  const P_SEARCH = 'M228.24,219.76l-51.38-51.38a86.15,86.15,0,1,0-8.48,8.48l51.38,51.38a6,6,0,0,0,8.48-8.48ZM38,112a74,74,0,1,1,74,74A74.09,74.09,0,0,1,38,112Z';
  const NIC = {"home": "M217.9,110.1l-80-80a14,14,0,0,0-19.8,0l-80,80A13.92,13.92,0,0,0,34,120v96a6,6,0,0,0,6,6h64a6,6,0,0,0,6-6V158h36v58a6,6,0,0,0,6,6h64a6,6,0,0,0,6-6V120A13.92,13.92,0,0,0,217.9,110.1ZM210,210H158V152a6,6,0,0,0-6-6H104a6,6,0,0,0-6,6v58H46V120a2,2,0,0,1,.58-1.42l80-80a2,2,0,0,1,2.84,0l80,80A2,2,0,0,1,210,120Z", "inbox": "M238,128a6,6,0,0,1-6,6H203.71l-38.34,76.68A6,6,0,0,1,160,214h-.3a6,6,0,0,1-5.31-3.85L95.51,55.57,61.46,130.48A6,6,0,0,1,56,134H24a6,6,0,0,1,0-12H52.14l38.4-84.48a6,6,0,0,1,11.07.34L160.74,193.1l33.89-67.78A6,6,0,0,1,200,122h32A6,6,0,0,1,238,128Z", "projects": "M216,50H40a6,6,0,0,0-6,6V208a14,14,0,0,0,14,14H88a14,14,0,0,0,14-14V158h52v18a14,14,0,0,0,14,14h40a14,14,0,0,0,14-14V56A6,6,0,0,0,216,50Zm-6,64H166V62h44ZM90,62v52H46V62Zm0,146a2,2,0,0,1-2,2H48a2,2,0,0,1-2-2V126H90Zm12-62V62h52v84Zm106,32H168a2,2,0,0,1-2-2V126h44v50A2,2,0,0,1,208,178Z", "flows": "M244.24,75.76l-32-32a6,6,0,0,0-8.48,8.48L225.51,74H208c-48,0-59.44,27.46-69.54,51.69-9.43,22.64-17.66,42.33-53,44.16a38,38,0,1,0,.06,12c43.34-2.06,54.29-28.29,64-51.55C159.44,106.53,168,86,208,86h17.51l-21.75,21.76a6,6,0,1,0,8.48,8.48l32-32A6,6,0,0,0,244.24,75.76ZM48,202a26,26,0,1,1,26-26A26,26,0,0,1,48,202Z", "agents": "M200,50H134V16a6,6,0,0,0-12,0V50H56A30,30,0,0,0,26,80V192a30,30,0,0,0,30,30H200a30,30,0,0,0,30-30V80A30,30,0,0,0,200,50Zm18,142a18,18,0,0,1-18,18H56a18,18,0,0,1-18-18V80A18,18,0,0,1,56,62H200a18,18,0,0,1,18,18ZM74,108a10,10,0,1,1,10,10A10,10,0,0,1,74,108Zm88,0a10,10,0,1,1,10,10A10,10,0,0,1,162,108Zm2,30H92a26,26,0,0,0,0,52h72a26,26,0,0,0,0-52Zm-22,12v28H114V150ZM78,164a14,14,0,0,1,14-14h10v28H92A14,14,0,0,1,78,164Zm86,14H154V150h10a14,14,0,0,1,0,28Z", "people": "M112.6,158.43a58,58,0,1,0-57.2,0A93.83,93.83,0,0,0,5.21,196.72a6,6,0,0,0,10.05,6.56,82,82,0,0,1,137.48,0,6,6,0,0,0,10-6.56A93.83,93.83,0,0,0,112.6,158.43ZM38,108a46,46,0,1,1,46,46A46.06,46.06,0,0,1,38,108Zm211,97a6,6,0,0,1-8.3-1.74A81.8,81.8,0,0,0,172,166a6,6,0,0,1,0-12,46,46,0,1,0-17.08-88.73,6,6,0,1,1-4.46-11.14,58,58,0,0,1,50.14,104.3,93.83,93.83,0,0,1,50.19,38.29A6,6,0,0,1,249,205Z", "knowledge": "M216,74H130.49l-27.9-27.9a13.94,13.94,0,0,0-9.9-4.1H40A14,14,0,0,0,26,56V200.62A13.39,13.39,0,0,0,39.38,214H216.89A13.12,13.12,0,0,0,230,200.89V88A14,14,0,0,0,216,74ZM40,54H92.69a2,2,0,0,1,1.41.59L113.51,74H38V56A2,2,0,0,1,40,54ZM218,200.89a1.11,1.11,0,0,1-1.11,1.11H39.38A1.4,1.4,0,0,1,38,200.62V86H216a2,2,0,0,1,2,2Z", "more": "M138,128a10,10,0,1,1-10-10A10,10,0,0,1,138,128ZM60,118a10,10,0,1,0,10,10A10,10,0,0,0,60,118Zm136,0a10,10,0,1,0,10,10A10,10,0,0,0,196,118Z"};
  const NAV = [['home', 'Home'], ['inbox', 'Activity'], ['projects', 'Tasks'], ['flows', 'Workflows'], ['agents', 'Agents'], ['people', 'People'], ['knowledge', 'Files']];
  const MORE = [['tools', 'Tools'], ['org', 'Organization'], ['settings', 'Settings']];
  const top = doc.createElement('header');
  top.className = 'hf-top';
  doc.body.appendChild(top);
  const curPage = () => {
    const p = S.page;
    if (p === 'profile' || p === 'agentnew') return String(S.prof || S.sub || '').startsWith('p:') ? 'people' : 'agents';
    return p;
  };
  const needs = () => { const a = doc.querySelector('.nav .nav-att'); return a && a.textContent.trim() !== '0' && a.textContent.trim() !== ''; };
  const rings = () => [...doc.querySelectorAll('.me-rings .mr svg')].map((s, i) => {
    const c = s.querySelector('circle:last-of-type'); let pct = .75;
    if (c) { const da = parseFloat(c.getAttribute('stroke-dasharray')) || 0, off = parseFloat(c.getAttribute('stroke-dashoffset')) || 0; if (da) pct = Math.max(0, Math.min(1, 1 - off / da)); }
    const col = ['#3e4a2c', '#6e7b3e', '#a9b78d'][i % 3];
    return `<i style="background: conic-gradient(${col} 0 ${Math.round(pct * 100)}%, rgba(30,33,27,.12) 0)"></i>`;
  }).join('');
  let topKey = '';
  const renderTop = () => {
    const cur = curPage(), moreOn = MORE.some(([k]) => k === cur);
    const avImg = doc.querySelector('#meAv img');
    const key = cur + needs() + rings() + (avImg ? avImg.getAttribute('src') : S.me.name);
    if (key === topKey) return; topKey = key;
    top.innerHTML = `<button type="button" class="hf-brand" data-nav="home">Halloway</button>
      <div class="hf-navwrap"><nav class="hf-nav" aria-label="Main">${NAV.map(([k, l]) => `<button type="button" data-nav="${k}" aria-label="${l}"${cur === k ? ' aria-current="page"' : ''}>${PH(NIC[k], 22)}<span class="lb">${l}</span>${k === 'inbox' && needs() ? '<span class="dot" aria-label="needs you"></span>' : ''}</button>`).join('')}<button type="button" data-hfmore aria-haspopup="menu" aria-label="More"${moreOn ? ' aria-current="page"' : ''}>${PH(NIC.more, 22)}<span class="lb">More</span></button></nav></div>
      <div class="hf-right"><button type="button" class="hf-icb" data-hfsearch aria-label="Search or jump to">${PH(P_SEARCH)}</button>
      <button type="button" class="hf-me" data-hfme aria-label="Your goals and account"><span class="hf-rings">${rings()}</span><span class="hf-av">${avImg ? `<img src="${avImg.getAttribute('src')}" alt="">` : esc((S.me.name || 'You').split(' ').map(w => w[0]).join('').slice(0, 2))}</span></button></div>`;
  };

  /* ask bar */
  const ask = doc.createElement('button');
  ask.type = 'button'; ask.className = 'hf-ask'; ask.setAttribute('aria-label', 'Ask HF1');
  ask.innerHTML = '<span class="hf-orb" aria-hidden="true"></span><span class="t">Ask HF1, or say what you want done</span><kbd>⌘K</kbd>';
  doc.body.appendChild(ask);
  ask.addEventListener('click', () => { const b = doc.getElementById('bell'); if (b) b.click(); });

  /* menus */
  let menu = null;
  const closeMenu = () => { if (menu) { menu.remove(); menu = null; } };
  const openMenu = (anchor, items) => {
    closeMenu();
    menu = doc.createElement('div'); menu.className = 'hf-menu'; menu.setAttribute('role', 'menu');
    items.forEach(it => {
      if (it === '-') { menu.appendChild(doc.createElement('hr')); return; }
      const b = doc.createElement('button'); b.type = 'button'; b.setAttribute('role', 'menuitem'); b.textContent = it[0];
      b.addEventListener('click', () => { closeMenu(); it[1](); });
      menu.appendChild(b);
    });
    doc.body.appendChild(menu);
    const r = anchor.getBoundingClientRect();
    menu.style.top = (r.bottom + 8) + 'px';
    menu.style.left = Math.min(innerWidth - menu.offsetWidth - 12, Math.max(12, r.right - menu.offsetWidth)) + 'px';
    const f = menu.querySelector('button'); if (f) f.focus();
  };
  const navTo = k => { const b = doc.createElement('button'); b.dataset.nav = k; b.hidden = true; doc.body.appendChild(b); b.click(); b.remove(); };
  doc.addEventListener('click', e => {
    if (menu && !menu.contains(e.target) && !e.target.closest('[data-hfmore],.rv-more')) closeMenu();
    if (e.target.closest('[data-hfmore]')) {
      const a = e.target.closest('[data-hfmore]');
      const sw = doc.getElementById('projSw');
      openMenu(a, [...MORE.map(([k, l]) => [l, () => navTo(k)]), ...(sw ? ['-', ['Switch project', () => sw.click()]] : [])]);
    } else if (e.target.closest('[data-hfsearch]')) { const b = doc.getElementById('askBtn'); if (b) b.click(); }
    else if (e.target.closest('[data-hfme]')) { const m = doc.querySelector('.me-top'); if (m) m.click(); }
  });
  doc.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });

  /* agents keep their pixel faces, recoloured to the warm palette */
  const WARM = { '6bcb77': 'a9b78d', '4d8af0': '9fb07a', 'f6d85b': 'e8c77a', 'f28ab2': 'e3a897', 'ff8a4c': 'f2c7a2', '9c7cf4': 'c9b99a', '3fc1c9': 'b5c69a', 'f25f5c': 'd9a08f', 'b8e05a': 'd6ec6b', '5bc0f5': 'cdd8b0' };
  if (typeof PX !== 'undefined' && PX.svg) {
    const _svg = PX.svg;
    PX.svg = id => _svg(id).replace(/#([0-9a-f]{6})/gi, (m, h) => WARM[h.toLowerCase()] ? '#' + WARM[h.toLowerCase()] : m);
    if (PX.color) { const _col = PX.color; PX.color = id => { const c = String(_col(id) || ''); const h = c.replace('#', '').toLowerCase(); return WARM[h] ? '#' + WARM[h] : c; }; }
  }

  /* agent orbs, agent accents and project dots, warmed to the palette (HF1 keeps its orb) */
  const W3 = [['#2f3a22', '#6e7b3e', '#e2efa8'], ['#3a2a1c', '#c98b5a', '#f6dcc0'], ['#2a3326', '#8fa476', '#e6eed2'], ['#3b2620', '#c58474', '#f3d2c6'], ['#33301c', '#b8a052', '#f1e6b4']];
  try { Object.keys(ORB).forEach((k, i) => { if (k !== 'johnny' && k !== 'hf1') ORB[k] = W3[i % W3.length]; }); } catch (e) {}
  const W1 = ['#6e7b3e', '#c98b5a', '#8fa476', '#c58474', '#b8a052', '#7d8a5a', '#a9b78d', '#d9a08f'];
  try { Object.keys(ACOL).forEach((k, i) => { if (k !== 'johnny') ACOL[k] = W1[i % W1.length]; }); } catch (e) {}
  try { Object.keys(PCOL).forEach((k, i) => { PCOL[k][0] = W1[i % W1.length]; }); } catch (e) {}
  try { FSH.splice(0, FSH.length, ...W1.slice(0, 7)); } catch (e) {}
  try { FTYPE.sheet[2] = '#6e7b3e'; FTYPE.pdf[2] = '#c58474'; FTYPE.doc[2] = '#8a7a4a'; FTYPE.image[2] = '#8fa476'; } catch (e) {}

  /* Home: welcome and activity left; the queue, then widgets, right */
  const _home = renderHome;
  renderHome = function () {
    const html = _home();
    if (!S.ob.done || S.building) return html;
    const t = doc.createElement('template'); t.innerHTML = html;
    const desk = t.content.querySelector('#desk'), din = desk && desk.querySelector('.desk-in');
    if (!din) return html;
    const L = doc.createElement('div'); L.className = 'hf-home-l';
    const R = doc.createElement('div'); R.className = 'hf-home-r';
    const greet = din.querySelector('.greet'), acts = din.querySelector('.desk-acts'), ap = din.querySelector('#actPrev'), grid = din.querySelector('.desk-grid');
    if (greet) L.appendChild(greet);
    if (ap) L.appendChild(ap);
    if (acts) L.appendChild(acts);
    if (grid) [...grid.children].forEach(c => R.appendChild(c));
    din.className = 'desk-in hf-home'; din.innerHTML = '';
    din.append(L, R);
    return t.innerHTML;
  };
  const moveAct = () => {
    const L = doc.querySelector('.hf-home-l'); if (!L) return;
    doc.querySelectorAll('#actPrev').forEach(ap => {
      if (ap.parentElement === L) return;
      L.querySelectorAll('#actPrev').forEach(o => o.remove());
      const a = L.querySelector('.desk-acts'); a ? L.insertBefore(ap, a) : L.appendChild(ap);
    });
  };

  /* queue card: what they want under the name, a "…" menu, gain bottom left, dots on the right */
  const qItem = id => QUEUE.find(q => q.id === id);
  const P_DOTS = 'M138,128a10,10,0,1,1-10-10A10,10,0,0,1,138,128ZM60,118a10,10,0,1,0,10,10A10,10,0,0,0,60,118Zm136,0a10,10,0,1,0,10,10A10,10,0,0,0,196,118Z';
  const shapeCard = card => {
    if (card.dataset.hf) return; card.dataset.hf = '1';
    const h = card.querySelector('.qc-h'); if (!h) return;
    const it = qItem(card.dataset.q), who = h.querySelector('.who');
    if (who && it && !card.classList.contains('teach')) {
      const sm = who.querySelector('small') || who.appendChild(doc.createElement('small'));
      sm.textContent = (it.idea ? 'Has an idea for you' : 'Needs your OK') + (it.wait ? ` · waiting ${it.wait}` : '');
    }
    const later = card.querySelector('[data-qact="later"]'), more = card.querySelector('.qc-more');
    if (!h.querySelector('.rv-more') && (later || more)) {
      const b = doc.createElement('button');
      b.type = 'button'; b.className = 'rv-more'; b.setAttribute('aria-label', 'More options'); b.setAttribute('aria-haspopup', 'menu');
      b.innerHTML = PH(P_DOTS);
      b.addEventListener('click', e => { e.stopPropagation(); if (menu) { closeMenu(); return; }
        const items = []; if (later) items.push(['Later', () => later.click()]); if (more) items.push([more.textContent.trim() || 'Open full details', () => more.click()]);
        items.push(['Ask HF1 about this', () => ask.click()]); openMenu(b, items); });
      h.appendChild(b);
    }
    const g = card.querySelector('.qgain'), f = card.querySelector('.qc-f');
    if (g && f && g.parentElement !== f) f.prepend(g);
  };
  const dots = () => {
    const st = doc.getElementById('stack'); if (!st || !st.closest('.hf-home')) return;
    let d = st.parentElement.querySelector(':scope > .rv-dots');
    let open = 0; try { open = qOpen().length; } catch (e) {}
    const total = QUEUE.length;
    if (!total || !open) { if (d) d.remove(); return; }
    if (!d) { d = doc.createElement('div'); d.className = 'rv-dots'; d.setAttribute('role', 'img'); st.after(d); }
    const done = total - open, k = `${done}/${total}`;
    if (d.dataset.k === k) return; d.dataset.k = k;
    d.setAttribute('aria-label', `Decision ${done + 1} of ${total}`);
    d.innerHTML = Array.from({ length: total }, (_, i) => `<i class="${i < done ? 'done' : i === done ? 'cur' : ''}"></i>`).join('');
  };
  /* the first goals widget becomes the moss tile; the pointer lights the others */
  const tiles = () => {
    const t = doc.querySelectorAll('.hf-home .tile[id^="tile-"]');
    t.forEach(x => x.classList.remove('hf-hero'));
    const hero = [...t].find(x => /goals/.test(x.id)) || t[0];
    if (hero) hero.classList.add('hf-hero');
  };
  doc.addEventListener('pointermove', e => {
    const tl = e.target.closest && e.target.closest('.hf-home .tile'); if (!tl) return;
    const r = tl.getBoundingClientRect();
    tl.style.setProperty('--mx', (e.clientX - r.left) + 'px'); tl.style.setProperty('--my', (e.clientY - r.top) + 'px');
  });

  /* ================= AffectUI pieces, ported to plain JS and dressed in moss and bone ================= */
  const RAYS = '<svg class="hf-rays" viewBox="0 0 16 16" aria-hidden="true">' + Array.from({ length: 8 }, (_, i) => `<line x1="8" y1="1.75" x2="8" y2="4.75" transform="rotate(${i * 45} 8 8)" style="animation-delay:${(i - 8) * 100}ms"/>`).join('') + '</svg>';
  const P_CHECK = 'M228.24,76.24l-128,128a6,6,0,0,1-8.48,0l-56-56a6,6,0,0,1,8.48-8.48L96,191.51,219.76,67.76a6,6,0,0,1,8.48,8.48Z';
  const P_X = 'M204.24,195.76a6,6,0,1,1-8.48,8.48L128,136.49,60.24,204.24a6,6,0,0,1-8.48-8.48L119.51,128,51.76,60.24a6,6,0,0,1,8.48-8.48L128,119.51l67.76-67.75a6,6,0,0,1,8.48,8.48L136.49,128Z';

  /* Thinking Loader: eight rays and a label that rolls through what HF1 is doing */
  const PHASES = ['Thinking', 'Reading what’s on screen', 'Checking with your agents', 'Writing it up'];
  const thinker = el => {
    if (el.dataset.hf) return; el.dataset.hf = '1';
    el.classList.add('hf-think'); el.setAttribute('role', 'status');
    el.innerHTML = RAYS + `<span class="hf-think-t"><span class="hf-lbl hf-shine" data-text="${PHASES[0]}">${PHASES[0]}</span></span>`;
    const box = el.querySelector('.hf-think-t'); let i = 0;
    const fit = () => { const c = box.querySelector('.hf-lbl:not(.out)'); if (c) box.style.width = (c.scrollWidth + 1) + 'px'; };
    fit();
    const t = setInterval(() => {
      if (!el.isConnected || i >= PHASES.length - 1) { clearInterval(t); return; }
      i++;
      const old = box.querySelector('.hf-lbl:not(.out)'); if (old) { old.classList.add('out'); old.classList.remove('hf-shine'); setTimeout(() => old.remove(), 340); }
      const n = doc.createElement('span'); n.className = 'hf-lbl hf-shine in'; n.dataset.text = PHASES[i]; n.textContent = PHASES[i];
      box.appendChild(n); fit();
    }, 1700);
  };
  /* "Happening now": the label shimmers while the work runs, rays instead of three dots */
  const running = () => doc.querySelectorAll('.ap2-tx:not([data-hf])').forEach(t => {
    t.dataset.hf = '1';
    const d = t.querySelector('.ap2-dots'); if (d) d.remove();
    t.dataset.text = t.textContent; t.classList.add('hf-shine');
    if (t.parentElement && !t.parentElement.querySelector('.hf-rays')) t.parentElement.insertAdjacentHTML('beforeend', RAYS);
  });

  /* Notification Stack: toasts become cards that stack; the front one reads, the others peek */
  const tStack = doc.createElement('div'); tStack.className = 'hf-toasts'; tStack.setAttribute('aria-live', 'polite');
  doc.body.appendChild(tStack);
  const tLayout = () => { const live = [...tStack.children].filter(c => !c.dataset.leaving); live.forEach((c, i) => { c.dataset.depth = Math.min(live.length - 1 - i, 3); }); };
  const tDismiss = c => { if (!c || c.dataset.leaving) return; c.dataset.leaving = '1'; tLayout(); setTimeout(() => { c.remove(); tLayout(); }, 340); };
  const tPush = m => {
    const c = doc.createElement('div'); c.className = 'hf-toast';
    c.innerHTML = `<span class="ic">${PH(P_CHECK, 16)}</span><span class="tx"></span><button type="button" class="x" aria-label="Dismiss">${PH(P_X, 14)}</button>`;
    c.querySelector('.tx').textContent = m;
    c.querySelector('.x').addEventListener('click', () => tDismiss(c));
    tStack.appendChild(c); tLayout();
    while (tStack.children.length > 4) tStack.firstElementChild.remove();
    setTimeout(() => tDismiss(c), 4200);
  };
  try { toast = function (m) { if (typeof HFX !== 'undefined' && HFX.busy) return; tPush(m); }; } catch (e) {}
  window.__hfToast = m => toast(m);

  /* Tooltip: a small moss label for controls that show no words; neighbours open at once */
  const tip = doc.createElement('div'); tip.className = 'hf-tip'; tip.setAttribute('role', 'tooltip'); tip.hidden = true;
  doc.body.appendChild(tip);
  let tipTimer = 0, tipHid = 0, tipFor = null;
  const tipLabel = el => el.dataset.tip || el.getAttribute('aria-label') || '';
  const hasWords = el => [...el.querySelectorAll('span,b,small')].some(s => s.offsetWidth > 2 && s.textContent.trim()) || [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim());
  const tipHide = () => { clearTimeout(tipTimer); if (!tip.hidden) { tip.hidden = true; tipHid = Date.now(); } tipFor = null; };
  const tipShow = el => {
    const l = tipLabel(el); if (!l || !el.isConnected) return;
    tip.textContent = l; tip.hidden = false; tip.dataset.instant = Date.now() - tipHid < 600 ? '1' : '';
    const r = el.getBoundingClientRect(), w = tip.offsetWidth, h = tip.offsetHeight;
    const below = r.top - h - 8 < 8;
    tip.dataset.side = below ? 'bottom' : 'top';
    tip.style.top = (below ? r.bottom + 8 : r.top - h - 8) + 'px';
    tip.style.left = Math.max(8, Math.min(innerWidth - w - 8, r.left + r.width / 2 - w / 2)) + 'px';
  };
  doc.addEventListener('pointerover', e => {
    if (e.pointerType === 'touch') return;
    const el = e.target.closest && e.target.closest('button, a, .av[title], [data-tip]');
    if (el === tipFor) return;
    tipHide(); if (!el) return;
    if (el.title) { el.dataset.tip = el.title; el.removeAttribute('title'); }
    if (!tipLabel(el) || hasWords(el)) return;
    tipFor = el; tipTimer = setTimeout(() => tipShow(el), Date.now() - tipHid < 600 ? 0 : 450);
  });
  doc.addEventListener('pointerdown', tipHide, true);
  doc.addEventListener('keydown', e => { if (e.key === 'Escape') tipHide(); });
  doc.addEventListener('scroll', tipHide, true);

  /* Segmented Control: the selected pill slides to its new place instead of jumping */
  const slid = {};
  const slide = (box, sel, key, cls) => {
    if (!box) return;
    const on = box.querySelector(sel);
    let th = box.querySelector(':scope > .hf-thumb');
    if (!on) { if (th) th.style.opacity = 0; return; }
    if (!th) { th = doc.createElement('i'); th.className = 'hf-thumb ' + (cls || ''); th.setAttribute('aria-hidden', 'true'); box.prepend(th); }
    box.classList.add('hf-slide');
    const x = on.offsetLeft, y = on.offsetTop, w = on.offsetWidth, h = on.offsetHeight, k = `${x},${y},${w},${h}`;
    if (th.dataset.k === k) return;
    const was = slid[key];
    if (!th.dataset.k && was && was !== k) { const [px, py, pw, ph] = was.split(',').map(Number); th.style.transition = 'none'; th.style.transform = `translate(${px}px,${py}px)`; th.style.width = pw + 'px'; th.style.height = ph + 'px'; th.getBoundingClientRect(); th.style.transition = ''; }
    th.dataset.k = k; th.style.opacity = 1;
    th.style.transform = `translate(${x}px,${y}px)`; th.style.width = w + 'px'; th.style.height = h + 'px';
    slid[key] = k;
  };
  const slides = () => {
    slide(top.querySelector('.hf-nav'), '[aria-current="page"]', 'nav', 'ink');
    doc.querySelectorAll('.vtabs').forEach((v, i) => slide(v, '[aria-pressed="true"],[aria-selected="true"]', 'vtabs:' + S.page + i, 'cream'));
    doc.querySelectorAll('.prf-tabs').forEach(v => slide(v, '[aria-selected="true"]', 'prf', 'well'));
  };

  /* full-screen sheets bring their own header: the shell steps back while one is open */
  const sheet = () => { const s = doc.getElementById('sheet'); root.classList.toggle('hf-sheet', !!(s && s.classList.contains('full') && s.getClientRects().length)); };

  const sync = () => {
    root.classList.toggle('hf-ob', !S.ob.done); root.dataset.hfpage = curPage();
    renderTop(); moveAct(); doc.querySelectorAll('.qc.front').forEach(shapeCard); dots(); tiles();
    doc.querySelectorAll('.hx-think').forEach(thinker); running(); sheet(); slides();
  };
  let queued = false;
  new MutationObserver(muts => {
    if (queued || muts.every(m => tStack.contains(m.target) || m.target === tip || (m.target.closest && m.target.closest('.hf-think-t')))) return;
    queued = true; requestAnimationFrame(() => { queued = false; sync(); });
  }).observe(doc.body, { childList: true, subtree: true });
  addEventListener('resize', () => { Object.keys(slid).forEach(k => delete slid[k]); doc.querySelectorAll('.hf-thumb').forEach(t => { t.dataset.k = ''; }); slides(); });
  sync();
})();
