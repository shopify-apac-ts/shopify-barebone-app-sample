import { v4 as uuidv4 } from 'uuid';
import {
  decodeSessionToken,
  decodeAppJwt,
  getAdminFromShop,
  verifyAppProxySignature,
  verifyShopifyHmac,
  verifyWebhookHmac,
  createAppJwt,
} from './shopify-auth.server.js';
import { renderEmbeddedApp, json } from './http.server.js';
import { requireAuthenticatedShop } from './session-token.server.js';
import { callAdminGraphql } from './shopify-graphql.server.js';

export async function embeddedPageLoader({ request, allowAuthenticatedFetch = false, handler = null }) {
  if (allowAuthenticatedFetch && request.headers.has('authorization')) {
    const context = await requireAuthenticatedShop(request);
    if (!context.ok) return json(context.response, { status: context.status });
    if (handler) return handler(request, context);
    return json({
      result: {
        message: 'Successfully authorized!',
        response: {},
      },
    });
  }

  const url = new URL(request.url);
  if (!verifyShopifyHmac(url.searchParams)) {
    return new Response('HMAC verification failed', { status: 400 });
  }
  const shop = url.searchParams.get('shop');
  if (!shop) return new Response('Missing shop', { status: 400 });
  return renderEmbeddedApp(request, shop);
}

export async function authenticatedEndpoint(request, handler) {
  const context = await requireAuthenticatedShop(request);
  if (!context.ok) return json(context.response, { status: context.status });
  return handler(context);
}

export async function loadAdminLink(request, context) {
  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  let response = {};
  if (id) {
    response = await callAdminGraphql(context.shop, `query AdminLinkedProduct($id: ID!) {
      product(id: $id) {
        id
        handle
        title
        onlineStoreUrl
        priceRangeV2 {
          maxVariantPrice {
            amount
            currencyCode
          }
          minVariantPrice {
            amount
            currencyCode
          }
        }
        variants(first: 10) {
          edges {
            node {
              id
              title
              price
            }
          }
        }
      }
    }`, { id: `gid://shopify/Product/${id}` });
  }

  return json({
    result: {
      message: '',
      response,
    },
  });
}

export async function createFunctionDiscount(request, context) {
  const url = new URL(request.url);
  const meta = url.searchParams.get('meta') || '';
  const id = url.searchParams.get('id');
  const [namespace, key] = meta.split('.');
  const response = await callAdminGraphql(context.shop, `mutation DiscountAutomaticAppCreate($automaticAppDiscount: DiscountAutomaticAppInput!) {
    discountAutomaticAppCreate(automaticAppDiscount: $automaticAppDiscount) {
      automaticAppDiscount {
        appDiscountType {
          functionId
          targetType
        }
        discountClass
        discountId
        title
        startsAt
      }
      userErrors {
        field
        message
      }
    }
  }`, {
    automaticAppDiscount: {
      combinesWith: {
        orderDiscounts: true,
        productDiscounts: true,
        shippingDiscounts: true,
      },
      functionId: id,
      metafields: [
        {
          key: 'customer_meta',
          namespace: 'barebone_app_function_discount',
          type: 'json',
          value: JSON.stringify({ namespace, key }),
        },
      ],
      startsAt: new Date().toISOString(),
      title: `Barebone App Function Discount - ${new Date().toISOString()}`,
    },
  });
  return apiJson(response);
}

export async function createDeliveryCustomization(request, context) {
  const url = new URL(request.url);
  const response = await callAdminGraphql(context.shop, `mutation DeliveryCustomizationCreate($deliveryCustomization: DeliveryCustomizationInput!) {
    deliveryCustomizationCreate(deliveryCustomization: $deliveryCustomization) {
      deliveryCustomization {
        enabled
        id
        functionId
        title
        metafields(first: 10) {
          edges {
            node {
              namespace
              key
              value
            }
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }`, {
    deliveryCustomization: {
      enabled: true,
      functionId: url.searchParams.get('id'),
      metafields: [
        {
          key: 'filter',
          namespace: 'barebone_app_function_shipping',
          type: 'json',
          value: JSON.stringify({
            rate: url.searchParams.get('rate'),
            zip: url.searchParams.get('zip'),
          }),
        },
      ],
      title: 'Barebone App Function Shipping',
    },
  });
  return apiJson(response);
}

