"use client";

import * as THREE from "three";
import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, useProgress, Html } from "@react-three/drei";
import { useShirtSectionTextures } from "@/lib/useTextures";
import type { ShirtType } from "@/lib/textures";
import { useReducedMotion } from "@/lib/useReducedMotion";

const BACKDROP: Record<ShirtType, string> = {
  white: "#d9d6d0",
  gray: "#1b1b1b",
  sport: "#1a0505",
};

type GLTFResult = { nodes: Record<string, THREE.Mesh> };

function Garment({ scene }: { scene: ShirtType }) {
  const { nodes } = useGLTF("/models/ShirtScrolling.glb") as unknown as GLTFResult;
  const textures = useShirtSectionTextures(scene, "second");
  return (
    <mesh geometry={nodes.Shirt.geometry} position={[0, -0.05, 0]}>
      <meshBasicMaterial map={textures.shirt} />
    </mesh>
  );
}

function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <p className="eyebrow text-mist whitespace-nowrap">{Math.round(progress)}%</p>
    </Html>
  );
}

export default function ProductViewer3D({ scene, label }: { scene: ShirtType; label: string }) {
  const reducedMotion = useReducedMotion();
  return (
    <div className="absolute inset-0" style={{ background: BACKDROP[scene] }}>
      <Canvas
        camera={{ position: [0, 0.05, 1.45], fov: 32 }}
        dpr={[1, 1.75]}
        gl={{ antialias: true, powerPreference: "low-power" }}
        aria-label={label}
        role="img"
      >
        <Suspense fallback={<Loader />}>
          <Garment scene={scene} />
        </Suspense>
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          autoRotate={!reducedMotion}
          autoRotateSpeed={1.2}
          minPolarAngle={Math.PI / 2.6}
          maxPolarAngle={Math.PI / 1.7}
          target={[0, 0.02, 0]}
        />
      </Canvas>
      <p className="absolute bottom-4 inset-x-0 text-center eyebrow text-[9px] mix-blend-difference text-white/70 pointer-events-none">
        Drag to rotate
      </p>
    </div>
  );
}
