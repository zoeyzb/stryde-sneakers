export const SORT_OPTIONS = [
  { value: "featured", label: "Featured", productKey: "BEST_SELLING", collectionKey: "COLLECTION_DEFAULT", reverse: false },
  { value: "newest", label: "Newest", productKey: "CREATED_AT", collectionKey: "CREATED", reverse: true },
  { value: "price-asc", label: "Price: low to high", productKey: "PRICE", collectionKey: "PRICE", reverse: false },
  { value: "price-desc", label: "Price: high to low", productKey: "PRICE", collectionKey: "PRICE", reverse: true },
  { value: "title", label: "A–Z", productKey: "TITLE", collectionKey: "TITLE", reverse: false },
] as const;

export type SortValue = (typeof SORT_OPTIONS)[number]["value"];

export function parseSort(value: string | string[] | undefined): SortValue {
  const v = Array.isArray(value) ? value[0] : value;
  return SORT_OPTIONS.some((o) => o.value === v) ? (v as SortValue) : "featured";
}
