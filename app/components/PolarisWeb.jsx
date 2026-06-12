export function Page({ title, children }) {
  return <s-page heading={title}>{children}</s-page>;
}

export function Card({ children }) {
  return (
    <s-section padding="base" className="sample-card">
      <s-box padding="base" border="base" borderRadius="base" background="base">
        {children}
      </s-box>
    </s-section>
  );
}

export function BlockStack({ children, gap = "base" }) {
  return <s-stack direction="block" gap={spacing(gap)}>{children}</s-stack>;
}

export function InlineStack({ children, gap = "base" }) {
  return (
    <s-stack direction="inline" gap={spacing(gap)} alignItems="center">
      {children}
    </s-stack>
  );
}

export function Button({ children, onClick, variant = "secondary", disabled = false }) {
  return (
    <s-button variant={variant} onClick={onClick} disabled={disabled}>
      {children}
    </s-button>
  );
}

export function Link({ children, url, onClick, target }) {
  if (onClick) {
    return (
      <s-link
        href="#"
        onClick={(event) => {
          event.preventDefault();
          onClick(event);
        }}
      >
        {children}
      </s-link>
    );
  }
  if (target || isExternalUrl(url)) {
    return (
      <a className="sample-link" href={url} target={target || "_blank"} rel="noreferrer">
        {children}
      </a>
    );
  }
  return <s-link href={url}>{children}</s-link>;
}

export function Badge({ children, tone = "info" }) {
  return <s-badge tone={tone}>{children}</s-badge>;
}

export function Text({ children, as = "span" }) {
  if (as === "h2" || as === "h3") return <s-heading>{children}</s-heading>;
  return <s-text>{children}</s-text>;
}

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

export function List({ children, type = "bullet" }) {
  return type === "number" ? (
    <s-ordered-list>{children}</s-ordered-list>
  ) : (
    <s-unordered-list>{children}</s-unordered-list>
  );
}

List.Item = function ListItem({ children }) {
  return <s-list-item>{children}</s-list-item>;
};

export function Spinner() {
  return <s-spinner accessibilityLabel="Loading"></s-spinner>;
}

export function TextField({ label, value, onChange, placeholder = "" }) {
  return (
    <s-text-field
      label={label || "Value"}
      value={value}
      placeholder={placeholder}
      onInput={(event) => onChange?.(event.currentTarget.value)}
    ></s-text-field>
  );
}

export function Checkbox({ label, checked, onChange }) {
  return (
    <s-checkbox
      label={label}
      checked={checked}
      onChange={(event) => onChange?.(event.currentTarget.checked)}
    ></s-checkbox>
  );
}

export function Select({ label, options, value, onChange }) {
  return (
    <s-select label={label} value={value} onChange={(event) => onChange?.(event.currentTarget.value)}>
      {options.map((option) => (
        <s-option key={option.value} value={option.value}>
          {option.label}
        </s-option>
      ))}
    </s-select>
  );
}

export const Layout = ({ children }) => (
  <s-stack direction="block" gap="base">
    {children}
  </s-stack>
);
Layout.Section = ({ children }) => <s-box>{children}</s-box>;

export const ButtonGroup = ({ children }) => <s-button-group gap="base">{children}</s-button-group>;
export const Label = ({ children }) => <s-text type="strong">{children}</s-text>;
export const Form = ({ children, onSubmit }) => <form onSubmit={onSubmit}>{children}</form>;

function spacing(value) {
  const legacyPolarisSpacing = {
    "0": "none",
    "025": "small",
    "050": "small",
    "100": "small",
    "200": "base",
    "300": "base",
    "400": "large",
    "500": "large",
    "600": "large",
    "800": "large",
  };
  return legacyPolarisSpacing[value] || value;
}

function isExternalUrl(url = "") {
  return /^https?:\/\//.test(url);
}
