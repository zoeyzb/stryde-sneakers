import { PageHeading, StoreError } from "@/components/store/StoreStatus";
import { getPolicies, isStorefrontConfigured } from "@/lib/shopify";
import type { Policies } from "@/lib/shopify/types";

export type PolicyKey = keyof Policies;

export default async function PolicyPage({ policy, title }: { policy: PolicyKey; title: string }) {
  let body: React.ReactNode;
  if (!isStorefrontConfigured()) {
    body = <Unpublished title={title} />;
  } else {
    try {
      const data = (await getPolicies())[policy];
      body = data?.body ? (
        <div className="prose-stryde" dangerouslySetInnerHTML={{ __html: data.body }} />
      ) : (
        <Unpublished title={title} />
      );
    } catch (err) {
      console.error("[policy]", err);
      body = <StoreError />;
    }
  }
  return (
    <div className="mx-auto max-w-3xl px-5 md:px-10">
      <PageHeading eyebrow="Policies" title={title} />
      {body}
    </div>
  );
}

function Unpublished({ title }: { title: string }) {
  return (
    <div className="border border-line p-8">
      <p className="eyebrow text-mist">Not yet published</p>
      <p className="mt-3 text-sm text-ivory/80 leading-6">
        Our {title.toLowerCase()} will appear here once it has been published in the store. If you have a question in
        the meantime, please <a href="/contact" className="underline underline-offset-4">contact us</a>.
      </p>
    </div>
  );
}
