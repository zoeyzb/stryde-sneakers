import { redirect } from "next/navigation";

/** The three original 3D worlds are now the complete editorial experience. */
export default function LookbookRedirect() {
  redirect("/collections");
}
