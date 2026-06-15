import { routeHeaders } from '../lib/http.server.js';
import { loadOrderManage } from '../lib/order-and-bulk.server.js';
import OrderManage from '../pages/OrderManage.jsx';

export async function loader({ request }) {
  return loadOrderManage(request);
}

export const headers = routeHeaders;

export default OrderManage;
