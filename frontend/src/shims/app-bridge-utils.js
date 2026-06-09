import {
  authenticatedFetch as fetchWithSessionToken,
  getSessionToken as idToken,
} from "../utils/app_bridge";

export function getSessionToken() {
  return idToken();
}

export function authenticatedFetch() {
  return fetchWithSessionToken;
}
