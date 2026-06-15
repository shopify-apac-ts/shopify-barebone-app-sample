export function logAppBridgeConfig() {
  if (typeof window === "undefined") return;

  const logConfig = () => {
    const config = window.shopify?.config;
    if (!config) return;

    console.info("Shopify App Bridge config", {
      apiKey: config.apiKey,
      appOrigins: config.appOrigins,
      host: config.host,
      shop: config.shop,
    });
  };

  if (document.readyState === "loading") {
    window.addEventListener("DOMContentLoaded", logConfig, { once: true });
    return;
  }

  logConfig();
}
