import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import SavedPieces from "@/components/account/SavedPieces";
import { PageHeading } from "@/components/store/StoreStatus";
import { customerAccountFetch, getValidSession } from "@/lib/customer/auth";
import { CUSTOMER_QUERY, type Customer, type CustomerOrder } from "@/lib/customer/queries";
import { formatMoney } from "@/lib/format";
import { getCustomerAccountConfig, getHostedAccountUrl } from "@/lib/shopify/config";

export const metadata: Metadata = { title: "Account", robots: { index: false } };
export const dynamic = "force-dynamic";

const ERRORS: Record<string, string> = {
  state: "Your sign-in session expired. Please try again.",
  denied: "Sign-in was cancelled.",
  token: "We couldn't complete sign-in. Please try again.",
  nonce: "We couldn't verify your sign-in. Please try again.",
  code: "We couldn't complete sign-in. Please try again.",
  "not-configured": "Customer accounts aren't connected yet.",
};

const label = (value: string | null | undefined) =>
  value ? value.toLowerCase().replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase()) : null;

function OrderRow({ order }: { order: CustomerOrder }) {
  const fulfilment = order.fulfillments.nodes[0];
  const status = order.cancelledAt
    ? `Cancelled${order.cancelReason ? ` · ${label(order.cancelReason)}` : ""}`
    : label(fulfilment?.latestShipmentStatus ?? fulfilment?.status) ?? "Unfulfilled";
  return (
    <li className="py-6 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
      <div className="flex items-center gap-4">
        <div className="flex -space-x-3">
          {order.lineItems.nodes.slice(0, 3).map((item, i) =>
            item.image ? (
              <div key={i} className="relative size-14 border border-ink bg-ink-2 overflow-hidden">
                <Image src={item.image.url} alt={item.image.altText ?? item.title} fill sizes="56px" className="object-cover" />
              </div>
            ) : null
          )}
        </div>
        <div>
          <p className="text-sm font-semibold">{order.name}</p>
          <p className="text-xs text-mist">
            {new Date(order.processedAt).toLocaleDateString("en", { dateStyle: "medium" })} ·{" "}
            {formatMoney(order.totalPrice)}
          </p>
          <p className="text-xs text-ivory/70 mt-1">
            {status}
            {order.financialStatus && !order.cancelledAt ? ` · ${label(order.financialStatus)}` : ""}
          </p>
        </div>
      </div>
      <a href={order.statusPageUrl} className="btn-ghost h-10 shrink-0" target="_blank" rel="noreferrer">
        Order status &amp; returns
      </a>
    </li>
  );
}

function Help() {
  return (
    <div className="mt-12 grid gap-6 sm:grid-cols-2 text-sm leading-6 text-ivory/75">
      <div className="border border-line p-5">
        <p className="eyebrow mb-3">Cancellations</p>
        <p>
          Need to change or cancel an order? <Link href="/contact" className="underline underline-offset-4">Contact us</Link>{" "}
          with your order number as soon as possible — orders that have already shipped can&apos;t be cancelled and are
          handled as returns.
        </p>
      </div>
      <div className="border border-line p-5">
        <p className="eyebrow mb-3">Returns</p>
        <p>
          Open an order&apos;s status page to see its details and any available return options. Our{" "}
          <Link href="/returns" className="underline underline-offset-4">returns policy</Link> explains eligibility.
        </p>
      </div>
    </div>
  );
}

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const errorKey = typeof sp.error === "string" ? sp.error : null;
  const config = getCustomerAccountConfig();
  const hosted = getHostedAccountUrl();

  let customer: Customer | null = null;
  let loadError = false;
  if (config) {
    const session = await getValidSession(config);
    if (session) {
      try {
        const data = await customerAccountFetch<{ customer: Customer }>(config, session, CUSTOMER_QUERY);
        customer = data?.customer ?? null;
      } catch (err) {
        console.error("[account]", err);
        loadError = true;
      }
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-5 md:px-10">
      <PageHeading eyebrow="STRYDE" title={customer ? `Hello${customer.firstName ? `, ${customer.firstName}` : ""}` : "Account"} />

      {errorKey && ERRORS[errorKey] && (
        <p role="alert" className="mb-8 text-sm text-red-300">
          {ERRORS[errorKey]}
        </p>
      )}

      {customer ? (
        <>
          <div className="flex flex-wrap items-center justify-between gap-4 border-y border-line py-5">
            <p className="text-sm text-ivory/80">{customer.emailAddress?.emailAddress}</p>
            <form action="/account/logout" method="post">
              <button type="submit" className="eyebrow text-mist hover:text-ivory">
                Sign out
              </button>
            </form>
          </div>
          <section aria-labelledby="orders-heading" className="mt-12">
            <h2 id="orders-heading" className="eyebrow text-mist mb-2">
              Order history
            </h2>
            {customer.orders.nodes.length ? (
              <ul className="divide-y divide-line">
                {customer.orders.nodes.map((order) => (
                  <OrderRow key={order.id} order={order} />
                ))}
              </ul>
            ) : (
              <p className="text-sm text-ivory/70 py-6">No orders yet.</p>
            )}
          </section>
          <Help />
        </>
      ) : config ? (
        <div className="border border-line p-8 max-w-lg">
          {loadError && <p role="alert" className="mb-4 text-sm text-red-300">We couldn&apos;t load your account. Please sign in again.</p>}
          <p className="text-sm text-ivory/80 leading-6">
            Sign in with your email to see your orders, track deliveries and start returns. A one-time sign-in
            code is emailed to you — no password needed.
          </p>
          <a href="/account/login" className="btn-primary mt-6">
            Sign in
          </a>
        </div>
      ) : hosted ? (
        <div className="border border-line p-8 max-w-lg">
          <p className="text-sm text-ivory/80 leading-6">
            View your orders, shipping updates, and returns in your customer account.
          </p>
          <a href={hosted} className="btn-primary mt-6">
            Go to my account
          </a>
        </div>
      ) : (
        <div className="border border-line p-8 max-w-lg">
          <p className="eyebrow text-mist">Not connected</p>
          <p className="mt-3 text-sm text-ivory/80 leading-6">
            Customer accounts will be available once customer account services are connected.
          </p>
        </div>
      )}

      <SavedPieces />
    </div>
  );
}
