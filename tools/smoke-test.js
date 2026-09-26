const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');
const { buildIndex } = require('./build-blog');

const root = path.resolve(__dirname, '..');
const slug = 'studio-smoke-check';
const file = path.join(root, 'blog', `${slug}.md`);
const pageFile = path.join(root, 'articles', `${slug}.html`);
let uploadedFile = '';
const base = 'http://127.0.0.1:4188';
const child = spawn(process.execPath, [path.join(__dirname, 'studio-server.js')], { cwd: root, env: { ...process.env, BLOG_STUDIO_PORT: '4188', BLOG_STUDIO_NO_BROWSER: '1' }, stdio: 'ignore' });

async function waitForServer() {
  for (let tries = 0; tries < 40; tries++) {
    try { return await fetch(`${base}/studio/`); } catch { await new Promise(resolve => setTimeout(resolve, 100)); }
  }
  throw new Error('Studio server did not start.');
}

(async () => {
  try {
    const studio = await waitForServer();
    assert.equal(studio.status, 200);
    const html = await studio.text();
    const token = html.match(/window\.STUDIO_SESSION='([^']+)'/)?.[1];
    assert.ok(token && token !== '__STUDIO_SESSION__');
    for (const route of ['/', '/archive.html', '/articles/thinking-like-infrastructure.html', '/clix/', '/vendor/marked.min.js']) {
      assert.equal((await fetch(base + route)).status, 200, route);
    }
    assert.equal((await fetch(`${base}/.git/config`)).status, 404);
    const headers = { 'Content-Type': 'application/json', Origin: base, 'X-Studio-Session': token };
    const body = JSON.stringify({ title: 'Smoke check', description: 'Editor route test', slug, date: '2026-09-26', tags: ['test'], content: '<h2>Saved article</h2><p>Written in the editor.</p>' });
    const forbidden = await fetch(`${base}/api/save`, { method: 'POST', headers: { ...headers, Origin: 'https://example.com' }, body });
    assert.equal(forbidden.status, 403);
    const png = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/l3sAAAAASUVORK5CYII=';
    const upload = await fetch(`${base}/api/upload`, { method: 'POST', headers, body: JSON.stringify({ data: png, name: 'pixel.png' }) });
    const uploadBody = await upload.json();
    assert.equal(upload.status, 200, uploadBody.error);
    const uploadUrl = uploadBody.url;
    uploadedFile = path.join(root, uploadUrl.slice(1));
    assert.equal((await fetch(base + uploadUrl)).status, 200);
    const saved = await fetch(`${base}/api/save`, { method: 'POST', headers, body });
    assert.equal(saved.status, 200, await saved.text());
    const posts = await (await fetch(`${base}/api/posts`)).json();
    assert.ok(posts.some(post => post.slug === slug));
    const article = await (await fetch(`${base}/api/post/${slug}`)).json();
    assert.match(article.content, /Saved article/);
    assert.match(fs.readFileSync(pageFile, 'utf8'), /<h2 id="saved-article">Saved article<\/h2>/);
    console.log('Studio smoke test passed.');
  } finally {
    child.kill();
    if (fs.existsSync(file)) fs.unlinkSync(file);
    if (fs.existsSync(pageFile)) fs.unlinkSync(pageFile);
    if (uploadedFile && fs.existsSync(uploadedFile)) fs.unlinkSync(uploadedFile);
    buildIndex();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
