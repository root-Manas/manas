// Generate the public index, article pages, archive, sitemap and feed from blog/*.md.
const fs = require('node:fs');
const path = require('node:path');
const { marked } = require('../vendor/marked.min.js');

const root = path.resolve(__dirname, '..');
const blogDir = path.join(root, 'blog');
const articleDir = path.join(root, 'articles');
const origin = 'https://manasraj.vercel.app';
const escapeHtml = text => String(text).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const escapeXml = escapeHtml;

function parsePost(source, slug) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (!match) throw new Error(`${slug}: missing frontmatter`);
  const fields = {};
  for (const line of match[1].split(/\r?\n/)) {
    const field = line.match(/^([A-Za-z][A-Za-z0-9]*):\s*(.*)$/);
    if (!field) continue;
    let value = field[2].trim();
    if (value.startsWith('"') && value.endsWith('"')) {
      try { value = JSON.parse(value); } catch { value = value.slice(1, -1); }
    }
    fields[field[1]] = value;
  }
  const rawDate = fields.date || fields.pubDate;
  if (!fields.title || !fields.description || !rawDate || Number.isNaN(Date.parse(rawDate))) throw new Error(`${slug}: title, description and a valid date are required`);
  const parsed = new Date(rawDate);
  const date = /^\d{4}-\d{2}-\d{2}$/.test(rawDate) ? rawDate : `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, '0')}-${String(parsed.getDate()).padStart(2, '0')}`;
  const updated = fields.updated && /^\d{4}-\d{2}-\d{2}$/.test(fields.updated) ? fields.updated : date;
  const tags = typeof fields.tags === 'string' ? fields.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [];
  const content = source.slice(match[0].length).trim();
  return { slug, title: fields.title, description: fields.description, date, updated, tags, image: fields.image || '/public/og-card.png', readingMinutes: Math.max(1, Math.ceil(content.split(/\s+/).filter(Boolean).length / 200)), content };
}

function articleHtml(post, template) {
  const headings = [];
  const usedIds = new Set();
  const leadImage = post.content.match(/^!\[([^\]]*)\]\(([^)]+)\)\s*$/m);
  const heroFigure = leadImage ? `<figure class="article-hero-media"><img src="${escapeHtml(leadImage[2])}" alt="${escapeHtml(leadImage[1])}" loading="eager"></figure>` : '';
  let body = marked.parse(leadImage ? post.content.replace(leadImage[0], '') : post.content);
  body = body.replace(/<h([23])>([\s\S]*?)<\/h\1>/g, (_, level, inner) => {
    const title = inner.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
    const base = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'section';
    let id = base;
    let suffix = 2;
    while (usedIds.has(id)) id = `${base}-${suffix++}`;
    usedIds.add(id);
    headings.push({ title, id, level });
    return `<h${level} id="${id}">${inner}</h${level}>`;
  });
  const toc = headings.length < 3 ? '' : `<nav class="article-toc" aria-label="On this page"><strong>ON THIS PAGE</strong>${headings.map(item => `<a class="${item.level === '3' ? 'toc-subitem' : ''}" href="#${item.id}">${escapeHtml(item.title)}</a>`).join('')}</nav>`;
  const canonical = `${origin}/articles/${encodeURIComponent(post.slug)}.html`;
  const image = new URL(post.image, origin).href;
  const structuredData = JSON.stringify({ '@context': 'https://schema.org', '@type': 'BlogPosting', headline: post.title, description: post.description, datePublished: post.date, dateModified: post.updated, image, mainEntityOfPage: canonical, author: { '@type': 'Person', name: 'Manas', url: origin }, publisher: { '@type': 'Person', name: 'Manas' } }).replace(/</g, '\\u003c');
  const dateLabel = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' }).format(new Date(`${post.date}T12:00:00Z`));
  const values = { TITLE: escapeHtml(post.title), DESCRIPTION: escapeHtml(post.description), CANONICAL: canonical, IMAGE: image, DATE: post.date, UPDATED: post.updated, STRUCTURED_DATA: structuredData, DATE_LABEL: dateLabel, READING_MINUTES: post.readingMinutes, HERO_FIGURE: heroFigure, TOC: toc, BODY: body };
  return template.replace(/%%([A-Z_]+)%%/g, (_, key) => String(values[key] ?? ''));
}

function archiveCard(post) {
  const tags = post.tags.map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('');
  return `<article class="post-card"><a class="post-card-link" href="articles/${encodeURIComponent(post.slug)}.html"><div class="post-card-meta">${escapeHtml(post.date)} / ${post.readingMinutes} MIN READ</div><h3>${escapeHtml(post.title)}</h3><p>${escapeHtml(post.description)}</p><div class="post-card-footer"><div class="tag-list">${tags}</div><span class="card-arrow" aria-hidden="true">↗</span></div></a></article>`;
}

function buildIndex() {
  const posts = fs.readdirSync(blogDir).filter(name => name.endsWith('.md'))
    .map(name => parsePost(fs.readFileSync(path.join(blogDir, name), 'utf8'), name.slice(0, -3)))
    .sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));
  const publicPosts = posts.map(({ content, ...post }) => post);
  fs.writeFileSync(path.join(blogDir, 'index.json'), JSON.stringify(publicPosts, null, 2) + '\n');
  fs.mkdirSync(articleDir, { recursive: true });
  const articleTemplate = fs.readFileSync(path.join(__dirname, 'article-template.html'), 'utf8');
  for (const post of posts) fs.writeFileSync(path.join(articleDir, `${post.slug}.html`), articleHtml(post, articleTemplate));
  const archiveTemplate = fs.readFileSync(path.join(__dirname, 'archive-template.html'), 'utf8');
  fs.writeFileSync(path.join(root, 'archive.html'), archiveTemplate.replace('%%POST_COUNT%%', String(posts.length).padStart(2, '0')).replace('%%POST_LIST%%', posts.map(archiveCard).join('\n')));
  const urls = [ ['/', new Date().toISOString().slice(0, 10)], ['/archive.html', new Date().toISOString().slice(0, 10)], ['/clix/', new Date().toISOString().slice(0, 10)], ...posts.map(post => [`/articles/${encodeURIComponent(post.slug)}.html`, post.updated]) ];
  fs.writeFileSync(path.join(root, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(([route, date]) => `  <url><loc>${escapeXml(origin + route)}</loc><lastmod>${date}</lastmod></url>`).join('\n')}\n</urlset>\n`);
  fs.writeFileSync(path.join(root, 'feed.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0"><channel><title>Manas — Field Notes</title><link>${origin}/archive.html</link><description>Security research, engineering and systems notes by Manas.</description><language>en</language>${posts.map(post => `<item><title>${escapeXml(post.title)}</title><link>${origin}/articles/${encodeURIComponent(post.slug)}.html</link><guid>${origin}/articles/${encodeURIComponent(post.slug)}.html</guid><description>${escapeXml(post.description)}</description><pubDate>${new Date(`${post.date}T12:00:00Z`).toUTCString()}</pubDate></item>`).join('')}</channel></rss>\n`);
  return publicPosts;
}

if (require.main === module) console.log(`Built ${buildIndex().length} articles.`);
module.exports = { buildIndex, parsePost };
