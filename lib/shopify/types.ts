export type Money = { amount: string; currencyCode: string };

export type ShopifyImage = {
  url: string;
  altText: string | null;
  width: number | null;
  height: number | null;
};

export type ProductCard = {
  id: string;
  handle: string;
  title: string;
  productType: string;
  tags: string[];
  availableForSale: boolean;
  priceRange: { minVariantPrice: Money; maxVariantPrice: Money };
  compareAtPriceRange: { maxVariantPrice: Money };
  featuredImage: ShopifyImage | null;
  hoverImages: { nodes: ShopifyImage[] };
  options: { name: string; optionValues: { name: string }[] }[];
};

export type SelectedOption = { name: string; value: string };

export type ProductVariant = {
  id: string;
  title: string;
  sku: string | null;
  availableForSale: boolean;
  currentlyNotInStock: boolean;
  price: Money;
  compareAtPrice: Money | null;
  selectedOptions: SelectedOption[];
  image: ShopifyImage | null;
};

export type ProductOption = {
  id: string;
  name: string;
  optionValues: { id: string; name: string; swatch: { color: string | null } | null }[];
};

type MetafieldValue = { value: string } | null;

export type Product = ProductCard & {
  description: string;
  descriptionHtml: string;
  vendor: string;
  seo: { title: string | null; description: string | null };
  gallery: { nodes: ShopifyImage[] };
  detailOptions: ProductOption[];
  variants: { nodes: ProductVariant[] };
  fabric: MetafieldValue;
  care: MetafieldValue;
  fit: MetafieldValue;
  sizeGuide: MetafieldValue;
  details: MetafieldValue;
  collections: { nodes: { id: string; handle: string; title: string }[] };
};

export type PageInfo = { hasNextPage: boolean; endCursor: string | null };

export type FilterValue = { id: string; label: string; count: number; input: string };
export type Filter = { id: string; label: string; type: string; values: FilterValue[] };

export type CollectionSummary = {
  id: string;
  handle: string;
  title: string;
  description: string;
  image: ShopifyImage | null;
  products: { nodes: { availableForSale: boolean; featuredImage: ShopifyImage | null }[] };
};

export type Collection = {
  id: string;
  handle: string;
  title: string;
  description: string;
  descriptionHtml: string;
  seo: { title: string | null; description: string | null };
  image: ShopifyImage | null;
  products: { filters: Filter[]; pageInfo: PageInfo; nodes: ProductCard[] };
};

export type Policy = { title: string; body: string; url: string; handle: string } | null;

export type Policies = {
  shippingPolicy: Policy;
  refundPolicy: Policy;
  privacyPolicy: Policy;
  termsOfService: Policy;
};

export type Shop = {
  name: string;
  description: string | null;
  primaryDomain: { url: string };
  paymentSettings: {
    countryCode: string;
    currencyCode: string;
    acceptedCardBrands: string[];
    supportedDigitalWallets: string[];
  };
  shipsToCountries: string[];
};

export type ShopPage = {
  id: string;
  title: string;
  body: string;
  bodySummary: string;
  seo: { title: string | null; description: string | null };
};

export type CartLine = {
  id: string;
  quantity: number;
  discountAllocations: { discountedAmount: Money }[];
  cost: {
    totalAmount: Money;
    amountPerQuantity: Money;
    compareAtAmountPerQuantity: Money | null;
  };
  merchandise: {
    id: string;
    title: string;
    availableForSale: boolean;
    selectedOptions: SelectedOption[];
    image: ShopifyImage | null;
    product: { handle: string; title: string; featuredImage: ShopifyImage | null };
  };
};

export type Cart = {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: { subtotalAmount: Money; totalAmount: Money };
  discountCodes: { code: string; applicable: boolean }[];
  lines: { nodes: CartLine[] };
};

export type CartUserError = { field: string[] | null; message: string; code: string | null };
export type CartWarning = { code: string; message: string; target: string };

export type CartMutationPayload = {
  cart: Cart | null;
  userErrors: CartUserError[];
  warnings: CartWarning[];
};