export async function createPaymentCustomization(request, context) {
  const url = new URL(request.url);
  const response = await callAdminGraphql(context.shop, `mutation PaymentCustomizationCreate($paymentCustomization: PaymentCustomizationInput!) {
    paymentCustomizationCreate(paymentCustomization: $paymentCustomization) {
      paymentCustomization {
        enabled
        id
        functionId
        title
        metafields(first: 10) {
          edges {
            node {
              namespace
              key
              value
            }
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }`, {
    paymentCustomization: {
      enabled: true,
      functionId: url.searchParams.get('id'),
      metafields: [
        {
          key: 'filter',
          namespace: 'barebone_app_function_payment',
          type: 'json',
          value: JSON.stringify({
            method: url.searchParams.get('method'),
            rate: url.searchParams.get('rate'),
          }),
        },
      ],
      title: 'Barebone App Function Payment',
    },
  });
  return apiJson(response);
}

export async function createWebPixel(request, context) {
  const url = new URL(request.url);
  const response = await callAdminGraphql(context.shop, `mutation WebPixelCreate($webPixel: WebPixelInput!) {
    webPixelCreate(webPixel: $webPixel) {
      userErrors {
        field
        message
      }
      webPixel {
        settings
        id
      }
    }
  }`, {
    webPixel: {
      settings: JSON.stringify({
        ga4Id: url.searchParams.get('ga4Id'),
        ga4Sec: url.searchParams.get('ga4Sec'),
        ga4Debug: url.searchParams.get('ga4Debug'),
      }),
    },
  });
  return apiJson(response);
}

export async function preparePostPurchase(request, context) {
  const origin = new URL(request.url).origin;
  const errors = {
    errors: 0,
    apis: [],
  };

  try {
    let response = await callAdminGraphql(context.shop, `query ShopId {
      shop {
        id
      }
    }`);
    const id = response.data.shop.id;
    response = await callAdminGraphql(context.shop, `mutation MetafieldsSet($metafields: [MetafieldsSetInput!]!) {
      metafieldsSet(metafields: $metafields) {
        metafields {
          id
          value
        }
        userErrors {
          field
          message
        }
      }
    }`, {
      metafields: [
        {
          key: 'url',
          namespace: 'barebone_app',
          ownerId: id,
          type: 'single_line_text_field',
          value: origin,
        },
      ],
    });
    if (response.data.metafieldsSet.userErrors.length > 0) {
      errors.errors += 1;
      errors.apis.push(`shop ${JSON.stringify(response.data.metafieldsSet.userErrors[0])}`);
    }
  } catch (error) {
    errors.errors += 1;
    errors.apis.push(`shop ${error.message}`);
  }

  return apiJson(errors);
}

export async function handlePostPurchaseAction(request) {
  const context = await requireAuthenticatedShop(request);
  if (!context.ok) return json({ Error: 'Signature unmatched. Incorrect authentication bearer sent' }, { status: 400 });

  const url = new URL(request.url);
  const payload = decodeSessionToken(context.token);
  const inputData = payload.input_data || null;
  const shop = inputData != null ? inputData.shop.domain : payload.dest?.replace('https://', '');
  const customerId = inputData != null ? `${inputData.initialPurchase.customerId}` : payload.sub || '';

  let responseData = {};
  const upsellProductIds = url.searchParams.get('upsell_product_ids');
  if (upsellProductIds) {
    const query = JSON.parse(upsellProductIds).map((id) => `id:${id}`).join(' OR ');
    const response = await callAdminGraphql(shop, `query UpsellProducts($query: String!) {
      products(first: 10, query: $query) {
        edges {
          node {
            id
            title
            featuredImage {
              url
            }
            priceRangeV2 {
              maxVariantPrice {
                amount
                currencyCode
              }
            }
            variants(first: 1) {
              edges {
                node {
                  id
                  price
                }
              }
            }
          }
        }
      }
    }`, { query });
    responseData = response.data;
  }

  const changes = url.searchParams.get('changes');
  if (changes) {
    responseData = {
      token: createAppJwt({
        iss: process.env.SHOPIFY_API_KEY || '',
        jti: uuidv4(),
        iat: Date.now(),
        sub: inputData != null ? inputData.initialPurchase.referenceId : '',
        changes: JSON.parse(changes),
      }),
    };
  }

  const score = url.searchParams.get('score');
  if (score && customerId !== '') {
    const ownerId = customerId.includes('gid') ? customerId : `gid://shopify/Customer/${customerId}`;
    const response = await callAdminGraphql(shop, `mutation MetafieldsSet($metafields: [MetafieldsSetInput!]!) {
      metafieldsSet(metafields: $metafields) {
        metafields {
          id
          value
        }
        userErrors {
          field
          message
        }
      }
    }`, {
      metafields: [
        {
          key: 'score',
          namespace: 'barebone_app_review',
          ownerId,
          type: 'number_integer',
          value: `${parseInt(score, 10)}`,
        },
      ],
    });
    responseData = response.data;
  }

  return json(responseData);
}

