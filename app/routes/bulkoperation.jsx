import { embeddedPageLoader, loadBulkOperation } from '../lib/legacy-routes.server.js';

export async function loader({ request }) {
  if (request.headers.has('authorization')) {
    return loadBulkOperation(request);
  }
  return embeddedPageLoader({ request });
}
