import { embeddedPageLoader } from '../lib/embedded.server.js';
import { routeHeaders } from '../lib/http.server.js';
import { createDeliveryCustomization } from '../lib/functions-samples.server.js';
import FunctionShipping from '../pages/FunctionShipping.jsx';

export async function loader({ request }) {
  return embeddedPageLoader({
    request,
    allowAuthenticatedFetch: true,
    handler: createDeliveryCustomization,
  });
}

export const headers = routeHeaders;

export default FunctionShipping;
