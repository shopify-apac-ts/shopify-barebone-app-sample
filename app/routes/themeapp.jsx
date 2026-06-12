import { embeddedPageLoader } from '../lib/embedded.server.js';
import ThemeApp from '../pages/ThemeApp.jsx';

export async function loader({ request }) {
  return embeddedPageLoader({ request });
}

export default ThemeApp;
