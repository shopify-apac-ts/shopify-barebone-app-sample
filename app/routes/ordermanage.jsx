import { loadOrderManage } from '../lib/legacy-routes.server.js';

export async function loader({ request }) {
  return loadOrderManage(request);
}
