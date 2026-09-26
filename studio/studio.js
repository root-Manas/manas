const $ = id => document.getElementById(id);
const editor = $('editor');
const form = $('post-form');
let originalSlug = '';
let changed = false;

function message(text, error = false) {
  $('message').textContent = text;
  $('message').classList.toggle('error', error);
}
function setBusy(busy) {
  for (const id of ['save-button', 'publish-button', 'preview-button']) $(id).disabled = busy;
}
function countWords() {
  $('word-count').textContent = `${(editor.textContent.trim().match(/\S+/g) || []).length} WORDS`;
}
function slugify(text) {
  return text.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80);
}
async function api(url, options = {}) {
  const response = await fetch(url, { ...options, headers: { 'Content-Type': 'application/json', 'X-Studio-Session': window.STUDIO_SESSION, ...options.headers } });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Request failed.');
  return data;
}
function today() { return new Date().toLocaleDateString('en-CA'); }
function newPost() {
  form.reset();
  $('date').value = today();
  $('slug').readOnly = false;
  editor.replaceChildren();
  originalSlug = '';
  changed = false;
  countWords();
  document.querySelectorAll('.post-list button').forEach(button => button.classList.remove('active'));
  message('New article. Start with a title and write below.');
  $('title').focus();
}
async function refreshList() {
  const posts = await api('/api/posts');
  const list = $('post-list');
  list.replaceChildren();
  for (const post of posts) {
    const button = document.createElement('button');
    button.type = 'button';
    button.classList.toggle('active', post.slug === originalSlug);
    const title = document.createElement('strong');
    title.textContent = post.title;
    const detail = document.createElement('small');
    detail.textContent = post.date;
    button.append(title, detail);
    button.addEventListener('click', () => openPost(post.slug));
    list.append(button);
  }
  if (!posts.length) list.textContent = 'Your posts will appear here.';
}
async function openPost(slug) {
  if (changed && !confirm('Discard your unsaved changes?')) return;
  try {
    message('Opening article…');
    const post = await api(`/api/post/${encodeURIComponent(slug)}`);
    if (!window.marked || !window.DOMPurify) throw new Error('The editor renderer could not be loaded. Check your internet connection.');
    $('title').value = post.title;
    $('slug').value = post.slug;
    $('slug').readOnly = true;
    $('date').value = post.date;
    $('tags').value = (post.tags || []).join(', ');
    $('description').value = post.description;
    editor.innerHTML = DOMPurify.sanitize(marked.parse(post.content), { USE_PROFILES: { html: true } });
    originalSlug = slug;
    changed = false;
    countWords();
    refreshList();
    message('Article loaded. You can edit and publish it here.');
  } catch (error) { message(error.message, true); }
}
function collect() {
  if (!form.reportValidity()) throw new Error('Please complete the article details.');
  if (!editor.textContent.trim()) throw new Error('Write something in the story before saving.');
  if (!window.DOMPurify) throw new Error('The editor sanitizer could not be loaded.');
  return { originalSlug, title: $('title').value.trim(), slug: $('slug').value.trim(), date: $('date').value, description: $('description').value.trim(), tags: $('tags').value.split(',').map(tag => tag.trim()).filter(Boolean), content: DOMPurify.sanitize(editor.innerHTML, { USE_PROFILES: { html: true } }) };
}
async function save() {
  const post = collect();
  const result = await api('/api/save', { method: 'POST', body: JSON.stringify(post) });
  originalSlug = result.slug;
  $('slug').readOnly = true;
  changed = false;
  await refreshList();
  message('Saved on this computer. Preview or publish when ready.');
  return result;
}

form.addEventListener('submit', async event => {
  event.preventDefault();
  setBusy(true);
  try { await save(); } catch (error) { message(error.message, true); } finally { setBusy(false); }
});
$('preview-button').addEventListener('click', async () => {
  setBusy(true);
  try {
    const post = await save();
    window.open(post.url, '_blank', 'noopener');
  } catch (error) { message(error.message, true); } finally { setBusy(false); }
});
$('publish-button').addEventListener('click', async () => {
  setBusy(true);
  try {
    const post = await save();
    message('Publishing to main…');
    const result = await api('/api/publish', { method: 'POST', body: JSON.stringify({ slug: post.slug }) });
    message(result.message);
  } catch (error) { message(error.message, true); } finally { setBusy(false); }
});
$('new-post').addEventListener('click', () => { if (!changed || confirm('Discard your unsaved changes?')) newPost(); });
$('title').addEventListener('input', () => { if (!originalSlug && (!$('slug').value || $('slug').dataset.auto === 'true')) { $('slug').value = slugify($('title').value); $('slug').dataset.auto = 'true'; } });
$('slug').addEventListener('input', () => { $('slug').dataset.auto = 'false'; });
form.addEventListener('input', () => { changed = true; });
editor.addEventListener('input', () => { changed = true; countWords(); });
editor.addEventListener('paste', event => {
  event.preventDefault();
  document.execCommand('insertText', false, event.clipboardData.getData('text/plain'));
});
document.querySelectorAll('[data-command]').forEach(button => button.addEventListener('click', () => {
  editor.focus();
  document.execCommand(button.dataset.command, false, button.dataset.value || null);
  changed = true;
}));
$('insert-link').addEventListener('click', () => {
  const url = prompt('Link URL (https://…)');
  if (!url) return;
  try {
    const parsed = new URL(url);
    if (!['https:', 'http:', 'mailto:'].includes(parsed.protocol)) throw new Error();
    editor.focus();
    document.execCommand('createLink', false, parsed.href);
    changed = true;
  } catch { message('Enter a valid https, http or mailto link.', true); }
});
let imageRange = null;
$('insert-image').addEventListener('click', () => {
  const selection = window.getSelection();
  imageRange = selection.rangeCount && editor.contains(selection.anchorNode) ? selection.getRangeAt(0).cloneRange() : null;
  $('image-file').click();
});
$('image-file').addEventListener('change', async event => {
  const file = event.target.files[0];
  event.target.value = '';
  if (!file) return;
  if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > 4_000_000) {
    message('Choose a PNG, JPEG or WebP image under 4 MB.', true);
    return;
  }
  try {
    message('Uploading image to this computer…');
    const dataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    const uploaded = await api('/api/upload', { method: 'POST', body: JSON.stringify({ name: file.name, data: dataUrl }) });
    const image = document.createElement('img');
    image.src = uploaded.url;
    image.alt = prompt('Describe this image for readers using screen readers:', file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ')) || file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ');
    if (imageRange && editor.contains(imageRange.commonAncestorContainer)) {
      imageRange.deleteContents();
      imageRange.insertNode(image);
    } else editor.append(image);
    imageRange = null;
    changed = true;
    message('Image added to this article.');
  } catch (error) { message(error.message, true); }
});
$('insert-code').addEventListener('click', () => {
  const code = prompt('Paste your code snippet');
  if (code === null) return;
  const pre = document.createElement('pre');
  const element = document.createElement('code');
  element.textContent = code;
  pre.append(element);
  editor.append(pre);
  changed = true;
  countWords();
});
window.addEventListener('beforeunload', event => { if (changed) { event.preventDefault(); event.returnValue = ''; } });
newPost();
refreshList().catch(error => message(error.message, true));
