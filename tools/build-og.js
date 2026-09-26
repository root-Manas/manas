// Optional image refresh: npm install --no-save playwright-core; node tools/build-og.js
const path = require('node:path');
const { chromium } = require('playwright-core');
const root = path.resolve(__dirname, '..');
const targets = [
  { file: 'public/og-card.png', eyebrow: 'a personal note / mumbai', title: "hi, i'm manas.", art: '' },
  { file: 'public/figures/ppf-og.png', eyebrow: 'FIELD NOTE / ECONOMICS', title: 'The Zero-Sum Silicon Game', art: 'ppf-system.svg' },
  { file: 'public/figures/rf-og.png', eyebrow: 'FIELD NOTE / RADIO SYSTEMS', title: 'Antenna Theory & Wave Propagation', art: 'rf-link.svg' },
  { file: 'public/figures/recon-og.png', eyebrow: 'FIELD NOTE / RECONNAISSANCE', title: 'Thinking Like Infrastructure', art: 'recon-graph.svg' },
  { file: 'public/figures/cron-og.png', eyebrow: 'FIELD NOTE / LINUX SECURITY', title: 'Cron Jobs & Privilege Boundaries', art: 'cron-boundary.svg' }
];
(async () => {
  const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  for (const item of targets) {
    await page.setContent(`<!doctype html><html><head><style>*{box-sizing:border-box}body{margin:0;background:#f7f5f0;color:#24231f;font-family:Consolas,monospace}.lines{position:absolute;inset:0;background:repeating-linear-gradient(to bottom,transparent 0,transparent 35px,#ad40380b 36px)}.bar{position:absolute;left:70px;right:70px;top:62px;border-top:2px solid #ad4038}.content{position:absolute;left:70px;right:70px;top:111px}small{font:400 20px Consolas,monospace;color:#ad4038}h1{font:400 ${item.art ? 63 : 78}px/1.12 Consolas,monospace;letter-spacing:-4px;max-width:960px;margin:135px 0 0}.footer{position:absolute;left:70px;right:70px;bottom:48px;display:flex;justify-content:space-between;font:400 18px Consolas,monospace}.footer span:last-child{color:#ad4038}</style></head><body><div class="lines"></div><div class="bar"></div><div class="content"><small>${item.eyebrow.toLowerCase()}</small><h1>${item.title}</h1></div><div class="footer"><span>manas.</span><span>mumbai, india / 2026</span></div></body></html>`);
    await page.screenshot({ path: path.join(root, item.file) });
    console.log(`Created ${item.file}`);
  }
  await browser.close();
})().catch(error => { console.error(error); process.exitCode = 1; });
