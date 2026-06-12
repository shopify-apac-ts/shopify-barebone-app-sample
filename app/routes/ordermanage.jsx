import { loadOrderManage } from '../lib/order-and-bulk.server.js';
import OrderManage from '../pages/OrderManage.jsx';

export async function loader({ request }) {
  return loadOrderManage(request);
}

export default OrderManage;
