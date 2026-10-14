"use client";
import { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { View } from "@react-three/drei";
import Rig from "./Rig";
import LoadingSkeleton from "./LoadingSkeleton";
import { patchThreeLoadingManager } from "@/lib/patchThreeLoadingManager";
import AssetsPreload from "./AssetsPreload";
patchThreeLoadingManager();
export default function ViewCanvas(){
 const [source,setSource]=useState<HTMLElement|null>(null);
 useEffect(()=>setSource(document.body),[]);
 return <Canvas
  dpr={[1,1.5]}
  frameloop="always"
  style={{position:"fixed",inset:0,overflow:"hidden",pointerEvents:"none"}}
  camera={{position:[0,0.7,3],fov:30}}
  eventSource={source??undefined} eventPrefix="client"
  gl={{stencil:true,antialias:false,powerPreference:"high-performance"}}>
   <AssetsPreload/>
   <Suspense fallback={<LoadingSkeleton/>}><View.Port/></Suspense>
   <Rig/>
 </Canvas>
}
