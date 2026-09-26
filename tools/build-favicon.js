// Optional asset refresh: npm install --no-save playwright-core
const path = require('node:path');
const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  const page = await browser.newPage({ viewport: { width: 128, height: 128 }, deviceScaleFactor: 2 });
  await page.setContent(`<!doctype html><link href="https://fonts.googleapis.com/css2?family=Special+Elite&display=swap" rel="stylesheet"><style>*{box-sizing:border-box}body{margin:0}.icon{width:128px;height:128px;background:#f7f5f0;display:grid;place-items:center;overflow:hidden}.mark{font:400 94px/1 'Special Elite','Courier New',monospace;letter-spacing:-.07em;color:#24231f;transform:translate(-5px,8px)}.mark span{color:#ad4038}</style><div class="icon"><span class="mark">m<span>.</span></span></div>`);
  await page.evaluate(() => document.fonts.ready);
  await page.locator('.icon').screenshot({ path: path.resolve(__dirname, '../favicon.png') });
  await browser.close();
})().catch(error => { console.error(error); process.exitCode = 1; });
