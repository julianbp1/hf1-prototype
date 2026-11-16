/* ================= HF1 swarm intro · agents build your desktop =================
   After onboarding, Home starts blank. A swarm of agent cursors flies out of HF1, draws the frames,
   types the words, pops in the faces and wipes in the charts. A staged intro, not real agents. */
(() => {
  const doc = document, root = doc.documentElement;
  const pix = (k, s) => (window.__hfPix ? window.__hfPix(k, s) : '');
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const CREW = ['johnny', 'mark', 'iris', 'penny', 'mike', 'otto', 'sarah', 'clara', 'alex', 'nova'].filter(id => AGENTS[id]);
  let run = null;

  /* ---------- the swarm layer ---------- */
  const layer = () => {
    let l = doc.getElementById('hfSwarm'); if (l) return l; if (!run) return doc.createElement('div');
    l = doc.createElement('div'); l.id = 'hfSwarm'; l.className = 'hf-sw'; l.setAttribute('aria-hidden', 'true');
    l.innerHTML = `<div class="sw-core">${hfOrb(64)}</div><button type="button" class="sw-skip" aria-hidden="false">Skip intro</button>`;
    doc.body.appendChild(l);
    l.querySelector('.sw-skip').addEventListener('click', () => { if (run) run.skip = true; finish(); });
    return l;
  };
  const cursor = (id, i) => {
    const c = doc.createElement('span'); c.className = 'sw-cur' + (id === 'johnny' ? ' hf' : '');
    c.innerHTML = `<svg viewBox="0 0 18 18" width="18" height="18"><path d="M3 2.2 15.4 8.1l-5.6 1.7-2.4 5.4z"/></svg><span class="sw-tag">${id === 'johnny' ? hfOrb(14) : `<span class="sw-px">${PX.svg(id)}</span>`}${esc(AGENTS[id].n)}</span>`;
    c.style.setProperty('--d', (i * 40) + 'ms');
    layer().appendChild(c); return c;
  };
  const moveTo = (c, x, y, ms = 520) => { c.style.transitionDuration = ms + 'ms'; c.style.transform = `translate(${x}px, ${y}px)`; c._x = x; c._y = y; return wait(ms); };

  /* a selection frame that grows from the corner, with a size tag, like a design tool */
  const frame = async (c, el, ms = 820) => {
    if (!run) return; const r = el.getBoundingClientRect(); if (r.width < 4 || r.height < 4) return;
    await moveTo(c, r.left, r.top, 640); if (!run) return;
    const f = doc.createElement('span'); f.className = 'sw-box';
    f.style.cssText = `left:${r.left}px;top:${r.top}px;width:0;height:0;--rad:${getComputedStyle(el).borderRadius}`;
    f.innerHTML = `<i class="h tl"></i><i class="h tr"></i><i class="h bl"></i><i class="h br"></i><em>${Math.round(r.width)} × ${Math.round(r.height)}</em>`;
    layer().appendChild(f);
    requestAnimationFrame(() => { f.style.transitionDuration = ms + 'ms'; f.style.width = r.width + 'px'; f.style.height = r.height + 'px'; });
    moveTo(c, r.right - 6, r.bottom - 6, ms);
    await wait(ms + 60);
    return f;
  };
  const hide = el => { if (run && el) el.classList.add('sw-hide'); };
  const reveal = (el, how = 'fill') => { if (!run || !el) return; el.classList.remove('sw-hide'); el.classList.add('sw-in', 'sw-' + how); };
  const drop = f => { if (!f) return; f.classList.add('out'); setTimeout(() => f.remove(), 420); };

  /* typing: empties the text nodes, then writes them back a few letters at a time */
  const type = async (c, el, cps = 60) => {
    const r = el.getBoundingClientRect(); if (!r.width) return reveal(el, 'fade');
    await moveTo(c, r.left - 4, r.top + Math.min(r.height, 40) / 2 - 8, 600);
    const nodes = [], walk = n => { n.childNodes.forEach(k => { if (k.nodeType === 3 && k.nodeValue.trim()) nodes.push([k, k.nodeValue]); else if (k.nodeType === 1 && !k.matches('svg, .av, canvas, .hfo-w')) walk(k); }); };
    walk(el); nodes.forEach(([k]) => { k.nodeValue = ''; });
    el.classList.remove('sw-hide'); el.classList.add('sw-typing');
    const total = nodes.reduce((s, [, t]) => s + t.length, 0), step = Math.max(1, Math.round(total / 40));
    let done = 0;
    for (const [k, t] of nodes) {
      for (let i = 0; i <= t.length; i += step) {
        if (!run || run.skip) break;
        k.nodeValue = t.slice(0, i); done += step;
        await wait(Math.max(22, 1000 / cps * step * .8));
        moveTo(c, Math.min(innerWidth - 40, c._x + 7 * step), c._y, 60);
      }
      k.nodeValue = t;
    }
    el.classList.remove('sw-typing'); el.classList.add('sw-in');
  };
  const pop = async (c, els) => {
    for (const el of els) { const r = el.getBoundingClientRect(); if (!r.width) { reveal(el, 'pop'); continue; } await moveTo(c, r.left + r.width / 2 - 2, r.top + r.height / 2 - 2, 340); reveal(el, 'pop'); await wait(140); }
  };
  const wipe = async (c, el) => { const f = await frame(c, el, 560); reveal(el, 'wipe'); await wait(600); drop(f); };
  const fill = async (c, el, inner) => { const f = await frame(c, el); reveal(el, 'fill'); await wait(380); drop(f); if (inner) await inner(); };

  /* ---------- the choreography: who builds what ---------- */
  const q = s => doc.querySelector(s), qa = s => [...doc.querySelectorAll(s)];
  const targets = () => {
    const vh = innerHeight, vis = el => el && el.getBoundingClientRect().top < vh && el.getBoundingClientRect().bottom > 0;
    const front = q('#stack .qc.front'), tiles = qa('#tiles > .tile').filter(vis);
    return {
      all: [...qa('#stackcol > :not(#stack)'), q('.hf-top'), q('.hf-ask'), q('header.greet small'), q('header.greet h1'), q('#greetSub'), q('.hf-since'), q('#actPrev'), q('.desk-acts'), ...qa('#stack .qc'), ...tiles].filter(Boolean),
      jobs: [
        c => fill(c, q('.hf-top'), () => pop(c, qa('.hf-top .hf-nav button').slice(0, 4))),
        c => type(c, q('header.greet small'), 70),
        c => type(c, q('header.greet h1'), 40),
        c => type(c, q('#greetSub'), 55),
        c => type(c, q('.hf-since'), 80),
        ...qa('#stack .qc.behind').map(el => c => fill(c, el)),
        c => front && fill(c, front, async () => {
          const parts = [front.querySelector('.qc-h'), front.querySelector('h3'), front.querySelector('.why'), front.querySelector('.ev'), front.querySelector('.qc-f')].filter(Boolean);
          parts.forEach(hide);
          if (parts[0]) await pop(c, [parts[0]]);
          if (parts[1]) await type(c, parts[1], 70);
          if (parts[2]) { reveal(parts[2], 'fade'); }
          if (parts[3]) await wipe(c, parts[3]);
          if (parts[4]) await pop(c, [parts[4]]);
        }),
        c => fill(c, q('#actPrev'), async () => { root.classList.add('sw-act'); const rows = qa('#actPrev li'); rows.forEach(hide); for (const r of rows) { await pop(c, [r]); } }),
        ...tiles.map(el => c => fill(c, el, async () => { const b = el.querySelector('.tb'); if (b) { hide(b); await wipe(c, b); } })),
        c => fill(c, q('.desk-acts')),
        c => fill(c, q('.hf-ask'))
      ]
    };
  };

  const finish = () => {
    const l = doc.getElementById('hfSwarm');
    if (run) run.skip = true;
    root.classList.remove('hf-swarming', 'sw-act');
    doc.querySelectorAll('.sw-hide, .sw-in, .sw-typing').forEach(e => e.classList.remove('sw-hide', 'sw-in', 'sw-typing', 'sw-fill', 'sw-pop', 'sw-wipe', 'sw-fade'));
    if (run && run.texts) run.texts.forEach(([k, t]) => { if (k.nodeValue !== t) k.nodeValue = t; });
    if (l) { l.classList.add('out'); setTimeout(() => l.remove(), 700); }
    run = null;
  };

  const play = async () => {
    run = { skip: false, texts: [] };
    root.classList.add('hf-swarming'); window.scrollTo(0, 0); const pv = doc.getElementById('pv'); if (pv) pv.scrollTop = 0;
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    const T = targets();
    // keep a copy of every text so a skip restores it exactly
    T.all.forEach(el => { const w = n => n.childNodes.forEach(k => { if (k.nodeType === 3) run.texts.push([k, k.nodeValue]); else if (k.nodeType === 1) w(k); }); w(el); el.classList.add('sw-hide'); });
    const l = layer(); requestAnimationFrame(() => l.classList.add('on'));
    await wait(1500);
    const cx = innerWidth / 2, cy = innerHeight / 2;
    const cs = CREW.map((id, i) => { const c = cursor(id, i); c.style.transitionDuration = '0ms'; c.style.transform = `translate(${cx}px, ${cy}px)`; return c; });
    await wait(30);
    cs.forEach((c, i) => { const a = i / cs.length * Math.PI * 2; moveTo(c, cx + Math.cos(a) * 220, cy + Math.sin(a) * 150, 600); c.classList.add('on'); });
    l.classList.add('burst');
    await wait(560);
    const jobs = T.jobs.slice(), R = run;
    await Promise.all(cs.map(async (c, i) => {
      await wait(i * 260);
      while (jobs.length && !R.skip) { const j = jobs.shift(); try { await j(c); } catch (e) {} await wait(200 + Math.random() * 300); }
      if (!R.skip) moveTo(c, c._x + (Math.random() - .5) * 120, c._y + (Math.random() - .5) * 80, 900);
    }));
    if (!run || run.skip) return;
    await wait(500);
    const lay = doc.getElementById('hfSwarm'); if (lay) lay.classList.add('leaving');
    /* the swarm gathers back into HF1, the ball in the Ask bar */
    const orb = doc.querySelector('.hf-ask .hf-orb'), o = orb ? orb.getBoundingClientRect() : { left: cx, top: innerHeight - 60, width: 0, height: 0 };
    const ox = o.left + o.width / 2 - 4, oy = o.top + o.height / 2 - 4, m = window.Motion;
    cs.forEach((c, i) => setTimeout(() => {
      moveTo(c, ox, oy, 760);
      if (m && m.animate) m.animate(c, { opacity: [1, 1, 0] }, { duration: .8, times: [0, .7, 1] }); else setTimeout(() => { c.style.opacity = 0; }, 600);
    }, i * 55));
    setTimeout(() => { if (orb && m && m.animate) m.animate(orb, { transform: ['scale(1)', 'scale(1.28)', 'scale(1)'] }, { duration: .7, ease: [.2, .9, .3, 1] }); }, 800 + cs.length * 55);
    await wait(1500);
    const n = typeof qOpen === 'function' ? qOpen().length : 0;
    finish();
    toast(`Your desktop is ready. ${n} decision${n === 1 ? ' is' : 's are'} waiting for you.`);
  };

  /* replace the old build step: pick the widgets, finish onboarding, let the swarm build Home */
  const _frBuild = frBuild;
  frBuild = function () {
    if (RM) return _frBuild();
    const F = S.fr;
    F.order = []; frOptions().filter(o => F.picks.has(o.id)).forEach(o => { const r = frResolve(o.id, F.order); if (!F.order.includes(r)) F.order.push(r); });
    S.home = F.order.slice(); F.built = F.order.length;
    S.ob.done = true; F.step = 'done'; S.frHint = false; S.qRise = false;
    root.classList.add('hf-swarming');
    renderAll();
    setTimeout(play, 380);
  };
  window.__hfSwarm = { play, skip: () => { if (run) run.skip = true; finish(); } };
})();
