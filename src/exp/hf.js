/* ================= HF1 design system v2 · shell and Home =================
   New markup for the frame (top pill nav, ask bar, ground). Every control reuses the
   prototype's own handlers: nav buttons carry data-nav, the rest re-click the old control. */
(() => {
  const doc = document, root = doc.documentElement;
  const tok = n => getComputedStyle(root).getPropertyValue(n).trim();
  root.classList.add('hf');
  const font = doc.createElement('link');
  font.rel = 'stylesheet'; font.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap';
  doc.head.appendChild(font);
  root.style.setProperty('--hf-grain', `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`);

  /* ground */
  const ground = doc.createElement('div');
  ground.className = 'hf-ground'; ground.setAttribute('aria-hidden', 'true');
  ground.innerHTML = '<canvas></canvas>';
  doc.body.prepend(ground);

  /* ================= Grounds: the same engine as the HF1 Grounds tool (design/grounds.html) ================= */
  const PAL = {
    bone:  { name: 'Bone',  bg: '#edebe4', shade: '#5c5a40', glow: ['#d6ec6b', '#f2c7a2', '#a9b78d'], wash: ['#a9b78d', '#d6ec6b', '#f2c7a2'] },
    moss:  { name: 'Moss',  bg: '#3e4a2c', shade: '#10150a', glow: ['#6e7b3e', '#d6ec6b', '#8fa476'], wash: ['#6e7b3e', '#2a331d', '#a9b78d'] },
    honey: { name: 'Honey', bg: '#efc85a', shade: '#7a4e10', glow: ['#f6dc8c', '#f2c7a2', '#d6ec6b'], wash: ['#d98a2b', '#f6dc8c', '#c58474'] },
    lime:  { name: 'Lime',  bg: '#d6ec6b', shade: '#3f4d10', glow: ['#f1f7c6', '#a9b78d', '#fbfaf6'], wash: ['#a9b78d', '#6e7b3e', '#f1f7c6'] },
    clay:  { name: 'Clay',  bg: '#e3b5a0', shade: '#5e3020', glow: ['#f6dcc0', '#f2c7a2', '#d6ec6b'], wash: ['#c58474', '#f2c7a2', '#a9b78d'] },
    night: { name: 'Night', bg: '#1e211b', shade: '#000000', glow: ['#3e4a2c', '#6e7b3e', '#d6ec6b'], wash: ['#3e4a2c', '#6e7b3e', '#1e211b'] }
  };
  const ASP = { wide: [1600, 900, '16:9'], square: [1200, 1200, '1:1'], tall: [900, 1600, '9:16'], banner: [1800, 600, '3:1'] };
  const SHAPES = [['leaves', 'Leaves'], ['palm', 'Palm fronds'], ['branch', 'Branches'], ['blinds', 'Blinds'], ['lattice', 'Lattice']];
  const LAYERS = [['shade', 'Shade'], ['size', 'Shade size'], ['soft', 'Softness'], ['glow', 'Glow'], ['wash', 'Watercolour'], ['grain', 'Grain'], ['tone', 'Halftone'], ['dot', 'Dot size'], ['grunge', 'Flecks'], ['sway', 'Movement']];
  const PRESETS = [
    { id: 'sun', name: 'Sun through leaves', sub: 'Dia', pal: 'honey', shapes: ['leaves'], shade: 45, size: 55, soft: 60, glow: 40, wash: 15, grain: 35, grunge: 10, sway: 45 },
    { id: 'palms', name: 'Palm shade', sub: 'Dia', pal: 'bone', shapes: ['palm', 'leaves'], shade: 35, size: 75, soft: 70, glow: 60, wash: 20, grain: 30, grunge: 5, sway: 40 },
    { id: 'blinds', name: 'Afternoon blinds', sub: 'Mix', pal: 'clay', shapes: ['blinds', 'branch'], shade: 35, size: 60, soft: 55, glow: 45, wash: 25, grain: 40, grunge: 15, sway: 30 },
    { id: 'paper', name: 'Moss paper', sub: 'Base44', pal: 'moss', shapes: ['branch'], shade: 25, size: 85, soft: 85, glow: 50, wash: 45, grain: 55, tone: 40, dot: 35, grunge: 45, sway: 25 },
    { id: 'wash', name: 'Lime wash', sub: 'Watercolour', pal: 'lime', shapes: ['leaves'], shade: 20, size: 90, soft: 90, glow: 30, wash: 80, grain: 45, grunge: 20, sway: 30 },
    { id: 'dusk', name: 'Night lattice', sub: 'Mix', pal: 'night', shapes: ['lattice', 'leaves'], shade: 35, size: 70, soft: 65, glow: 70, wash: 30, grain: 45, grunge: 20, sway: 35 }
  ];


  const rng = s => () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const hexA = (h, a) => { const n = parseInt(h.slice(1), 16); return `rgba(${n >> 16 & 255},${n >> 8 & 255},${n & 255},${a})`; };
  const mk = (w, h) => { const c = document.createElement('canvas'); c.width = Math.max(1, Math.round(w)); c.height = Math.max(1, Math.round(h)); return c; };

  /* ---------- scene: everything random is decided once per seed, so motion only moves it ---------- */
  function scene(o, W, H) {
    const r = rng(o.seed), u = Math.min(W, H) / 900, ls = (.6 + Math.pow(o.size / 100, 1.5) * 5) * u;
    const items = [];
    const n = Math.round(6 + 10 * (1 - o.size / 160));
    if (o.shapes.includes('leaves')) for (let k = 0; k < n; k++) {
      const cx = r() * W * 1.2 - W * .1, cy = r() * H * 1.2 - H * .1, leaves = [], spread = (60 + r() * 140) * ls;
      for (let j = 0, m = 6 + Math.floor(r() * 10); j < m; j++) { const a = r() * 6.283, d = r() * spread; leaves.push([Math.cos(a) * d, Math.sin(a) * d, r() * 3.14, (30 + r() * 60) * ls, (12 + r() * 22) * ls]); }
      items.push({ t: 'leaves', x: cx, y: cy, leaves, ph: r() * 6.283, amp: (.6 + r()) });
    }
    if (o.shapes.includes('palm')) for (let k = 0, m = 2 + Math.floor(r() * 3); k < m; k++) {
      const edge = r() < .5; const px = edge ? (r() < .5 ? -W * .02 : W * 1.02) : r() * W, py = edge ? r() * H : (r() < .5 ? -H * .02 : H * 1.02);
      items.push({ t: 'palm', x: px, y: py, a: Math.atan2(H * (.3 + r() * .4) - py, W * (.3 + r() * .4) - px) + (r() - .5) * .6, len: (380 + r() * 380) * ls, ph: r() * 6.283, amp: .8 + r() * .6, seed: r() });
    }
    if (o.shapes.includes('branch')) for (let k = 0, m = 2 + Math.floor(r() * 3); k < m; k++) {
      const segs = []; let x = W * (.1 + r() * .8), y = -20 * u, a = 1.1 + r() * .9;
      for (let i = 0; i < 9; i++) { const l = (70 + r() * 90) * ls; const nx = x + Math.cos(a) * l, ny = y + Math.sin(a) * l; segs.push([x, y, nx, ny, (14 - i * 1.3) * u, r() < .55 ? r() : -1]); x = nx; y = ny; a += (r() - .5) * .8; }
      items.push({ t: 'branch', segs, ph: r() * 6.283, amp: .7 + r() * .5 });
    }
    if (o.shapes.includes('blinds')) items.push({ t: 'blinds', a: -.35 + r() * .3, gap: (60 + r() * 40) * ls, ph: r() * 6.283, amp: 1 });
    if (o.shapes.includes('lattice')) items.push({ t: 'lattice', a: .55 + r() * .3, gap: (110 + r() * 60) * ls, ph: r() * 6.283, amp: 1 });
    const glows = [0, 1, 2].map(i => ({ x: .15 + r() * .8, y: r() * .9, rad: .35 + r() * .35, c: i, ph: r() * 6.283 }));
    return { items, glows, u, ls };
  }

  function drawShade(c, sc, o, t, W, H) {
    const sw = o.sway / 100, sp = .00045; // slow
    for (const it of sc.items) {
      const wob = Math.sin(t * sp * it.amp + it.ph) * sw, wob2 = Math.cos(t * sp * .7 * it.amp + it.ph) * sw;
      if (it.t === 'leaves') {
        c.save(); c.translate(it.x + wob * 14 * sc.u, it.y + wob2 * 10 * sc.u); c.rotate(wob * .04);
        for (const [x, y, a, rx, ry] of it.leaves) { c.save(); c.translate(x, y); c.rotate(a + wob * .12); c.beginPath(); c.ellipse(0, 0, rx, ry, 0, 0, 6.283); c.fill(); c.restore(); }
        c.restore();
      } else if (it.t === 'palm') {
        c.save(); c.translate(it.x, it.y); c.rotate(it.a + wob * .05);
        c.lineWidth = 6 * sc.ls; c.beginPath(); c.moveTo(0, 0); c.lineTo(it.len, 0); c.stroke();
        const fr = rng(Math.floor(it.seed * 1e6));
        for (let i = 2; i < 30; i++) { const p = i / 30 * it.len, L = (1 - i / 34) * it.len * .32 * (0.85 + fr() * .3); for (const sgn of [-1, 1]) {
          const ang = sgn * (.9 - i * .012) + wob2 * .08 * sgn; c.beginPath(); c.moveTo(p, 0); c.quadraticCurveTo(p + Math.cos(ang) * L * .6, Math.sin(ang) * L * .5, p + Math.cos(ang) * L * .9 + L * .2, Math.sin(ang) * L); c.lineWidth = (9 - i * .22) * sc.ls; c.stroke(); } }
        c.restore();
      } else if (it.t === 'branch') {
        c.save(); c.lineCap = 'round';
        it.segs.forEach(([x1, y1, x2, y2, w, leaf], i) => {
          const d = wob * (i + 1) * 3 * sc.u;
          c.lineWidth = Math.max(2 * sc.u, w * sc.ls / sc.u); c.beginPath(); c.moveTo(x1 + d * .8, y1); c.lineTo(x2 + d, y2); c.stroke();
          if (leaf >= 0) { c.save(); c.translate(x2 + d, y2); c.rotate(leaf * 6.283 + wob2 * .2); c.beginPath(); c.ellipse(26 * sc.ls, 0, 30 * sc.ls, 11 * sc.ls, 0, 0, 6.283); c.fill(); c.restore(); }
        });
        c.restore();
      } else if (it.t === 'blinds' || it.t === 'lattice') {
        const D = Math.hypot(W, H);
        const dirs = it.t === 'lattice' ? [it.a, it.a + 1.571] : [it.a];
        for (const a of dirs) { c.save(); c.translate(W / 2, H / 2); c.rotate(a); const off = (wob * it.gap * .35) % it.gap;
          for (let y = -D; y < D; y += it.gap) c.fillRect(-D, y + off, 2 * D, it.gap * (it.t === 'lattice' ? .18 : .42));
          c.restore(); }
      }
    }
  }

  /* watercolour: deformed blobs layered at low alpha, pigment pooling at the edges */
  function wash(o, W, H) {
    const out = mk(W, H), c = out.getContext('2d'), r = rng(o.seed + 31), p = PAL[o.pal], amt = o.wash / 100, u = Math.min(W, H) / 900;
    if (amt <= 0) return out;
    const blob = (cx, cy, rad) => { let pts = []; for (let i = 0; i < 10; i++) { const a = i / 10 * 6.283; pts.push([cx + Math.cos(a) * rad, cy + Math.sin(a) * rad]); }
      for (let d = 0; d < 5; d++) { const np = []; pts.forEach((q, i) => { const n = pts[(i + 1) % pts.length]; const mx = (q[0] + n[0]) / 2, my = (q[1] + n[1]) / 2, len = Math.hypot(n[0] - q[0], n[1] - q[1]); np.push(q, [mx + (r() - .5) * len * .55, my + (r() - .5) * len * .55]); }); pts = np; }
      return pts; };
    const n = 2 + Math.floor(amt * 3);
    for (let k = 0; k < n; k++) {
      const col = p.wash[k % p.wash.length], cx = r() * W, cy = r() * H, rad = (380 + r() * 420) * u;
      const base = blob(cx, cy, rad);
      for (let l = 0; l < 14; l++) {
        const jit = base.map(([x, y]) => [x + (r() - .5) * 26 * u, y + (r() - .5) * 26 * u]);
        c.beginPath(); jit.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath();
        c.fillStyle = hexA(col, .022 * amt + .005); c.fill();
      }
    }
    return out;
  }

  function noiseTiles(seed) { return [0, 1, 2, 3].map(k => { const t = mk(256, 256), tc = t.getContext('2d'), id = tc.createImageData(256, 256), nr = rng(seed + 7 + k * 101);
    for (let i = 0; i < id.data.length; i += 4) { const v = nr() * 255; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255; } tc.putImageData(id, 0, 0); return t; }); }

  function flecks(o, W, H) {
    const out = mk(W, H), c = out.getContext('2d'), r = rng(o.seed + 53), gu = o.grunge / 100, u = Math.min(W, H) / 900;
    if (gu <= 0) return out;
    for (let i = 0; i < 1100 * gu * (W * H) / (1600 * 900); i++) { const dark = r() < .6; c.fillStyle = dark ? hexA('#1e1a10', .05 + r() * .12 * gu) : hexA('#ffffff', .05 + r() * .15 * gu); c.beginPath(); c.arc(r() * W, r() * H, (r() * r() * 3 + .4) * u, 0, 6.283); c.fill(); }
    c.strokeStyle = hexA('#1e1a10', .06 * gu); c.lineWidth = .7 * u;
    for (let i = 0; i < 40 * gu; i++) { const x = r() * W, y = r() * H, l = (20 + r() * 80) * u, a = r() * 3.14; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + Math.cos(a) * l / 2 + r() * 6, y + Math.sin(a) * l / 2, x + Math.cos(a) * l, y + Math.sin(a) * l); c.stroke(); }
    return out;
  }

  /* halftone: printed dots on a 45° screen, their size drifting like ink on paper */
  function halftone(o, W, H) {
    const out = mk(W, H), c = out.getContext('2d'), amt = (o.tone || 0) / 100, u = Math.min(W, H) / 900;
    if (amt <= 0) return out;
    const r = rng(o.seed + 77), step = (5 + (o.dot ?? 40) / 100 * 16) * u, D = Math.hypot(W, H);
    const fx = .0015 + r() * .002, fy = .0012 + r() * .002, p1 = r() * 6.3, p2 = r() * 6.3;
    c.fillStyle = PAL[o.pal].shade; c.translate(W / 2, H / 2); c.rotate(Math.PI / 4);
    for (let y = -D / 2; y < D / 2; y += step) for (let x = -D / 2; x < D / 2; x += step) {
      const v = .5 + .25 * Math.sin(x * fx / u + p1) + .25 * Math.cos(y * fy / u + p2);
      const rad = step * .5 * Math.max(0, v * (.35 + amt * .65) + (r() - .5) * .08);
      if (rad > .3) { c.beginPath(); c.arc(x, y, rad, 0, 6.283); c.fill(); }
    }
    return out;
  }

  /* a Ground holds the cached layers for one canvas and draws a frame at time t */
  function Ground(cv, scale) {
    let key = '', sc, wl, fl, ht, tiles, shade, sharp;
    this.frame = (o, t) => {
      const W0 = o.w, H0 = o.h, W = Math.round(W0 * scale), H = Math.round(H0 * scale);
      const k = JSON.stringify([o.seed, o.w, o.h, o.pal, o.shapes, o.shade, o.size, o.wash, o.grunge, o.tone, o.dot, scale]);
      if (k !== key) { key = k; cv.width = W; cv.height = H; sc = scene(o, W, H); wl = wash(o, W, H); fl = flecks(o, W, H); ht = halftone(o, W, H); tiles = noiseTiles(o.seed);
        const q = .25 + (1 - o.soft / 100) * .2; shade = mk(W * q, H * q); sharp = mk(W * .5, H * .5); }
      const c = cv.getContext('2d'), p = PAL[o.pal];
      c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1; c.fillStyle = p.bg; c.fillRect(0, 0, W, H);
      // glow, drifting
      const g = o.glow / 100;
      if (g > 0) for (const gl of sc.glows) { const dx = Math.sin(t * .00012 + gl.ph) * W * .04 * (o.sway / 100), dy = Math.cos(t * .0001 + gl.ph) * H * .03 * (o.sway / 100);
        const x = gl.x * W + dx, y = gl.y * H + dy, rad = Math.max(W, H) * gl.rad, gr = c.createRadialGradient(x, y, 0, x, y, rad);
        gr.addColorStop(0, hexA(p.glow[gl.c], .75 * g)); gr.addColorStop(1, hexA(p.glow[gl.c], 0)); c.fillStyle = gr; c.fillRect(0, 0, W, H); }
      // watercolour under the shade
      if (o.wash > 0) { c.save(); c.globalCompositeOperation = 'multiply'; c.filter = `blur(${Math.round(28 * scale)}px)`; c.drawImage(wl, 0, 0); c.restore(); c.globalCompositeOperation = 'source-over'; }
      // shade: drawn small and scaled up, which blurs it for free
      const sh = o.shade / 100;
      if (sh > 0 && sc.items.length) {
        for (const [cnv, a] of [[shade, .04 + .42 * sh * sh], [sharp, o.soft < 35 ? .08 * sh * (1 - o.soft / 35) : 0]]) {
          if (a <= 0) continue;
          const sc2 = cnv.width / W, sx = cnv.getContext('2d'); sx.setTransform(1, 0, 0, 1, 0, 0); sx.clearRect(0, 0, cnv.width, cnv.height);
          sx.setTransform(sc2, 0, 0, sc2, 0, 0); sx.fillStyle = p.shade; sx.strokeStyle = p.shade; drawShade(sx, sc, o, t, W, H);
          c.save(); c.globalCompositeOperation = 'multiply'; c.globalAlpha = a; c.imageSmoothingQuality = 'high';
          if (cnv === shade) c.filter = `blur(${Math.round((2 + Math.pow(o.soft / 100, 1.4) * 22) * (sc.ls / sc.u) * scale)}px)`;
          c.drawImage(cnv, 0, 0, W, H); c.restore();
        }
      }
      if (o.tone > 0) { c.save(); c.globalCompositeOperation = 'multiply'; c.globalAlpha = .06 + o.tone / 100 * .22; c.drawImage(ht, 0, 0); c.restore(); }
      if (o.grunge > 0) c.drawImage(fl, 0, 0);
      // grain, stepping between four tiles so it breathes
      const gn = o.grain / 100;
      if (gn > 0) { const tile = tiles[o.motion ? Math.floor(Math.abs(t) / 110) % 4 : 0];
        c.save(); c.globalAlpha = .12 * gn + .02; c.globalCompositeOperation = 'overlay'; c.fillStyle = c.createPattern(tile, 'repeat'); c.fillRect(0, 0, W, H); c.restore(); }
    };
  }


  PAL.brand = { name: 'Brand', bg: tok('--hf-bone') || '#edebe4', shade: tok('--brand-shade') || '#5c5a40', glow: [tok('--brand-accent') || '#d6ec6b', tok('--brand-warm') || '#f2c7a2', tok('--brand-300') || '#a9b78d'], wash: [tok('--brand-300') || '#a9b78d', tok('--brand-accent') || '#d6ec6b', tok('--brand-warm') || '#f2c7a2'] };
  const GROUND = { seed: 4821, pal: 'brand', shapes: ['palm', 'leaves'], shade: 24, size: 85, soft: 80, glow: 26, wash: 8, grain: 26, tone: 0, dot: 40, grunge: 6, sway: 30 };
  const HERO = { seed: 4821, w: 960, h: 540, pal: 'moss', shapes: ['branch'], shade: 25, size: 85, soft: 85, glow: 50, wash: 45, grain: 55, tone: 40, dot: 35, grunge: 45, sway: 0, motion: false };
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const gcv = ground.querySelector('canvas'); const gEng = new Ground(gcv, 1);
  const gOpts = () => Object.assign({}, GROUND, { w: Math.round(innerWidth * .5), h: Math.round(innerHeight * .5), motion: !reduceMotion });
  let gT0 = performance.now(), gLast = 0, gO = gOpts();
  const gTick = now => { if (!doc.hidden && now - gLast > 66) { gLast = now; gEng.frame(gO, reduceMotion ? 0 : now - gT0); } if (!reduceMotion) requestAnimationFrame(gTick); };
  gEng.frame(gO, 0); if (!reduceMotion) requestAnimationFrame(gTick);
  addEventListener('resize', () => { gO = gOpts(); gEng.frame(gO, performance.now() - gT0); });
  try { const hc = mk(1, 1); new Ground(hc, 1).frame(HERO, 0); root.style.setProperty('--hf-hero-ground', `url(${hc.toDataURL('image/jpeg', .85)})`); } catch (e) {}

  /* top: brand · pill nav · search, goals, you */
  const PH = (d, s = 18) => `<svg viewBox="0 0 256 256" width="${s}" height="${s}" aria-hidden="true"><path d="${d}"/></svg>`;
  const P_SEARCH = 'M228.24,219.76l-51.38-51.38a86.15,86.15,0,1,0-8.48,8.48l51.38,51.38a6,6,0,0,0,8.48-8.48ZM38,112a74,74,0,1,1,74,74A74.09,74.09,0,0,1,38,112Z';
  const NIC = {"org": "M128,26A102,102,0,1,0,230,128,102.12,102.12,0,0,0,128,26Zm0,192a90,90,0,1,1,90-90A90.1,90.1,0,0,1,128,218Zm0-146a56,56,0,1,0,56,56A56.06,56.06,0,0,0,128,72Zm0,100a44,44,0,1,1,44-44A44.05,44.05,0,0,1,128,172Zm0-58a14,14,0,1,0,14,14A14,14,0,0,0,128,114Z", "home": "M217.9,110.1l-80-80a14,14,0,0,0-19.8,0l-80,80A13.92,13.92,0,0,0,34,120v96a6,6,0,0,0,6,6h64a6,6,0,0,0,6-6V158h36v58a6,6,0,0,0,6,6h64a6,6,0,0,0,6-6V120A13.92,13.92,0,0,0,217.9,110.1ZM210,210H158V152a6,6,0,0,0-6-6H104a6,6,0,0,0-6,6v58H46V120a2,2,0,0,1,.58-1.42l80-80a2,2,0,0,1,2.84,0l80,80A2,2,0,0,1,210,120Z", "inbox": "M238,128a6,6,0,0,1-6,6H203.71l-38.34,76.68A6,6,0,0,1,160,214h-.3a6,6,0,0,1-5.31-3.85L95.51,55.57,61.46,130.48A6,6,0,0,1,56,134H24a6,6,0,0,1,0-12H52.14l38.4-84.48a6,6,0,0,1,11.07.34L160.74,193.1l33.89-67.78A6,6,0,0,1,200,122h32A6,6,0,0,1,238,128Z", "projects": "M216,50H40a6,6,0,0,0-6,6V208a14,14,0,0,0,14,14H88a14,14,0,0,0,14-14V158h52v18a14,14,0,0,0,14,14h40a14,14,0,0,0,14-14V56A6,6,0,0,0,216,50Zm-6,64H166V62h44ZM90,62v52H46V62Zm0,146a2,2,0,0,1-2,2H48a2,2,0,0,1-2-2V126H90Zm12-62V62h52v84Zm106,32H168a2,2,0,0,1-2-2V126h44v50A2,2,0,0,1,208,178Z", "flows": "M244.24,75.76l-32-32a6,6,0,0,0-8.48,8.48L225.51,74H208c-48,0-59.44,27.46-69.54,51.69-9.43,22.64-17.66,42.33-53,44.16a38,38,0,1,0,.06,12c43.34-2.06,54.29-28.29,64-51.55C159.44,106.53,168,86,208,86h17.51l-21.75,21.76a6,6,0,1,0,8.48,8.48l32-32A6,6,0,0,0,244.24,75.76ZM48,202a26,26,0,1,1,26-26A26,26,0,0,1,48,202Z", "agents": "M200,50H134V16a6,6,0,0,0-12,0V50H56A30,30,0,0,0,26,80V192a30,30,0,0,0,30,30H200a30,30,0,0,0,30-30V80A30,30,0,0,0,200,50Zm18,142a18,18,0,0,1-18,18H56a18,18,0,0,1-18-18V80A18,18,0,0,1,56,62H200a18,18,0,0,1,18,18ZM74,108a10,10,0,1,1,10,10A10,10,0,0,1,74,108Zm88,0a10,10,0,1,1,10,10A10,10,0,0,1,162,108Zm2,30H92a26,26,0,0,0,0,52h72a26,26,0,0,0,0-52Zm-22,12v28H114V150ZM78,164a14,14,0,0,1,14-14h10v28H92A14,14,0,0,1,78,164Zm86,14H154V150h10a14,14,0,0,1,0,28Z", "people": "M112.6,158.43a58,58,0,1,0-57.2,0A93.83,93.83,0,0,0,5.21,196.72a6,6,0,0,0,10.05,6.56,82,82,0,0,1,137.48,0,6,6,0,0,0,10-6.56A93.83,93.83,0,0,0,112.6,158.43ZM38,108a46,46,0,1,1,46,46A46.06,46.06,0,0,1,38,108Zm211,97a6,6,0,0,1-8.3-1.74A81.8,81.8,0,0,0,172,166a6,6,0,0,1,0-12,46,46,0,1,0-17.08-88.73,6,6,0,1,1-4.46-11.14,58,58,0,0,1,50.14,104.3,93.83,93.83,0,0,1,50.19,38.29A6,6,0,0,1,249,205Z", "knowledge": "M216,74H130.49l-27.9-27.9a13.94,13.94,0,0,0-9.9-4.1H40A14,14,0,0,0,26,56V200.62A13.39,13.39,0,0,0,39.38,214H216.89A13.12,13.12,0,0,0,230,200.89V88A14,14,0,0,0,216,74ZM40,54H92.69a2,2,0,0,1,1.41.59L113.51,74H38V56A2,2,0,0,1,40,54ZM218,200.89a1.11,1.11,0,0,1-1.11,1.11H39.38A1.4,1.4,0,0,1,38,200.62V86H216a2,2,0,0,1,2,2Z", "more": "M138,128a10,10,0,1,1-10-10A10,10,0,0,1,138,128ZM60,118a10,10,0,1,0,10,10A10,10,0,0,0,60,118Zm136,0a10,10,0,1,0,10,10A10,10,0,0,0,196,118Z"};
  const NAV = [['home', 'Home'], ['org', 'Live'], ['inbox', 'Activity'], ['projects', 'Tasks'], ['flows', 'Workflows'], ['agents', 'Agents'], ['people', 'People'], ['knowledge', 'Files']];
  const MORE = [['tools', 'Tools'], ['settings', 'Settings']];
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
    top.innerHTML = `<button type="button" class="hf-brand" data-nav="home" aria-label="Halloway, home"><svg class="hf-logo" viewBox="0 0 28 28" width="28" height="28" aria-hidden="true"><rect width="28" height="28" rx="9" fill="var(--brand-700)"/><path d="M9 7.5v13M19 7.5v13M9 15.5c2.6-3.4 7.4-3.4 10 0" fill="none" stroke="var(--brand-accent)" stroke-width="2.4" stroke-linecap="round"/></svg><span>Halloway</span></button>
      <div class="hf-navwrap"><nav class="hf-nav" aria-label="Main">${NAV.map(([k, l]) => `<button type="button" data-nav="${k}" aria-label="${l}"${cur === k ? ' aria-current="page"' : ''}>${PH(NIC[k], 22)}<span class="lb">${l}</span>${k === 'inbox' && needs() ? `<span class="hf-need" title="Needs you">${pix('needs', 11)}</span>` : ''}</button>`).join('')}<button type="button" data-hfmore aria-haspopup="menu" aria-label="More"${moreOn ? ' aria-current="page"' : ''}>${PH(NIC.more, 22)}<span class="lb">More</span></button></nav></div>
      <div class="hf-right"><button type="button" class="hf-me" data-hfme aria-label="Your goals and account"><span class="hf-rings">${rings()}</span><span class="hf-av">${avImg ? `<img src="${avImg.getAttribute('src')}" alt="">` : esc((S.me.name || 'You').split(' ').map(w => w[0]).join('').slice(0, 2))}</span></button></div>`;
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
  const navTo = k => { closeMenu(); try { go(k); } catch (e) {} };
  doc.addEventListener('click', e => {
    const nb = e.target.closest && e.target.closest('.hf-top [data-nav]');
    if (nb) { e.preventDefault(); navTo(nb.dataset.nav); return; }
    if (menu && !menu.contains(e.target) && !e.target.closest('[data-hfmore],.rv-more')) closeMenu();
    if (e.target.closest('[data-hfmore]')) {
      const a = e.target.closest('[data-hfmore]');
      const sw = doc.getElementById('projSw');
      openMenu(a, [...MORE.map(([k, l]) => [l, () => navTo(k)]), ['Component library', () => window.__hfLib && window.__hfLib.open()], ...(sw ? ['-', ['Switch project', () => sw.click()]] : [])]);
    } else if (e.target.closest('[data-hfsearch]')) { const b = doc.getElementById('askBtn'); if (b) b.click(); }
    else if (e.target.closest('[data-hfme]')) {
      const btn = e.target.closest('[data-hfme]'), m = doc.querySelector('.me-top'); if (m) m.click();
      const place = () => { const pm = doc.getElementById('popm'); if (!pm || pm.hidden) return; const r = btn.getBoundingClientRect();
        pm.classList.add('hf-pop'); pm.style.top = (r.bottom + 10) + 'px'; pm.style.left = Math.max(12, Math.min(innerWidth - pm.offsetWidth - 12, r.right - pm.offsetWidth)) + 'px'; pm.style.right = 'auto'; pm.style.bottom = 'auto'; };
      requestAnimationFrame(place); setTimeout(place, 60);
    }
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
  try { const hfOrb = [tok('--brand-900') || '#1f2a14', tok('--brand-500') || '#6e7b3e', tok('--brand-accent') || '#e2efa8']; ORB.hf1 = hfOrb; ORB.johnny = hfOrb; } catch (e) {}
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

  /* Pixel mark: a 3×3 grid of soft squares. One shape for thinking, working, needs-you and done. */
  const PIXP = {
    think: [0, 1, 4, 5, 8, 7, 4, 3],   // snakes through the middle
    scan: [0, 3, 6, 1, 4, 7, 2, 5, 8],
    make: [6, 4, 2, 4],                // a diagonal climb
    needs: null, done: null
  };
  const PIXS = { needs: [1, 3, 4, 5, 7], done: [0, 1, 2, 3, 4, 5, 6, 7, 8] };
  const pix = (kind = 'think', size = 14) => {
    const u = size / 11, cells = [];
    for (let i = 0; i < 9; i++) {
      const x = (i % 3) * 4 * u, y = Math.floor(i / 3) * 4 * u; let cls = '', st = '';
      if (kind === 'live') { const ring = [1, 3, 5, 7].includes(i) ? 1 : i === 4 ? 0 : 2; cls = ring ? 'run' : 'on'; if (ring) st = ` style="animation-delay:${ring === 1 ? '0s' : '.32s'}"`; }
      else if (PIXS[kind]) cls = PIXS[kind].includes(i) ? 'on' : 'off';
      else { const seq = PIXP[kind], k = seq.indexOf(i); if (k < 0) cls = 'off'; else { cls = 'run'; st = ` style="animation-delay:${(k * 1.4 / seq.length).toFixed(2)}s"`; } }
      cells.push(`<rect class="${cls}"${st} x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${(3 * u).toFixed(1)}" height="${(3 * u).toFixed(1)}" rx="${(.9 * u).toFixed(1)}"/>`);
    }
    return `<svg class="hf-pix hf-pix-${kind}" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" aria-hidden="true">${cells.join('')}</svg>`;
  };
  window.__hfPix = pix;

  /* Thinking Loader: eight rays and a label that rolls through what HF1 is doing */
  const PHASES = ['Thinking', 'Reading what’s on screen', 'Checking with your agents', 'Writing it up'];
  const thinker = el => {
    if (el.dataset.hf) return; el.dataset.hf = '1';
    el.classList.add('hf-think'); el.setAttribute('role', 'status');
    el.innerHTML = pix('think', 16) + `<span class="hf-think-t"><span class="hf-lbl hf-shine" data-text="${PHASES[0]}">${PHASES[0]}</span></span>`;
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
    if (t.parentElement && !t.parentElement.querySelector('.hf-pix')) t.parentElement.insertAdjacentHTML('beforeend', pix('think', 13));
  });
  /* onboarding: the step being built shows the same rays */
  const building = () => doc.querySelectorAll('.ob-steps li.cur .d').forEach(d => { if (!d.querySelector('.hf-pix')) d.innerHTML = pix('make', 14); });

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
    setTimeout(() => tDismiss(c), 2600);
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
  const marks = () => {
    doc.querySelectorAll('.ap2-live:not([data-hf])').forEach(l => { l.dataset.hf = '1'; l.innerHTML = pix('think', 12); });
    doc.querySelectorAll('.xp.att .xp-ctx:not([data-hf])').forEach(c => { c.dataset.hf = '1'; const i = c.querySelector('svg.i'); if (i) i.outerHTML = pix('needs', 11); });
    doc.querySelectorAll('.hx-in:not([data-hf]), .wz-in:not([data-hf])').forEach(f => {
      f.dataset.hf = '1'; const inp = f.querySelector('input'), send = f.querySelector('button.hfc-send, button[type=submit]') || [...f.querySelectorAll('button')].pop(); if (!inp || !send) return;
      const plus = doc.createElement('button'); plus.type = 'button'; plus.className = 'hf-cb'; plus.setAttribute('aria-label', 'Attach a file or link');
      plus.innerHTML = PH('M222,128a6,6,0,0,1-6,6H134v82a6,6,0,0,1-12,0V134H40a6,6,0,0,1,0-12h82V40a6,6,0,0,1,12,0v82h82A6,6,0,0,1,222,128Z', 20);
      const mic = doc.createElement('button'); mic.type = 'button'; mic.className = 'hf-cb'; mic.setAttribute('aria-label', 'Talk instead of typing');
      mic.innerHTML = PH('M128,174a46.06,46.06,0,0,0,46-46V64a46,46,0,0,0-92,0v64A46.06,46.06,0,0,0,128,174ZM94,64a34,34,0,0,1,68,0v64a34,34,0,0,1-68,0Zm40,141.75V232a6,6,0,0,1-12,0V205.75A78.09,78.09,0,0,1,50,128a6,6,0,0,1,12,0,66,66,0,0,0,132,0,6,6,0,0,1,12,0A78.09,78.09,0,0,1,134,205.75Z', 20);
      plus.addEventListener('click', () => toast('Attach a file, a link or a screenshot. Coming in the next build.'));
      mic.addEventListener('click', () => { mic.toggleAttribute('data-on'); mic.setAttribute('aria-pressed', mic.hasAttribute('data-on')); });
      f.insertBefore(plus, f.querySelector('.wz-ctx') || inp); f.insertBefore(mic, send);
    });
  };
  const setNav = () => doc.querySelectorAll('.set-nav:not([data-hf])').forEach(n => { n.dataset.hf = '1'; const a = n.querySelector('a'); if (a) a.classList.add('on');
    n.addEventListener('click', e => { const t = e.target.closest('a'); if (!t) return; n.querySelectorAll('a').forEach(x => x.classList.toggle('on', x === t)); }); });
  const runSteps = () => doc.querySelectorAll('.tl2 li.run .d:not([data-hf])').forEach(d => { d.dataset.hf = '1'; d.innerHTML = pix('think', 12); });
  const sheet = () => { const s = doc.getElementById('sheet'); root.classList.toggle('hf-sheet', !!(s && s.classList.contains('full') && s.getClientRects().length)); };

  const sync = () => {
    root.classList.toggle('hf-ob', !S.ob.done); root.dataset.hfpage = curPage();
    renderTop(); moveAct(); doc.querySelectorAll('.qc.front').forEach(shapeCard); dots(); tiles();
    doc.querySelectorAll('.hx-think').forEach(thinker); running(); building(); marks(); setNav(); runSteps(); sheet(); slides();
    root.classList.toggle('hf-thread', !!doc.querySelector('.th-comp'));
  };
  let queued = false;
  new MutationObserver(muts => {
    if (queued || muts.every(m => tStack.contains(m.target) || m.target === tip || (m.target.closest && m.target.closest('.hf-think-t')))) return;
    queued = true; requestAnimationFrame(() => { queued = false; sync(); });
  }).observe(doc.body, { childList: true, subtree: true });
  addEventListener('resize', () => { Object.keys(slid).forEach(k => delete slid[k]); doc.querySelectorAll('.hf-thumb').forEach(t => { t.dataset.k = ''; }); slides(); });
  sync();
})();
