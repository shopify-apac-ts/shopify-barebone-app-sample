import {ExtensionStatic} from './Checkout';

export default async () => {
  ExtensionStatic(document.body, /** @type {any} */ (shopify));
};
