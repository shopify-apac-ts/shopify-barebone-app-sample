import { embeddedPageLoader } from '../lib/embedded.server.js';
import { routeHeaders } from '../lib/http.server.js';
import { createFunctionDiscount } from '../lib/functions-samples.server.js';
import FunctionDiscount from '../pages/FunctionDiscount.jsx';

export async function loader({ request }) {
  return embeddedPageLoader({
    request,
    allowAuthenticatedFetch: true,
    handler: createFunctionDiscount,
  });
}

export const headers = routeHeaders;

export default FunctionDiscount;
