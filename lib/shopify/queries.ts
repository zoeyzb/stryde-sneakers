const IMAGE = /* GraphQL */ `
  fragment ImageFields on Image {
    url
    altText
    width
    height
  }
`;

const MONEY = /* GraphQL */ `
  fragment MoneyFields on MoneyV2 {
    amount
    currencyCode
  }
`;

const PRODUCT_CARD = /* GraphQL */ `
  fragment ProductCardFields on Product {
    id
    handle
    title
    productType
    tags
    availableForSale
    priceRange {
      minVariantPrice {
        ...MoneyFields
      }
      maxVariantPrice {
        ...MoneyFields
      }
    }
    compareAtPriceRange {
      maxVariantPrice {
        ...MoneyFields
      }
    }
    featuredImage {
      ...ImageFields
    }
    hoverImages: images(first: 2) {
      nodes {
        ...ImageFields
      }
    }
    options(first: 3) {
      name
      optionValues {
        name
      }
    }
  }
  ${IMAGE}
  ${MONEY}
`;

const PRODUCT_DETAIL = /* GraphQL */ `
  fragment ProductDetailFields on Product {
    ...ProductCardFields
    description
    descriptionHtml
    vendor
    seo {
      title
      description
    }
    gallery: images(first: 20) {
      nodes {
        ...ImageFields
      }
    }
    detailOptions: options(first: 3) {
      id
      name
      optionValues {
        id
        name
        swatch {
          color
        }
      }
    }
    variants(first: 100) {
      nodes {
        id
        title
        sku
        availableForSale
        currentlyNotInStock
        price {
          ...MoneyFields
        }
        compareAtPrice {
          ...MoneyFields
        }
        selectedOptions {
          name
          value
        }
        image {
          ...ImageFields
        }
      }
    }
    fabric: metafield(namespace: "stryde", key: "fabric") {
      value
    }
    care: metafield(namespace: "stryde", key: "care") {
      value
    }
    fit: metafield(namespace: "stryde", key: "fit") {
      value
    }
    sizeGuide: metafield(namespace: "stryde", key: "size_guide") {
      value
    }
    details: metafield(namespace: "stryde", key: "details") {
      value
    }
    collections(first: 3) {
      nodes {
        id
        handle
        title
      }
    }
  }
  ${PRODUCT_CARD}
`;

export const SHOP_QUERY = /* GraphQL */ `
  query StrydeShop {
    shop {
      name
      description
      primaryDomain {
        url
      }
      paymentSettings {
        countryCode
        currencyCode
        acceptedCardBrands
        supportedDigitalWallets
      }
      shipsToCountries
    }
  }
`;

export const POLICIES_QUERY = /* GraphQL */ `
  query StrydePolicies {
    shop {
      shippingPolicy {
        title
        body
        url
        handle
      }
      refundPolicy {
        title
        body
        url
        handle
      }
      privacyPolicy {
        title
        body
        url
        handle
      }
      termsOfService {
        title
        body
        url
        handle
      }
    }
  }
`;

export const PRODUCTS_QUERY = /* GraphQL */ `
  query StrydeProducts(
    $first: Int!
    $after: String
    $query: String
    $sortKey: ProductSortKeys
    $reverse: Boolean
  ) {
    products(first: $first, after: $after, query: $query, sortKey: $sortKey, reverse: $reverse) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        ...ProductCardFields
      }
    }
  }
  ${PRODUCT_CARD}
`;

export const PRODUCT_TYPES_QUERY = /* GraphQL */ `
  query StrydeProductTypes {
    productTypes(first: 50) {
      nodes
    }
  }
`;

export const COLLECTIONS_QUERY = /* GraphQL */ `
  query StrydeCollections {
    collections(first: 50, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        id
        handle
        title
        description
        image {
          ...ImageFields
        }
        products(first: 4) {
          nodes {
            availableForSale
            featuredImage {
              ...ImageFields
            }
          }
        }
      }
    }
  }
  ${IMAGE}
`;

