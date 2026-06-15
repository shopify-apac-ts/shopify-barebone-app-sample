import {
  embeddedHtmlData,
  htmlSecurityHeaders,
  oauthBounceUrl,
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
import { getPublicOrigin } from '../lib/public-url.server.js';
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
    const publicOrigin = getPublicOrigin(request);
    const authorizeUrl = createOAuthAuthorizeUrl(shop, publicOrigin);
    console.info('[auth] oauth required', JSON.stringify({ shop, authorizeUrl }));
    if (isEmbedded(params)) {
      const bounceUrl = `${publicOrigin}${oauthBounceUrl(request)}`;
      console.info('[auth] escaping iframe before oauth', JSON.stringify({ shop, bounceUrl }));
      return topLevelRedirect(bounceUrl, htmlSecurityHeaders(shop, true));
    }
    return redirect(authorizeUrl);
  }

  if (!isEmbedded(params)) {
    return redirect(`/mocklogin?my_token=${createAppJwt({ shop })}`);
  }

  return embeddedHtmlData(shop);
}

export const headers = routeHeaders;

export default Index;
