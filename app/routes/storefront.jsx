import { json, parseRequestBody, verifyEmbeddedRequest } from '../lib/http.server.js';
import { requireAuthenticatedShop } from '../lib/session-token.server.js';
import {
  callPrivateStorefrontAction,
  prepareStorefrontAccess,
  renderStorefrontPage,
} from '../lib/storefront.server.js';
import Storefront from '../pages/Storefront.jsx';

export async function loader({ request }) {
  const url = new URL(request.url);

  const authContext = await requireAuthenticatedShop(request);
  if (authContext.ok) {
    try {
      const response = await prepareStorefrontAccess(authContext.shop, url.origin);
      return json({
        result: {
          message: '',
          response,
        },
      });
    } catch (error) {
      return json({
        result: {
          message: error.message,
          response: {
            error_count: 1,
            error_messages: [error.message],
          },
        },
      }, { status: 500 });
    }
  }

  const shop = url.searchParams.get('shop');
  const publicToken = url.searchParams.get('public_token') || '';
  if (shop) {
    return renderStorefrontPage(request, { shop, publicToken });
  }

  const verified = verifyEmbeddedRequest(request);
  if (!verified.ok) return verified.response;
  return null;
}

export async function action({ request }) {
  const url = new URL(request.url);
  const actionName = url.searchParams.get('action');
  const body = await parseRequestBody(request);

  const result = await callPrivateStorefrontAction({
    shop: body.shop,
    action: actionName,
    locale: url.searchParams.get('locale'),
    variables: body.variables,
    buyerIp: body.ip_address,
  });

  return json(result);
}

export default Storefront;
