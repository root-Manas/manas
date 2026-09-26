const assert = require('node:assert/strict');

const base = 'https://manasraj.vercel.app';
const routes = [
  ['/', 'PERSONAL HOMELAB'],
  ['/clix/', 'portfolio-theme.css'],
  ['/clix/style.css', '--'],
  ['/clix/portfolio-theme.css', '--'],
  ['/clix/app.js', 'function'],
  ['/articles/PPF-model.html', 'Explore the frontier'],
  ['/articles/antenna-wave-propagation.html', 'Radio link budget'],
  ['/articles/thinking-like-infrastructure.html', 'Evidence-weighting exercise'],
  ['/articles/cron_jobs_to_priviliage_esc.html', 'Trace the boundary'],
  ['/archive.html', 'FIELD NOTES'],
  ['/sitemap.xml', '/articles/PPF-model.html'],
  ['/feed.xml', 'rss version'],
  ['/public/figures/ppf-system.svg', '<svg'],
  ['/public/assets/webdorks.webm', ''],
];

(async () => {
  for (const [route, marker] of routes) {
    const response = await fetch(base + route, { redirect: 'follow' });
    assert.equal(response.status, 200, `${route}: ${response.status}`);
    if (marker) assert.match(await response.text(), new RegExp(marker, 'i'), route);
    console.log(`${route} ${response.status}`);
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
