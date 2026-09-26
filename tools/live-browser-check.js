// Optional deployment QA: npm install --no-save playwright-core
const assert = require('node:assert/strict');
const os = require('node:os');
const path = require('node:path');
const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', response => { if (response.url().startsWith('https://manasraj.vercel.app/') && response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
    await page.goto('https://manasraj.vercel.app/clix/', { waitUntil: 'domcontentloaded' });
    await page.locator('#cards .card').first().waitFor();
    assert.match(page.url(), /\/clix\/?$/);
    const style = await page.locator('#cards .card').first().evaluate(card => ({ border: getComputedStyle(card).borderTopStyle, background: getComputedStyle(card).backgroundImage }));
    assert.equal(style.border, 'solid');
    assert.notEqual(style.background, 'none');
    await page.locator('#search').fill('grep');
    assert.match(await page.locator('#resultCount').innerText(), /entries?/i);
    await page.screenshot({ path: path.join(os.tmpdir(), 'manas-live-clix.png') });
    await page.goto('https://manasraj.vercel.app/');
    await page.locator('.hero-deck video').waitFor();
    assert.equal(await page.locator('.deck-slide').count(), 3);
    await page.locator('.theme-toggle').click();
    assert.equal(await page.locator('html').getAttribute('data-theme'), 'light');
    await page.goto('https://manasraj.vercel.app/articles/cron_jobs_to_priviliage_esc.html');
    assert.equal(await page.locator('.article-hero-media img').count(), 1);
    await page.locator('#cron-file').check();
    assert.match(await page.locator('#cron-assessment').innerText(), /Review privilege boundary/);
    assert.deepEqual(errors, []);
    console.log('Live browser check passed.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
