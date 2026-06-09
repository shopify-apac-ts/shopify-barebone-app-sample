import { createDeliveryCustomization, embeddedPageLoader } from '../lib/legacy-routes.server.js';

export async function loader({ request }) {
  return embeddedPageLoader({
    request,
    allowAuthenticatedFetch: true,
    handler: createDeliveryCustomization,
  });
}
