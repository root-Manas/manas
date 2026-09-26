function control(label, id, min, max, value, step = 1) {
  return `<label class="sim-control">${label}<input id="${id}" type="range" min="${min}" max="${max}" value="${value}" step="${step}"><output for="${id}"></output></label>`;
}
function metric(label, id) { return `<div><small>${label}</small><strong id="${id}">—</strong></div>`; }
function text(id, value) { const element = document.getElementById(id); if (element) element.textContent = value; }

function initPpf(root) {
  root.querySelector('.sim-ui').innerHTML = `<div class="sim-grid">${control('DESIGN ALLOCATION', 'ppf-share', 5, 95, 55)}${control('PRODUCTIVITY MULTIPLIER', 'ppf-productivity', 100, 180, 100)}</div><svg class="sim-chart" viewBox="0 0 600 310" role="img" aria-label="Illustrative production frontier"><line class="sim-axis" x1="58" y1="260" x2="560" y2="260"/><line class="sim-axis" x1="58" y1="260" x2="58" y2="20"/><text x="300" y="295">FABRICATION CAPABILITY →</text><text x="63" y="20">DESIGN ↑</text><path id="ppf-frontier" class="sim-frontier"/><circle id="ppf-point" class="sim-point" r="7"/></svg><div class="sim-output">${metric('DESIGN INDEX', 'ppf-design')}${metric('FABRICATION INDEX', 'ppf-fab')}</div><p class="sim-note">R = 100 normalized resource units; diminishing-return exponent = 0.65. Productivity scales both outputs. Values are illustrative.</p>`;
  const share = document.getElementById('ppf-share');
  const productivity = document.getElementById('ppf-productivity');
  const update = () => {
    const s = Number(share.value) / 100;
    const a = Number(productivity.value) / 100;
    const output = t => a * 10 * Math.pow(100 * t, .65);
    const max = 10 * Math.pow(100, .65) * 1.8;
    const x = t => 58 + 500 * output(1 - t) / max;
    const y = t => 260 - 230 * output(t) / max;
    const points = Array.from({ length: 51 }, (_, index) => index / 50);
    document.getElementById('ppf-frontier').setAttribute('d', points.map((t, index) => `${index ? 'L' : 'M'}${x(t).toFixed(1)} ${y(t).toFixed(1)}`).join(' '));
    const point = document.getElementById('ppf-point');
    point.setAttribute('cx', x(s));
    point.setAttribute('cy', y(s));
    text('ppf-design', output(s).toFixed(1));
    text('ppf-fab', output(1 - s).toFixed(1));
    share.nextElementSibling.textContent = `${share.value}%`;
    productivity.nextElementSibling.textContent = `${a.toFixed(2)}×`;
  };
  share.addEventListener('input', update);
  productivity.addEventListener('input', update);
  update();
}

function initRf(root) {
  root.querySelector('.sim-ui').innerHTML = `<div class="sim-grid">${control('FREQUENCY (MHz)', 'rf-frequency', 400, 6000, 2400, 100)}${control('DISTANCE (KM)', 'rf-distance', .1, 20, 1, .1)}${control('TRANSMIT POWER (dBm)', 'rf-power', -10, 30, 20)}${control('GAIN AT EACH ANTENNA (dBi)', 'rf-gain', 0, 18, 2)}${control('BANDWIDTH (MHz)', 'rf-bandwidth', .2, 40, 20, .2)}${control('RECEIVER NOISE FIGURE (dB)', 'rf-nf', 0, 10, 5)}</div><div class="sim-output">${metric('WAVELENGTH', 'rf-wavelength')}${metric('FREE-SPACE LOSS', 'rf-loss')}${metric('RECEIVED POWER', 'rf-received')}${metric('EST. SNR', 'rf-snr')}</div><p class="sim-note">Noise assumes about 290 K. This omits cable loss, obstruction, fading, polarization loss, and other transmitters.</p>`;
  const ids = ['frequency', 'distance', 'power', 'gain', 'bandwidth', 'nf'];
  const inputs = Object.fromEntries(ids.map(name => [name, document.getElementById(`rf-${name}`)]));
  const update = () => {
    const value = name => Number(inputs[name].value);
    const loss = 32.4 + 20 * Math.log10(value('frequency')) + 20 * Math.log10(value('distance'));
    const received = value('power') + 2 * value('gain') - loss;
    const noise = -174 + 10 * Math.log10(value('bandwidth') * 1e6) + value('nf');
    text('rf-wavelength', `${(299.792458 / value('frequency')).toFixed(3)} m`);
    text('rf-loss', `${loss.toFixed(1)} dB`);
    text('rf-received', `${received.toFixed(1)} dBm`);
    text('rf-snr', `${(received - noise).toFixed(1)} dB`);
    for (const name of ids) inputs[name].nextElementSibling.textContent = inputs[name].value;
  };
  Object.values(inputs).forEach(input => input.addEventListener('input', update));
  update();
}

