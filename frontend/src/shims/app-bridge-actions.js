import { _getAdminFromShop, _getShopFromQuery } from "../utils/my_util";
import { appRedirect, remoteRedirect } from "../utils/app_bridge";

export const Redirect = {
  Action: {
    APP: "APP",
    REMOTE: "REMOTE",
    ADMIN_PATH: "ADMIN_PATH",
  },
  create() {
    return {
      dispatch(action, payload) {
        if (action === Redirect.Action.APP) {
          appRedirect(payload);
          return;
        }
        if (action === Redirect.Action.REMOTE) {
          if (typeof payload === "string") {
            remoteRedirect(payload);
          } else {
            remoteRedirect(payload.url, Boolean(payload.newContext));
          }
          return;
        }
        if (action === Redirect.Action.ADMIN_PATH) {
          const path = typeof payload === "string" ? payload : payload.path;
          const shop = _getShopFromQuery(window);
          const target = shop && path.startsWith("/")
            ? `https://${_getAdminFromShop(shop)}${path}`
            : path;
          remoteRedirect(target, Boolean(payload?.newContext));
        }
      },
    };
  },
};
