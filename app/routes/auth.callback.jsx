import { redirect } from '../lib/http.server.js';
import { getAdminFromShop } from '../lib/shopify-auth.server.js';
import { exchangeOAuthCode, getAppHandle } from '../lib/oauth.server.js';
import { verifyShopifyHmac } from '../lib/shopify-auth.server.js';
import { upsertShopData } from '../lib/shop-store.server.js';

export async function loader({ request }) {
  const params = new URL(request.url).searchParams;
  if (!verifyShopifyHmac(params)) {
    return new Response('HMAC verification failed', { status: 400 });
  }

  const shop = params.get('shop');
  const code = params.get('code');
  if (!shop || !code) {
    return new Response('Missing shop or code', { status: 400 });
  }

  const tokenResponse = await exchangeOAuthCode(shop, code);
  if (!tokenResponse.access_token) {
    return new Response('Shopify did not return an access token', { status: 502 });
  }

  await upsertShopData(shop, tokenResponse);
  const appHandle = await getAppHandle(shop, tokenResponse.access_token);
  if (!appHandle) {
    return new Response('Unable to resolve app handle', { status: 502 });
  }

  return redirect(`https://${getAdminFromShop(shop)}/apps/${appHandle}`);
}
