import { embeddedPageLoader } from '../lib/embedded.server.js';
import CheckoutUi from '../pages/CheckoutUi.jsx';

export async function loader({ request }) {
  return embeddedPageLoader({ request });
}

export default CheckoutUi;
