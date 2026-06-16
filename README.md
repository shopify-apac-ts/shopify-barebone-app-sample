# Overview
This is _unofficial_ sample code for scratch building a [Shopify app](https://shopify.dev/apps) _without_ [CLI automatic code generation](https://shopify.dev/apps/getting-started/create) for learning how it works with simple React Router, React, Polaris web components, App Bridge, and GraphQL knowledge.

Making clear, simple, and fewest code is this purpose that's why it doesn't use the CLI generated code.

Reading [Shopify OAuth flow](https://shopify.dev/apps/auth/oauth/getting-started) might help you to grab the basic.

For quick start with automatically generated code, go to the [official CLI tutorial](https://shopify.dev/apps/getting-started/build-app-example).

# Code structure
```
--------- Backend process in a server (Node.js) ---------
app/ ... React Router route modules, UI pages written directly with Polaris and App Bridge web components, and server helpers for OAuth, session token validation, Storefront API, Customer Account API, GraphQL calls, and DB access. No Express wrapper and no Shopify CLI generated app template are used.

  ./root.jsx ... React Router HTML shell that loads App Bridge and Polaris web components from Shopify CDN.
  ./AppShell.jsx ... Embedded app shell using App Bridge web components for the title bar and app navigation. This is the React Router layout route's default export, so the App Bridge navigation is present in both SSR HTML and the client route bundle. The app navigation uses `<s-app-nav>` with plain anchor children so Shopify Admin can register the sidebar menu while page content continues to use Polaris `<s-*>` web components directly.
  ./routes/ ... HTTP entry points. Each route is intentionally thin and points to one Shopify sample concept. Embedded HTML routes export headers from `app/lib/http.server.js` so Shopify iframe protection is applied. Routes ending in `.json` are resource routes for authenticated App Bridge fetches, keeping UI pages and JSON API responses separate.
  ./pages/ ... Embedded app UI pages rendered by React Router with Polaris web components used directly in each page.
  ./lib/ ... Server-side Shopify API helpers, grouped by learning topic.
  ./utils/ ... Browser-side App Bridge and URL helpers used by UI pages.
  ./assets/ ... Static source assets imported by route modules.

views/ ... holds the plain custom storefront HTML sample.
  ./storefront.html ... plain custom storefront sample using Storefront API Cart API, tokenless access, and Customer Account API.

package.json ... pnpm scripts for building with React Router and serving the built server bundle with `react-router-serve`.

--------- Extensions with Shopify CLI generation and deployment (Liquid/React/JavaScript/Wasm, etc.) ---------
extensions/ ... automatically generated directory and code by Shopify CLI `shopify app generate extension`.

  ./my-XXXXX-ext ... each extension (Theme App / Shopify Functions / Checkout UI / Post-purchase / Web Pixels /... etc.) source.
    ../shopify.extension.toml ... each extension configuration required by CLI commands.
```

[React Router](https://reactrouter.com/), [React](https://react.dev/) ([JSX](https://react.dev/learn/writing-markup-with-jsx), [Props](https://react.dev/learn/passing-props-to-a-component), [State](https://react.dev/learn/state-a-components-memory), [Hooks](https://react.dev/reference/react/hooks), etc.) and [GraphQL](https://graphql.org/) ([Query](https://graphql.org/learn/queries/), [Edges](https://graphql.org/learn/pagination/#pagination-and-edges), [Union](https://graphql.org/learn/schema/#union-types), etc.) are mandatory technologies for manipulating this sample.


For creating the embedded app UI, the following contents might help you.
- [App Bridge APIs](https://shopify.dev/docs/api/app-home)
- [Polaris web components](https://shopify.dev/docs/api/app-home/web-components)

For extensions like Theme App Extensinons, Shopify Functions, and Checkout UI Extensions, refer to the [App extensions](https://shopify.dev/docs/apps/build/app-extensions) and [List of app extensions](https://shopify.dev/docs/apps/build/app-extensions/list-of-app-extensions).

# Where to start reading
If you are new to this sample, start from these files instead of reading the repository from top to bottom.

- Embedded admin UI: start with `app/root.jsx`. This file loads App Bridge and Polaris web components from Shopify CDN, so pages can use tags like `<s-page>` and `<s-button>` directly. Then read `app/AppShell.jsx` for the App Bridge title bar and Shopify Admin sidebar navigation, and `app/pages/Index.jsx` for the first embedded UI screen.
- OAuth and embedded app entry: read `app/routes/index.jsx` and `app/routes/auth.jsx` first. `index.jsx` reuses the auth loader, and `auth.jsx` verifies embedded requests, checks installation state, applies Shopify iframe protection, and starts OAuth when the shop has not installed the app yet. Continue to `app/routes/auth.callback.jsx` and `app/lib/oauth.server.js` to see the access token exchange and storage flow.
- Server-side sample endpoints: read the thin route modules under `app/routes/` together with the matching topic helpers under `app/lib/`. UI routes such as `app/routes/storefront.jsx` render embedded pages or standalone HTML, while matching resource routes such as `app/routes/storefront-json.jsx` return JSON for authenticated App Bridge fetches. `app/routes/sessiontoken.jsx` points to session token validation helpers.
- Browser-side App Bridge helpers: read `app/utils/app-bridge.js` for ID token retrieval, authenticated fetches, embedded navigation, and external tab handling used by the admin UI pages.
- Iframe protection: read `app/lib/http.server.js`, `app/lib/embedded.server.js`, and `app/lib/shopify-auth.server.js`. Embedded HTML pages return a shop-specific `Content-Security-Policy: frame-ancestors https://{shop} https://admin.shopify.com;` header, while standalone HTML pages use `frame-ancestors 'none';`.
- Checkout, customer account, POS, web pixel, theme, and function customizations: read the matching directories under `extensions/`. These are deployed by Shopify CLI, even though the main app server is hand-written with React Router.
- Plain custom storefront sample: read `views/storefront.html` after `app/routes/storefront.jsx` if you want to follow Cart API, tokenless Storefront API access, and Customer Account API login outside the embedded admin UI.

# How to run
0. Create your Shopify partner account from [here](https://www.shopify.com/partners) and create a Shopify app **manually** (not choosing Shopify CLI) in the app menu of [your dev. dashboard](https://dev.shopify.com/dashboard). Also, [create a development store](https://shopify.dev/docs/api/development-stores#create-a-development-store-to-test-your-app) to install this app too. If you want to customize this sample code, don't forget to clone (fork) this repository to make your own one.

1. Decide if you run this app locally **or** in cloud hosting serivces like [Render](https://render.com/), [Fly.io](https://fly.io/), [Heroku](https://www.heroku.com/), and [AWS EC2](https://aws.amazon.com/), etc. If you run it locally, you need to use network tunneling tool like [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/) because your app server url (described as `YOUR_APP_URL` below) needs to be **public**, not localhost directly, so you need to bind your localhost to a public URL. If your company **blocks network tunneling**, you have to choose a cloud hosting serivce. This app has no limtation of hosting serivce choise, but [Render](https://render.com/) is recommneded as they provide free plan, and just conneting a [GitHub repository](../../../shopify-barebone-app-sample) enables you to create a web service, and [Shopify CLI app hosting](https://render.com/docs/deploy-shopify-app) is supported natively with the Docker file.

2. Add the following environmental variables locally (export in the terminal) where you develop this sample app. Add the same variables in the cloud hosting service (in environmental variable settings) if you chose it as the running place.
    ```
    SHOPIFY_API_KEY:              YOUR_API_KEY (Copy and paste from your app settings in partner dashboard)
    SHOPIFY_API_SECRET:           YOUR_API_SECRET (Copy and paste from your app settings in partner dashboard)
    SHOPIFY_API_VERSION:          2026-04
    SHOPIFY_SCOPES:               Optional. Comma-separated Admin API scopes. If omitted, the sample uses the same default scopes as the included shopify.app.toml file.
    SHOPIFY_APP_URL:              YOUR_APP_URL. Recommended on hosted environments like Render so OAuth and Customer Account API callback URLs use the public HTTPS origin.

    // Required for the Storefront API sample's Customer Account API login flow.
    SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_ID: YOUR_CUSTOMER_ACCOUNT_API_CLIENT_ID

    SHOPIFY_DB_TYPE:              MONGODB (Default) / POSTGRESQL / MYSQL

    // The followings are required if you set SHOPIFY_DB_TYPE 'MONGODB'
    SHOPIFY_MONGO_DB_NAME:        YOUR_DB_NAME (any name is OK)
    SHOPIFY_MONGO_URL:            mongodb://YOUR_USER:YOUR_PASSWORD@YOUR_DOMAIN:YOUR_PORT/YOUR_DB_NAME

    // The followings are required if you set SHOPIFY_DB_TYPE 'POSTGRESQL'
    SHOPIFY_POSTGRESQL_URL:       postgres://YOUR_USER:YOUR_PASSWORD@YOUR_DOMAIN(:YOUR_PORT)/YOUR_DB_NAME

    // The followings are required if you set SHOPIFY_DB_TYPE 'MYSQL'
    SHOPIFY_MYSQL_HOST:           YOUR_DOMAIN
    SHOPIFY_MYSQL_USER:           YOUR_USER
    SHOPIFY_MYSQL_PASSWORD:       YOUR_PASSWORD
    SHOPIFY_MYSQL_DATABASE:       YOUR_DB_NAME

    // The followings are required if you use `webhookcommon` endpoint as a manually created webhook target.
    SHOPIFY_WEBHOOK_SECRET:       YOUR_TEST_STORE_WEBHOOK_SIGNATURE given by the webhook creation settings

    ```

3.  If you run it locally, run the following build command (`pnpm install && pnpm run build`). If you use cloud hosting (e.g. Render), use `pnpm install --prod=false` instead to ensure devDependencies (for example React Router's Vite build tooling) are installed even when `NODE_ENV=production`. You can see the details of command definition in `package.json`.
    Use Node.js 20.19.0 or later because the React Router and Vite toolchain require it.
    ```
    Build command (local)  = pnpm install && pnpm run build
    Build command (Render) = pnpm install --prod=false && pnpm run build

    Start command = pnpm run start (= react-router-serve ./build/server/index.js)
    ```

4. If you run it locally, install a network tunneling tool like [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/) and bind your localhost to their provided public URL. If you use cloud hosting, skip this step.
    ```
    `cloudflared tunnel --url localhost:3000` => This provides a dynamic URL like a "https://*********.trycloudflare.com" poiting your localhost to be used for `YOUR_APP_URL` below.
    ```

5. If you use PostgreSQL or MySQL, create the following table in your database (in `psql` or `mysql` command or other tools).
    ```
    For PostgreSQL:

    CREATE TABLE shops ( _id VARCHAR NOT NULL PRIMARY KEY, data json NOT NULL, created_at TIMESTAMP NOT NULL, updated_at TIMESTAMP NOT NULL );

    For MySQL:

    CREATE TABLE shops ( _id VARCHAR(500) NOT NULL PRIMARY KEY, data JSON NOT NULL, created_at TIMESTAMP NOT NULL, updated_at TIMESTAMP NOT NULL );

    ```

6. Create `shopify.app.toml` file in the root directory copied from [this page](https://shopify.dev/docs/apps/tools/cli/configuration) and replace each value as follows.
    - _name_ = `YOUR_APP_NAME`
    - _client_id_ = `SHOPIFY_API_KEY`
    - _application_url_ = `YOUR_APP_URL` (***1**)
    - _handle_ = `YOUR_APP_HANDLE` (In general, lowercase letters of the app name replacing '_' with '-' used for admin URL path for the app and toml file name for multiple app hanlding)
    - _scopes in [access_scopes]_ = "write_app_proxy,write_products,write_discounts,write_orders,write_payment_customizations,write_delivery_customizations,write_pixels,read_customer_events,write_customers,write_assigned_fulfillment_orders,write_merchant_managed_fulfillment_orders,write_third_party_fulfillment_orders,write_fulfillments,write_inventory,unauthenticated_read_product_listings,unauthenticated_read_selling_plans,read_locations"
    - _redirect_urls in [auth]_ = [`YOUR_APP_URL/callback`]
    - _api_version in [webhooks]_ = `SHOPIFY_API_VERSION`
    - _uri in [webhooks.subscriptions]_ = `/webhookgdpr`
    - _url in [app_proxy]_ = `YOUR_APP_URL/appproxy`
    - _subpath in [app_proxy]_ = "bareboneproxy"
    - _prefix in [app_proxy]_ = "apps"
    - _url in [app_preferences]_ = `YOUR_APP_URL`

    ***1** `YOUR_APP_URL` is your network tunneling tool or cloud hosting service's `root` URL. If you add `?external=true` parameter to `YOUR_APP_URL`, the app UX turns into a [service connector](../../../shopify-barebone-app-sample/wiki#for-external-service-connection) which connects Shopify stores with the external dummy serivce. **Note that if you disable the app embedded (non embedeed app), App Bridge and its Session Token cannot be used so this app shows the same external page using its own JWT which contains "shop", instead of Session Token.** (See [this demo](../../../shopify-barebone-app-sample/wiki#non-embedded-apps-cannot-use-app-bridge-or-session-token-so-should-render-the-external-page-with-your-own-jwt))

7. Install [Shopify CLI](https://shopify.dev/docs/api/shopify-cli) and execute `shopify app deploy` and follow its instruction (choose your partner account, connecting to the exising app, include your configuration on deploy = YES, etc.) which registers extensions to your app. For [Shopify Functions](https://shopify.dev/api/functions) deployment using [Rust](https://www.rust-lang.org/), you need to install [Cargo](https://doc.rust-lang.org/cargo/) Wasm package before executing `shopify app deploy` by `cargo install cargo-wasi`.
    If you see the **Cargo specific error** for function build (this typically happens in old Rust environment), try the following commands.
    ```
    rustup target remove wasm32-wasi

    rustup update

    rustup target add wasm32-wasip1
    ```

8. Go to the app `API access` in your partner dashboard (not dev. dashboard) to `Allow network access`. => This is required for [using fetch() in Checkout UI Extensions](../../../shopify-barebone-app-sample/blob/main/extensions/my-checkout-ui-ext/src/Upsell.jsx). 

9. Go to the app `Distribution` in your partner dashboard (not dev. dashboard) to select `Public` or `Custom` (if you selected the custom app, use your development store domain for the link). => This is required for [using useShippingAddress() in Checkout UI Extensions](../../../shopify-barebone-app-sample/blob/main/extensions/my-checkout-ui-ext/src/Review.jsx). 

10. If you run it locally, execute the start command (`pnpm run start`). If you use cloud hosting, specify the start command in the appropriate settings or run it directly. Accessing `YOUR_APP_URL` from the browser shows `Bad request` message, but this is expected. Make sure if no other errors happen like 404 / 500.

# How to install
Access to the following endpoit.
`https://SHOPIFY_SHOP_DOMAIN/admin/oauth/authorize?client_id=YOUR_API_KEY&redirect_uri=YOUR_APP_URL/callback&state=&grant_options[]=`

Or 

you can install to your development stores from the app home `Install app` button in [dev. dashboard](https://dev.shopify.com/dashboard).

# How to update
- For app UI or server-side updates (`app/` or `views`), run the build command (`pnpm run build`) and start command (`pnpm run start`) again. Some cloud services like Render enable it with `git commit & git push`.
- If you change the value of `SHOPIFY_API_KEY`, you need to build again because `app/root.jsx` writes it into the App Bridge meta tag. Some cloud services like Render enable it with `git commit & git push`.
- If you change `SHOPIFY_API_KEY` or switch the app connected to this source code, the OAuth access tokens already stored in the `shops` DB collection belong to the previous app client. Reload the embedded app so OAuth runs again and stores a fresh token for the current app. A Shopify Admin GraphQL 401 with `Invalid API key or access token` usually means the DB returned a stored token, but Shopify rejected that token; it is not the same symptom as a missing MongoDB connection.
- For extension update (`extensions`), run `shopify app deploy` again. This needs to be done in your local (development) PC, not in the cloud hosting service.  If you change the value of `SHOPIFY_API_KEY`, you need to deploy again with the toml file updated as described below.
- For adding a new extension under `extensions`, run `shopify app generate extension` to choose your prefered one with a template. 

# Sample list
All sample are available at [Wiki](../../wiki).

# TIPS
- If you want to create other language versions of this app like PHP, Java, Ruby, Python, etc., the best way is [creating an extension-only app](https://shopify.dev/docs/apps/app-extensions/extension-only-apps) by **not choosing a Remix template in CLI steps** to add your server side code manually. 
- If you fail to get [protected customer data](https://shopify.dev/docs/apps/store/data-protection/protected-customer-data) in Checkout UI Extension or API Webhook creation even in dev. stores, submit your app first which enable you get them (this is for `public app distribution` only).
- If you update some environment variables shared with `shopify.app.toml` (e.g. `SHOPIFY_API_KEY`), change the coressponding value in the file to run `shopify app deploy` to apply the change to the app configration in partner dashboard (if you change other toml file values, do the same).
- If you manage **multiple apps in this single source code** and swtich the target app, follow the steps below.
    1. Change the environment variables of `SHOPIFY_API_KEY` and `SHOPIFY_API_SECRET` and apply them (export).
    2. Execute `shopify app deploy --reset` and choose the target app (it is supposed to be created manually).
    3. Enter the new toml file name (use `YOUR_APP_HANDLE`) or leave blank for the app.
    4. The new toml file gets generated for the new app with the current config values in partner dashboard.
    5. Remember to replace `scopes in [auth]` with the same value as the original toml file which must be blank by default.
- [Checkout UI Extension Integration Deep Dive](../../wiki/Checkout-UI-Extension-Integration-Deep-Dive) (Japanese version is [here](../../wiki/Checkout-UI-Extension-%E5%AE%9F%E8%A3%85%E8%A9%B3%E7%B4%B0)) help you to understand how the extension work deeply and avoid some pitfalls.

# Disclaimer
- This code is fully _unofficial_ and NOT guaranteed to pass [the public app review](https://shopify.dev/apps/store/review) for Shopify app store. The official requirements are described [here](https://shopify.dev/apps/store/requirements). 
- You need to follow [Shopi API Licene and Terms of Use](https://www.shopify.com/legal/api-terms) even for custom app usage.
- This code is supposed to be used as tutorials mainly for catching up Shopify app dev and does **NOT** guarantees all security covered like [this consideration](https://shopify.dev/docs/api/checkout-ui-extensions/unstable/configuration#network-access). If you use this code for your production, **all resposibilties are owned by you**.
