import type { Metadata } from "next";
import PolicyPage from "@/components/content/PolicyPage";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "How STRYDE collects, uses and protects personal information.",
};

export default function Page() {
  return <PolicyPage policy="privacyPolicy" title="Privacy policy" />;
}
