// Optional asset refresh: npm install --no-save playwright-core
const path = require('node:path');
const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  const page = await browser.newPage({ viewport: { width: 128, height: 128 }, deviceScaleFactor: 2 });
  await page.setContent(`<!doctype html><style>*{box-sizing:border-box}body{margin:0}.icon{width:128px;height:128px;background:#090909;border:8px solid #090909;position:relative;display:grid;place-items:center;overflow:hidden}.icon:before{content:'';position:absolute;top:0;left:0;width:34px;height:7px;background:#ef3434}.icon:after{content:'';position:absolute;right:0;bottom:0;width:34px;height:7px;background:#ef3434}.mark{font:900 78px/1 Arial,sans-serif;letter-spacing:-.12em;color:#fff;transform:translate(-5px,-2px)}.slash{position:absolute;right:21px;bottom:27px;color:#ef3434;font:900 63px/1 Arial,sans-serif;transform:rotate(7deg)}</style><div class="icon"><span class="mark">M</span><span class="slash">/</span></div>`);
  await page.locator('.icon').screenshot({ path: path.resolve(__dirname, '../favicon.png') });
  await browser.close();
})().catch(error => { console.error(error); process.exitCode = 1; });
