import puppeteer from 'puppeteer-core'; import fs from 'fs';
const out = process.argv[2];
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 1000 });
await p.goto('file://' + process.cwd() + '/design/grounds.html'); await new Promise(r => setTimeout(r, 800));
await p.evaluate(() => { const m = document.getElementById('motion'); if (m.getAttribute('aria-pressed') === 'true') m.click(); });
const ids = ['sun', 'palms', 'blinds', 'paper', 'wash', 'dusk'];
for (let i = 0; i < ids.length; i++) {
  const url = await p.evaluate(async i => { document.querySelectorAll('.pre')[i].click(); await new Promise(r => setTimeout(r, 400)); return document.getElementById('cv').toDataURL('image/jpeg', .9); }, i);
  fs.writeFileSync(`${out}/${ids[i]}.jpg`, Buffer.from(url.split(',')[1], 'base64'));
}
await b.close();
