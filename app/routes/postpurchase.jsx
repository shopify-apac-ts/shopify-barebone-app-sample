import {
  handlePostPurchaseAction,
  preparePostPurchase,
} from '../lib/post-purchase.server.js';
import { embeddedPageLoader } from '../lib/embedded.server.js';
import PostPurchase from '../pages/PostPurchase.jsx';

export async function loader({ request }) {
  return embeddedPageLoader({
    request,
    allowAuthenticatedFetch: true,
    handler: preparePostPurchase,
  });
}

export async function action({ request }) {
  return handlePostPurchaseAction(request);
}

export default PostPurchase;
