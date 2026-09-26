// Optional image refresh: npm install --no-save playwright-core; node tools/build-og.js
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright-core');
const root = path.resolve(__dirname, '..');
const targets = [
  { file: 'public/og-card.png', eyebrow: 'MANAS / MUMBAI', title: "Hi, I'm Manas.", art: '' },
  { file: 'public/figures/ppf-og.png', eyebrow: 'FIELD NOTE / ECONOMICS', title: 'The Zero-Sum Silicon Game', art: 'ppf-system.svg' },
  { file: 'public/figures/rf-og.png', eyebrow: 'FIELD NOTE / RADIO SYSTEMS', title: 'Antenna Theory & Wave Propagation', art: 'rf-link.svg' },
  { file: 'public/figures/recon-og.png', eyebrow: 'FIELD NOTE / RECONNAISSANCE', title: 'Thinking Like Infrastructure', art: 'recon-graph.svg' },
  { file: 'public/figures/cron-og.png', eyebrow: 'FIELD NOTE / LINUX SECURITY', title: 'Cron Jobs & Privilege Boundaries', art: 'cron-boundary.svg' }
];
(async () => {
  const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  for (const item of targets) {
    const svg = item.art ? fs.readFileSync(path.join(root, 'public/figures', item.art), 'utf8') : '';
    await page.setContent(`<!doctype html><html><head><style>*{box-sizing:border-box}body{margin:0;background:#090909;color:#fff;font-family:Arial,sans-serif}.grid{position:absolute;inset:0;background-image:linear-gradient(#ffffff14 1px,transparent 1px),linear-gradient(90deg,#ffffff14 1px,transparent 1px);background-size:48px 48px}.art{position:absolute;right:-30px;top:35px;width:750px;opacity:.36}.art svg{width:100%;height:auto}.bar{position:absolute;left:70px;right:70px;top:60px;border-top:3px solid #ef3434}.content{position:absolute;left:70px;right:70px;top:104px}small{font:700 21px monospace;color:#ef3434;letter-spacing:2px}h1{font-size:76px;line-height:1.04;letter-spacing:-5px;max-width:950px;margin:125px 0 0;text-shadow:0 4px 16px #000}.footer{position:absolute;left:70px;right:70px;bottom:48px;display:flex;justify-content:space-between;font:700 21px monospace}.footer span:last-child{color:#ef3434}</style></head><body><div class="grid"></div><div class="art">${svg}</div><div class="bar"></div><div class="content"><small>${item.eyebrow}</small><h1>${item.title}</h1></div><div class="footer"><span>MANAS.</span><span>LAB / 2026 ↗</span></div></body></html>`);
    await page.screenshot({ path: path.join(root, item.file) });
    console.log(`Created ${item.file}`);
  }
  await browser.close();
})().catch(error => { console.error(error); process.exitCode = 1; });
