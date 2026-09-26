async function renderRecentPosts() {
  const container = document.getElementById('blog-posts');
  if (!container) return;
  try {
    const response = await fetch('blog/index.json', { cache: 'no-store' });
    if (!response.ok) throw new Error('Archive unavailable');
    const posts = await response.json();
    const count = document.getElementById('post-count');
    if (count) count.textContent = String(posts.length).padStart(2, '0');
    container.replaceChildren();
    for (const post of posts.slice(0, 3)) {
      const card = document.createElement('article');
      card.className = 'post-card';
      const link = document.createElement('a');
      link.className = 'post-card-link';
      link.href = `articles/${encodeURIComponent(post.slug)}.html`;
      const meta = document.createElement('div');
      meta.className = 'post-card-meta';
      meta.textContent = `${post.date} / ${post.readingMinutes} MIN READ`;
      const title = document.createElement('h3');
      title.textContent = post.title;
      const summary = document.createElement('p');
      summary.textContent = post.description;
      const footer = document.createElement('div');
      footer.className = 'post-card-footer';
      const tags = document.createElement('div');
      tags.className = 'tag-list';
      for (const name of post.tags || []) {
        const tag = document.createElement('span');
        tag.className = 'tag';
        tag.textContent = name;
        tags.append(tag);
      }
      const arrow = document.createElement('span');
      arrow.className = 'card-arrow';
      arrow.textContent = '↗';
      footer.append(tags, arrow);
      link.append(meta, title, summary, footer);
      card.append(link);
      container.append(card);
    }
    if (!posts.length) container.textContent = 'No field notes published yet.';
  } catch {
    container.textContent = 'Field notes could not be loaded. Visit the writing archive to try again.';
  }
}

document.addEventListener('DOMContentLoaded', renderRecentPosts);
