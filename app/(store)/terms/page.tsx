import type { Metadata } from "next";
import PolicyPage from "@/components/content/PolicyPage";

export const metadata: Metadata = {
  title: "Terms of service",
  description: "The terms that apply to using this site and buying from STRYDE.",
};

export default function Page() {
  return <PolicyPage policy="termsOfService" title="Terms of service" />;
}
