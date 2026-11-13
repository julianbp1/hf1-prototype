
/* ================= Standalone: open any Owner screen by link =================
   index.html?screen=<slug> plays the same clicks a person would make, then leaves the app live.
   window.HF1_SCREENS lists every screen; window.__screenReady turns true when the screen is set. */
(() => {
  const w = ms => new Promise(r => setTimeout(r, ms));
  const click = sel => { const e = document.querySelector(sel); if (!e) throw new Error('missing ' + sel); e.click(); };
  // ?role=ceo|mgr|emp (or owner|manager|salesperson) opens the screen as that person, once onboarding is done
  const RA = { owner: 'ceo', manager: 'mgr', salesperson: 'emp' };
  const ROLE = (r => RA[r] || r)((new URLSearchParams(location.search).get('role') || '').toLowerCase());
  const asRole = async () => { if (ROLE && VIEWS[ROLE] && S.vas !== ROLE) { setView(ROLE); await w(700); } };
  const done = async () => { S.ob.done = true; S.panel = null; renderAll(); await w(600); await asRole(); };
  const onboard = async () => {
    await w(2600); click('[data-sconnect="github"]'); await w(1600); click('[data-setupdone]'); await w(2200); click('[data-frbuild]'); await w(9000);
    if (!S.ob.done) await done(); else await asRole();
    S.frHint = false; renderAll(); await w(800);
  };
  const view = (pg, v) => async () => { await done(); if (v) S.view[pg] = v; go(pg); renderAll(); await w(1200); };
  const prof = (k, t) => async () => { await done(); openProfile(k, t); await w(1200); };
  const pick = (sel, fn) => { const e = [...document.querySelectorAll(sel)].find(fn); if (!e) throw new Error('missing ' + sel); return e; };
  const toWidgets = async () => { await w(2600); click('[data-sconnect="github"]'); await w(1600); click('[data-setupdone]'); };
  const deal = async () => { await done(); openEntity('flowpage:deal'); await w(1300); };
  const SCR = [
    ['Onboarding', 'Connect tools', async () => { await w(3200); }],
    ['Onboarding', 'Pick your widgets', async () => { await toWidgets(); await w(3000); }],
    ['Onboarding', 'Building your desktop', async () => { await toWidgets(); await w(2200); click('[data-frbuild]'); await w(1400); }],
    ['Home', 'Queue', onboard],
    ['Home', 'HF1 knows the page', async () => { await onboard(); hfOpenChat(true); await w(1200); }],
    ['Home', 'HF1 full view', async () => { await onboard(); hfOpenChat(true); await w(700); click('[data-hx="full"]'); await w(1200); }],
    ['Home', 'HF1 walks you through a decision', async () => { await onboard(); hfOpenChat(true); await w(700); hfSend('What needs me?'); for (let i = 0; i < 40 && !HFX.call; i++) await w(250); await w(900); }],
    ['Home', 'Widget details', async () => { await onboard(); const t = document.querySelector('#tiles .tile[id^="tile-"]'); openWDet(t.id.slice(5)); await w(1200); }],
    ['Home', 'After approving', async () => { await onboard(); click('#stack .qc.front [data-qact="approve"]'); await w(2600); }],
    ['Home', 'Queue cleared', async () => { await onboard(); for (let i = 0; i < 30; i++) { const t = document.querySelector('#stack .qc.front [data-qteach="no"]') || document.querySelector('#stack .qc.front [data-qact="approve"]'); if (!t) break; t.click(); await w(1500); } await w(2000); }],
    ['Activity', 'Feed', view('inbox')],
    ['Activity', 'Decision post', async () => { await view('inbox')(); document.querySelector('.xp.att .xp-t').click(); await w(1000); }],
    ['Activity', 'Live work post', async () => { await view('inbox')(); pick('.xp', e => e.querySelector('.xp-live')).querySelector('.xp-t').click(); await w(1000); }],
    ['Activity', 'Follow-up post', async () => { await view('inbox')(); pick('.xp', e => /After your decision/.test(e.textContent)).querySelector('.xp-t').click(); await w(1000); }],
    ['Tasks', 'Board', view('projects', 'board')],
    ['Tasks', 'List', view('projects', 'db')],
    ['Tasks', 'Timeline', view('projects', 'timeline')],
    ['Tasks', 'Canvas', view('projects', 'canvas')],
    ['Tasks', 'Task details', async () => { await view('projects', 'board')(); openEntity('t:SLS-21'); await w(1200); }],
    ['Flows', 'Canvas', view('flows', 'canvas')],
    ['Flows', 'List', view('flows', 'db')],
    ['Flows', 'Builder · Trade-in offers', async () => { await deal(); await w(300); }],
    ['Flows', 'Builder · Step settings', async () => { await deal(); click('[data-fbopen]'); await w(900); }],
    ['Flows', 'Builder · Test run waiting for you', async () => { await deal(); click('[data-fbopen]'); await w(500); document.querySelectorAll('[data-fbsamp]')[1].click(); await w(400); click('[data-fbtest]'); await w(7000); }],
    ['Flows', 'Builder · Version history', async () => { await deal(); click('[data-fbmore]'); await w(300); pick('[data-pop]', b => b.textContent.includes('Version history')).click(); await w(900); }],
    ['Flows', 'New flow with HF1', async () => { await view('flows', 'canvas')(); click('[data-pact="flows"]'); await w(1800); }],
    ['Flows', 'HF1 builds a flow', async () => { await view('flows', 'canvas')(); click('[data-pact="flows"]'); await w(1500); document.querySelectorAll('[data-fbhs]')[0].click(); await w(3200); }],
    ['People', 'List', view('people', 'db')],
    ['People', 'Canvas', view('people', 'canvas')],
    ['People', 'Person · Rick Alvarez', prof('p:victor')],
    ['Agents', 'List', view('agents', 'db')],
    ['Agents', 'Canvas', view('agents', 'canvas')],
    ['Agents', 'Agent · Mark · Overview', prof('a:mark')],
    ['Agents', 'Agent · Mark · Activity', prof('a:mark', 'activity')],
    ['Agents', 'Agent · Mark · Settings', prof('a:mark', 'settings')],
    ['Agents', 'New agent', async () => { await done(); openBuilder(false); await w(1500); }],
    ['Agents', 'Talk to an agent', async () => { await prof('a:nova')(); talkTo('nova'); await w(1200); }],
    ['Organization', 'Map', view('org', 'canvas')],
    ['Organization', 'List', view('org', 'db')],
    ['Tools', 'Cards', view('tools', 'cards')],
    ['Tools', 'List', view('tools', 'db')],
    ['Tools', 'Tool details', async () => { await view('tools', 'cards')(); openEntity('tool:hubspot'); await w(1200); }],
    ['Files', 'By the work they came from', view('knowledge', 'cards')],
    ['Files', 'Folder · November sales', async () => { await view('knowledge', 'cards')(); click('.ux-fchip[data-fdir="q4"]'); await w(1000); }],
    ['Files', 'File preview', async () => { await view('knowledge', 'cards')(); click('[data-fopen]'); await w(1400); }],
    ['Settings', 'Organization settings', view('settings')],
    ['Settings', 'Your settings', async () => { await done(); go('me'); await w(1200); }],
    ['Search', 'Search or jump to', async () => { await done(); click('#askBtn'); await w(1000); }]
  ];
  const slug = (a, n) => (a + ' ' + n).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  window.HF1_SCREENS = SCR.map(([area, name], i) => ({ n: String(i + 1).padStart(2, '0'), area, name, slug: slug(area, name) }));
  window.__screenReady = false;
  window.__hfWho = () => ({ vas: S.vas, me: S.me && S.me.name, page: S.page });
  const want = new URLSearchParams(location.search).get('screen');
  const i = want ? window.HF1_SCREENS.findIndex(s => s.slug === want || s.n === want) : -1;
  if (i < 0) { window.__screenReady = true; return; }
  (async () => {
    try { await w(1200); await SCR[i][2](); await w(400); }
    catch (e) { console.error('Could not open screen', want, e); window.__screenError = String(e && e.message || e); }
    window.__screenReady = true;
  })();
})();
