// Optional visual and interaction QA: npm install --no-save playwright-core
const assert = require('node:assert/strict');
const path = require('node:path');
const os = require('node:os');
const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('http://127.0.0.1:4177/');
  await page.waitForTimeout(1000);
  assert.match(await page.title(), /Manas/);
  assert.equal(await page.locator('text=CultLink').count(), 0);
  assert.equal(await page.locator('text=Finsen').count(), 0);
  assert.match(await page.locator('.video-visual video source').getAttribute('src'), /webdorks\.webm/);
  await page.screenshot({ path: path.join(os.tmpdir(), 'manas-new-home.png') });
  await page.locator('#hash-input').fill('abc');
  await page.locator('#hash-form button').click();
  assert.match(await page.locator('#hash-result').innerText(), /ba7816bf8f01cfea414140de5dae2223/);
  await page.route('https://dns.google/resolve**', route => route.fulfill({ json: { Status: 0, Answer: [{ data: '93.184.215.14' }] } }));
  await page.locator('#dns-domain').fill('example.org');
  await page.locator('#dns-form button').click();
  assert.match(await page.locator('#dns-result').innerText(), /93\.184\.215\.14/);
  await page.route('https://ipapi.co/json/', route => route.fulfill({ json: { ip: '203.0.113.7', city: 'Test City', country_name: 'Test Country', org: 'Test Network' } }));
  await page.locator('#check-ip').click();
  assert.match(await page.locator('#ip-result').innerText(), /203\.0\.113\.7/);
  for (const slug of ['PPF-model', 'antenna-wave-propagation', 'thinking-like-infrastructure']) {
    await page.goto(`http://127.0.0.1:4177/articles/${slug}.html`);
    assert.equal(await page.locator('.article-body img').count() > 0, true, slug);
    assert.equal(await page.locator('.article-body img').first().evaluate(image => image.complete && image.naturalWidth > 0), true, `${slug} figure failed to load`);
    assert.equal(await page.locator('.simulation .sim-output').count(), 1, slug);
    assert.equal(await page.locator('link[rel=canonical]').count(), 1, slug);
  }
  await page.goto('http://127.0.0.1:4177/clix/');
  assert.match(await page.title(), /CLIx/);
  assert.equal(await page.locator('.portfolio-return').count(), 1);
  assert.equal(await page.locator('#cards .card').count() > 0, true);
  await page.screenshot({ path: path.join(os.tmpdir(), 'manas-new-clix.png') });
  await page.goto('http://127.0.0.1:4177/studio/');
  await page.locator('#post-list button').first().waitFor();
  await page.locator('#post-list button').first().click();
  await page.waitForTimeout(400);
  assert.ok((await page.locator('#editor').innerText()).length > 100, await page.locator('#message').innerText());
  await page.screenshot({ path: path.join(os.tmpdir(), 'manas-new-studio.png') });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://127.0.0.1:4177/');
  await page.waitForTimeout(500);
  const width = await page.evaluate(() => ({ content: document.documentElement.scrollWidth, viewport: window.innerWidth }));
  assert.ok(width.content <= width.viewport + 1, `Mobile overflow: ${JSON.stringify(width)}`);
  await page.screenshot({ path: path.join(os.tmpdir(), 'manas-new-mobile.png') });
  assert.deepEqual(errors, []);
  console.log('Browser check passed.');
  await browser.close();
})().catch(error => { console.error(error); process.exitCode = 1; });
