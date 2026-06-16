import {
  embeddedHtmlData,
  json,
  parseRequestBody,
  routeHeaders,
  verifyEmbeddedRequest,
} from '../lib/http.server.js';
import {
  callPrivateStorefrontAction,
  renderStorefrontPage,
} from '../lib/storefront.server.js';
import Storefront from '../pages/Storefront.jsx';

export async function loader({ request }) {
  const url = new URL(request.url);
  const isEmbeddedAppPage = url.searchParams.get('embedded') === '1' || request.headers.has('authorization');
  if (isEmbeddedAppPage) {
    const verified = verifyEmbeddedRequest(request);
    if (!verified.ok) return verified.response;
    return embeddedHtmlData(verified.shop);
  }

  const shop = url.searchParams.get('shop');
  const publicToken = url.searchParams.get('public_token') || '';
  if (shop) {
    return renderStorefrontPage(request, { shop, publicToken });
  }

  return new Response('Missing shop', { status: 400 });
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

export const headers = routeHeaders;

export default Storefront;
