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
  if (!(await hasValidInstallation(shop))) {
    const url = new URL(request.url);
    return topLevelRedirect(createOAuthAuthorizeUrl(shop, url.origin), htmlSecurityHeaders(shop, true));
  }

  if (!isEmbedded(params)) {
    return redirect(`/mocklogin?my_token=${createAppJwt({ shop })}`);
  }

  return embeddedHtmlData(shop);
}

export const headers = routeHeaders;

export default Index;
