import { mockLogin } from '../lib/legacy-routes.server.js';

export async function loader({ request }) {
  return mockLogin(request);
}
