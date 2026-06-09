import { useEffect, useSyncExternalStore } from "react";

import Index from './pages/Index';
import SessionToken from './pages/SessionToken';
import AdminLink from './pages/AdminLink';
import ThemeApp from './pages/ThemeApp';
import FunctionDiscount from './pages/FunctionDiscount';
import FunctionShipping from './pages/FunctionShipping';
import FunctionPayment from './pages/FunctionPayment';
import WebPixel from './pages/WebPixel';
import PostPurchase from './pages/PostPurchase';
import CheckoutUi from './pages/CheckoutUi';
import OrderManage from './pages/OrderManage';
import BulkOperation from './pages/BulkOperation';
import Storefront from './pages/Storefront';
import { setupAppBridgeChrome } from "./utils/app_bridge";

import "./styles.css";

const routes = {
  "/": Index,
  "/sessiontoken": SessionToken,
  "/adminlink": AdminLink,
  "/themeapp": ThemeApp,
  "/functiondiscount": FunctionDiscount,
  "/functionshipping": FunctionShipping,
  "/functionpayment": FunctionPayment,
  "/webpixel": WebPixel,
  "/postpurchase": PostPurchase,
  "/checkoutui": CheckoutUi,
  "/ordermanage": OrderManage,
  "/bulkoperation": BulkOperation,
  "/storefront": Storefront,
};

function subscribe(callback) {
  window.addEventListener("popstate", callback);
  return () => window.removeEventListener("popstate", callback);
}

function getPathname() {
  return window.location.pathname;
}

function App() {
  const pathname = useSyncExternalStore(subscribe, getPathname, () => "/");
  const Component = routes[pathname] || Index;

  useEffect(() => {
    setupAppBridgeChrome();
  }, []);

  return <Component />;
}

export default App;