function initRecon(root) {
  const clues = [
    ['dns', 'A current CNAME points to a CDN', 15],
    ['ct', 'A recent certificate SAN names the API host', 10],
    ['repo', 'An owner-controlled deployment file names the API origin', 25],
    ['client', 'The current client bundle calls that API origin', 25],
    ['owner', 'Owner documentation confirms the service', 25]
  ];
  root.querySelector('.sim-ui').innerHTML = `<div class="sim-clues">${clues.map(([id, label]) => `<label><input type="checkbox" value="${id}">${label}</label>`).join('')}</div><div class="sim-output" style="margin-top:14px">${metric('HEURISTIC INDEX', 'recon-score')}${metric('NEXT INTERPRETATION', 'recon-level')}</div><p class="sim-note">Clues can be correlated. This index is not a probability, proof of ownership, or permission to test.</p>`;
  const update = () => {
    const checked = [...root.querySelectorAll('input:checked')].map(input => input.value);
    const score = clues.reduce((sum, [id, , weight]) => sum + (checked.includes(id) ? weight : 0), 0);
    text('recon-score', `${score} / 100`);
    text('recon-level', score < 25 ? 'More evidence needed' : score < 60 ? 'Plausible hypothesis' : 'Ask owner to verify');
  };
  root.querySelectorAll('input').forEach(input => input.addEventListener('change', update));
  update();
}

function initCron(root) {
  root.querySelector('.sim-ui').innerHTML = `<div class="sim-clues"><label><input type="checkbox" id="cron-root" checked>Scheduled command runs as root</label><label><input type="checkbox" id="cron-file">Lower-trust account can edit the script file</label><label><input type="checkbox" id="cron-parent">Lower-trust account can replace a path component</label><label><input type="checkbox" id="cron-helper">Script loads a lower-trust helper or PATH entry</label></div><div class="sim-output" style="margin-top:14px">${metric('EXECUTION IDENTITY', 'cron-identity')}${metric('BOUNDARY ASSESSMENT', 'cron-assessment')}</div><p class="sim-note">A static model of influence, not a vulnerability scanner. Actual permissions, ACLs, mount policy, and timing still need inspection.</p>`;
  const update = () => {
    const rootJob = document.getElementById('cron-root').checked;
    const influence = ['cron-file', 'cron-parent', 'cron-helper'].some(id => document.getElementById(id).checked);
    text('cron-identity', rootJob ? 'root' : 'unprivileged');
    text('cron-assessment', rootJob && influence ? 'Review privilege boundary' : influence ? 'Code can be influenced' : 'No influence shown');
  };
  root.querySelectorAll('input').forEach(input => input.addEventListener('change', update));
  update();
}

document.querySelectorAll('[data-sim]').forEach(root => {
  if (root.dataset.sim === 'ppf') initPpf(root);
  if (root.dataset.sim === 'rf') initRf(root);
  if (root.dataset.sim === 'recon') initRecon(root);
  if (root.dataset.sim === 'cron') initCron(root);
});