export async function loadOrderManage(request) {
  const url = new URL(request.url);
  if (url.searchParams.get('embedded') === '1') {
    if (!verifyShopifyHmac(url.searchParams)) return new Response('HMAC verification failed', { status: 400 });
    return renderEmbeddedApp(request, url.searchParams.get('shop'));
  }

  return authenticatedEndpoint(request, async (context) => {
    let error = '';
    let response = { data: {} };
    const id = url.searchParams.get('id');
    if (id) {
      const orderId = `gid://shopify/Order/${id}`;
      const foids = url.searchParams.get('foids');
      if (foids) {
        for (const fulfillmentOrderId of foids.split(',')) {
          const fulfillmentResponse = await callAdminGraphql(context.shop, `mutation FulfillmentCreate($fulfillment: FulfillmentInput!, $message: String) {
            fulfillmentCreate(fulfillment: $fulfillment, message: $message) {
              fulfillment {
                id
                name
              }
              userErrors {
                field
                message
              }
            }
          }`, {
            fulfillment: {
              lineItemsByFulfillmentOrder: [
                {
                  fulfillmentOrderId,
                },
              ],
              trackingInfo: {
                company: 'Dummy shipping carrier',
                number: `manual-${Date.now()}`,
                url: 'https://example.com',
              },
            },
            message: 'Fulfilled by the barebone app sample.',
          });
          const userErrors = fulfillmentResponse.data.fulfillmentCreate.userErrors;
          if (userErrors.length > 0) error += userErrors.map((e) => e.message).join(',');
        }
      }

      const transactions = url.searchParams.get('trans');
      if (transactions) {
        for (const transaction of transactions.split(',')) {
          const [parentTransactionId, amount] = transaction.split('-');
          const captureResponse = await callAdminGraphql(context.shop, `mutation OrderCapture($input: OrderCaptureInput!) {
            orderCapture(input: $input) {
              transaction {
                id
                status
                gateway
                kind
              }
              userErrors {
                field
                message
              }
            }
          }`, {
            input: {
              amount,
              id: orderId,
              parentTransactionId,
            },
          });
          const userErrors = captureResponse.data.orderCapture.userErrors;
          if (userErrors.length > 0) error += userErrors.map((e) => e.message).join(',');
        }
      }

      response = await callAdminGraphql(context.shop, `query OrderDetails($id: ID!) {
        order(id: $id) {
          id
          name
          displayFulfillmentStatus
          fulfillable
          displayFinancialStatus
          capturable
          fulfillments(first: 10) {
            id
            createdAt
            deliveredAt
            displayStatus
            status
            trackingInfo {
              number
              company
            }
          }
          transactions(first: 10) {
            id
            status
            gateway
            formattedGateway
            kind
            manuallyCapturable
            amountSet {
              presentmentMoney {
                amount
                currencyCode
              }
            }
            parentTransaction {
              id
            }
          }
          fulfillmentOrders(first: 10) {
            edges {
              node {
                id
                createdAt
                status
                requestStatus
                supportedActions {
                  action
                  externalUrl
                }
              }
            }
          }
        }
      }`, { id: orderId });
    }

    if (url.searchParams.get('fs') === 'true') {
      const origin = new URL(request.url).origin;
      response = await callAdminGraphql(context.shop, `query BareboneFulfillmentServiceOwner {
        shop {
          id
          metafield(namespace: "barebone_app", key: "fullfillment_service") {
            value
          }
        }
      }`);
      const shopId = response.data.shop.id;
      const existingServiceId = response.data.shop.metafield?.value;
      if (existingServiceId) {
        const deleteResponse = await callAdminGraphql(context.shop, `mutation FulfillmentServiceDelete($id: ID!) {
          fulfillmentServiceDelete(id: $id) {
            deletedId
            userErrors {
              field
              message
            }
          }
        }`, { id: existingServiceId });
        const userErrors = deleteResponse.data.fulfillmentServiceDelete.userErrors;
        if (userErrors.length > 0) error += userErrors.map((e) => e.message).join(',');
      }

      response = await callAdminGraphql(context.shop, `mutation FulfillmentServiceCreate($callbackUrl: URL!, $inventoryManagement: Boolean!, $trackingSupport: Boolean!, $name: String!) {
        fulfillmentServiceCreate(callbackUrl: $callbackUrl, inventoryManagement: $inventoryManagement, trackingSupport: $trackingSupport, name: $name) {
          fulfillmentService {
            id
            serviceName
            callbackUrl
            inventoryManagement
            location {
              id
            }
            type
          }
          userErrors {
            field
            message
          }
        }
      }`, {
        callbackUrl: origin,
        inventoryManagement: true,
        trackingSupport: true,
        name: 'Barebone app fulfillment service',
      });
      const userErrors = response.data.fulfillmentServiceCreate.userErrors;
      if (userErrors.length > 0) {
        error += userErrors.map((e) => e.message).join(',');
      } else {
        await callAdminGraphql(context.shop, `mutation MetafieldsSet($metafields: [MetafieldsSetInput!]!) {
          metafieldsSet(metafields: $metafields) {
            metafields {
              id
              namespace
              key
              value
            }
            userErrors {
              field
              message
            }
          }
        }`, {
          metafields: [
            {
              key: 'fullfillment_service',
              namespace: 'barebone_app',
              ownerId: shopId,
              value: response.data.fulfillmentServiceCreate.fulfillmentService.id,
              type: 'single_line_text_field',
            },
          ],
        });
      }
    }

    const delta = url.searchParams.get('delta');
    const name = url.searchParams.get('name');
    const reason = url.searchParams.get('reason');
    if (delta != null && name != null && reason != null) {
      response = await callAdminGraphql(context.shop, `query BareboneFulfillmentService {
        shop {
          id
          metafield(namespace: "barebone_app", key: "fullfillment_service") {
            value
          }
        }
      }`);
      const fulfillmentServiceId = response.data.shop.metafield?.value;
      if (!fulfillmentServiceId) {
        error += "This app's fulfillment service is not found!";
      } else {
        response = await callAdminGraphql(context.shop, `query FulfillmentServiceInventory($id: ID!) {
          fulfillmentService(id: $id) {
            id
            serviceName
            location {
              id
              inventoryLevels(first: 10) {
                edges {
                  node {
                    id
                    item {
                      id
                      variant {
                        id
                        title
                        product {
                          id
                          title
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }`, { id: fulfillmentServiceId });
        const location = response.data.fulfillmentService.location;
        if (location.inventoryLevels.edges.length === 0) {
          error += "This app's fulfillment service has no inventory levels.";
        } else {
          for (const edge of location.inventoryLevels.edges) {
            const adjustResponse = await callAdminGraphql(context.shop, `mutation InventoryAdjustQuantities($input: InventoryAdjustQuantitiesInput!, $idempotencyKey: String!) {
              inventoryAdjustQuantities(input: $input) @idempotent(key: $idempotencyKey) {
                inventoryAdjustmentGroup {
                  id
                }
                userErrors {
                  field
                  message
                }
              }
            }`, {
              input: {
                changes: [
                  {
                    delta: parseInt(delta, 10),
                    inventoryItemId: edge.node.item.id,
                    locationId: location.id,
                    ledgerDocumentUri: url.searchParams.get('uri') || null,
                    changeFromQuantity: null,
                  },
                ],
                name,
                reason,
              },
              idempotencyKey: uuidv4(),
            });
            const userErrors = adjustResponse.data.inventoryAdjustQuantities.userErrors;
            if (userErrors.length > 0) error += userErrors.map((e) => e.message).join(',');
          }
        }
      }
    }

    return json({
      response: response.data,
      error,
    });
  });
}

