// Optional asset refresh: npm install --no-save playwright-core; npx playwright install ffmpeg
// Run from this repository after updating D:/Projects/webdorks.
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require('playwright-core');

(async () => {
  const pageFile = path.resolve(__dirname, '../../webdorks/dorks/index.html');
  if (!fs.existsSync(pageFile)) throw new Error('Clone root-Manas/webdorks to D:/Projects/webdorks first.');
  const output = path.resolve(__dirname, '../public/assets/webdorks.webm');
  const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1, recordVideo: { dir: path.dirname(output), size: { width: 1280, height: 720 } } });
  const page = await context.newPage();
  await page.goto(pathToFileURL(pageFile).href);
  await page.waitForTimeout(1100);
  await page.locator('#themeToggle').click();
  await page.waitForTimeout(700);
  await page.locator('#targetDomain').fill('example.org');
  await page.waitForTimeout(900);
  await page.locator('#keywordFilter').fill('admin');
  await page.waitForTimeout(1300);
  await page.mouse.wheel(0, 540);
  await page.waitForTimeout(1700);
  await page.mouse.wheel(0, 590);
  await page.waitForTimeout(1200);
  await page.mouse.wheel(0, -1130);
  await page.waitForTimeout(700);
  await page.locator('#keywordFilter').fill('');
  await page.locator('#engineFilter').selectOption({ label: 'GitHub' });
  await page.waitForTimeout(1300);
  await page.mouse.wheel(0, 550);
  await page.waitForTimeout(1700);
  const video = page.video();
  await context.close();
  await browser.close();
  const rawVideo = await video.path();
  fs.copyFileSync(rawVideo, output);
  fs.rmSync(rawVideo);
  console.log(`Recorded ${output}`);
})().catch(error => { console.error(error); process.exitCode = 1; });
