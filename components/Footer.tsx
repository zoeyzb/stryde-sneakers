"use client";
import { useParams } from "next/navigation";
export default function Footer() {
 const light = useParams()?.slug==="white";
 return <footer className={"stryde-footer "+(light?"stryde-footer-light":"")}>
  <span>© 2026 STRYDE / PERFORMANCE COLLECTION</span>
  <span>INTERACTIVE 3D EXPERIENCE</span>
 </footer>;
}
