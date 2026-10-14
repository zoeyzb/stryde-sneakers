"use client";
import Link from "next/link";
import { View } from "@react-three/drei";
import { Suspense, useState } from "react";
import { MainStudioModel } from "@/components/MainStudioModel";
const items=[{slug:"white",name:"The Light Edit"},{slug:"sport",name:"The Sport Edit"},{slug:"gray",name:"The Essential Edit"}];
export default function Home(){
 const [selected,setSelected]=useState(1);
 return <main className="stryde-shell">
  <section className="stryde-hero" aria-labelledby="hero-title">
   <div className="stryde-scene" aria-label="Interactive 3D garment showroom. Select a garment to view its collection.">
     <Suspense fallback={<div role="status" style={{height:"100%",display:"grid",placeItems:"center",color:"#aaa"}}>Preparing the studio…</div>}><View className="w-full h-full"><MainStudioModel currentIndex={selected} scale={1}/></View></Suspense>
   </div>
   <div className="stryde-hero-copy">
    <p className="stryde-eyebrow">PERFORMANCE WEAR</p>
    <h1 id="hero-title" className="stryde-title">MOVE<span>DIFFERENTLY.</span></h1>
    <p className="stryde-description">Engineered for motion. Designed for what’s next. An immersive collection made to move.</p>
    <div className="stryde-actions">
     <Link className="stryde-cta stryde-cta--red" href="#collection">Explore collection ↗</Link>
     <Link className="stryde-cta" href="/shirts/sport">View in 3D →</Link>
    </div>
   </div>
   <div className="stryde-selector" aria-label="Choose garment">
    <span>{String(selected+1).padStart(2,"0")} / 03</span>
    <button type="button" aria-label="Previous garment" onClick={()=>setSelected(v=>(v+2)%3)}>←</button>
    <button type="button" aria-label="Next garment" onClick={()=>setSelected(v=>(v+1)%3)}>→</button>
    <Link style={{fontSize:11,color:"#fff",textDecoration:"underline",textUnderlineOffset:5,marginTop:9}} href={`/shirts/${items[selected].slug}`}>EXPLORE PIECE</Link>
   </div>
   <div className="stryde-bottom">
     <div className="stryde-feature">01 / FORM & FUNCTION<span>Designed for the everyday</span></div>
     <div className="stryde-feature">02 / INTERACTIVE DETAIL<span>Explore the garments in 3D</span></div>
     <div className="stryde-feature">03 / MADE TO MOVE<span>Sport-inspired essentials</span></div>
   </div>
  </section>
  <section className="stryde-collection" id="collection" aria-labelledby="collection-heading">
    <p className="stryde-eyebrow">THE COLLECTION</p>
    <h2 id="collection-heading">Three pieces. One point of view.</h2>
    <div className="stryde-grid">
      <Link className="stryde-card" style={{"--garment":"#e6e6e7"} as React.CSSProperties} href="/shirts/white"><strong>01 / LIGHT</strong><span>EXPLORE THE PIECE ↗</span></Link>
      <Link className="stryde-card" style={{"--garment":"#141416"} as React.CSSProperties} href="/shirts/sport"><strong>02 / SPORT</strong><span>EXPLORE THE PIECE ↗</span></Link>
      <Link className="stryde-card" style={{"--garment":"#66666d"} as React.CSSProperties} href="/shirts/gray"><strong>03 / ESSENTIAL</strong><span>EXPLORE THE PIECE ↗</span></Link>
    </div>
  </section>
 </main>
}
