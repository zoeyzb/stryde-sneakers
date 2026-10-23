import type { Metadata } from "next";
import PolicyPage from "@/components/content/PolicyPage";

export const metadata: Metadata = {
  title: "Shipping policy",
  description: "How orders are shipped, delivery estimates and costs.",
};

export default function Page() {
  return <PolicyPage policy="shippingPolicy" title="Shipping policy" />;
}
