"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
export default function Header() {
 const pathname=usePathname();
 return <header style={{position:"absolute",top:0,left:0,right:0,zIndex:30,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"22px 5%",background:"linear-gradient(#050506d9,transparent)",borderBottom:"1px solid #ffffff16"}}>
   <Link href="/" aria-label="STRYDE home" style={{color:"#fff",textDecoration:"none",fontWeight:900,letterSpacing:".36em",fontSize:22}}>STRYDE</Link>
   <nav aria-label="Main navigation" style={{display:"flex",gap:"clamp(16px,3vw,42px)",alignItems:"center"}}>
     <Link href="/#collection" style={{color:"#fff",fontSize:13,textDecoration:"none"}}>Collections</Link>
     <Link href="/shirts/sport" style={{color:"#fff",fontSize:13,textDecoration:"none"}}>Performance</Link>
     {pathname!=="/"&&<Link href="/" style={{color:"#fff",fontSize:13,textDecoration:"none"}}>Back to studio</Link>}
   </nav>
 </header>
}
