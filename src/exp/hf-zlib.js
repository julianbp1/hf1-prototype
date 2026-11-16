/* ================= HF1 component library =================
   Masters live here: each component lists its properties, shows its real instances (rendered by the
   same functions the prototype uses), and lists where it's used. Editing a property updates every
   instance in the prototype at once. Edits are kept in this browser; "Copy changes" hands them over
   so they can be written into the source. */
(() => {
  const doc = document, root = doc.documentElement;
  const KEY = 'hf-lib-v1';
  const pix = (k, s) => (window.__hfPix ? window.__hfPix(k, s) : '');
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) { return {}; } };
  const save = o => { try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) {} };
  let OV = load();
  const apply = () => { Object.entries(OV).forEach(([k, v]) => root.style.setProperty(k, v)); };
  apply();

  /* property helpers: [css var, label, type, min, max, step, unit] */
  const C = (v, l) => ({ v, l, t: 'color' });
  const R = (v, l, a, b, s = 1, u = 'px') => ({ v, l, t: 'range', a, b, s, u });
  const A = (v, l) => ({ v, l, t: 'range', a: 0, b: .3, s: .005, u: '' });
  const SEL = (v, l, o) => ({ v, l, t: 'select', o });

  const thr = () => { try { return inboxThreads(); } catch (e) { return []; } };
  const post = pick => { const t = thr().find(pick); return t ? `<div class="xf"><div class="xf-list">${xPost(t)}</div></div>` : '<p>Nothing to show.</p>'; };
  const postWhere = (fn) => { for (const t of thr()) { if (!t.it) continue; let h = ''; try { h = xPost(t); } catch (e) {} if (fn(h, t)) return `<div class="xf"><div class="xf-list">${h}</div></div>`; } return post(t => t.kind === 'decision'); };
  const v = (label, html) => `<div class="lib-var"><span>${esc(label)}</span><div>${html}</div></div>`;

  const COMPS = [
    { g: 'Foundations', id: 'color', n: 'Colour', d: 'Brand tokens drive everything coloured. Ink, bone, cream, needs-you honey and gain stay fixed in meaning.',
      p: [C('--brand-900', 'Brand 900'), C('--brand-700', 'Brand 700 · moss'), C('--brand-500', 'Brand 500 · olive'), C('--brand-300', 'Brand 300 · sage'), C('--brand-accent', 'Accent · lime'), C('--brand-warm', 'Warm · peach'), C('--hf-ink', 'Ink'), C('--hf-bone', 'Bone'), C('--hf-cream', 'Cream'), C('--hf-needs', 'Needs you'), C('--hf-gain', 'Gain')],
      r: () => v('Tokens', `<div class="lib-sw">${['--brand-900', '--brand-700', '--brand-500', '--brand-300', '--brand-accent', '--brand-warm', '--hf-ink', '--hf-bone', '--hf-cream', '--hf-needs', '--hf-gain'].map(k => `<span><i style="background:var(${k})"></i>${k.replace('--', '')}</span>`).join('')}</div>`),
      u: [['Everywhere', 'home']] },
    { g: 'Foundations', id: 'type', n: 'Type', d: 'Three sizes carry the hierarchy: page title, card title, body.',
      p: [R('--lib-title', 'Page title', 20, 40), R('--lib-card-title', 'Card title', 14, 26), R('--lib-body', 'Body', 13, 18, .5)],
      r: () => v('Scale', `<div class="lib-type" style="display:flex;flex-direction:column;gap:10px"><p class="lib-title" style="font-weight:500;letter-spacing:-.025em">Activity</p><p class="xp-t" style="font-weight:500">Approve $2,400 over book on the Henderson trade-in</p><p class="xp-l" style="color:var(--hf-ink-2)">The Hendersons are in the showroom. Mark can go $1,000 over book on his own.</p></div>`),
      u: [['Page headers', 'projects'], ['Activity', 'inbox']] },
    { g: 'Foundations', id: 'radius', n: 'Radius', d: 'Nested radius = outer radius − padding. Change the outer or the padding and every inner corner follows.',
      p: [R('--r-card', 'Card radius', 12, 40), R('--p-card', 'Card padding', 12, 32), R('--r-prev', 'Preview radius', 8, 28), R('--p-prev', 'Preview padding', 2, 14), R('--r-chip', 'Chip radius', 2, 12)],
      r: () => v('Card › preview › tile', `<div style="padding:var(--p-card);border-radius:var(--r-card);background:var(--hf-cream);box-shadow:0 0 0 1px rgba(30,33,27,.08);width:420px"><div style="padding:var(--p-prev);border-radius:var(--r-prev);background:rgba(30,33,27,var(--prev-a))"><div style="height:64px;border-radius:calc(var(--r-prev) - var(--p-prev));background:rgba(251,250,246,.9);display:flex;align-items:center;padding:0 14px;font-size:13px;color:var(--hf-ink-3)">tile = preview − padding</div></div></div>`),
      u: [['Activity', 'inbox'], ['Live', 'org']] },
    { g: 'Foundations', id: 'pix', n: 'Pixel mark', d: 'Our status sign. Think, scan and make animate; live ripples; needs and done are still.',
      p: [C('--pix-c', 'Colour'), C('--pix-needs', 'Needs-you colour'), SEL('--pix-speed', 'Speed', [['1s', 'Fast'], ['1.4s', 'Normal'], ['2s', 'Calm']])],
      r: () => v('States', ['think', 'scan', 'make', 'live', 'needs', 'done'].map(k => `<span style="display:inline-flex;flex-direction:column;align-items:center;gap:8px;width:72px;font-size:12.5px;color:var(--hf-ink-3)">${pix(k, 28)}${k}</span>`).join('')),
      u: [['Home', 'home'], ['Activity', 'inbox'], ['Live', 'org']] },
    { g: 'Controls', id: 'btn-pri', n: 'Button · primary', d: 'One per card, the action that moves the work. Compact in feeds, large on the queue card.',
      p: [C('--btn-pri-bg', 'Fill'), C('--btn-pri-fg', 'Label'), R('--btn-h', 'Height, compact', 30, 48), R('--btn-h-l', 'Height, large', 40, 60), R('--btn-round', 'Roundness', 0, 1, .05, ''), R('--btn-fs', 'Label size', 13, 18, .5), SEL('--btn-w', 'Weight', [['400', 'Regular'], ['500', 'Medium'], ['600', 'Semibold']])],
      r: () => v('Compact', `<button type="button" class="lib-btn-pri">Approve the offer</button><button type="button" class="lib-btn-sec">Later</button>`) + v('Large · queue card', `<button type="button" class="lib-btn-pri lib-btn-l" style="padding:0 28px;font-size:16px">Approve the offer</button><button type="button" class="lib-btn-sec lib-btn-l" style="padding:0 22px;font-size:16px">Send back</button>`),
      u: [['Home queue', 'home'], ['Activity', 'inbox'], ['Live', 'org']] },
    { g: 'Controls', id: 'btn-sec', n: 'Button · secondary', d: 'Later, send back, keep both. A quiet tint of ink.',
      p: [A('--btn-sec-a', 'Tint'), C('--btn-sec-fg', 'Label')],
      r: () => v('Compact and large', `<button type="button" class="lib-btn-sec">Later</button><button type="button" class="lib-btn-sec lib-btn-l" style="padding:0 22px">Send back</button>`),
      u: [['Home queue', 'home'], ['Activity', 'inbox']] },
    { g: 'Controls', id: 'seg', n: 'Segmented control', d: 'Two variants today: light (views, rail tabs) and dark (Activity filters, Live rings). Decide whether they should become one.',
      p: [A('--seg-a', 'Track tint'), C('--seg-on', 'Light · selected fill'), C('--segd-on', 'Dark · selected fill'), C('--segd-on-fg', 'Dark · selected label'), R('--seg-round', 'Roundness', 0, 1, .05, '')],
      r: () => v('Light', `<div class="vtabs lib-seg" role="group" style="display:inline-flex;padding:4px;gap:2px"><button type="button" aria-pressed="true" style="height:34px;padding:0 14px;border:0">List</button><button type="button" aria-pressed="false" style="height:34px;padding:0 14px;border:0;background:none">Canvas</button><button type="button" aria-pressed="false" style="height:34px;padding:0 14px;border:0;background:none">Timeline</button></div>`) + v('Dark', `<div class="lib-seg dark" style="display:inline-flex;padding:4px;gap:2px"><button type="button" aria-selected="true" style="height:36px;padding:0 14px;border:0">All 26</button><button type="button" style="height:36px;padding:0 14px;border:0;background:none;color:var(--hf-ink-3)">Unread 14</button><button type="button" style="height:36px;padding:0 14px;border:0;background:none;color:var(--hf-ink-3)">Needs attention 12</button></div>`),
      u: [['Tasks', 'projects'], ['Activity', 'inbox'], ['Live', 'org']] },
    { g: 'Controls', id: 'chip', n: 'Chip', d: 'Links to the thing a post belongs to, like its task.',
      p: [R('--chip-h', 'Height', 26, 42), A('--chip-a', 'Tint')],
      r: () => v('Task chip', `<button type="button" class="lib-chip"><span style="color:var(--hf-ink-4)">SLS-14</span>Follow up 23 showroom visitors</button>`),
      u: [['Activity', 'inbox']] },
    { g: 'Navigation', id: 'tabs', n: 'Header tabs', d: 'The light frame sits behind the desktop; the active tab is cut from the desktop itself.',
      p: [C('--frame-bg', 'Frame'), R('--tab-fs', 'Label size', 13, 17, .5), R('--tab-icon', 'Icon size', 14, 22)],
      r: () => { const nav = doc.querySelector('.hf-top .hf-nav'); const btns = nav ? [...nav.querySelectorAll('button')].slice(0, 5).map((b, i) => `<button type="button" class="${i === 0 ? 'on' : ''}">${b.querySelector('svg') ? b.querySelector('svg').outerHTML : ''}<span>${esc((b.querySelector('.lb') || b).textContent.trim())}</span></button>`).join('') : ''; return v('Tabs', `<div style="width:100%"><div class="lib-tabs">${btns}</div><div style="height:36px;border-radius:0 0 14px 14px;background:var(--hf-bone);box-shadow:0 0 0 1px rgba(30,33,27,.06)"></div></div>`); },
      u: [['Every page', 'home']] },
    { g: 'Navigation', id: 'ask', n: 'Ask bar', d: 'HF1 at the bottom of every page. It replaced search.',
      p: [R('--ask-h', 'Height', 48, 72), R('--ask-w', 'Width', 420, 720, 10), R('--ask-round', 'Roundness', 0, 1, .05, '')],
      r: () => { const a = doc.querySelector('.hf-ask'); return v('Instance', a ? a.outerHTML.replace('class="hf-ask', 'class="hf-ask lib-ask') : ''); },
      u: [['Every page', 'home']] },
    { g: 'Cards', id: 'post', n: 'Post card', d: 'Every item in the ledger. Context, who, title, line, preview, outcome, task, actions.',
      p: [R('--r-card', 'Radius', 12, 40), R('--p-card', 'Padding', 12, 32), R('--card-bg-a', 'Fill opacity', .5, 1, .02, ''), R('--card-shadow', 'Shadow', 0, .6, .02, ''), R('--lib-card-title', 'Title size', 14, 26)],
      r: () => v('Decision, waiting on you', post(t => t.kind === 'decision')) + v('Working now', post(t => t.kind === 'live')),
      u: [['Activity', 'inbox']] },
    { g: 'Cards', id: 'queue', n: 'Queue card', d: 'The decision in front of you on Home. One at a time, approve or send back.',
      p: [R('--qc-r', 'Radius', 16, 48), R('--qc-p', 'Padding', 16, 40), R('--qc-bg-a', 'Fill opacity', .6, 1, .02, ''), R('--btn-h-l', 'Button height', 40, 60)],
      r: () => { let h = ''; try { const it = qOpen()[0]; h = it ? qCardHTML(it) : ''; } catch (e) {} return v('Front card', `<div class="lib-qc">${h}</div>`); },
      u: [['Home', 'home']] },
    { g: 'Cards', id: 'tile', n: 'Widget tile', d: 'Home widgets. The add tile follows the same corners.',
      p: [R('--tile-r', 'Radius', 12, 40), R('--tile-p', 'Padding', 12, 32), R('--tile-bg-a', 'Fill opacity', .4, 1, .02, '')],
      r: () => { let h = ''; try { const b = (S.home || []).find(x => BLOCKS[x]) || Object.keys(BLOCKS)[0]; h = tileHTML(b, 2, null); } catch (e) {} return v('Widget', `<section class="tiles">${h}</section>`); },
      u: [['Home', 'home']] },
    { g: 'Cards', id: 'preview', n: 'Preview', d: 'The well inside a card that shows the evidence: tables, stat tiles, signatures, bars, checks.',
      p: [R('--r-prev', 'Radius', 8, 28), R('--p-prev', 'Padding', 2, 14), A('--prev-a', 'Tint')],
      r: () => v('Stat tiles', postWhere(h => /ev-stats/.test(h))) + v('Signatures', postWhere(h => /ev-sign/.test(h))) + v('Bars', postWhere(h => /ev-bars/.test(h))),
      u: [['Activity', 'inbox'], ['Home queue', 'home']] },
    { g: 'Cards', id: 'kpi', n: 'KPI strip', d: 'Only on work that moves a KPI: the gain, and the member › project › business targets it climbs.',
      p: [R('--kpi-a', 'Lime strength', 0, .8, .02, ''), C('--kpi-v', 'Value colour'), R('--kpi-size', 'Value size', 14, 28)],
      r: () => v('Attached under a preview', postWhere((h, t) => typeof GAIN !== 'undefined' && GAIN[t.it.id])),
      u: [['Activity', 'inbox'], ['Home queue', 'home']] },
    { g: 'Feedback', id: 'toast', n: 'Notification', d: 'Short confirmations, stacked bottom centre. Gone in 2.6 seconds.',
      p: [R('--toast-r', 'Radius', 8, 28)],
      r: () => v('Instance', `<div class="hf-toast lib-toast"><span class="ic"><svg viewBox="0 0 24 24" width="16" height="16"><path d="m5 12.5 4.2 4.2L19 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></span><span class="tx">Approved. Mark sends the offer now.</span></div>`),
      u: [['Everywhere', 'home']] },
    { g: 'Feedback', id: 'cursor', n: 'Agent cursor', d: 'People and agents moving on the canvas and in the swarm intro.',
      p: [C('--cur-bg', 'Person · tag'), C('--cur-fg', 'Person · label'), C('--cur-agent', 'HF1 and agents · tag')],
      r: () => { const arrow = '<svg viewBox="0 0 18 18" width="18" height="18"><path d="M3 2.2 15.4 8.1l-5.6 1.7-2.4 5.4z"/></svg>'; return v('Person and agents', `<span class="sw-cur lib-cur on">${arrow}<span class="sw-tag"><span class="sw-px">${PX.svg('mark')}</span>Mark</span></span><span class="sw-cur hf lib-cur on" style="margin-left:40px">${arrow}<span class="sw-tag">${hfOrb(14)}HF1</span></span>`); },
      u: [['Live', 'org'], ['Onboarding swarm', 'home']] }
  ];

  /* ---------- the page ---------- */
  let el = null, cur = 'btn-pri';
  const val = k => { const s = getComputedStyle(root).getPropertyValue(k).trim(); return s; };
  const hex = s => { if (/^#/.test(s)) return s.length === 4 ? '#' + [...s.slice(1)].map(c => c + c).join('') : s.slice(0, 7); const m = s.match(/\d+(\.\d+)?/g); return m ? '#' + m.slice(0, 3).map(n => (+n).toString(16).padStart(2, '0')).join('') : '#000000'; };
  const num = (s, u) => parseFloat(String(s).replace(u || '', '')) || 0;
  const changed = () => Object.keys(OV).length;
  const propHTML = p => {
    const on = p.v in OV, now = val(p.v);
    if (p.t === 'color') return `<div class="lib-p${on ? ' changed' : ''}"><label for="lp${p.v}">${esc(p.l)}<small>${p.v}</small></label><input type="color" id="lp${p.v}" data-libv="${p.v}" value="${hex(now)}">${on ? `<button type="button" class="lib-rs" data-librs="${p.v}">Reset</button>` : ''}</div>`;
    if (p.t === 'select') return `<div class="lib-p${on ? ' changed' : ''}"><label for="lp${p.v}">${esc(p.l)}<small>${p.v}</small></label><select id="lp${p.v}" data-libv="${p.v}">${p.o.map(([x, l]) => `<option value="${x}"${now === x ? ' selected' : ''}>${esc(l)}</option>`).join('')}</select>${on ? `<button type="button" class="lib-rs" data-librs="${p.v}">Reset</button>` : ''}</div>`;
    const n = num(now, p.u);
    return `<div class="lib-p${on ? ' changed' : ''}"><label for="lp${p.v}">${esc(p.l)}<small>${p.v}</small></label><output id="lo${p.v}">${+n.toFixed(3)}${p.u}</output><input type="range" id="lp${p.v}" data-libv="${p.v}" data-u="${p.u}" min="${p.a}" max="${p.b}" step="${p.s}" value="${n}">${on ? `<button type="button" class="lib-rs" data-librs="${p.v}">Reset</button>` : ''}</div>`;
  };
  const render = () => {
    const c = COMPS.find(x => x.id === cur) || COMPS[0];
    const groups = [...new Set(COMPS.map(x => x.g))];
    el.innerHTML = `<header class="lib-top"><h2 class="lib-title">Component library</h2><small>${changed() ? `${changed()} change${changed() === 1 ? '' : 's'}, live in the prototype` : 'Edit a master, every instance follows'}</small>
      <button type="button" class="lib-act" data-libcopy${changed() ? '' : ' disabled'}>Copy changes</button><button type="button" class="lib-act" data-libreset${changed() ? '' : ' disabled'}>Reset all</button><button type="button" class="lib-x" data-libclose aria-label="Close the library"><svg viewBox="0 0 24 24" width="16" height="16"><path d="M6 6l12 12M18 6 6 18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></button></header>
      <nav class="lib-side" aria-label="Components">${groups.map(g => `<h6>${g}</h6>${COMPS.filter(x => x.g === g).map(x => `<button type="button" data-libc="${x.id}" aria-current="${x.id === c.id}">${esc(x.n)}${x.p.some(p => p.v in OV) ? '<i title="Changed"></i>' : ''}</button>`).join('')}`).join('')}</nav>
      <section class="lib-stage"><header><b>${esc(c.n)}</b><p>${esc(c.d)}</p></header>${(() => { try { return c.r(); } catch (e) { return '<p>Could not render this one.</p>'; } })()}</section>
      <aside class="lib-props"><h5>Properties</h5><p>Changes apply to every instance in the prototype right away.</p>${c.p.map(propHTML).join('')}
        <div class="lib-used"><b>Used in</b>${c.u.map(([l, pg]) => `<button type="button" data-libgo="${pg}">${esc(l)}</button>`).join('')}</div></aside>`;
    if (window.__hfAct && window.__hfAct.decorate) { const pg = S.page; try { window.__hfAct.decorate(); } catch (e) {} }
  };
  const open = () => {
    if (!el) { el = doc.createElement('div'); el.className = 'hf-lib'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', 'Component library'); doc.body.appendChild(el); bind(); }
    el.hidden = false; root.classList.add('hf-libopen'); render();
    const m = window.Motion; if (m && m.animate) m.animate(el, { opacity: [0, 1], transform: ['translateY(12px)', 'translateY(0px)'] }, { type: 'spring', stiffness: 300, damping: 32 });
  };
  const close = () => { if (!el) return; el.hidden = true; root.classList.remove('hf-libopen'); };
  const set = (k, x) => { OV[k] = x; root.style.setProperty(k, x); save(OV); };
  const bind = () => {
    el.addEventListener('input', e => {
      const i = e.target.closest('[data-libv]'); if (!i) return; const k = i.dataset.libv, u = i.dataset.u || '';
      const x = i.type === 'range' ? i.value + u : i.value; set(k, x);
      const o = el.querySelector(`#lo${CSS.escape(k)}`); if (o) o.textContent = (+(+i.value).toFixed(3)) + u;
      const row = i.closest('.lib-p'); if (row && !row.classList.contains('changed')) { row.classList.add('changed'); }
      const sm = el.querySelector('.lib-top small'); if (sm) sm.textContent = `${changed()} change${changed() === 1 ? '' : 's'}, live in the prototype`;
      el.querySelectorAll('[data-libcopy], [data-libreset]').forEach(b => { b.disabled = false; });
    });
    el.addEventListener('change', e => { if (e.target.matches('[data-libv]')) render(); });
    el.addEventListener('click', e => {
      let m;
      if ((m = e.target.closest('[data-libc]'))) { cur = m.dataset.libc; render(); el.querySelector('.lib-stage').scrollTop = 0; return; }
      if (e.target.closest('[data-libclose]')) { close(); return; }
      if ((m = e.target.closest('[data-librs]'))) { delete OV[m.dataset.librs]; root.style.removeProperty(m.dataset.librs); save(OV); render(); return; }
      if (e.target.closest('[data-libreset]')) { Object.keys(OV).forEach(k => root.style.removeProperty(k)); OV = {}; save(OV); render(); toast('Every component is back to its default.'); return; }
      if (e.target.closest('[data-libcopy]')) { const t = JSON.stringify(OV, null, 2); (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(() => toast('Changes copied. Paste them to Claude to write them into the source.'), () => toast('Copy failed. Select the changes in the console instead.')); console.log('HF1 library changes', t); return; }
      if ((m = e.target.closest('[data-libgo]'))) { close(); go(m.dataset.libgo); return; }
    });
    /* instances inside the library are for looking, not acting */
    el.addEventListener('click', e => { if (e.target.closest('.lib-var') && !e.target.closest('[data-libgo]')) { e.stopPropagation(); } }, true);
  };
  addEventListener('keydown', e => { if (e.key === 'Escape' && el && !el.hidden) { e.stopImmediatePropagation(); close(); } }, true);
  if (/[?&]library\b/.test(location.search)) setTimeout(open, 1500);
  window.__hfLib = { open, close, comps: COMPS, overrides: () => Object.assign({}, OV) };
})();
