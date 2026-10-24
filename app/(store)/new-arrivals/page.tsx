import { redirect } from "next/navigation";

/** Keep old campaign URLs working without adding a fourth collection. */
export default function NewArrivalsPage() {
  redirect("/shop");
}
