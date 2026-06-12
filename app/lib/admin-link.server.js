import { json } from './http.server.js';
import { callAdminGraphql } from './shopify-graphql.server.js';

export async function loadAdminLink(request, context) {
  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  let response = {};
  if (id) {
    response = await callAdminGraphql(context.shop, `query AdminLinkedProduct($id: ID!) {
      product(id: $id) {
        id
        handle
        title
        onlineStoreUrl
        priceRangeV2 {
          maxVariantPrice {
            amount
            currencyCode
          }
          minVariantPrice {
            amount
            currencyCode
          }
        }
        variants(first: 10) {
          edges {
            node {
              id
              title
              price
            }
          }
        }
      }
    }`, { id: `gid://shopify/Product/${id}` });
  }

  return json({
    result: {
      message: '',
      response,
    },
  });
}
