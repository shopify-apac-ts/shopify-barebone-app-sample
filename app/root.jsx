import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from 'react-router';
import styles from './styles.css?url';
import { API_KEY } from './lib/env.server.js';
import { logAppBridgeConfig } from './utils/app-bridge-diagnostics.js';

export const links = () => [{ rel: 'stylesheet', href: styles }];

export const clientLoader = () => {
  logAppBridgeConfig();
  return null;
};

export function loader() {
  return { apiKey: API_KEY || '' };
}

export function Layout({ children }) {
  const { apiKey } = useLoaderData() || {};
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="shopify-api-key" content={apiKey || ''} />
        <Meta />
        <Links />
        <script src="https://cdn.shopify.com/shopifycloud/app-bridge.js"></script>
        <script src="https://cdn.shopify.com/shopifycloud/polaris.js"></script>
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
