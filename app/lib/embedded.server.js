import { embeddedHtmlData, json } from './http.server.js';
import { requireAuthenticatedShop } from './session-token.server.js';
import { verifyShopifyHmac } from './shopify-auth.server.js';

export async function embeddedPageLoader({ request, allowAuthenticatedFetch = false, handler = null }) {
  if (allowAuthenticatedFetch && request.headers.has('authorization')) {
    const context = await requireAuthenticatedShop(request);
    if (!context.ok) return json(context.response, { status: context.status });
    if (handler) return handler(request, context);
    return json({
      result: {
        message: 'Successfully authorized!',
        response: {},
      },
    });
  }

  const url = new URL(request.url);
  if (!verifyShopifyHmac(url.searchParams)) {
    return new Response('HMAC verification failed', { status: 400 });
  }
  const shop = url.searchParams.get('shop');
  if (!shop) return new Response('Missing shop', { status: 400 });
  return embeddedHtmlData(shop);
}

export async function authenticatedEndpoint(request, handler) {
  const context = await requireAuthenticatedShop(request);
  if (!context.ok) return json(context.response, { status: context.status });
  return handler(context);
}

export function apiJson(response) {
  return json({
    result: {
      message: '',
      response,
    },
  });
}
