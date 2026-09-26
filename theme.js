(() => {
  const key = 'manas-theme';
  const root = document.documentElement;
  const current = () => root.dataset.theme === 'light' ? 'light' : 'dark';
  const apply = theme => {
    root.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'light' ? '#f7f5f0' : '#171715');
    try { localStorage.setItem(key, theme); } catch {}
    document.querySelectorAll('.theme-toggle').forEach(button => {
      button.textContent = theme === 'light' ? '☾ DARK' : '☼ LIGHT';
      button.setAttribute('aria-label', `Switch to ${theme === 'light' ? 'dark' : 'light'} mode`);
      button.setAttribute('aria-pressed', String(theme === 'light'));
    });
  };
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'theme-toggle mono';
  button.addEventListener('click', () => apply(current() === 'light' ? 'dark' : 'light'));
  const target = document.querySelector('.site-header .header-contact, .studio-top>.button, header .online');
  if (target) target.before(button);
  apply(current());
})();
