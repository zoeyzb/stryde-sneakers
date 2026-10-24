export const CUSTOMER_QUERY = /* GraphQL */ `
  query StrydeCustomer {
    customer {
      id
      firstName
      lastName
      displayName
      emailAddress {
        emailAddress
        marketingState
      }
      orders(first: 25, sortKey: PROCESSED_AT, reverse: true) {
        nodes {
          id
          name
          processedAt
          cancelledAt
          cancelReason
          financialStatus
          statusPageUrl
          totalPrice {
            amount
            currencyCode
          }
          fulfillments(first: 5) {
            nodes {
              status
              latestShipmentStatus
            }
          }
          lineItems(first: 5) {
            nodes {
              title
              quantity
              variantTitle
              image {
                url
                altText
              }
            }
          }
        }
      }
    }
  }
`;

export type CustomerOrder = {
  id: string;
  name: string;
  processedAt: string;
  cancelledAt: string | null;
  cancelReason: string | null;
  financialStatus: string | null;
  statusPageUrl: string;
  totalPrice: { amount: string; currencyCode: string };
  fulfillments: { nodes: { status: string | null; latestShipmentStatus: string | null }[] };
  lineItems: {
    nodes: {
      title: string;
      quantity: number;
      variantTitle: string | null;
      image: { url: string; altText: string | null } | null;
    }[];
  };
};

export type Customer = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  displayName: string;
  emailAddress: { emailAddress: string; marketingState: string } | null;
  orders: { nodes: CustomerOrder[] };
};
