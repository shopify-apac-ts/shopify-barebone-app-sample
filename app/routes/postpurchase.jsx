import {
  embeddedPageLoader,
  handlePostPurchaseAction,
  preparePostPurchase,
} from '../lib/legacy-routes.server.js';

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
