import { v4 as uuidv4 } from 'uuid';
import { apiJson } from './embedded.server.js';
import { json } from './http.server.js';
import { requireAuthenticatedShop } from './session-token.server.js';
import { createAppJwt, decodeSessionToken } from './shopify-auth.server.js';
import { callAdminGraphql } from './shopify-graphql.server.js';
import { getPublicOrigin } from './public-url.server.js';

export async function preparePostPurchase(request, context) {
  const origin = getPublicOrigin(request);
  const errors = {
    errors: 0,
    apis: [],
  };

  try {
    let response = await callAdminGraphql(context.shop, `query ShopId {
      shop {
        id
      }
    }`);
    const id = response.data.shop.id;
    response = await callAdminGraphql(context.shop, `mutation MetafieldsSet($metafields: [MetafieldsSetInput!]!) {
      metafieldsSet(metafields: $metafields) {
        metafields {
          id
          value
        }
        userErrors {
          field
          message
        }
      }
    }`, {
      metafields: [
        {
          key: 'url',
          namespace: 'barebone_app',
          ownerId: id,
          type: 'single_line_text_field',
          value: origin,
        },
      ],
    });
    if (response.data.metafieldsSet.userErrors.length > 0) {
      errors.errors += 1;
      errors.apis.push(`shop ${JSON.stringify(response.data.metafieldsSet.userErrors[0])}`);
    }
  } catch (error) {
    errors.errors += 1;
    errors.apis.push(`shop ${error.message}`);
  }

  return apiJson(errors);
}

export async function handlePostPurchaseAction(request) {
  const context = await requireAuthenticatedShop(request);
  if (!context.ok) return json({ Error: 'Signature unmatched. Incorrect authentication bearer sent' }, { status: 400 });

  const url = new URL(request.url);
  const payload = decodeSessionToken(context.token);
  const inputData = payload.input_data || null;
  const shop = inputData != null ? inputData.shop.domain : payload.dest?.replace('https://', '');
  const customerId = inputData != null ? `${inputData.initialPurchase.customerId}` : payload.sub || '';

  let responseData = {};
  const upsellProductIds = url.searchParams.get('upsell_product_ids');
  if (upsellProductIds) {
    const query = JSON.parse(upsellProductIds).map((id) => `id:${id}`).join(' OR ');
    const response = await callAdminGraphql(shop, `query UpsellProducts($query: String!) {
      products(first: 10, query: $query) {
        edges {
          node {
            id
            title
            featuredImage {
              url
            }
            priceRangeV2 {
              maxVariantPrice {
                amount
                currencyCode
              }
            }
            variants(first: 1) {
              edges {
                node {
                  id
                  price
                }
              }
            }
          }
        }
      }
    }`, { query });
    responseData = response.data;
  }

  const changes = url.searchParams.get('changes');
  if (changes) {
    responseData = {
      token: createAppJwt({
        iss: process.env.SHOPIFY_API_KEY || '',
        jti: uuidv4(),
        iat: Date.now(),
        sub: inputData != null ? inputData.initialPurchase.referenceId : '',
        changes: JSON.parse(changes),
      }),
    };
  }

  const score = url.searchParams.get('score');
  if (score && customerId !== '') {
    const ownerId = customerId.includes('gid') ? customerId : `gid://shopify/Customer/${customerId}`;
    const response = await callAdminGraphql(shop, `mutation MetafieldsSet($metafields: [MetafieldsSetInput!]!) {
      metafieldsSet(metafields: $metafields) {
        metafields {
          id
          value
        }
        userErrors {
          field
          message
        }
      }
    }`, {
      metafields: [
        {
          key: 'score',
          namespace: 'barebone_app_review',
          ownerId,
          type: 'number_integer',
          value: `${parseInt(score, 10)}`,
        },
      ],
    });
    responseData = response.data;
  }

  return json(responseData);
}
