/* ================= Experiment: revamp (Home first) =================
   Look and layout only. Every click still goes to the same handlers:
   this layer moves and relabels existing elements, it never adds behaviour of its own
   except the "…" menu, which only re-clicks the card's own Later and Open full details. */
(() => {
  const doc = document;
  doc.documentElement.classList.add('rv');
  const font = doc.createElement('link');
  font.rel = 'stylesheet';
  font.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap';
  doc.head.appendChild(font);

  // HF1 lives in one ask bar at the bottom
  const bell = doc.getElementById('bell');
  if (bell) { const l = bell.querySelector('.hfbtn-l'); if (l) l.textContent = 'Ask HF1, or say what you want done'; bell.setAttribute('aria-label', 'Ask HF1'); }

  const qItem = id => (typeof QUEUE !== 'undefined' ? QUEUE.find(q => q.id === id) : null);
  const openCount = () => { try { return qOpen().length; } catch (e) { return 0; } };

  let menu = null;
  const closeMenu = () => { if (menu) { menu.remove(); menu = null; } };
  doc.addEventListener('click', e => { if (menu && !menu.contains(e.target) && !e.target.closest('.rv-more')) closeMenu(); }, true);
  doc.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
  const openMenu = (btn, card) => {
    closeMenu();
    const items = [];
    const later = card.querySelector('[data-qact="later"]');
    const more = card.querySelector('.qc-more');
    if (later) items.push(['Later', later]);
    if (more) items.push([more.textContent.trim() || 'Open full details', more]);
    if (!items.length) return;
    menu = doc.createElement('div');
    menu.className = 'rv-menu'; menu.setAttribute('role', 'menu');
    items.forEach(([label, target]) => {
      const b = doc.createElement('button'); b.type = 'button'; b.setAttribute('role', 'menuitem'); b.textContent = label;
      b.addEventListener('click', () => { closeMenu(); target.click(); });
      menu.appendChild(b);
    });
    doc.body.appendChild(menu);
    const r = btn.getBoundingClientRect();
    menu.style.top = (r.bottom + 8) + 'px';
    menu.style.left = Math.max(12, r.right - menu.offsetWidth) + 'px';
    menu.querySelector('button').focus();
  };

  const shapeCard = card => {
    if (card.dataset.rv) return;
    card.dataset.rv = '1';
    const h = card.querySelector('.qc-h');
    if (!h) return;
    // under the name: what they want, and how long they've waited
    const it = qItem(card.dataset.q);
    const who = h.querySelector('.who');
    if (who && it && !card.classList.contains('teach')) {
      const sm = who.querySelector('small') || who.appendChild(doc.createElement('small'));
      const wait = it.wait ? ` · waiting ${it.wait}` : '';
      sm.textContent = (it.idea ? 'Has an idea for you' : 'Needs your OK') + wait;
      sm.classList.add('rv-want');
    }
    if (!h.querySelector('.rv-more') && (card.querySelector('[data-qact="later"]') || card.querySelector('.qc-more'))) {
      const b = doc.createElement('button');
      b.type = 'button'; b.className = 'rv-more'; b.setAttribute('aria-label', 'More options'); b.setAttribute('aria-haspopup', 'menu');
      b.innerHTML = '<svg viewBox="0 0 18 4" aria-hidden="true"><circle cx="2" cy="2" r="1.6"/><circle cx="9" cy="2" r="1.6"/><circle cx="16" cy="2" r="1.6"/></svg>';
      b.addEventListener('click', e => { e.stopPropagation(); menu ? closeMenu() : openMenu(b, card); });
      h.appendChild(b);
    }
    // gain sits bottom left, actions bottom right
    const g = card.querySelector('.qgain'), f = card.querySelector('.qc-f');
    if (g && f && g.parentElement !== f) f.prepend(g);
  };

  const dots = stack => {
    let d = stack.parentElement.querySelector(':scope > .rv-dots');
    const total = typeof QUEUE !== 'undefined' ? QUEUE.length : 0, open = openCount();
    if (!total || !open) { if (d) d.remove(); return; }
    if (!d) { d = doc.createElement('div'); d.className = 'rv-dots'; d.setAttribute('role', 'img'); stack.after(d); }
    const done = total - open, key = `${done}/${total}`;
    if (d.dataset.k === key) return;
    d.dataset.k = key;
    d.setAttribute('aria-label', `Decision ${done + 1} of ${total}`);
    d.innerHTML = Array.from({ length: total }, (_, i) => `<i class="${i < done ? 'done' : i === done ? 'cur' : ''}"></i>`).join('');
  };

  const ensure = () => {
    // shorter nav labels so the line fits
    doc.querySelectorAll('.tree .tr .lab').forEach(l => { if (l.textContent === 'Organization settings') l.textContent = 'Settings'; });
    const desk = doc.querySelector('.desk-in');
    if (desk) {
      let L = desk.querySelector(':scope > .rv-left');
      if (!L) { L = doc.createElement('div'); L.className = 'rv-left'; desk.prepend(L); }
      const greet = desk.querySelector(':scope > header.greet');
      if (greet) L.prepend(greet);
      const acts = desk.querySelector(':scope > .desk-acts');
      if (acts) L.appendChild(acts);
      doc.querySelectorAll('#actPrev').forEach(ap => {
        if (ap.parentElement === L) return;
        L.querySelectorAll('#actPrev').forEach(o => o.remove());
        L.appendChild(ap);
      });
      const a2 = L.querySelector(':scope > .desk-acts'); if (a2 && a2 !== L.lastElementChild) L.appendChild(a2);
    }
    doc.querySelectorAll('.qc.front').forEach(shapeCard);
    const st = doc.getElementById('stack'); if (st) dots(st);
  };
  let queued = false;
  new MutationObserver(() => { if (queued) return; queued = true; requestAnimationFrame(() => { queued = false; ensure(); }); })
    .observe(doc.body, { childList: true, subtree: true });
  ensure();
})();
