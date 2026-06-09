import { createWebPixel, embeddedPageLoader } from '../lib/legacy-routes.server.js';

export async function loader({ request }) {
  return embeddedPageLoader({
    request,
    allowAuthenticatedFetch: true,
    handler: createWebPixel,
  });
}
