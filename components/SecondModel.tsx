"use client";
import * as THREE from "three";
import { useGLTF, useMask } from "@react-three/drei";
import { ShirtType, TextureKey } from "@/lib/textures";
import { useShirtSectionTextures } from "@/lib/useTextures";
import { createMaterials } from "@/lib/material";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);
type ModelNodes={nodes:Record<string,THREE.Mesh>};
export function SecondModel({shirtType}:{shirtType:ShirtType}){
 const {nodes}=useGLTF("/models/ShirtScrolling.glb") as unknown as ModelNodes;
 const stencil=useMask(1,true);
 const textures=useShirtSectionTextures(shirtType,"second");
 const mats=createMaterials(textures,stencil) as Record<TextureKey<typeof shirtType,"second">,THREE.MeshBasicMaterial>;
 const garment=useRef<THREE.Group>(null);
 useGSAP(()=>{
   if(!garment.current)return;
   const reduce=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
   if(reduce)return;
   const tl=gsap.timeline({scrollTrigger:{trigger:"#second-section",start:"top top",end:"600% top",scrub:1,pin:true}});
   tl.fromTo(garment.current.position,{y:-.3},{y:.5,duration:1,ease:"power2.out"})
     .fromTo(garment.current.rotation,{y:-Math.PI/5},{y:Math.PI*2,duration:4,ease:"none"},0)
     .fromTo(garment.current.scale,{x:1.35,y:1.35,z:1.35},{x:2.1,y:2.1,z:2.1,duration:4},0);
 },[]);
 return <group>
  <mesh geometry={nodes.Sphere_ENV.geometry} material={mats.sphere} />
  <group ref={garment} position={[0,.5,0]} scale={1.35}>
   <mesh geometry={nodes.Shirt.geometry} material={mats.shirt}/>
  </group>
  <mesh rotation={[-Math.PI/2,0,0]} position={[0,-.45,0]} {...stencil}>
    <torusGeometry args={[.72,.012,8,90]}/>
    <meshBasicMaterial color="#f11730" {...stencil}/>
  </mesh>
  <pointLight position={[1.5,1,1]} intensity={2} color="#f11730"/>
 </group>;
}
