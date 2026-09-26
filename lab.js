const byId = id => document.getElementById(id);
const row = (label, value) => {
  const line = document.createElement('div');
  line.className = 'record';
  const key = document.createElement('span');
  key.textContent = label;
  const data = document.createElement('strong');
  data.textContent = value || '—';
  line.append(key, data);
  return line;
};
const fail = (element, message) => {
  const line = document.createElement('span');
  line.className = 'error';
  line.textContent = message;
  element.replaceChildren(line);
};

const ipButton = byId('check-ip');
if (ipButton) ipButton.addEventListener('click', async () => {
  const result = byId('ip-result');
  ipButton.disabled = true;
  result.textContent = 'Checking external IP…';
  try {
    const response = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(8000) });
    if (!response.ok) throw new Error('Location service unavailable');
    const data = await response.json();
    if (data.error || !data.ip) throw new Error('Location service unavailable');
    result.replaceChildren(row('PUBLIC IP', data.ip), row('NETWORK', data.org || data.asn || 'Unknown'), row('REGION', [data.city, data.region, data.country_name].filter(Boolean).join(', ') || 'Unknown'), row('TIMEZONE', data.timezone || 'Unknown'));
  } catch {
    try {
      const response = await fetch('https://api64.ipify.org?format=json', { signal: AbortSignal.timeout(8000) });
      if (!response.ok) throw new Error();
      const data = await response.json();
      result.replaceChildren(row('PUBLIC IP', data.ip), row('LOCATION', 'Not available'));
    } catch { fail(result, 'The external lookup failed. Check your connection and try again.'); }
  } finally { ipButton.disabled = false; }
});

const dnsForm = byId('dns-form');
if (dnsForm) dnsForm.addEventListener('submit', async event => {
  event.preventDefault();
  const result = byId('dns-result');
  const domain = byId('dns-domain').value.trim().replace(/\.$/, '').toLowerCase();
  const type = byId('dns-type').value;
  if (!/^(?=.{1,253}$)[a-z0-9-]+(?:\.[a-z0-9-]+)+$/.test(domain) || domain.split('.').some(label => label.length > 63 || label.startsWith('-') || label.endsWith('-'))) {
    fail(result, 'Enter a valid public domain, such as example.org.');
    return;
  }
  result.textContent = `Resolving ${type} records…`;
  try {
    const url = new URL('https://dns.google/resolve');
    url.searchParams.set('name', domain);
    url.searchParams.set('type', type);
    url.searchParams.set('edns_client_subnet', '0.0.0.0/0');
    const response = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!response.ok) throw new Error();
    const data = await response.json();
    if (data.Status !== 0) { fail(result, `DNS response code ${data.Status}. No matching record was returned.`); return; }
    const answers = Array.isArray(data.Answer) ? data.Answer.slice(0, 8) : [];
    if (!answers.length) { result.textContent = 'No matching records found.'; return; }
    result.replaceChildren(...answers.map((answer, index) => row(`${type} ${index + 1}`, answer.data)));
  } catch { fail(result, 'DNS lookup failed. Check your connection and try again.'); }
});

const hashForm = byId('hash-form');
if (hashForm) hashForm.addEventListener('submit', async event => {
  event.preventDefault();
  const result = byId('hash-result');
  try {
    const bytes = new TextEncoder().encode(byId('hash-input').value);
    const digest = await crypto.subtle.digest('SHA-256', bytes);
    const hex = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
    result.replaceChildren(row('SHA-256', hex));
  } catch { fail(result, 'Hashing needs a secure browser context (HTTPS or localhost).'); }
});
