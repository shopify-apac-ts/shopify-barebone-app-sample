import { API_KEY } from '../lib/env.server.js';
import { redirect, topLevelRedirect, verifyEmbeddedRequest } from '../lib/http.server.js';
import {
  createAppJwt,
  isEmbedded,
} from '../lib/shopify-auth.server.js';
import { hasValidInstallation } from '../lib/oauth.server.js';
import Index from '../pages/Index.jsx';

export async function loader({ request }) {
  const verified = verifyEmbeddedRequest(request);
  if (!verified.ok) return verified.response;

  const { params, shop } = verified;
  if (!(await hasValidInstallation(shop))) {
    const url = new URL(request.url);
    const callbackUrl = `${url.origin}/callback`;
    const redirectUrl = new URL(`https://${shop}/admin/oauth/authorize`);
    redirectUrl.searchParams.set('client_id', API_KEY);
    redirectUrl.searchParams.set('redirect_uri', callbackUrl);
    redirectUrl.searchParams.set('state', '');
    redirectUrl.searchParams.append('grant_options[]', '');
    return topLevelRedirect(redirectUrl.toString());
  }

  if (!isEmbedded(params)) {
    return redirect(`/mocklogin?my_token=${createAppJwt({ shop })}`);
  }

  return null;
}

export default Index;