export async function loadBulkOperation(request) {
  return authenticatedEndpoint(request, async (context) => {
    const url = new URL(request.url);
    let response;
    const key = url.searchParams.get('key');
    if (key) {
      response = await callAdminGraphql(context.shop, `mutation BulkOperationRunMutation {
        bulkOperationRunMutation(
          mutation: "mutation call($input: ProductInput!) { productCreate(input: $input) { product { id title variants(first: 10) { edges { node { id title inventoryQuantity } } } } userErrors { message field } } }",
          stagedUploadPath: "${key}") {
          bulkOperation {
            id
            url
            status
          }
          userErrors {
            message
            field
          }
        }
      }`);
      return json(response);
    }

    if (url.searchParams.get('check') === 'true') {
      response = await callAdminGraphql(context.shop, `query CurrentBulkOperation {
        currentBulkOperation(type: MUTATION) {
          id
          status
          errorCode
          createdAt
          completedAt
          objectCount
          fileSize
          url
          partialDataUrl
        }
      }`);
      return json(response);
    }

    const id = url.searchParams.get('id');
    if (id) {
      response = await callAdminGraphql(context.shop, `mutation BulkOperationCancel {
        bulkOperationCancel(id: "${id}") {
          bulkOperation {
            status
          }
          userErrors {
            field
            message
          }
        }
      }`);
      return json(response);
    }

    response = await callAdminGraphql(context.shop, `mutation StagedUploadsCreate {
      stagedUploadsCreate(input: {
        resource: BULK_MUTATION_VARIABLES,
        filename: "bulk_op_vars",
        mimeType: "text/jsonl",
        httpMethod: POST
      }) {
        userErrors {
          field
          message
        }
        stagedTargets {
          url
          resourceUrl
          parameters {
            name
            value
          }
        }
      }
    }`);
    return json(response);
  });
}

