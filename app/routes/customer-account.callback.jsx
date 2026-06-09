import {
  completeCustomerAccountLogin,
  customerAccountCookie,
} from '../lib/customer-account.server.js';
import { redirect } from '../lib/http.server.js';

export async function loader({ request }) {
  const { returnTo, sessionId } = await completeCustomerAccountLogin(request);
  const response = redirect(returnTo);
  response.headers.append('Set-Cookie', customerAccountCookie(sessionId));
  return response;
}
