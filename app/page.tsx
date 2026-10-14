"use client";
import Link from "next/link";
import { MainStudioModel } from "@/components/MainStudioModel";
import { View } from "@react-three/drei";
import { useState } from "react";
import { useMediaQuery } from "react-responsive";
const pieces = [{slug:"white",name:"WHITE"},{slug:"sport",name:"SPORT"},{slug:"gray",name:"GRAY"}] as const;
export default function Home() {
 const isMobile=useMediaQuery({maxWidth:400});
 const [currentIndex,setCurrentIndex]=useState(1);
 return <main>
  <section className="stryde-home" aria-labelledby="hero-title">
    <div className="stryde-home-scene">
      <View className="w-full h-full"><MainStudioModel currentIndex={currentIndex} scale={isMobile?0.8:1}/></View>
    </div>
    <div className="stryde-home-copy">
      <div className="stryde-kicker">THE PERFORMANCE EDIT</div>
      <h1 id="hero-title">MOVE<span>DIFFERENTLY.</span></h1>
      <p>Three silhouettes. One immersive experience. Discover the detail, movement, and craft behind every piece.</p>
      <Link className="stryde-cta" href={`/shirts/${pieces[currentIndex].slug}`}>EXPLORE THIS PIECE ↗</Link>
    </div>
    <div className="stryde-piece-nav" aria-label="Change featured garment">
      <span>{String(currentIndex+1).padStart(2,"0")} / 03</span>
      <button type="button" aria-label="Previous garment" disabled={currentIndex===0} onClick={()=>setCurrentIndex(i=>Math.max(0,i-1))}>←</button>
      <button type="button" aria-label="Next garment" disabled={currentIndex===2} onClick={()=>setCurrentIndex(i=>Math.min(2,i+1))}>→</button>
      <Link href={`/shirts/${pieces[currentIndex].slug}`}>VIEW {pieces[currentIndex].name}</Link>
    </div>
    <div className="stryde-home-note">INTERACTIVE 3D COLLECTION — SELECT A GARMENT</div>
  </section>
  <section className="stryde-collection" id="collection" aria-labelledby="collection-title">
    <div className="stryde-kicker">EXPLORE THE COLLECTION</div>
    <h2 id="collection-title">The collection, in motion.</h2>
    <div className="stryde-collection-grid">
      <Link href="/shirts/white"><strong>01 / WHITE</strong><small>ENTER THE EXPERIENCE ↗</small></Link>
      <Link href="/shirts/sport"><strong>02 / SPORT</strong><small>ENTER THE EXPERIENCE ↗</small></Link>
      <Link href="/shirts/gray"><strong>03 / GRAY</strong><small>ENTER THE EXPERIENCE ↗</small></Link>
    </div>
  </section>
 </main>;
}
