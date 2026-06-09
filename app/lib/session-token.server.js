import {
  decodeSessionToken,
  getBearerToken,
  getShopFromSessionToken,
  verifySessionToken,
} from './shopify-auth.server.js';
import { getShopData } from './shop-store.server.js';

export function getAuthenticatedFetchContext(request) {
  const token = getBearerToken(request);
  const verified = verifySessionToken(token);
  const signature = token ? token.split('.')[2] : '';
  if (!verified) {
    return {
      ok: false,
      token,
      signature,
      response: {
        result: {
          message: 'Signature unmatched. Incorrect authentication bearer sent',
        },
      },
      status: 400,
    };
  }

  return {
    ok: true,
    token,
    signature,
    shop: getShopFromSessionToken(token),
    payload: decodeSessionToken(token),
  };
}

export async function requireAuthenticatedShop(request) {
  const context = getAuthenticatedFetchContext(request);
  if (!context.ok) {
    return context;
  }

  const shopData = await getShopData(context.shop);
  if (shopData == null) {
    return {
      ok: false,
      status: 400,
      response: {
        result: {
          message: 'Authorization failed. No shop data',
        },
      },
    };
  }

  return {
    ...context,
    shopData,
  };
}
