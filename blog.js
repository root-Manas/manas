const blogIndexUrl = 'blog/index.json';
const dateLabel = value => new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${value}T12:00:00Z`));

async function getPosts() {
  const response = await fetch(blogIndexUrl, { cache: 'no-store' });
  if (!response.ok) throw new Error('The writing archive is unavailable. Please try again shortly.');
  return response.json();
}

function postCard(post) {
  const article = document.createElement('article');
  article.className = 'post-card glass-card';
  const link = document.createElement('a');
  link.href = `post.html?slug=${encodeURIComponent(post.slug)}`;
  link.className = 'post-card-link';
  const meta = document.createElement('div');
  meta.className = 'post-card-meta mono';
  meta.textContent = `${dateLabel(post.date)}  /  ${post.readingMinutes} min read`;
  const title = document.createElement('h3');
  title.textContent = post.title;
  const description = document.createElement('p');
  description.textContent = post.description;
  const footer = document.createElement('div');
  footer.className = 'post-card-footer';
  const tags = document.createElement('div');
  tags.className = 'tag-list';
  for (const tag of post.tags || []) {
    const item = document.createElement('span');
    item.className = 'tag';
    item.textContent = tag;
    tags.append(item);
  }
  const arrow = document.createElement('span');
  arrow.className = 'card-arrow';
  arrow.textContent = '↗';
  footer.append(tags, arrow);
  link.append(meta, title, description, footer);
  article.append(link);
  return article;
}

async function renderListing() {
  const container = document.getElementById('blog-posts');
  if (!container) return;
  try {
    const posts = await getPosts();
    const archive = document.body.dataset.page === 'archive';
    const visible = archive ? posts : posts.slice(0, 3);
    container.replaceChildren(...visible.map(postCard));
    if (!visible.length) container.textContent = 'No posts published yet.';
    const count = document.getElementById('post-count');
    if (count) count.textContent = String(posts.length).padStart(2, '0');
  } catch (error) {
    container.textContent = error.message;
  }
}

function parseFrontmatter(source) {
  const match = source.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n/);
  return match ? source.slice(match[0].length) : source;
}

function setMeta(property, value) {
  let tag = document.querySelector(`meta[property="${property}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute('property', property);
    document.head.append(tag);
  }
  tag.content = value;
}

async function renderPost() {
  const container = document.getElementById('article-content');
  if (!container) return;
  const slug = new URLSearchParams(location.search).get('slug');
  if (!slug || !/^[A-Za-z0-9_-]+$/.test(slug)) {
    container.innerHTML = '<p class="post-error">Choose a post from the <a href="archive.html">writing archive</a>.</p>';
    return;
  }
  try {
    const posts = await getPosts();
    const post = posts.find(item => item.slug === slug);
    if (!post) throw new Error('This post could not be found.');
    const response = await fetch(`blog/${encodeURIComponent(slug)}.md`);
    if (!response.ok) throw new Error('This post could not be loaded.');
    if (!window.marked || !window.DOMPurify) throw new Error('The article renderer could not be loaded.');
    const markdown = parseFrontmatter(await response.text());
    const header = document.createElement('header');
    header.className = 'article-header';
    const eyebrow = document.createElement('div');
    eyebrow.className = 'eyebrow';
    eyebrow.textContent = `FIELD NOTES / ${dateLabel(post.date)} / ${post.readingMinutes} MIN READ`;
    const title = document.createElement('h1');
    title.textContent = post.title;
    const summary = document.createElement('p');
    summary.textContent = post.description;
    header.append(eyebrow, title, summary);
    const body = document.createElement('div');
    body.className = 'article-body';
    body.innerHTML = DOMPurify.sanitize(marked.parse(markdown), { USE_PROFILES: { html: true } });
    const toc = document.createElement('nav');
    toc.className = 'article-toc glass-card';
    toc.setAttribute('aria-label', 'On this page');
    const tocTitle = document.createElement('strong');
    tocTitle.textContent = 'ON THIS PAGE';
    toc.append(tocTitle);
    const ids = new Set();
    body.querySelectorAll('h2, h3').forEach((heading, index) => {
      let id = heading.textContent.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || `section-${index + 1}`;
      const base = id;
      let suffix = 2;
      while (ids.has(id)) id = `${base}-${suffix++}`;
      ids.add(id);
      heading.id = id;
      const link = document.createElement('a');
      link.href = `#${id}`;
      link.textContent = heading.textContent;
      if (heading.tagName === 'H3') link.classList.add('toc-subitem');
      toc.append(link);
    });
    container.replaceChildren(header, ...(ids.size >= 3 ? [toc] : []), body);
    document.title = `${post.title} — Manas`;
    setMeta('og:title', post.title);
    setMeta('og:description', post.description);
    setMeta('og:url', location.href);
    if (window.MathJax?.typesetPromise) MathJax.typesetPromise([body]).catch(() => {});
  } catch (error) {
    container.textContent = error.message;
    container.classList.add('post-error');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  renderListing();
  renderPost();
});
