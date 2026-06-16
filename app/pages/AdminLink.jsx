import { useEffect, useState } from 'react';
import { authenticatedFetch, createRedirect, RedirectAction } from "../utils/app-bridge";
import { getAdminFromShop, getCurrentUrlWithoutQuery, getQueryParam, getShopFromLocation } from "../utils/shop";


// Admin link sample with App Bridge redirection
// Read https://shopify.dev/apps/tools/app-bridge/getting-started/app-setup
// Read https://shopify.dev/apps/app-extensions/getting-started#add-an-admin-link
function AdminLink() {
    const redirect = createRedirect();
    const [pageContext, setPageContext] = useState({
        ready: false,
        id: null,
        rawUrl: '',
        shop: '',
    });
    const [res, setRes] = useState('');

    useEffect(() => {
        setPageContext({
            ready: true,
            id: getQueryParam("id"),
            rawUrl: getCurrentUrlWithoutQuery(),
            shop: getShopFromLocation(),
        });
    }, []);

    const { ready, id, rawUrl, shop } = pageContext;

    useEffect(() => {
        if (!id) {
            setRes('');
            return undefined;
        }

        let cancelled = false;
        setRes('');

        authenticatedFetch(`/adminlink.json?id=${encodeURIComponent(id)}`).then(async (response) => {
            const text = await response.text();
            const contentType = response.headers.get('content-type') || 'unknown content type';
            if (!response.ok) {
                throw new Error(`Admin Link API failed ${response.status}: ${text.slice(0, 1000)}`);
            }

            let json;
            try {
                json = JSON.parse(text);
            } catch (error) {
                throw new Error(`Admin Link API returned ${contentType}, not JSON: ${text.slice(0, 1000)}`);
            }

            console.log(JSON.stringify(json, null, 4));
            if (!cancelled) setRes(JSON.stringify(json.result, null, 4));
        }).catch((error) => {
            console.log(`${error}`);
            if (!cancelled) setRes(`${error}`);
        });

        return () => {
            cancelled = true;
        };
    }, [id]);

    if (!ready) {
        return (
            <s-page heading="Admin Link">
                <s-spinner accessibilityLabel="Loading Admin Link"></s-spinner>
            </s-page>
        );
    }

    // This query parameter is supposed to be given by Admin Link extensions.
    // Supposed to be shown from the linked page like a order details.
    if (id != null) {
        return (
            <s-page heading="You seem to have come through Admin Link!">
                <s-stack direction="block" gap="base">
                    <s-box>
                        <s-heading>Your selected data id: <s-badge tone='info'>{id}</s-badge></s-heading>
                        <s-text>
                            <s-link href="#" onClick={(event) => {
                                event.preventDefault();
                                redirect.dispatch(RedirectAction.APP, '/adminlink');
                            }}>
                                Go back
                            </s-link>
                        </s-text>
                    </s-box>
                    <s-box>
                        <s-badge tone="warning">If you come from a <b>product detail page</b>, you must see the following GraphQL response for the given id</s-badge>
                    </s-box>
                    <s-box>
                        <s-section>
                            <APIResult res={res} />
                        </s-section>
                    </s-box>
                </s-stack>
            </s-page>
        );
    }

    return (
        <s-page heading="Switch the request hanlding for embedded or unembedded.">
            <s-stack direction="block" gap="large">
                <s-section>
                    <s-unordered-list>
                        <s-list-item>
                            This app endpoints (menus) accept embedded requests only with the parameter <s-badge tone="info">embedded</s-badge> = 1 to be protected by <s-link href="https://shopify.dev/apps/auth/oauth/getting-started#step-2-verify-the-installation-request" target="_blank">hmac signature verification</s-link>,
                            but this page accepts unembedded ones supposed to be <b>accessed outside Shopify to be protected by Shopify login</b> of <s-link href="https://shopify.dev/apps/tools/app-bridge/getting-started/app-setup#initialize-shopify-app-bridge-in-your-app" target="_blank">App Bridge force redirection</s-link> (<s-badge tone="info">forceRedirect: true</s-badge>).
                        </s-list-item>
                        <s-list-item>
                            Copy <s-badge>{`${rawUrl}?shop=${shop}`}</s-badge> to another browser in which you are not logged in to check if the page gets redirected to Shopify login (Disclaimer: the initial page should be blank for production).
                        </s-list-item>
                    </s-unordered-list>
                </s-section>
                <s-section>
                    <s-unordered-list>
                        <s-list-item>
                            Check if <s-badge>app://adminlink</s-badge> is added in the admin extension link setting in <s-badge>extensions/my-admin-link-product-details/shopify.extension.toml</s-badge> file
                            for <s-link href={`https://${ getAdminFromShop(shop)}/products`} target="_blank">product details</s-link>.
                        </s-list-item>
                        <s-list-item>
                            Once you click your extension label in <s-badge tone="info">More actions</s-badge> in your selected product details, this page shows up again in a diffrent UI checking if the <s-badge tone="info">id</s-badge> parameter is given or not.
                        </s-list-item>
                    </s-unordered-list>
                </s-section>
            </s-stack>
        </s-page>
    );
}

function APIResult(props) {
    if (props.res === '') {
        return <s-spinner accessibilityLabel="Calling Order GraphQL"></s-spinner>;
    }
    return (<pre>{props.res}</pre>);
}

export default AdminLink
