// Unit tests for the Cloudflare Pages contact function. No browser and no network: the Web3Forms call is mocked,
// so nothing is ever sent to the live endpoint.
import { test, expect } from '@playwright/test';
import { onRequest, screen } from '../functions/api/contact.js';

const freshIp = () => `10.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}`; // unique per call: the limiter keeps state in memory
const ORIGIN = 'https://www.monarchsoftwares.com';
const valid = (over = {}) => ({
  name: 'Test Person', email: 'test@example.com', company: 'Acme', service: 'Software',
  message: 'We would like a quote for a new website please.', _ts: Date.now() - 10_000, ...over,
});
const post = (body, { ip = freshIp(), headers = {}, env = {} } = {}) =>
  onRequest({
    request: new Request(`${ORIGIN}/api/contact`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', origin: ORIGIN, referer: `${ORIGIN}/`, 'cf-connecting-ip': ip, ...headers },
      body: typeof body === 'string' ? body : JSON.stringify(body),
    }),
    env: { WEB3FORMS_ACCESS_KEY: 'test-key', ...env },
  });

test.describe('contact function', () => {
  let upstream;
  const realFetch = globalThis.fetch;
  test.beforeEach(() => {
    upstream = [];
    globalThis.fetch = async (url, init) => { upstream.push({ url: String(url), body: JSON.parse(init.body) }); return new Response(JSON.stringify({ success: true, message: 'ok' }), { status: 200 }); };
  });
  test.afterEach(() => { globalThis.fetch = realFetch; });

  test('rejects non-POST and foreign origins', async () => {
    expect((await onRequest({ request: new Request(`${ORIGIN}/api/contact`), env: {} })).status).toBe(405);
    expect((await post(valid(), { headers: { origin: 'https://evil.example' } })).status).toBe(403);
    expect(upstream.length).toBe(0);
  });

  test('honeypot gets a silent success and nothing is forwarded', async () => {
    const res = await post(valid({ hp_url: 'http://spam.example' }));
    expect(res.status).toBe(200);
    expect((await res.json()).success).toBe(true);
    expect(upstream.length).toBe(0);
  });

  test('too-fast submissions and missing fields are rejected', async () => {
    expect((await post(valid({ _ts: Date.now() - 500 }))).status).toBe(400);
    expect((await post(valid({ message: '' }))).status).toBe(400);
    expect(screen(valid({ service: 'Careers' })).ok).toBe(false);
  });

  test('a normal submission is forwarded once to Web3Forms with the screened fields', async () => {
    const res = await post(valid());
    expect(res.status).toBe(200);
    expect((await res.json()).success).toBe(true);
    expect(upstream.length).toBe(1);
    expect(upstream[0].url).toBe('https://api.web3forms.com/submit');
    expect(upstream[0].body).toMatchObject({ access_key: 'test-key', name: 'Test Person', service: 'Software', email: 'test@example.com' });
  });

  test('rate limit stops the fourth inquiry from the same IP', async () => {
    const ip = freshIp();
    for (let i = 0; i < 3; i++) expect((await post(valid(), { ip })).status).toBe(200);
    expect((await post(valid(), { ip })).status).toBe(429);
  });
});
