/**
 * Contact form endpoint (Vercel serverless function): POST /api/contact
 *
 * The browser used to post straight to Web3Forms, so there was no server in between and nothing could rate-limit or screen the
 * traffic (the Web3Forms access key sits in the page, so anyone could post to it directly). This function sits in the middle:
 *
 *   1. Only POST, JSON, small bodies, and only from this site (Origin / Referer check).
 *   2. Rate limit per IP address: MAX_PER_WINDOW inquiries per WINDOW_SECONDS and MAX_PER_DAY per day (only inquiries that pass the
 *      screening below count, so a real person correcting a typo is never locked out), plus a generous cap on raw requests. Counters are shared across
 *      all serverless instances when Upstash Redis is configured (UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN); without it the
 *      limiter falls back to per-instance memory, which still stops a single client hammering one instance but is not shared.
 *      IPs are hashed before they are used as keys.
 *   3. Bot / spam screening: a hidden honeypot field humans never fill, a minimum time between the form appearing and being sent,
 *      field validation and length limits, HTML / link spam, repeated-character junk and common spam phrases.
 *   4. Only then is the inquiry forwarded to Web3Forms from the server. Set WEB3FORMS_ACCESS_KEY in the Vercel project settings so
 *      the key is read here (and can be removed from the page); without it the key sent by the form is used, as before.
 */
import { createHash } from 'node:crypto';

// ---- limits (change here) ----
const MAX_PER_WINDOW = 3;            // inquiries per IP ...
const WINDOW_SECONDS = 10 * 60;      // ... per 10 minutes
const MAX_PER_DAY = 8;               // and per IP per 24 hours
const MAX_ATTEMPTS = 20;             // generous cap on raw requests per IP per window (bots hammering the endpoint); validation slips by real people never get near it
const MIN_FILL_MS = 3000;            // a person cannot read, fill and send the form faster than this
const MAX_FORM_AGE_MS = 24 * 60 * 60 * 1000;
const MAX_BODY_BYTES = 20 * 1024;

const ALLOWED_HOSTS = (process.env.CONTACT_ALLOWED_HOSTS || 'monarchsoftwares.com,www.monarchsoftwares.com,localhost,127.0.0.1')
  .split(',').map((h) => h.trim().toLowerCase()).filter(Boolean);
const isAllowedOrigin = (value) => {
  if (!value) return true;           // some privacy tools strip both headers: do not block real visitors for that
  try {
    const host = new URL(value).hostname.toLowerCase();
    return ALLOWED_HOSTS.includes(host) || host.endsWith('.vercel.app');   // production + preview deployments
  } catch { return false; }
};

// ---- rate limiter ----
const memory = new Map();            // fallback: key -> { count, expires }
const memoryHit = (key, ttlSeconds) => {
  const now = Date.now();
  if (memory.size > 5000) for (const [k, v] of memory) if (v.expires <= now) memory.delete(k);
  let e = memory.get(key);
  if (!e || e.expires <= now) { e = { count: 0, expires: now + ttlSeconds * 1000 }; memory.set(key, e); }
  e.count += 1;
  return e.count;
};
const hasRedis = () => !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
const redisHit = async (key, ttlSeconds) => {
  const r = await fetch(`${process.env.UPSTASH_REDIS_REST_URL}/pipeline`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify([['INCR', key], ['EXPIRE', key, String(ttlSeconds), 'NX']]),
  });
  const j = await r.json();
  return Number(j && j[0] && j[0].result);
};
const hit = async (key, ttl) => {
  if (hasRedis()) { try { return await redisHit(key, ttl); } catch { /* store unreachable: fall through to memory */ } }
  return memoryHit(key, ttl);
};
const clientIp = (req) => {
  const h = req.headers || {};
  const fwd = String(h['x-forwarded-for'] || '').split(',')[0].trim();
  return String(h['x-real-ip'] || fwd || (req.socket && req.socket.remoteAddress) || 'unknown');
};
const hashIp = (ip) => createHash('sha256').update(ip + (process.env.RATE_LIMIT_SALT || 'monarch')).digest('hex').slice(0, 32);

