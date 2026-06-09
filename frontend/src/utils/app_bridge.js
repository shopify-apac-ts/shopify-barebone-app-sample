import jwt_decode from "jwt-decode";
import { _getAdminFromShop, _getShopFromQuery } from "./my_util";

export function shopifyGlobal() {
  return window.shopify;
}

export async function getSessionToken() {
  const shopify = shopifyGlobal();
  if (shopify?.idToken) return shopify.idToken();
  throw new Error("App Bridge idToken API is not available.");
}

export async function authenticatedFetch(url, options = {}) {
  const token = await getSessionToken();
  return fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function remoteRedirect(url, newContext = false) {
  const shopify = shopifyGlobal();
  if (shopify?.open && newContext) {
    await shopify.open(url);
    return;
  }
  if (shopify?.open) {
    await shopify.open(url, '_self');
    return;
  }
  window.location.assign(url);
}

export function appRedirect(path) {
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

export function setupAppBridgeChrome() {
  const shopify = shopifyGlobal();
  if (!shopify) return;

  const links = [
    ["Session Token", "/sessiontoken"],
    ["Admin Link", "/adminlink"],
    ["Theme App Extension", "/themeapp"],
    ["Function Discount", "/functiondiscount"],
    ["Function Shipping", "/functionshipping"],
    ["Function Payment", "/functionpayment"],
    ["Web Pixel", "/webpixel"],
    ["Post-purchase", "/postpurchase"],
    ["Checkout UI", "/checkoutui"],
    ["Order management", "/ordermanage"],
    ["Bulk Operation", "/bulkoperation"],
    ["Storefront API", "/storefront"],
    ["POS", "/pos"],
  ];

  if (!document.querySelector("ui-nav-menu")) {
    const nav = document.createElement("ui-nav-menu");
    links.forEach(([label, href]) => {
      const anchor = document.createElement("a");
      anchor.href = href;
      anchor.textContent = label;
      nav.appendChild(anchor);
    });
    document.body.prepend(nav);
  }

  if (!document.querySelector("ui-title-bar")) {
    const titleBar = document.createElement("ui-title-bar");
    titleBar.setAttribute("title", "Welcome to my barebone app");
    document.body.prepend(titleBar);
  }
}

export function getShopForAppBridge() {
  const params = new URLSearchParams(window.location.search);
  const host = params.get("host");
  if (host) return host;
  const shop = _getShopFromQuery(window);
  return shop ? window.btoa(_getAdminFromShop(shop)).replace(/=/g, "") : "";
}

export function decodeSessionToken(sessionToken) {
  return jwt_decode(sessionToken);
}
