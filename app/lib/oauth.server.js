import {
  API_KEY,
  API_SECRET,
  CONTENT_TYPE_JSON,
} from './env.server.js';
import { callAdminGraphql } from './shopify-graphql.server.js';
import { getShopData } from './shop-store.server.js';

const APP_HANDLE_QUERY = `query AppHandle {
  app {
    handle
  }
}`;

const SHOP_QUERY = `query InstalledShop {
  shop {
    name
  }
  app {
    handle
  }
}`;

export async function hasValidInstallation(shop) {
  if (!API_KEY || !API_SECRET) return false;
  const shopData = await getShopData(shop);
  if (shopData == null) return false;
  try {
    const response = await callAdminGraphql(shop, SHOP_QUERY);
    return response.data?.shop?.name != null && response.data?.app?.handle != null;
  } catch (_error) {
    return false;
  }
}

export async function exchangeOAuthCode(shop, code) {
  const response = await fetch(`https://${shop}/admin/oauth/access_token`, {
    method: 'POST',
    headers: {
      'Content-Type': CONTENT_TYPE_JSON,
    },
    body: JSON.stringify({
      client_id: API_KEY,
      client_secret: API_SECRET,
      code,
    }),
  });
  if (!response.ok) {
    throw new Response(`Token exchange failed: ${await response.text()}`, { status: 502 });
  }
  return response.json();
}

export async function getAppHandle(shop, accessToken) {
  const response = await callAdminGraphql(shop, APP_HANDLE_QUERY, null, accessToken);
  return response.data?.app?.handle;
}
