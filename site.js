const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const clock = document.getElementById('local-clock');
if (clock) {
  const updateClock = () => {
    clock.textContent = `LOCAL / ${new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date())}`;
  };
  updateClock();
  setInterval(updateClock, 30_000);
}

if (!reducedMotion && window.anime?.animate) {
  const { animate, stagger } = window.anime;
  animate('.hero-meta span', { opacity: [0, 1], translateY: [12, 0], duration: 520, delay: stagger(90), ease: 'out(3)' });
  animate('.hero-copy .eyebrow, .hero-copy h1, .hero-copy p, .hero-actions', { opacity: [0, 1], translateY: [24, 0], duration: 780, delay: stagger(105, { start: 110 }), ease: 'out(3)' });
  animate('.hero-portrait', { opacity: [0, 1], scale: [.86, 1], rotate: [-6, 0], duration: 850, delay: 120, ease: 'out(3)' });
  animate('.research-map', { opacity: [0, 1], translateX: [24, 0], duration: 850, delay: 190, ease: 'out(3)' });
  animate('.pulse-dot, .console-state i, .section-status i', { opacity: [1, .35], duration: 1300, alternate: true, loop: true, ease: 'inOut(2)' });
  const seen = new WeakSet();
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting || seen.has(entry.target)) continue;
      seen.add(entry.target);
      observer.unobserve(entry.target);
      animate(entry.target, { opacity: [0, 1], translateY: [22, 0], duration: 680, ease: 'out(3)' });
    }
  }, { threshold: .08 });
  document.querySelectorAll('.section-title-row, .tool-card, .project-card, .post-card').forEach(element => observer.observe(element));
  new MutationObserver(records => {
    for (const record of records) for (const node of record.addedNodes) {
      if (node.nodeType === 1 && node.matches?.('.post-card')) observer.observe(node);
    }
  }).observe(document.body, { childList: true, subtree: true });
}
