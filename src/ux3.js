
/* ================= Widget suggestions learned from what you open (approved proposal) =================
   HF1 counts which parts of the workspace you open, per role, and offers the matching widget on Home.
   Counts stay in this browser; nothing new is sent anywhere. One tap builds the widget the usual way. */
const UXW = { flowhealth: 'Flows', agents: 'Agents', projects: 'Tasks', capacity: 'People', leads: 'Internet lead replies' };
let uxUse = {};
try { uxUse = JSON.parse(localStorage.getItem('hf1.use') || '{}') || {}; } catch (_) { uxUse = {}; }
const uxSave = () => { try { localStorage.setItem('hf1.use', JSON.stringify(uxUse)); } catch (_) { /* private mode: keep it in memory */ } };
function uxSeen(block) {
  if (!S.ob.done || !BLOCKS[block]) return;
  const r = uxUse[S.vas] = uxUse[S.vas] || {}; r[block] = (r[block] || 0) + 1; uxSave();
}
function uxSignal(page, key) {
  if (key) { if (/^flowpage:leads|^a:iris/.test(key)) return 'leads'; if (/^flowpage:|^flow:/.test(key)) return 'flowhealth'; if (/^a:/.test(key)) return 'agents'; return null; }
  return { flows: 'flowhealth', agents: 'agents', projects: 'projects', people: 'capacity', org: 'capacity' }[page] || null;
}
const _goUX = go; go = function (p, o) { const r = _goUX(p, o); const s = uxSignal(p); if (s) uxSeen(s); return r; };
const _openEntityUX = openEntity; openEntity = function (k) { const r = _openEntityUX(k); const s = uxSignal(null, k); if (s) uxSeen(s); return r; };
const _openProfileUX = openProfile; openProfile = function (k, t) { const r = _openProfileUX(k, t); const s = uxSignal(null, k); if (s) uxSeen(s); return r; };
function uxWidgetSugs() {
  const r = uxUse[S.vas] || {};
  return Object.entries(r).filter(([b, n]) => n >= 3 && BLOCKS[b] && TILE[b] && !S.home.includes(b)).sort((a, b) => b[1] - a[1]).slice(0, 2);
}
const _tilesHTMLUX = tilesHTML;
tilesHTML = function () {
  const h = _tilesHTMLUX(), sg = uxWidgetSugs();
  if (!sg.length) return h;
  return h + `<div class="ux-wsug"><span class="ux-wsug-h">${hfOrb(16)}<span>From what you open most</span></span>${sg.map(([b, n]) => `<button type="button" class="ux-wsug-b" data-uxw="${b}"><b>${esc(BLOCKS[b].t)}</b><small>You opened ${esc(UXW[b] || BLOCKS[b].t)} ${n} times</small><span class="ux-add">Add</span></button>`).join('')}</div>`;
};
window.addEventListener('click', e => { const b = e.target.closest('[data-uxw]'); if (!b) return; e.stopImmediatePropagation(); doWidget({ id: b.dataset.uxw }); }, true);
