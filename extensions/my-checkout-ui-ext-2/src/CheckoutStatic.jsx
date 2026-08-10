import '@shopify/ui-extensions/preact';
import {render} from 'preact';
import {ExtensionStatic} from './Checkout';

export default async () => {
  render(<ExtensionStatic />, document.body);
};
