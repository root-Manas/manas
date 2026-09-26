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
  animate('.hero-copy .eyebrow, .hero-copy h1, .hero-copy p, .hero-actions, .hero-quick', { opacity: [0, 1], translateY: [9, 0], duration: 620, delay: stagger(130, { start: 80 }), ease: 'out(3)' });
  animate('.hero-photo', { opacity: [0, 1], translateY: [12, 0], duration: 750, delay: 240, ease: 'out(3)' });
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
  document.querySelectorAll('.section-title-row').forEach(element => observer.observe(element));
}
