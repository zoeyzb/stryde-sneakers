import * as THREE from "three";
import { Text, useGLTF, useMask } from "@react-three/drei";
import { ShirtType, TextureKey } from "@/lib/textures";
import { useShirtSectionTextures } from "@/lib/useTextures";
import { createMaterials } from "@/lib/material";
import { useGSAP } from "@gsap/react";
import { RefObject, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { shirtColors } from "@/lib/colors";
import { useMediaQuery } from "react-responsive";
import { useReducedMotion } from "@/lib/useReducedMotion";

type GLTFResult = {
  nodes: {
    [name: string]: THREE.Mesh;
  };
};

const DISPLAY_FONT = "/fonts/Syncopate-Bold.ttf";

// Placement mirrors the wrapped typography baked into the original scroll model:
// each block sits on a cylinder around the garment, angle measured as atan2(x, z).
const WRAPPED_LINES = [
  { text: "STRYDE STUDIO", angle: 0.37, radius: 0.276, y: 0.28 },
  { text: "COLLECTION 01", angle: 2.58, radius: 0.318, y: 0.214 },
  { text: "CUT FOR THE CITY", angle: 2.58, radius: 0.318, y: 0.176 },
  { text: "DESIGNED IN STUDIO", angle: -0.6, radius: 0.317, y: 0.03 },
  { text: "RELEASED IN DROPS", angle: -0.6, radius: 0.317, y: -0.003 },
];

const MARQUEE_Z = -0.672;
const MARQUEE_SPEED = 0.12;
const MARQUEE_ROWS = [
  { text: "STRYDE  \u2014  STUDIO  \u2014  ", y: 0.25, size: 0.15, direction: -1 },
  { text: "COLLECTION 01  \u2014  NEXT DROP  \u2014  ", y: 0.02, size: 0.15, direction: 1 },
  { text: "STRYDE  \u2014  STUDIO  \u2014  ", y: -0.22, size: 0.15, direction: -1 },
];

function MarqueeRow({
  text,
  y,
  size,
  direction,
  material,
  animate,
}: {
  text: string;
  y: number;
  size: number;
  direction: number;
  material: THREE.Material;
  animate: boolean;
}) {
  const rowRef = useRef<THREE.Group>(null);
  const [width, setWidth] = useState(0);
  const repeated = text.repeat(4);

  useGSAP(
    () => {
      if (!rowRef.current || !width || !animate) return;
      const from = direction < 0 ? 0 : -width;
      const to = direction < 0 ? -width : 0;
      rowRef.current.position.x = from;
      gsap.to(rowRef.current.position, {
        x: to,
        duration: width / MARQUEE_SPEED,
        ease: "none",
        repeat: -1,
      });
    },
    { dependencies: [width, animate, direction] }
  );

  return (
    <group position={[0, y, MARQUEE_Z]}>
      <group ref={rowRef}>
        {[0, 1].map((copy) => (
          <Text
            key={copy}
            font={DISPLAY_FONT}
            fontSize={size}
            letterSpacing={0.08}
            anchorX="left"
            anchorY="middle"
            position-x={-3.2 + copy * width}
            material={material}
            onSync={(troika) => {
              if (copy !== 0) return;
              const bounds = troika.textRenderInfo?.blockBounds;
              if (bounds) setWidth(bounds[2] - bounds[0]);
            }}
          >
            {repeated}
          </Text>
        ))}
      </group>
    </group>
  );
}

export function SecondModel({ shirtType }: { shirtType: ShirtType }) {
  const { nodes } = useGLTF(
    "/models/ShirtScrolling.glb"
  ) as unknown as GLTFResult;
  const stencil = useMask(1, true);
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const reducedMotion = useReducedMotion();
  const textures = useShirtSectionTextures(shirtType, "second");
  const mats = createMaterials(textures, stencil) as Record<
    TextureKey<typeof shirtType, "second">,
    THREE.MeshBasicMaterial
  >;

  const groupRef = useRef<THREE.Group>(null);
  const textsRef = useRef<THREE.Group>(null);

  const textColor = shirtColors[shirtType]?.text ?? "black";
  const textsMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: textColor,
        transparent: true,
        opacity: 1,
        ...stencil,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [textColor]
  );
  const marqueeMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: textColor,
        transparent: true,
        opacity: 0,
        ...stencil,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [textColor]
  );

  useGSAP(() => {
    if (!groupRef.current) return;
    gsap
      .timeline({
        scrollTrigger: {
          trigger: "#second-section",
          start: "top top",
          end: "600% top",
          scrub: 1,
          pin: true,
        },
      })
      .to(groupRef.current.rotation, { x: 0, duration: 0.2 })
      .to(groupRef.current.position, { y: 0.7, duration: 0.8 }, "<")
      .to(groupRef.current.rotation, { y: -Math.PI * 2, duration: 0.8 }, "<")
      .to(groupRef.current.scale, { x: 1, y: 1, z: 1, duration: 0.1 })
      .to(textsMaterial, { opacity: 0, duration: 0.05 }, "<")
      .to(marqueeMaterial, { opacity: 0.1, duration: 0.05 }, "<")
      .to(groupRef.current.position, { y: 0.7 })
      .add(animateTexts(textsRef).duration(0.5), 0);
  }, []);

  const animateTexts = (textsRef: RefObject<THREE.Group | null>) => {
    const tl = gsap.timeline();
    if (!textsRef.current) return tl;
    const meshes: THREE.Object3D[] = [];
    textsRef.current.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) meshes.push(obj);
    });
    meshes.forEach((mesh, i) => {
      tl.from(
        mesh.scale,
        { x: 0, y: 0, z: 0, duration: 1, ease: "circ.out" },
        i * 0.1
      );
      tl.from(
        mesh.position,
        { y: "+=0.04", duration: 1, ease: "back.out" },
        i * 0.1
      );
    });
    return tl;
  };

  return (
    <group
      ref={groupRef}
      dispose={null}
      scale={isMobile ? 1.5 : 2.2}
      rotation={[Math.PI / 8, Math.PI / 3, 0]}
      position-y={0.1}
    >
      <mesh geometry={nodes.Shirt.geometry} material={mats.shirt} />
      <mesh geometry={nodes.Sphere_ENV.geometry} material={mats.sphere} />

      <group ref={textsRef}>
        {WRAPPED_LINES.map((line) => (
          <group key={line.text} rotation-y={line.angle}>
            <Text
              font={DISPLAY_FONT}
              fontSize={0.018}
              letterSpacing={0.12}
              anchorX="center"
              anchorY="middle"
              {...{ curveRadius: -line.radius }}
              position={[0, line.y, line.radius]}
              material={textsMaterial}
            >
              {line.text}
            </Text>
          </group>
        ))}
      </group>

      {MARQUEE_ROWS.map((row, i) => (
        <MarqueeRow
          key={i}
          {...row}
          material={marqueeMaterial}
          animate={!reducedMotion}
        />
      ))}
    </group>
  );
}
