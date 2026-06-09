import {
  Badge,
  BlockStack,
  Button,
  ButtonGroup,
  Card,
  Checkbox,
  Form,
  Label,
  Layout,
  Link,
  List,
  Page,
  Select,
  Spinner,
  Text,
  TextField,
} from "../components/PolarisWeb";

export {
  Badge,
  BlockStack,
  Button,
  ButtonGroup,
  Card,
  Checkbox,
  Form,
  Label,
  Layout,
  Link,
  List,
  Page,
  Select,
  Spinner,
  Text,
  TextField,
};

export function ResourceList({ items = [], renderItem }) {
  return (
    <s-section padding="base">
      <s-stack direction="block" gap="base">
        {items.map((item) => renderItem(item))}
      </s-stack>
    </s-section>
  );
}

ResourceList.Item = function ResourceListItem({ id, onClick, media, children }) {
  return (
    <s-clickable key={id} padding="base" onClick={() => onClick?.(id)}>
      <s-stack direction="inline" gap="base" alignItems="center">
        {media}
        <s-box>{children}</s-box>
      </s-stack>
    </s-clickable>
  );
};

export function Icon() {
  return <s-icon type="arrow-right"></s-icon>;
}

export function AppProvider({ children }) {
  return children;
}

export function FooterHelp() {
  return null;
}
