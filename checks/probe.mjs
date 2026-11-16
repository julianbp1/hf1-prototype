// Quick look at one screen: run JS in it and/or screenshot it.
//   node checks/probe.mjs <page> <slug> [--vp=desktop|phone] [--role=owner] [--js="expr"] [--shot=file.png] [--before="js run before shot"]
import puppeteer from 'puppeteer-core';
const [page0, slug, ...rest] = process.argv.slice(2);
const a = Object.fromEntries(rest.map(s => { const m = s.match(/^--([^=]+)=?([\s\S]*)$/); return [m[1], m[2]]; }));
const VP = a.vp === 'phone' ? { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true } : { width: 1440, height: 900, deviceScaleFactor: 1 };
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, args: ['--hide-scrollbars', '--force-color-profile=srgb'] });
const p = await b.newPage(); await p.setViewport(VP);
p.on('pageerror', e => console.log('PAGEERROR', e.message));
await p.goto(`${a.base || 'http://localhost:3000'}/${page0}?screen=${slug}&role=${a.role || 'owner'}`, { waitUntil: 'load' });
await p.waitForFunction('window.__screenReady === true', { timeout: 90000 }).catch(async e => { console.log('TIMEOUT'); });
await new Promise(r => setTimeout(r, 600));
if (a.before) { await p.evaluate(a.before); await new Promise(r => setTimeout(r, 900)); }
if (a.js) console.log(JSON.stringify(await p.evaluate(a.js), null, 1));
if (a.shot) await p.screenshot({ path: a.shot });
await b.close();
