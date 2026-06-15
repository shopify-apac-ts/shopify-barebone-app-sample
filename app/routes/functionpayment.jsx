import { embeddedPageLoader } from '../lib/embedded.server.js';
import { routeHeaders } from '../lib/http.server.js';
import { createPaymentCustomization } from '../lib/functions-samples.server.js';
import FunctionPayment from '../pages/FunctionPayment.jsx';

export async function loader({ request }) {
  return embeddedPageLoader({
    request,
    allowAuthenticatedFetch: true,
    handler: createPaymentCustomization,
  });
}

export const headers = routeHeaders;

export default FunctionPayment;
