import { webhookAction } from '../lib/legacy-routes.server.js';

export async function action({ request }) {
  return webhookAction(request);
}
