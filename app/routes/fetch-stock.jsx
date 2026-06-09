import { stockLevels } from '../lib/legacy-routes.server.js';

export async function loader({ request }) {
  return stockLevels(request);
}
