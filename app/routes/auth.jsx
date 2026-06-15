import {
  embeddedHtmlData,
  htmlSecurityHeaders,
  redirect,
  routeHeaders,
  topLevelRedirect,
  verifyEmbeddedRequest,
} from '../lib/http.server.js';
import {
  createAppJwt,
  isEmbedded,
} from '../lib/shopify-auth.server.js';
import { createOAuthAuthorizeUrl, hasValidInstallation } from '../lib/oauth.server.js';
import Index from '../pages/Index.jsx';

export async function loader({ request }) {
  const verified = verifyEmbeddedRequest(request);
  if (!verified.ok) return verified.response;

  const { params, shop } = verified;
  const validInstallation = await hasValidInstallation(shop);
  console.info('[auth] embedded request', JSON.stringify({
    method: request.method,
    path: new URL(request.url).pathname,
    shop,
    embedded: params.get('embedded') || '',
    validInstallation,
  }));

  if (!validInstallation) {
    const url = new URL(request.url);
    const authorizeUrl = createOAuthAuthorizeUrl(shop, url.origin);
    console.info('[auth] oauth required', JSON.stringify({ shop, authorizeUrl }));
    return topLevelRedirect(authorizeUrl, htmlSecurityHeaders(shop, true));
  }

  if (!isEmbedded(params)) {
    return redirect(`/mocklogin?my_token=${createAppJwt({ shop })}`);
  }

  return embeddedHtmlData(shop);
}

export const headers = routeHeaders;

export default Index;