export const COLLECTION_QUERY = /* GraphQL */ `
  query StrydeCollection(
    $handle: String!
    $first: Int!
    $after: String
    $filters: [ProductFilter!]
    $sortKey: ProductCollectionSortKeys
    $reverse: Boolean
  ) {
    collection(handle: $handle) {
      id
      handle
      title
      description
      descriptionHtml
      seo {
        title
        description
      }
      image {
        ...ImageFields
      }
      products(
        first: $first
        after: $after
        filters: $filters
        sortKey: $sortKey
        reverse: $reverse
      ) {
        filters {
          id
          label
          type
          values {
            id
            label
            count
            input
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          ...ProductCardFields
        }
      }
    }
  }
  ${PRODUCT_CARD}
`;

export const PRODUCT_QUERY = /* GraphQL */ `
  query StrydeProduct($handle: String!) {
    product(handle: $handle) {
      ...ProductDetailFields
    }
  }
  ${PRODUCT_DETAIL}
`;

export const RECOMMENDATIONS_QUERY = /* GraphQL */ `
  query StrydeRecommendations($productId: ID!) {
    productRecommendations(productId: $productId, intent: RELATED) {
      ...ProductCardFields
    }
  }
  ${PRODUCT_CARD}
`;

export const PAGE_QUERY = /* GraphQL */ `
  query StrydePage($handle: String!) {
    page(handle: $handle) {
      id
      title
      body
      bodySummary
      seo {
        title
        description
      }
    }
  }
`;

const CART = /* GraphQL */ `
  fragment CartFields on Cart {
    id
    checkoutUrl
    totalQuantity
    cost {
      subtotalAmount {
        ...MoneyFields
      }
      totalAmount {
        ...MoneyFields
      }
    }
    discountCodes {
      code
      applicable
    }
    lines(first: 100) {
      nodes {
        id
        quantity
        discountAllocations(lineLevelOnly: false) {
          discountedAmount {
            ...MoneyFields
          }
        }
        cost {
          totalAmount {
            ...MoneyFields
          }
          amountPerQuantity {
            ...MoneyFields
          }
          compareAtAmountPerQuantity {
            ...MoneyFields
          }
        }
        merchandise {
          ... on ProductVariant {
            id
            title
            availableForSale
            selectedOptions {
              name
              value
            }
            image {
              ...ImageFields
            }
            product {
              handle
              title
              featuredImage {
                ...ImageFields
              }
            }
          }
        }
      }
    }
  }
  ${IMAGE}
  ${MONEY}
`;

const CART_RESULT = /* GraphQL */ `
  cart {
    ...CartFields
  }
  userErrors {
    field
    message
    code
  }
  warnings {
    code
    message
    target
  }
`;

export const CART_QUERY = /* GraphQL */ `
  query StrydeCart($cartId: ID!) {
    cart(id: $cartId) {
      ...CartFields
    }
  }
  ${CART}
`;

export const CART_CREATE_MUTATION = /* GraphQL */ `
  mutation StrydeCartCreate($lines: [CartLineInput!]) {
    cartCreate(input: { lines: $lines }) {
      ${CART_RESULT}
    }
  }
  ${CART}
`;

export const CART_LINES_ADD_MUTATION = /* GraphQL */ `
  mutation StrydeCartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      ${CART_RESULT}
    }
  }
  ${CART}
`;

export const CART_LINES_UPDATE_MUTATION = /* GraphQL */ `
  mutation StrydeCartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      ${CART_RESULT}
    }
  }
  ${CART}
`;

export const CART_LINES_REMOVE_MUTATION = /* GraphQL */ `
  mutation StrydeCartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      ${CART_RESULT}
    }
  }
  ${CART}
`;

export const CART_DISCOUNT_CODES_UPDATE_MUTATION = /* GraphQL */ `
  mutation StrydeCartDiscountCodesUpdate($cartId: ID!, $discountCodes: [String!]!) {
    cartDiscountCodesUpdate(cartId: $cartId, discountCodes: $discountCodes) {
      ${CART_RESULT}
    }
  }
  ${CART}
`;
