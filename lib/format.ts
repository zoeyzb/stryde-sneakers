import type { Money } from "./shopify/types";

export function formatMoney(money: Money | null | undefined) {
  if (!money) return "";
  const amount = Number(money.amount);
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency: money.currencyCode,
    currencyDisplay: "narrowSymbol",
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
  }).format(amount);
}

export function shopifyImage(url: string, width: number) {
  const u = new URL(url);
  u.searchParams.set("width", String(width));
  return u.toString();
}
