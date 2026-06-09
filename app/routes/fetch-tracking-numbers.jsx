import { trackingNumbers } from '../lib/legacy-routes.server.js';

export async function loader({ request }) {
  return trackingNumbers(request);
}
