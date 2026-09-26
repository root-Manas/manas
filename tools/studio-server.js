const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { spawn, execFile } = require('node:child_process');
const { promisify } = require('node:util');
const { buildIndex, parsePost } = require('./build-blog');

const exec = promisify(execFile);
const root = path.resolve(__dirname, '..');
const blogDir = path.join(root, 'blog');
const uploadDir = path.join(root, 'public', 'uploads');
const host = '127.0.0.1';
const port = Number(process.env.BLOG_STUDIO_PORT || 4177);
const session = crypto.randomBytes(24).toString('hex');
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.md': 'text/plain; charset=utf-8', '.png': 'image/png', '.svg': 'image/svg+xml', '.xml': 'application/xml; charset=utf-8', '.webm': 'video/webm', '.woff2': 'font/woff2' };

function reply(res, status, body, type = 'application/json; charset=utf-8') {
  res.writeHead(status, { 'Content-Type': type, 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
  res.end(type.startsWith('application/json') ? JSON.stringify(body) : body);
}

function safeSlug(slug) { return typeof slug === 'string' && /^[A-Za-z0-9_-]+$/.test(slug); }
function frontmatter(post) {
  return `---\ntitle: ${JSON.stringify(post.title)}\ndescription: ${JSON.stringify(post.description)}\ndate: ${JSON.stringify(post.date)}\nupdated: ${JSON.stringify(new Date().toISOString().slice(0, 10))}\nimage: ${JSON.stringify(post.image || '/public/og-card.png')}\ntags: ${JSON.stringify(post.tags.join(', '))}\n---\n\n${post.content.trim()}\n`;
}
function withinRoot(file) { return file === root || file.startsWith(root + path.sep); }
function rejectIfForeign(req) {
  const origin = req.headers.origin;
  return origin !== `http://${host}:${port}` || req.headers['x-studio-session'] !== session;
}
async function readJson(req) {
  let text = '';
  for await (const chunk of req) {
    text += chunk;
    if (text.length > 6_000_000) throw new Error('Request is too large.');
  }
  return JSON.parse(text);
}
async function git(...args) {
  try { return (await exec('git', args, { cwd: root, windowsHide: true, maxBuffer: 1024 * 1024 })).stdout.trim(); }
  catch (error) { throw new Error((error.stderr || error.message).trim()); }
}

async function publish(slug) {
  if (!safeSlug(slug)) throw new Error('Invalid post slug.');
  if (!fs.existsSync(path.join(blogDir, `${slug}.md`))) throw new Error('Save the post before publishing.');
  const branch = await git('branch', '--show-current');
  if (branch !== 'main') throw new Error(`Checkout main before publishing (currently ${branch || 'detached'}).`);
  await git('fetch', 'origin', 'main');
  const remote = await git('rev-parse', 'origin/main');
  const ancestor = await git('merge-base', 'HEAD', 'origin/main');
  if (ancestor !== remote) throw new Error('Remote main has new commits. Sync your local checkout before publishing.');
  const source = fs.readFileSync(path.join(blogDir, `${slug}.md`), 'utf8');
  const uploads = [...new Set(source.match(/\/public\/uploads\/[a-f0-9-]+\.(?:png|jpg|webp)/g) || [])]
    .map(url => url.slice(1)).filter(file => fs.existsSync(path.join(root, file)));
  const files = [`blog/${slug}.md`, 'blog/index.json', `articles/${slug}.html`, 'archive.html', 'sitemap.xml', 'feed.xml', ...uploads];
  await git('add', '--', ...files);
  const staged = await git('diff', '--cached', '--name-only', '--', ...files);
  if (staged) await git('commit', '-m', `Publish blog post: ${slug}`, '--', ...files);
  const ahead = await git('rev-list', '--count', 'origin/main..HEAD');
  if (Number(ahead) > 0) await git('push', 'origin', 'HEAD:main');
  return { message: Number(ahead) > 0 ? 'Published to main. Your deployment should update shortly.' : 'This post is already published.', url: `/articles/${encodeURIComponent(slug)}.html` };
}

const server = http.createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, `http://${host}:${port}`).pathname);
    if (pathname.startsWith('/api/')) {
      if (req.method === 'GET' && pathname === '/api/posts') return reply(res, 200, buildIndex());
      if (req.method === 'GET' && pathname.startsWith('/api/post/')) {
        const slug = pathname.slice('/api/post/'.length);
        if (!/^[A-Za-z0-9_-]+$/.test(slug)) return reply(res, 400, { error: 'Invalid slug.' });
        const file = path.join(blogDir, `${slug}.md`);
        if (!fs.existsSync(file)) return reply(res, 404, { error: 'Post not found.' });
        const source = fs.readFileSync(file, 'utf8');
        return reply(res, 200, { ...parsePost(source, slug), content: source.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '') });
      }
      if (req.method !== 'POST' || rejectIfForeign(req)) return reply(res, 403, { error: 'Request refused.' });
      const data = await readJson(req);
      if (pathname === '/api/upload') {
        const input = typeof data.data === 'string' ? data.data : '';
        const match = input.match(/^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/=]+)$/);
        if (!match) return reply(res, 400, { error: 'Choose a PNG, JPEG or WebP image.' });
        const buffer = Buffer.from(match[2], 'base64');
        const mime = match[1];
        const valid = mime === 'png' ? buffer.subarray(0, 8).equals(Buffer.from('89504e470d0a1a0a', 'hex'))
          : mime === 'jpeg' ? buffer.subarray(0, 3).equals(Buffer.from('ffd8ff', 'hex'))
          : buffer.subarray(0, 4).toString() === 'RIFF' && buffer.subarray(8, 12).toString() === 'WEBP';
        if (!valid || !buffer.length || buffer.length > 4_000_000) return reply(res, 400, { error: 'Image format is invalid or exceeds 4 MB.' });
        fs.mkdirSync(uploadDir, { recursive: true });
        const filename = `${crypto.randomUUID()}.${mime === 'jpeg' ? 'jpg' : mime}`;
        fs.writeFileSync(path.join(uploadDir, filename), buffer, { flag: 'wx' });
        return reply(res, 200, { url: `/public/uploads/${filename}` });
      }
      if (pathname === '/api/save') {
        const title = String(data.title || '').trim();
        const description = String(data.description || '').trim();
        const date = String(data.date || '').trim();
        const slug = String(data.slug || '').trim();
        const tags = Array.isArray(data.tags) ? data.tags.map(tag => String(tag).trim()).filter(Boolean).slice(0, 8) : [];
        const content = String(data.content || '').trim();
        if (!safeSlug(slug) || !title || !description || !/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date)) || !content) return reply(res, 400, { error: 'Complete the title, slug, date, summary and article.' });
        if (title.length > 180 || description.length > 400 || content.length > 1_000_000) return reply(res, 400, { error: 'A field exceeds the allowed length.' });
        const file = path.join(blogDir, `${slug}.md`);
        if (data.originalSlug && data.originalSlug !== slug) return reply(res, 400, { error: 'The slug of an existing post cannot be changed.' });
        if (!data.originalSlug && fs.existsSync(file)) return reply(res, 409, { error: 'That slug already belongs to a post.' });
        const previous = data.originalSlug && fs.existsSync(file) ? parsePost(fs.readFileSync(file, 'utf8'), slug) : null;
        fs.writeFileSync(file, frontmatter({ title, description, date, tags, content, image: previous?.image }));
        buildIndex();
        return reply(res, 200, { message: 'Saved locally.', slug, url: `/articles/${encodeURIComponent(slug)}.html` });
      }
      if (pathname === '/api/publish') return reply(res, 200, await publish(data.slug));
      return reply(res, 404, { error: 'Not found.' });
    }
    if (req.method !== 'GET' && req.method !== 'HEAD') return reply(res, 405, { error: 'Method not allowed.' });
    let file = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
    if (!withinRoot(file) || file.includes(`${path.sep}.git${path.sep}`) || file.includes(`${path.sep}tools${path.sep}`) || file.includes(`${path.sep}node_modules${path.sep}`)) return reply(res, 404, { error: 'Not found.' });
    if (pathname === '/studio/' || pathname === '/studio/index.html') file = path.join(root, 'studio', 'index.html');
    if (pathname === '/clix' || pathname === '/clix/' || pathname === '/clix/index.html') file = path.join(root, 'clix', 'index.html');
    if (!fs.existsSync(file) || !fs.statSync(file).isFile()) return reply(res, 404, { error: 'Not found.' });
    const type = types[path.extname(file)] || 'application/octet-stream';
    let body = fs.readFileSync(file);
    if (file.endsWith(path.join('studio', 'index.html'))) body = Buffer.from(body.toString().replace('__STUDIO_SESSION__', session));
    res.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
    res.end(req.method === 'HEAD' ? undefined : body);
  } catch (error) {
    reply(res, 500, { error: error.message || 'Unexpected error.' });
  }
});

server.listen(port, host, () => {
  const url = `http://${host}:${port}/studio/`;
  console.log(`Blog Studio is ready at ${url}`);
  if (process.platform === 'win32' && process.env.BLOG_STUDIO_NO_BROWSER !== '1') spawn('cmd.exe', ['/c', 'start', '', url], { detached: true, stdio: 'ignore', windowsHide: true }).unref();
});
