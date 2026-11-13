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
  const NAV = [['home', 'Home'], ['inbox', 'Activity'], ['projects', 'Tasks'], ['flows', 'Workflows'], ['agents', 'Agents'], ['people', 'People'], ['knowledge', 'Files']];
  const MORE = [['tools', 'Tools'], ['org', 'Organization'], ['settings', 'Settings']];
  const top = doc.createElement('header');
  top.className = 'hf-top';
  doc.body.appendChild(top);
  const curPage = () => {
    const p = S.page;
    if (p === 'profile' || p === 'agentnew') return S.sub && String(S.sub).startsWith('p:') ? 'people' : 'agents';
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
      <div class="hf-navwrap"><nav class="hf-nav" aria-label="Main">${NAV.map(([k, l]) => `<button type="button" data-nav="${k}"${cur === k ? ' aria-current="page"' : ''}>${l}${k === 'inbox' && needs() ? '<span class="dot" aria-label="needs you"></span>' : ''}</button>`).join('')}<button type="button" data-hfmore aria-haspopup="menu"${moreOn ? ' aria-current="page"' : ''}>More</button></nav></div>
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

  const sync = () => { renderTop(); moveAct(); doc.querySelectorAll('.qc.front').forEach(shapeCard); dots(); tiles(); };
  let queued = false;
  new MutationObserver(() => { if (queued) return; queued = true; requestAnimationFrame(() => { queued = false; sync(); }); })
    .observe(doc.querySelector('.app') || doc.body, { childList: true, subtree: true });
  sync();
})();
