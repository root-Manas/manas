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
  const ticks = map.querySelector('#map-ticks');
  const barGroup = map.querySelector('#scope-bars');
  const dotGroup = map.querySelector('#scope-dots');
  const svgNS = 'http://www.w3.org/2000/svg';
  for (let i = 0; i < 144; i++) {
    const angle = i / 144 * Math.PI * 2 - Math.PI / 2;
    const major = i % 12 === 0;
    const inner = major ? 286 : 292;
    const line = document.createElementNS(svgNS, 'line');
    line.setAttribute('x1', 350 + Math.cos(angle) * inner);
    line.setAttribute('y1', 350 + Math.sin(angle) * inner);
    line.setAttribute('x2', 350 + Math.cos(angle) * 309);
    line.setAttribute('y2', 350 + Math.sin(angle) * 309);
    if (major) line.classList.add('major');
    ticks.append(line);
  }
  const bars = [];
  for (let i = 0; i < 51; i++) {
    const y = 190 + i * 6.4;
    const profile = 1 - Math.abs((i - 25) / 25);
    const width = 28 + profile * 385 + Math.sin(i * .88) * 12;
    const line = document.createElementNS(svgNS, 'line');
    line.setAttribute('x1', 350 - width / 2);
    line.setAttribute('x2', 350 + width / 2);
    line.setAttribute('y1', y);
    line.setAttribute('y2', y);
    line.style.transformOrigin = `350px ${y}px`;
    line.dataset.scale = '1';
    barGroup.append(line);
    bars.push(line);
  }
  const dots = [];
  for (let i = 0; i < 42; i++) {
    const t = i / 41;
    const x = 141 + t * 420;
    const y = 478 - t * t * 257 + Math.sin(t * 9) * 13;
    const dot = document.createElementNS(svgNS, 'circle');
    dot.setAttribute('cx', x);
    dot.setAttribute('cy', y);
    dot.setAttribute('r', 2.5 + t * 2.8);
    dot.style.transformOrigin = `${x}px ${y}px`;
    dotGroup.append(dot);
    dots.push(dot);
  }

  const select = key => {
    const item = content[key];
    if (!item) return;
    nodes.forEach(node => {
      const active = node.dataset.map === key;
      node.classList.toggle('is-active', active);
      node.setAttribute('aria-pressed', String(active));
    });
    const selectionNumber = String(Object.keys(content).indexOf(key) + 1).padStart(2, '0');
    map.querySelector('.map-status').lastChild.textContent = ` ${selectionNumber} / 04`;
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
      bars.forEach((bar, i) => {
        const previous = Number(bar.dataset.scale);
        const target = key === 'webdorks' ? 1 : key === 'clix' ? .64 + .34 * Math.abs(Math.sin(i * .32)) : key === 'writing' ? .46 + .5 * Math.abs(Math.sin(i * .14 + .8)) : .55 + .42 * Math.abs(Math.cos(i * .53));
        bar.dataset.scale = String(target);
        animate(bar, { scaleX: [previous, target], duration: 520, delay: i * 8, ease: 'out(3)' });
      });
    } else {
      bars.forEach((bar, i) => {
        const target = key === 'webdorks' ? 1 : key === 'clix' ? .64 + .34 * Math.abs(Math.sin(i * .32)) : key === 'writing' ? .46 + .5 * Math.abs(Math.sin(i * .14 + .8)) : .55 + .42 * Math.abs(Math.cos(i * .53));
        bar.style.transform = `scaleX(${target})`;
        bar.dataset.scale = String(target);
      });
    }
  };
  nodes.forEach(node => node.addEventListener('click', () => select(node.dataset.map)));
  select('webdorks');

  if (!reducedMotion && animate) {
    animate('.map-sweep', { rotate: [0, 360], duration: 7800, loop: true, ease: 'linear' });
    animate('.scope-arcs', { rotate: [0, 360], duration: 42000, loop: true, ease: 'linear' });
    animate('.map-ticks .major', { opacity: [1, .25, 1], duration: 1900, delay: stagger(80), loop: true, ease: 'inOut(2)' });
    animate(dots, { scale: [.55, 1.25, .55], opacity: [.35, 1, .35], duration: 1700, delay: stagger(45), loop: true, ease: 'inOut(2)' });
    animate(bars, { opacity: [.35, .8, .35], duration: 2100, delay: stagger(32), loop: true, ease: 'inOut(2)' });
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
