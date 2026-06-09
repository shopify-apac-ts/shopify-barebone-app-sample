import { shopifyGlobal } from "../utils/app_bridge";

export function useAppBridge() {
  return shopifyGlobal();
}

export function Provider({ children }) {
  return children;
}

export function NavigationMenu({ navigationLinks = [] }) {
  if (typeof document !== "undefined" && !document.querySelector("ui-nav-menu")) {
    const nav = document.createElement("ui-nav-menu");
    navigationLinks.forEach((link) => {
      const anchor = document.createElement("a");
      anchor.href = link.destination;
      anchor.textContent = link.label;
      nav.appendChild(anchor);
    });
    document.body.prepend(nav);
  }
  return null;
}

export function TitleBar({ title }) {
  if (typeof document !== "undefined" && !document.querySelector("ui-title-bar")) {
    const titleBar = document.createElement("ui-title-bar");
    titleBar.setAttribute("title", title);
    document.body.prepend(titleBar);
  }
  return null;
}
