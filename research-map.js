(() => {
  const map = document.querySelector('.research-map');
  if (!map) return;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const { animate, stagger } = window.anime || {};
  const content = {
    webdorks: { index: '01 / WEB SEARCH', name: 'WebDorks', copy: 'Search queries grouped by task and engine.', href: 'https://webdorks.vercel.app/', cta: 'OPEN PROJECT ↗', external: true },
    clix: { index: '02 / COMMANDS', name: 'CLIx', copy: 'Commands and examples in one place.', href: 'clix/', cta: 'OPEN CLIx ↗' },
    writing: { index: '03 / WRITING', name: 'Writing', copy: 'Longer notes on security and systems.', href: 'archive.html', cta: 'READ POSTS ↗' },
    ip: { index: '04 / SMALL TOOL', name: 'IP check', copy: 'See the address your connection exposes.', href: '#lab', cta: 'TRY IT ↗' }
  };
  const nodes = [...map.querySelectorAll('.map-node')];
  const focus = map.querySelector('.map-focus');
  const link = focus.querySelector('a');
  const paths = [...map.querySelectorAll('.map-links path')];
  const ticks = map.querySelector('#map-ticks');
  const svgNS = 'http://www.w3.org/2000/svg';
  for (let i = 0; i < 96; i++) {
    const angle = i / 96 * Math.PI * 2 - Math.PI / 2;
    const major = i % 8 === 0;
    const inner = major ? 188 : 192;
    const line = document.createElementNS(svgNS, 'line');
    line.setAttribute('x1', 300 + Math.cos(angle) * inner);
    line.setAttribute('y1', 225 + Math.sin(angle) * inner);
    line.setAttribute('x2', 300 + Math.cos(angle) * 204);
    line.setAttribute('y2', 225 + Math.sin(angle) * 204);
    if (major) line.classList.add('major');
    ticks.append(line);
  }

  const select = key => {
    const item = content[key];
    if (!item) return;
    nodes.forEach(node => {
      const active = node.dataset.map === key;
      node.classList.toggle('is-active', active);
      node.setAttribute('aria-pressed', String(active));
    });
    paths.forEach(path => {
      path.classList.toggle('is-active', path.dataset.link === key);
      path.style.removeProperty('stroke-dasharray');
      path.style.removeProperty('stroke-dashoffset');
    });
    focus.querySelector('.map-focus-index').textContent = item.index;
    focus.querySelector('.map-focus-name').textContent = item.name;
    focus.querySelector('.map-focus-copy').textContent = item.copy;
    link.textContent = item.cta;
    link.href = item.href;
    if (item.external) {
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
    } else {
      link.removeAttribute('target');
      link.removeAttribute('rel');
    }
    if (!reducedMotion && animate) {
      animate(focus.children, { opacity: [.45, 1], translateY: [8, 0], duration: 380, delay: stagger(45), ease: 'out(3)' });
      const activePath = paths.find(path => path.dataset.link === key);
      const length = activePath.getTotalLength();
      activePath.style.strokeDasharray = String(length);
      animate(activePath, { strokeDashoffset: [length, 0], duration: 650, ease: 'out(3)' });
    }
  };
  nodes.forEach(node => node.addEventListener('click', () => select(node.dataset.map)));
  select('webdorks');

  if (!reducedMotion && animate) {
    animate('.map-sweep', { rotate: [0, 360], duration: 8400, loop: true, ease: 'linear' });
    animate('.map-ticks .major', { opacity: [1, .25, 1], duration: 1900, delay: stagger(80), loop: true, ease: 'inOut(2)' });
    animate(nodes, { opacity: [0, 1], scale: [.88, 1], duration: 520, delay: stagger(85, { start: 250 }), ease: 'out(3)' });
    const stage = map.querySelector('.research-map-stage');
    if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
      stage.addEventListener('pointermove', event => {
        const rect = stage.getBoundingClientRect();
        stage.style.setProperty('--map-rx', `${5 - ((event.clientY - rect.top) / rect.height - .5) * 10}deg`);
        stage.style.setProperty('--map-ry', `${-5 + ((event.clientX - rect.left) / rect.width - .5) * 10}deg`);
      });
      stage.addEventListener('pointerleave', () => {
        stage.style.setProperty('--map-rx', '5deg');
        stage.style.setProperty('--map-ry', '-5deg');
      });
    }
  }

  if (!reducedMotion && matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.querySelectorAll('.project-card').forEach(card => {
      card.addEventListener('pointermove', event => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--tilt-x', `${((event.clientY - rect.top) / rect.height - .5) * -7}deg`);
        card.style.setProperty('--tilt-y', `${((event.clientX - rect.left) / rect.width - .5) * 7}deg`);
      });
      card.addEventListener('pointerleave', () => {
        card.style.setProperty('--tilt-x', '0deg');
        card.style.setProperty('--tilt-y', '0deg');
      });
    });
  }
})();
