import { renderEmbeddedApp, verifyEmbeddedRequest } from '../lib/http.server.js';

export async function loader({ request }) {
  const verified = verifyEmbeddedRequest(request);
  if (!verified.ok) return verified.response;
  return renderEmbeddedApp(request, verified.shop);
}
