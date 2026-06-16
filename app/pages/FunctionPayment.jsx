import { useState, useCallback } from 'react';
import { authenticatedJson } from "../utils/app-bridge";
import { getAdminFromShop, getShopFromLocation } from "../utils/shop";


// Shopify Functions for payment method sample
// Read https://shopify.dev/apps/checkout/payment-customizations
// This sample doesn't use Shopify given libraries for the app UX, create an extention manually. 
// Read https://shopify.dev/api/functions/reference/payment-customization
function FunctionPayment() {

  const shop = getShopFromLocation();

  const [method, setMethod] = useState('Cash on Delivery (COD)');
  const methodChange = useCallback((newMethod) => setMethod(newMethod), []);

  const [rate, setRate] = useState('Standard');
  const rateChange = useCallback((newRate) => setRate(newRate), []);

  const [id, setId] = useState('');
  const idChange = useCallback((newId) => setId(newId), []);

  const [result, setResult] = useState('');
  const [accessing, setAccessing] = useState(false);

  return (
    <s-page heading="Create your original payment method filtering with Shopify Functions">
      <s-stack direction="block" gap="large">
        <s-section>
          <s-stack direction="block" gap="base">
            <s-box>
              <s-link href="https://shopify.dev/api/functions/reference/payment-customization" target="_blank">Dev. doc</s-link>
            </s-box>
            <s-box>
              <s-ordered-list>
                <s-list-item>Input a <s-badge>payment method name</s-badge> which you want to show only, from <s-link href={`https://${shop}`} target="_blank">your checkout page</s-link> (note that the method name needs to be <b>the buyer facing one</b>, not admin).
                  <s-text-field label="Payment method name" labelAccessibilityVisibility="exclusive" value={method} onInput={(event) => methodChange(event.currentTarget.value)} placeholder="Example: Cash on Delivery (COD)"></s-text-field>
                </s-list-item>
                <s-list-item>Input a <s-badge>shipping rate name</s-badge> which buyers select when the payment method shows up above, from <s-link href={`https://${ getAdminFromShop(shop)}/settings/shipping`} target="_blank">shipping settings</s-link> or <s-link href={`https://${ getAdminFromShop(shop)}/orders`} target="_blank">past orders</s-link>
                  <s-text-field label="Shipping rate name" labelAccessibilityVisibility="exclusive" value={rate} onInput={(event) => rateChange(event.currentTarget.value)} placeholder="Example: Standard"></s-text-field>
                </s-list-item>
              </s-ordered-list>
            </s-box>
          </s-stack>
        </s-section>
        <s-section>
          <s-stack direction="block" gap="base">
            <s-box>
              <s-link href="https://shopify.dev/api/admin-graphql/2023-04/mutations/paymentCustomizationCreate" target="_blank">Dev. doc</s-link>
            </s-box>
            <s-box>
              <s-ordered-list>
                <s-list-item>
                  Input your <s-badge>Shopify Functions ID (uid)</s-badge> in <s-badge>extensions/my-function-payment-ext/shopify.extension.toml</s-badge> or <s-link href="https://shopify.dev/docs/api/admin-graphql/unstable/queries/shopifyFunctions" target="_blank">Shopify Functions Admin API</s-link>
                  <s-text-field label="Shopify Function ID" labelAccessibilityVisibility="exclusive" value={id} onInput={(event) => idChange(event.currentTarget.value)} placeholder="Example: db1fde78-bf9a-42ea-afb6-89f0edbb4797"></s-text-field>
                </s-list-item>
                <s-list-item>
                  <s-button variant="primary" onClick={() => {
                    setAccessing(true);
                    // Read https://shopify.dev/api/admin-graphql/2023-04/mutations/paymentCustomizationCreate"
                    authenticatedJson(`/functionpayment.json?method=${encodeURIComponent(method)}&rate=${encodeURIComponent(rate)}&id=${encodeURIComponent(id)}`).then((json) => {
                        console.log(JSON.stringify(json, null, 4));
                        setAccessing(false);
                        if (json.result.response.data.paymentCustomizationCreate.userErrors.length == 0) {
                          setResult('Success!');
                        } else {
                          setResult('Error!');
                        }
                    }).catch((e) => {
                        console.log(`${e}`);
                        setAccessing(false);
                        setResult('Error!');
                    });
                  }}>
                    Create your payment customization
                  </s-button>&nbsp;
                  <s-badge tone='info'>Result: <APIResult res={result} loading={accessing} /></s-badge>
                </s-list-item>
                <s-list-item>
                  Go to <s-link href={`https://${ getAdminFromShop(shop)}/settings/payments`} target="_blank">payment settings</s-link> to check if the customization is created and visit <s-link href={`https://${shop}`} target="_blank">your theme storefront</s-link> to see how your customization works with your selected shipping rate.
                </s-list-item>
              </s-ordered-list>
            </s-box>
          </s-stack>
        </s-section>
      </s-stack>
    </s-page>
  );
}

function APIResult(props) {
  if (props.loading) {
    return <s-spinner accessibilityLabel="Calling Order GraphQL"></s-spinner>;
  }
  return (<span>{props.res}</span>);
}

export default FunctionPayment
