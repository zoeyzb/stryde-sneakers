import type { Metadata } from "next";
import PolicyPage from "@/components/content/PolicyPage";

export const metadata: Metadata = {
  title: "Returns & refunds",
  description: "Eligibility, timeframes and how to return a STRYDE piece.",
};

export default function Page() {
  return <PolicyPage policy="refundPolicy" title="Returns & refunds" />;
}
