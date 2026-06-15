import { embeddedPageLoader } from '../lib/embedded.server.js';
import { routeHeaders } from '../lib/http.server.js';
import { loadAdminLink } from '../lib/admin-link.server.js';
import AdminLink from '../pages/AdminLink.jsx';

export async function loader({ request }) {
  return embeddedPageLoader({
    request,
    allowAuthenticatedFetch: true,
    handler: loadAdminLink,
  });
}

export const headers = routeHeaders;

export default AdminLink;