// ---- spam screening ----
const SPAM_PHRASES = [
  /\b(viagra|cialis|casino|porn|escort|sex\s?cam|adult\s?dating|payday\s?loan|loan\s?approval|forex\s?signal|binary\s?options)\b/i,
  /\b(crypto|bitcoin)\s+(investment|giveaway|trading\s+signal|doubler)\b/i,
  /\b(you\s+have\s+won|claim\s+your\s+(prize|reward)|click\s+here\s+now|make\s+\$?\d+\s*(k|usd)?\s+(a|per)\s+(day|week)|work\s+from\s+home\s+and\s+earn)\b/i,
  /\b(backlinks?\s+for\s+sale|buy\s+(followers|likes|traffic)|guaranteed\s+(first\s+page|#?1\s+rank))\b/i,
];
const LIMITS = { name: 100, email: 254, company: 150, service: 40, message: 3000 };
const SERVICES = ['Training', 'Recruitment', 'Software', 'Marketing', 'Other'];
const EMAIL_RE = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[A-Za-z]{2,}$/;

const clean = (v) => String(v == null ? '' : v).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim();
const linkCount = (s) => (s.match(/(https?:\/\/|www\.)\S+/gi) || []).length;
const hasHtml = (s) => /<\s*\/?\s*[a-z][^>]*>|\[url=|\[link=/i.test(s);
const looksLikeJunk = (s) => /(.)\1{9,}/.test(s) || (s.length > 12 && !/[aeiou]/i.test(s.replace(/[^a-z]/gi, '')));

/** @returns {{ok:true, fields:object} | {ok:false, status:number, message:string, silent?:boolean}} */
export function screen(body, now = Date.now()) {
  const b = body && typeof body === 'object' ? body : {};
  // honeypot: invisible to people, filled in by form-scraping bots. Answer "success" so the bot learns nothing.
  if (clean(b.hp_url) || b.botcheck === true || b.botcheck === 'on' || b.botcheck === 'true') return { ok: false, status: 200, message: 'ok', silent: true };

  const ts = Number(b._ts);
  const age = now - ts;
  if (!Number.isFinite(ts) || age > MAX_FORM_AGE_MS || age < -60000) return { ok: false, status: 400, message: 'Please reload the page and try again.' };
  if (age < MIN_FILL_MS) return { ok: false, status: 400, message: 'That was very quick. Please wait a moment and send your inquiry again.' };

  const f = { name: clean(b.name), email: clean(b.email), company: clean(b.company), service: clean(b.service), message: clean(b.message) };
  for (const k of Object.keys(LIMITS)) if (f[k].length > LIMITS[k]) return { ok: false, status: 400, message: 'One of the fields is too long.' };
  if (!f.name || !f.email || !f.service || !f.message) return { ok: false, status: 400, message: 'Please complete all required fields.' };
  if (!EMAIL_RE.test(f.email)) return { ok: false, status: 400, message: 'Please enter a valid email address.' };
  if (!SERVICES.includes(f.service)) return { ok: false, status: 400, message: 'Please choose one of the listed topics.' };
  if (f.message.length < 5) return { ok: false, status: 400, message: 'Please add a little more detail to your message.' };

  const all = `${f.name} ${f.company} ${f.message}`;
  const spam = hasHtml(all) || linkCount(all) > 2 || linkCount(f.name) > 0 || linkCount(f.company) > 0 || SPAM_PHRASES.some((r) => r.test(all)) || looksLikeJunk(f.message) || looksLikeJunk(f.name);
  if (spam) return { ok: false, status: 422, message: 'Your message looks like spam, so it was not sent. Please remove links or unusual content, or email us directly at contact@monarchsoftwares.com.' };
  return { ok: true, fields: f };
}

const send = (res, status, data, extra = {}) => {
  for (const [k, v] of Object.entries(extra)) res.setHeader(k, v);
  res.setHeader('Cache-Control', 'no-store');
  res.status(status).json(data);
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return send(res, 405, { success: false, message: 'Method not allowed.' }, { Allow: 'POST' });
  if (!isAllowedOrigin(req.headers.origin) || !isAllowedOrigin(req.headers.referer)) return send(res, 403, { success: false, message: 'Request not allowed.' });
  if (!String(req.headers['content-type'] || '').includes('application/json')) return send(res, 415, { success: false, message: 'Unsupported request.' });

  const id = hashIp(clientIp(req));
  const tooMany = (minutes) => send(res, 429, { success: false, message: `You have sent several inquiries already. Please try again in about ${minutes} minutes, or email us at contact@monarchsoftwares.com.` }, { 'Retry-After': String(minutes * 60) });

  // 1) cheap cap on raw requests first, so a script hammering the endpoint is cut off before any work is done
  if ((await hit(`contact:a:${id}`, WINDOW_SECONDS)) > MAX_ATTEMPTS) return tooMany(Math.ceil(WINDOW_SECONDS / 60));

  let body = req.body;
  if (typeof body === 'string') { if (body.length > MAX_BODY_BYTES) return send(res, 413, { success: false, message: 'Request too large.' }); try { body = JSON.parse(body); } catch { body = null; } }
  if (!body || typeof body !== 'object' || JSON.stringify(body).length > MAX_BODY_BYTES) return send(res, 400, { success: false, message: 'Invalid request.' });

  // 2) bot / spam screening (honeypot, timing, validation, spam content): rejected requests are not counted as inquiries
  const verdict = screen(body);
  if (!verdict.ok) return send(res, verdict.status, { success: !!verdict.silent, message: verdict.message });

  // 3) the real limit: inquiries that will actually be forwarded, per IP
  const win = await hit(`contact:w:${id}`, WINDOW_SECONDS);
  const day = await hit(`contact:d:${id}`, 24 * 60 * 60);
  if (win > MAX_PER_WINDOW) return tooMany(Math.ceil(WINDOW_SECONDS / 60));
  if (day > MAX_PER_DAY) return tooMany(60);

  const accessKey = process.env.WEB3FORMS_ACCESS_KEY || clean(body.access_key);
  if (!accessKey) return send(res, 500, { success: false, message: 'Inquiries are not configured right now. Please email contact@monarchsoftwares.com.' });
  try {
    const upstream = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        access_key: accessKey,
        subject: clean(body.subject) || 'New Inquiry from Monarch Softwares Website',
        from_name: clean(body.from_name) || 'MONARCH SOFTWARES Form',
        ...verdict.fields,
      }),
    });
    const data = await upstream.json().catch(() => ({}));
    return send(res, upstream.status === 200 ? 200 : 502, { success: upstream.status === 200, message: data.message || (upstream.status === 200 ? 'ok' : 'Submission failed. Please email contact@monarchsoftwares.com') });
  } catch {
    return send(res, 502, { success: false, message: 'Submission failed. Please email contact@monarchsoftwares.com' });
  }
}
