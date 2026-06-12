import { embeddedPageLoader } from '../lib/embedded.server.js';
import { createWebPixel } from '../lib/web-pixel.server.js';
import WebPixel from '../pages/WebPixel.jsx';

export async function loader({ request }) {
  return embeddedPageLoader({
    request,
    allowAuthenticatedFetch: true,
    handler: createWebPixel,
  });
}

export default WebPixel;
