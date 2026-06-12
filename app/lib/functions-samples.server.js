import { apiJson } from './embedded.server.js';
import { callAdminGraphql } from './shopify-graphql.server.js';

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
