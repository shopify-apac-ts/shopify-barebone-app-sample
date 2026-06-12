import { Outlet } from "react-router";

const links = [
  ["Session Token", "/sessiontoken"],
  ["Admin Link", "/adminlink"],
  ["Theme App Extension", "/themeapp"],
  ["Function Discount", "/functiondiscount"],
  ["Function Shipping", "/functionshipping"],
  ["Function Payment", "/functionpayment"],
  ["Web Pixel", "/webpixel"],
  ["Post-purchase", "/postpurchase"],
  ["Checkout UI", "/checkoutui"],
  ["Order management", "/ordermanage"],
  ["Bulk Operation", "/bulkoperation"],
  ["Storefront API", "/storefront"],
];

export function AppShell() {
  return (
    <>
      <ui-title-bar title="Welcome to my barebone app"></ui-title-bar>
      <ui-nav-menu>
        {links.map(([label, href]) => (
          <a key={href} href={href}>
            {label}
          </a>
        ))}
      </ui-nav-menu>
      <Outlet />
    </>
  );
}
