import {
  CONTENT_TYPE_JSON,
  GRAPHQL_PATH_ADMIN,
  GRAPHQL_PATH_STOREFRONT,
  USER_AGENT,
} from './env.server.js';
import { getShopData } from './shop-store.server.js';

export async function callAdminGraphql(shop, query, variables = null, token = null) {
  const accessToken = token || (await getShopData(shop))?.access_token;
  if (!accessToken) throw new Error(`No Admin API token stored for ${shop}`);
  return callShopifyGraphql(`https://${shop}/${GRAPHQL_PATH_ADMIN}`, query, variables, {
    'X-Shopify-Access-Token': accessToken,
  });
}

export async function callStorefrontGraphql(shop, query, variables, token, buyerIp = null) {
  const headers = {};
  if (token) {
    headers['Shopify-Storefront-Private-Token'] = token;
  }
  if (buyerIp) {
    headers['Shopify-Storefront-Buyer-IP'] = buyerIp;
  }
  return callShopifyGraphql(`https://${shop}/${GRAPHQL_PATH_STOREFRONT}`, query, variables, headers);
}

async function callShopifyGraphql(endpoint, query, variables, headers) {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': CONTENT_TYPE_JSON,
      'User-Agent': USER_AGENT,
      ...headers,
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });
  const json = await response.json();
  if (!response.ok) {
    const error = new Error(`Shopify GraphQL failed ${response.status}: ${JSON.stringify(json)}`);
    error.status = response.status;
    error.body = json;
    throw error;
  }
  return json;
}
