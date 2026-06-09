import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { CONTENT_TYPE_JSON } from './env.server.js';
import { contentSecurityPolicy, isEmbedded, verifyShopifyHmac } from './shopify-auth.server.js';

const rootDir = process.cwd();

export function json(data, init = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      'Content-Type': CONTENT_TYPE_JSON,
      ...(init.headers || {}),
    },
  });
}

export function redirect(location, status = 302) {
  return new Response(null, {
    status,
    headers: {
      Location: location,
    },
  });
}

export async function renderEmbeddedApp(request, shop) {
  const html = await readFile(resolve(rootDir, 'views/index.html'), 'utf8');
  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Security-Policy': contentSecurityPolicy(shop, isEmbedded(new URL(request.url).searchParams)),
    },
  });
}

export function verifyEmbeddedRequest(request) {
  const params = new URL(request.url).searchParams;
  if (!verifyShopifyHmac(params)) {
    return { ok: false, params, response: new Response('HMAC verification failed', { status: 400 }) };
  }
  const shop = params.get('shop');
  if (!shop) {
    return { ok: false, params, response: new Response('Missing shop', { status: 400 }) };
  }
  return { ok: true, params, shop };
}

export function requireQueryParam(params, key) {
  const value = params.get(key);
  if (value == null || value === '') {
    throw new Response(`Missing ${key}`, { status: 400 });
  }
  return value;
}

export async function parseRequestBody(request) {
  const contentType = request.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return request.json();
  }
  if (contentType.includes('application/x-www-form-urlencoded')) {
    const text = await request.text();
    return Object.fromEntries(new URLSearchParams(text));
  }
  const text = await request.text();
  return text ? { rawBody: text } : {};
}
