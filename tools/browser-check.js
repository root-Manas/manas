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
  assert.match(await page.locator('#hero-title').innerText(), /manas/i);
  assert.equal(await page.locator('.hero-portrait').evaluate(image => image.complete && image.naturalWidth > 0), true);
  assert.equal(await page.locator('text=CultLink').count(), 0);
  assert.equal(await page.locator('text=Finsen').count(), 0);
  assert.equal(await page.locator('text=LAB / SYSTEM MAP').count(), 0);
  assert.match(await page.locator('.video-visual video source').getAttribute('src'), /webdorks\.webm/);
  assert.equal(await page.locator('html').getAttribute('data-theme'), 'light');
  assert.equal(await page.locator('.research-map').count(), 0);
  assert.equal(await page.locator('.project-card').count(), 5);
  await page.screenshot({ path: path.join(os.tmpdir(), 'manas-light-home.png') });
  await page.locator('.theme-toggle').click();
  assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark');
  await page.waitForTimeout(350);
  await page.screenshot({ path: path.join(os.tmpdir(), 'manas-new-home.png') });
  await page.locator('.theme-toggle').click();
  assert.equal(await page.locator('html').getAttribute('data-theme'), 'light');
  await page.locator('#about').scrollIntoViewIfNeeded();
  await page.waitForTimeout(750);
  await page.locator('#about').screenshot({ path: path.join(os.tmpdir(), 'manas-about.png') });
  await page.locator('#work').scrollIntoViewIfNeeded();
  await page.waitForTimeout(750);
  await page.locator('#work').screenshot({ path: path.join(os.tmpdir(), 'manas-work.png') });
  await page.locator('#hash-input').fill('abc');
  await page.locator('#hash-form button').click();
  assert.match(await page.locator('#hash-result').innerText(), /ba7816bf8f01cfea414140de5dae2223/);
  await page.route('https://dns.google/resolve**', route => route.fulfill({ json: { Status: 0, Answer: [{ data: '93.184.215.14' }] } }));
  await page.locator('#dns-domain').fill('example.org');
  await page.locator('#dns-form button').click();
  assert.match(await page.locator('#dns-result').innerText(), /93\.184\.215\.14/);
  await page.route('https://ipapi.co/json/', route => route.fulfill({ json: { ip: '203.0.113.7', city: 'Test City', country_name: 'Test Country', org: 'Test Network' } }));
  await page.locator('#check-ip').click();
  await page.waitForFunction(() => document.querySelector('#ip-result')?.textContent?.includes('203.0.113.7'));
  assert.match(await page.locator('#ip-result').innerText(), /203\.0\.113\.7/);
  await page.goto('http://127.0.0.1:4177/archive.html');
  assert.equal(await page.locator('.archive-grid .post-card').count(), 4);
  assert.match(await page.locator('.archive-hero').innerText(), /Electronics Engineering/);
  assert.equal(await page.locator('html').getAttribute('data-theme'), 'light');
  await page.screenshot({ path: path.join(os.tmpdir(), 'manas-light-archive.png') });
  for (const slug of ['PPF-model', 'antenna-wave-propagation', 'thinking-like-infrastructure', 'cron_jobs_to_priviliage_esc']) {
    await page.goto(`http://127.0.0.1:4177/articles/${slug}.html`);
    assert.equal(await page.locator('.article-hero-media img').count(), 1, slug);
    assert.equal(await page.locator('.article-hero-media img').evaluate(image => image.complete && image.naturalWidth > 0), true, `${slug} figure failed to load`);
    assert.equal(await page.locator('.simulation .sim-output').count(), 1, slug);
    assert.match(await page.locator('.article-author').innerText(), /From Mumbai/);
    assert.equal(await page.locator('link[rel=canonical]').count(), 1, slug);
    assert.equal(await page.locator('html').getAttribute('data-theme'), 'light', `${slug} theme persistence`);
    if (slug === 'PPF-model') {
      const before = await page.locator('#ppf-design').innerText();
      await page.locator('#ppf-share').fill('80');
      assert.notEqual(await page.locator('#ppf-design').innerText(), before);
    }
    if (slug === 'antenna-wave-propagation') {
      const before = await page.locator('#rf-received').innerText();
      await page.locator('#rf-distance').fill('2');
      assert.notEqual(await page.locator('#rf-received').innerText(), before);
    }
    if (slug === 'thinking-like-infrastructure') {
      await page.locator('.sim-clues input').first().check();
      assert.match(await page.locator('#recon-score').innerText(), /15/);
    }
    if (slug === 'cron_jobs_to_priviliage_esc') {
      await page.locator('#cron-file').check();
      assert.match(await page.locator('#cron-assessment').innerText(), /Review privilege boundary/);
    }
    if (slug === 'PPF-model') {
      await page.screenshot({ path: path.join(os.tmpdir(), 'manas-light-article.png') });
      await page.locator('.article-author').screenshot({ path: path.join(os.tmpdir(), 'manas-author.png') });
    }
  }
  await page.goto('http://127.0.0.1:4177/clix');
  assert.match(await page.title(), /CLIx/);
  assert.equal(await page.locator('.portfolio-return').count(), 1);
  assert.equal(await page.locator('#cards .card').count() > 0, true);
  assert.equal(await page.locator('.card').first().evaluate(card => getComputedStyle(card).display !== 'none'), true);
  assert.equal(await page.locator('html').getAttribute('data-theme'), 'light');
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
  assert.equal(await page.locator('.hero-photo img').count(), 1);
  const width = await page.evaluate(() => ({ content: document.documentElement.scrollWidth, viewport: window.innerWidth }));
  await page.screenshot({ path: path.join(os.tmpdir(), 'manas-new-mobile.png') });
  assert.ok(width.content <= width.viewport + 1, `Mobile overflow: ${JSON.stringify(width)}`);
  await page.goto('http://127.0.0.1:4177/articles/cron_jobs_to_priviliage_esc.html');
  const articleWidth = await page.evaluate(() => ({ content: document.documentElement.scrollWidth, viewport: window.innerWidth }));
  assert.ok(articleWidth.content <= articleWidth.viewport + 1, `Mobile article overflow: ${JSON.stringify(articleWidth)}`);
  const stillPage = await browser.newPage({ reducedMotion: 'reduce' });
  await stillPage.goto('http://127.0.0.1:4177/');
  const stillBefore = await stillPage.locator('.hero-photo').evaluate(element => getComputedStyle(element).opacity);
  await stillPage.waitForTimeout(250);
  const stillAfter = await stillPage.locator('.hero-photo').evaluate(element => getComputedStyle(element).opacity);
  assert.equal(stillBefore, stillAfter, 'The portrait should stay still when reduced motion is requested');
  await stillPage.close();
  assert.deepEqual(errors, []);
  console.log('Browser check passed.');
  await browser.close();
})().catch(error => { console.error(error); process.exitCode = 1; });
