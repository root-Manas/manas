// Generates the public index from post frontmatter. Run with: node tools/build-blog.js
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const blogDir = path.join(root, 'blog');

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
  const date = fields.date || fields.pubDate;
  if (!fields.title || !fields.description || !date || Number.isNaN(Date.parse(date))) {
    throw new Error(`${slug}: title, description and a valid date are required`);
  }
  const tags = typeof fields.tags === 'string' ? fields.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [];
  const body = source.slice(match[0].length).trim();
  const parsed = new Date(date);
  const normalizedDate = /^\d{4}-\d{2}-\d{2}$/.test(date)
    ? date
    : `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, '0')}-${String(parsed.getDate()).padStart(2, '0')}`;
  return { slug, title: fields.title, description: fields.description, date: normalizedDate, tags, readingMinutes: Math.max(1, Math.ceil(body.split(/\s+/).filter(Boolean).length / 200)) };
}

function buildIndex() {
  const posts = fs.readdirSync(blogDir)
    .filter(name => name.endsWith('.md'))
    .map(name => parsePost(fs.readFileSync(path.join(blogDir, name), 'utf8'), name.slice(0, -3)))
    .sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));
  fs.writeFileSync(path.join(blogDir, 'index.json'), JSON.stringify(posts, null, 2) + '\n');
  return posts;
}

if (require.main === module) console.log(`Indexed ${buildIndex().length} posts.`);
module.exports = { buildIndex, parsePost };
