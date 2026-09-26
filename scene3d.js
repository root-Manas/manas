(() => {
  const canvas = document.getElementById('identity-canvas');
  if (!canvas) return;
  const frame = canvas.parentElement;
  const context = canvas.getContext('2d', { alpha: true });
  if (!context) return;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const state = { width: 0, height: 0, yaw: -.24, pitch: -.12, targetYaw: -.24, targetPitch: -.12, dragging: false, visible: true, lastX: 0, lastY: 0, raf: 0, time: 0 };
  const faces = [];

  // Four extruded bars make the M. Every face is projected and depth sorted.
  const bar = (a, b, width, depth, accent = false) => {
    const dx = b[0] - a[0], dy = b[1] - a[1];
    const length = Math.hypot(dx, dy), nx = -dy / length * width / 2, ny = dx / length * width / 2;
    const outline = [[a[0] + nx, a[1] + ny], [b[0] + nx, b[1] + ny], [b[0] - nx, b[1] - ny], [a[0] - nx, a[1] - ny]];
    const front = outline.map(([x, y]) => [x, y, depth / 2]);
    const back = outline.map(([x, y]) => [x, y, -depth / 2]);
    faces.push({ points: back.slice().reverse(), shade: .28, accent });
    for (let i = 0; i < 4; i++) faces.push({ points: [front[i], front[(i + 1) % 4], back[(i + 1) % 4], back[i]], shade: [.58, .38, .52, .68][i], accent });
    faces.push({ points: front, shade: 1, accent });
  };
  bar([-1.12, -.92], [-1.12, .94], .3, .42);
  bar([1.12, -.92], [1.12, .94], .3, .42);
  bar([-1.05, .9], [0, -.15], .29, .42, true);
  bar([0, -.15], [1.05, .9], .29, .42, true);

  const resize = () => {
    const rect = frame.getBoundingClientRect();
    const dpr = Math.min(devicePixelRatio || 1, 2);
    state.width = rect.width;
    state.height = rect.height;
    canvas.width = Math.max(1, Math.round(rect.width * dpr));
    canvas.height = Math.max(1, Math.round(rect.height * dpr));
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw();
  };
  const rotate = ([x, y, z], yaw, pitch) => {
    const cy = Math.cos(yaw), sy = Math.sin(yaw), cx = Math.cos(pitch), sx = Math.sin(pitch);
    const xx = x * cy + z * sy, zz = z * cy - x * sy;
    return [xx, y * cx - zz * sx, y * sx + zz * cx];
  };
  const project = point => {
    const [x, y, z] = rotate(point, state.yaw, state.pitch);
    const scale = Math.min(state.width / 4.4, state.height / 3.25) * 4.6 / (4.6 - z);
    return { x: state.width / 2 + x * scale, y: state.height / 2 - y * scale, z };
  };
  const line = (points, color, width = 1) => {
    context.beginPath();
    points.forEach((point, i) => i ? context.lineTo(point.x, point.y) : context.moveTo(point.x, point.y));
    context.strokeStyle = color;
    context.lineWidth = width;
    context.stroke();
  };
  const draw = () => {
    const { width, height } = state;
    if (!width || !height) return;
    const light = document.documentElement.dataset.theme === 'light';
    const ink = light ? '#191919' : '#f4f1ed';
    const red = '#ef3434';
    context.clearRect(0, 0, width, height);

    // Quiet depth cues: perspective floor, orbit, and a shadow under the mark.
    context.save();
    context.translate(width / 2, height * .82);
    context.scale(1, .17);
    const shadow = context.createRadialGradient(0, 0, 8, 0, 0, Math.min(width * .3, 190));
    shadow.addColorStop(0, light ? '#1b1b1b29' : '#0009');
    shadow.addColorStop(1, '#0000');
    context.fillStyle = shadow;
    context.beginPath();
    context.arc(0, 0, Math.min(width * .3, 190), 0, Math.PI * 2);
    context.fill();
    context.restore();
    for (let i = -4; i <= 4; i++) {
      const a = project([i * .56, -1.27, -2.5]);
      const b = project([i * .56, -1.27, 2.5]);
      line([a, b], light ? '#2222' : '#fff2');
    }
    for (let i = -4; i <= 4; i++) {
      const a = project([-2.5, -1.27, i * .56]);
      const b = project([2.5, -1.27, i * .56]);
      line([a, b], light ? '#2222' : '#fff2');
    }
    for (let ring = 0; ring < 2; ring++) {
      const points = [];
      for (let i = 0; i <= 120; i++) {
        const angle = i / 120 * Math.PI * 2;
        points.push(project([Math.cos(angle) * (1.75 + ring * .32), Math.sin(angle) * (1.17 + ring * .22), Math.sin(angle * 2 + ring) * .28]));
      }
      line(points, ring ? (light ? '#2a2a2a3d' : '#ffffff50') : (light ? '#ef343477' : '#ef343499'), ring ? 1 : 1.6);
    }

    const sorted = faces.map(face => ({ ...face, projected: face.points.map(project) }));
    sorted.sort((a, b) => a.projected.reduce((sum, p) => sum + p.z, 0) / a.projected.length - b.projected.reduce((sum, p) => sum + p.z, 0) / b.projected.length);
    for (const face of sorted) {
      context.beginPath();
      face.projected.forEach((p, i) => i ? context.lineTo(p.x, p.y) : context.moveTo(p.x, p.y));
      context.closePath();
      if (face.accent) {
        context.fillStyle = `rgba(239,52,52,${.36 + face.shade * .62})`;
      } else if (light) {
        const v = Math.round(24 + face.shade * 116);
        context.fillStyle = `rgb(${v},${v},${v})`;
      } else {
        const v = Math.round(58 + face.shade * 190);
        context.fillStyle = `rgb(${v},${v},${v})`;
      }
      context.fill();
      context.strokeStyle = light ? '#ffffff67' : '#ffffff50';
      context.lineWidth = .8;
      context.stroke();
    }
    const pin = project([1.76, .15, .18]);
    context.fillStyle = red;
    context.beginPath();
    context.arc(pin.x, pin.y, 4, 0, Math.PI * 2);
    context.fill();
    const label = project([1.91, .27, .18]);
    context.fillStyle = light ? '#555' : '#aaa';
    context.font = '10px "IBM Plex Mono", monospace';
    context.fillText('M', label.x, label.y);
  };
  const tick = () => {
    if (!state.visible || document.hidden || reducedMotion) { state.raf = 0; return; }
    if (!state.dragging) state.targetYaw += .0028;
    state.yaw += (state.targetYaw - state.yaw) * .075;
    state.pitch += (state.targetPitch - state.pitch) * .075;
    draw();
    state.raf = requestAnimationFrame(tick);
  };
  const start = () => { if (!state.raf && !reducedMotion) state.raf = requestAnimationFrame(tick); };
  frame.addEventListener('pointerdown', event => {
    if (reducedMotion) return;
    state.dragging = true;
    state.lastX = event.clientX;
    state.lastY = event.clientY;
    frame.setPointerCapture(event.pointerId);
  });
  frame.addEventListener('pointermove', event => {
    if (!state.dragging) return;
    state.targetYaw += (event.clientX - state.lastX) * .012;
    state.targetPitch = Math.max(-.7, Math.min(.7, state.targetPitch + (event.clientY - state.lastY) * .008));
    state.lastX = event.clientX;
    state.lastY = event.clientY;
  });
  const release = () => { state.dragging = false; };
  frame.addEventListener('pointerup', release);
  frame.addEventListener('pointercancel', release);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) start(); });
  new IntersectionObserver(([entry]) => { state.visible = entry.isIntersecting; if (state.visible) start(); }).observe(frame);
  new ResizeObserver(resize).observe(frame);
  new MutationObserver(draw).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  frame.closest('.identity-scene').classList.add('is-ready');
  resize();
  start();

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
