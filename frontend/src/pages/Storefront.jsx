import { useState, useCallback } from 'react';
import { useAppBridge } from '../shims/app-bridge-react';
import { Redirect } from '../shims/app-bridge-actions';
import { authenticatedFetch } from '../shims/app-bridge-utils';
import { Page, Card, Layout, Link, List, Button, Spinner, BlockStack, Badge } from '../components/PolarisWeb';

import { _getShopFromQuery, _getAdminFromShop } from "../utils/my_util";

// Storefront API sample
// Read https://shopify.dev/docs/api/storefront
function Storefront() {
  const app = useAppBridge();
  const redirect = Redirect.create(app);

  const shop = _getShopFromQuery(window);

  const [result, setResult] = useState({});
  const [accessing, setAccessing] = useState(false);

  return (
    <Page title="Storefront API sample with Cart API, tokenless access, and Customer Account API">
      <BlockStack gap="500">
        <Card sectioned={true}>
          <Layout>
            <Layout.Section>
              <Link url="https://shopify.dev/docs/api/storefront/latest" target="_blank">Storefront API</Link><br />
              <Link url="https://shopify.dev/docs/api/customer/latest" target="_blank">Customer Account API</Link><br />
              <Link url="https://shopify.dev/docs/api/storefront/latest/mutations/cartCreate" target="_blank">cartCreate</Link>
            </Layout.Section>
            <Layout.Section>
              <List type="number">
                <List.Item>
                  <Button variant="primary" onClick={() => {
                    setAccessing(true);
                    authenticatedFetch(app)(`/storefront`).then((response) => {
                      response.json().then((json) => {
                        console.log(JSON.stringify(json, null, 4));
                        setAccessing(false);
                        setResult(json.result.response);
                      }).catch((e) => {
                        console.log(`${e}`);
                        setAccessing(false);
                        setResult({});
                      });
                    });
                  }}>
                    Prepare Storefront API access tokens
                  </Button>
                  <p><APIResult res={result} loading={accessing} /></p>
                  <List type="bullet">
                    <List.Item>
                      <Badge tone="info">Tokenless Storefront API</Badge> can run the cart sample without a Storefront access token.
                    </List.Item>
                    <List.Item>
                      <Badge tone="info">Public Storefront token</Badge> is still generated so the sample can compare tokenless and token-based browser calls.
                    </List.Item>
                    <List.Item>
                      <Badge tone="info">Private delegated token</Badge> is kept server-side only for the server-call comparison.
                    </List.Item>
                  </List>
                </List.Item>
                <List.Item>
                  Open the <Link onClick={() => {
                    redirect.dispatch(Redirect.Action.REMOTE, { url: `https://${window.location.hostname}/storefront?shop=${shop}&public_token=${result.public_token.accessToken}`, newContext: true });
                  }}>plain custom storefront page
                  </Link> using Cart API, tokenless access, and Customer Account API login.
                </List.Item>
              </List>
            </Layout.Section>
          </Layout>
        </Card>
      </BlockStack>
    </Page>
  );
}

function APIResult(props) {
  if (props.loading) {
    return <Spinner accessibilityLabel="Calling Order GraphQL" size="large" />;
  }
  return (<pre>{JSON.stringify(props.res, null, 4)}</pre>);
}

export default Storefront