export async function appProxy(request, body) {
  const url = new URL(request.url);
  if (!verifyAppProxySignature(url.searchParams)) {
    return new Response('App proxy signature verification failed', { status: 400 });
  }

  const response = {
    message: 'CAUTION! DO NOT RETURN PRIVATE DATA OVER APP PROXY, THIS IS FULLY PUBLIC.',
    query: Object.fromEntries(url.searchParams),
    body,
  };

  if (url.searchParams.get('format') === 'liquid') {
    return new Response(`<h2>Liquid objects rendered by the app proxy in 'Content-Type application/liquid'</h2>
      <ul>
        <li>&#123;&#123;shop.name&#125;&#125;: {{shop.name}}</li>
        <li>&#123;&#123;template.name&#125;&#125;: {{template.name}}</li>
        <li>&#123;&#123;customer.email&#125;&#125;: {{customer.email}}</li>
        <li>&#123;&#123;product.title&#125;&#125;: {{product.title}}</li>
      </ul>
      <h2>Request query from the app proxy to my app endpoint</h2>
      <pre>${JSON.stringify(response, null, 4)}</pre>`, {
      headers: { 'Content-Type': 'application/liquid' },
    });
  }

  return json(response);
}

export async function mockLogin(request) {
  const url = new URL(request.url);
  let target = '';
  let details = '';

  const sessionToken = url.searchParams.get('sessiontoken');
  if (sessionToken) {
    const context = await requireAuthenticatedShop(new Request(request.url, {
      headers: {
        Authorization: `Bearer ${sessionToken}`,
      },
    }));
    if (!context.ok) return new Response('Signature unmatched. Incorrect session token sent', { status: 400 });
    target = `<p>You are connecting to: <h3>${context.shop}</h3></p>`;
    details = `<p><b>The following is the received session token with the shop data above which you can never falsify.</b></p>
      <pre>${sessionToken}</pre>
      <p><a href="https://${getAdminFromShop(context.shop)}">Go back to Shopify admin</a></p>`;
  }

  const appToken = url.searchParams.get('my_token');
  if (appToken) {
    const payload = decodeAppJwt(appToken);
    const shop = payload.shop;
    target = `<p>You are connecting to: <h3>${shop}</h3></p>`;
    details = `<p><b>The following is your own JWT token with the shop.</b></p>
      <pre>${appToken}</pre>
      <p><a href="https://${getAdminFromShop(shop)}">Go back to Shopify admin</a></p>`;
  }

  return new Response(`<h1>Welcome to my mock login for my dummy service</h1>
    ${target}
    <p>Your email: <input /></p>
    <p>Your password: <input /></p>
    <p><button onClick="javascript:window.location.href='./mocklogin';">Login</button></p>
    ${details}`, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

export async function webhookAction(request) {
  const valid = await verifyWebhookHmac(request);
  return new Response(null, { status: valid ? 200 : 401 });
}

export function trackingNumbers(request) {
  const url = new URL(request.url);
  const orderNames = url.searchParams.getAll('order_names[]');
  const body = {
    tracking_numbers: {},
    message: 'Successfully received the tracking numbers',
    success: true,
  };
  orderNames.forEach((name) => {
    body.tracking_numbers[name] = `service-fetch-${Date.now()}`;
  });
  return json(body);
}

export function stockLevels(request) {
  const url = new URL(request.url);
  const sku = url.searchParams.get('sku');
  const body = {};
  if (sku) {
    body[sku] = Math.floor(Math.random() * 2000);
  } else {
    body.DUMMYSKU2000 = Math.floor(Math.random() * 3000);
    body.DUMMYSKU3000 = Math.floor(Math.random() * 4000);
  }
  return json(body);
}

function apiJson(response) {
  return json({
    result: {
      message: '',
      response,
    },
  });
}
