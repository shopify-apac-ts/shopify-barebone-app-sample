import { verifyEmbeddedRequest } from '../lib/http.server.js';
import SessionToken from '../pages/SessionToken.jsx';

export async function loader({ request }) {
  const verified = verifyEmbeddedRequest(request);
  if (!verified.ok) return verified.response;
  return null;
}

export default SessionToken;
