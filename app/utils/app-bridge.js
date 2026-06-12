import jwt_decode from "jwt-decode";
import { getAdminFromShop, getShopFromLocation } from "./shop.js";

export function useAppBridge() {
  return typeof window === "undefined" ? undefined : window.shopify;
}

export async function getSessionToken() {
  const shopify = useAppBridge();
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

export async function openRemote(url, newContext = false) {
  const shopify = useAppBridge();
  if (shopify?.open) {
    await shopify.open(url, newContext ? undefined : "_self");
    return;
  }
  window.location.assign(url);
}

export function navigateApp(path) {
  window.location.assign(path);
}

export function navigateAdmin(path, newContext = true) {
  const shop = getShopFromLocation();
  const target = shop && path.startsWith("/")
    ? `https://${getAdminFromShop(shop)}${path}`
    : path;
  return openRemote(target, newContext);
}

export function decodeSessionToken(sessionToken) {
  return jwt_decode(sessionToken);
}

export const RedirectAction = {
  APP: "APP",
  REMOTE: "REMOTE",
  ADMIN_PATH: "ADMIN_PATH",
};

export function createRedirect() {
  return {
    dispatch(action, payload) {
      if (action === RedirectAction.APP) {
        navigateApp(payload);
        return;
      }
      if (action === RedirectAction.REMOTE) {
        if (typeof payload === "string") {
          openRemote(payload);
        } else {
          openRemote(payload.url, Boolean(payload.newContext));
        }
        return;
      }
      if (action === RedirectAction.ADMIN_PATH) {
        const path = typeof payload === "string" ? payload : payload.path;
        navigateAdmin(path, Boolean(payload?.newContext));
      }
    },
  };
}
