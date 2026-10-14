import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import * as THREE from "three";
import { useGLTF } from "@react-three/drei";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

import { useMainStudioTextures } from "@/lib/useTextures";
import { studioTextures } from "@/lib/textures";
import { createMaterials } from "@/lib/material";

type GLTFResult = {
  nodes: {
    [name: string]: THREE.Mesh;
  };
};
export function MainStudioModel({
  currentIndex,
  scale,
}: {
  currentIndex: number;
  scale: number;
}) {
  const { nodes } = useGLTF(
    "/models/main/MainStudio.glb"
  ) as unknown as GLTFResult;

  const textures = useMainStudioTextures();
  const mats = createMaterials(textures) as Record<
    keyof typeof studioTextures.main,
    THREE.MeshBasicMaterial
  >;

  const shirts = useMemo(
    () => [
      {
        position: [0.65, 0.7, -0.45] as [number, number, number],
        rotation: [0, Math.PI / 9, 0] as [number, number, number],
        geometry: nodes.Shirt_White.geometry,
        material: mats.whiteShirt,
        hoverdMat: mats.whiteStudio,
        slug: "white",
      },
      {
        position: [0, 0.7, 0] as [number, number, number],
        rotation: [0, 0, 0] as [number, number, number],
        geometry: nodes.Shirt_Sport.geometry,
        material: mats.sportShirt,
        hoverdMat: mats.redStudio,
        slug: "sport",
      },
      {
        position: [-0.65, 0.7, -0.45] as [number, number, number],
        rotation: [0, -Math.PI / 9, 0] as [number, number, number],
        geometry: nodes.Shirt_Gray.geometry,
        material: mats.grayShirt,
        hoverdMat: mats.grayStudio,
        slug: "gray",
      },
    ],
    [nodes, mats]
  );
  const [envMaterial, setEnvMaterial] = useState<THREE.MeshBasicMaterial>(
    mats.defaultStudio
  );
  const groupRef = useRef<THREE.Group>(null);
  const meshRefs = useRef<(THREE.Mesh | null)[]>([]);
  const tlRefs = useRef<GSAPTimeline[]>([]);
  const router = useRouter();
  useEffect(() => {
    shirts.forEach((shirt) => {
      router.prefetch(`/shirts/${shirt.slug}`);
    });
  }, [router, shirts]);

  useGSAP(() => {
    const hasAnimationRun = sessionStorage.getItem("mainStudioAnimationRan");
    if (!groupRef.current || hasAnimationRun) return;
    gsap.from(groupRef.current.position, {
      y: -0.15,
      z: 2,
      duration: 4,
      ease: "power4.inOut",
      onComplete: () => {
        sessionStorage.setItem("mainStudioAnimationRan", "true");
      },
    });
    meshRefs.current.forEach((shirt, i) => {
      if (!shirt) return;
      gsap.from(shirt.position, {
        x: shirt.position.x * 2,
        delay: 1,
        duration: 3,
        ease: "power2.out",
      });
      gsap.from(shirt.rotation, {
        y: shirt.rotation.y * 4,
        delay: 1,
        duration: 3,
        ease: "power2.out",
      });
    });
  });

  useGSAP(() => {
    if (!meshRefs.current) return;
    meshRefs.current.forEach((mesh, i) => {
      if (!mesh) return;
      tlRefs.current[i] = gsap
        .timeline({ paused: true })
        .to(mesh.rotation, { y: 0, duration: 1, ease: "power1.inOut" })
        .to(
          mesh.scale,
          {
            x: 1.05,
            y: 1.05,
            z: 1.05,
            duration: 1,
            ease: "power1.inOut",
          },
          "<"
        );
    });
  });
  useEffect(() => {
    // Selecting a piece works on desktop and mobile without accumulating drift.
    meshRefs.current.forEach((mesh,i) => {
      if (!mesh) return;
      const active = i === currentIndex;
      gsap.to(mesh.position, {
        x: shirts[i].position[0],
        y: active ? shirts[i].position[1]+0.035 : shirts[i].position[1],
        z: active ? 0.2 : shirts[i].position[2]-0.12,
        duration: 0.85, ease: "power3.out", overwrite: true,
      });
      gsap.to(mesh.rotation, {
        y: active ? 0 : shirts[i].rotation[1],
        duration: 0.85, ease:"power3.out", overwrite: true,
      });
      gsap.to(mesh.scale, {
        x: active ? 1.12 : 0.94,
        y: active ? 1.12 : 0.94,
        z: active ? 1.12 : 0.94,
        duration: 0.85, ease:"power3.out",overwrite:true,
      });
    });
    setEnvMaterial(currentIndex === 0 ? mats.whiteStudio : currentIndex === 2 ? mats.grayStudio : mats.redStudio);
  }, [currentIndex, shirts, mats.whiteStudio, mats.grayStudio, mats.redStudio]);
  function enterHandler(index: number, material: THREE.MeshBasicMaterial) {
    document.body.style.cursor = "pointer";
    setEnvMaterial(material);
    tlRefs.current[index].play();
  }
  function leaveHandler(index: number) {
    document.body.style.cursor = "auto";
    tlRefs.current[index].reverse();
  }
  function handleClick(slug: string) {
    router.push(`/shirts/${slug}`);
    document.body.style.cursor = "auto";
  }
  return (
    <group ref={groupRef} dispose={null} scale={scale}>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Environment.geometry}
        material={envMaterial}
      />
      {shirts.map((shirt, i) => (
        <mesh
          key={i}
          ref={(m) => {
            if (!m) return;
            meshRefs.current[i] = m;
          }}
          geometry={shirt.geometry}
          material={shirt.material}
          position={shirt.position}
          rotation={shirt.rotation}
          onPointerEnter={() => enterHandler(i, shirt.hoverdMat)}
          onPointerLeave={() => leaveHandler(i)}
          onClick={() => handleClick(shirt.slug)}
        />
      ))}
      <mesh
        geometry={nodes.Hitbox.geometry}
        scale={[2.52, 1, 1]}
        visible={false}
        onPointerLeave={() => setEnvMaterial(mats.defaultStudio)}
      />
    </group>
  );
}
