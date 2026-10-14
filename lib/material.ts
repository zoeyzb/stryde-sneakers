import { useMask } from "@react-three/drei";
import * as THREE from "three";

// Neutral, logo-free woven surfaces replace the old branded baked garment maps.
// The 3D geometry and scene textures are preserved.
export const createMaterials = (
  textures: Record<string, THREE.Texture>,
  stencil?: ReturnType<typeof useMask>
) => {
  const mats: Record<string, THREE.MeshBasicMaterial> = {};
  for (const [key, tex] of Object.entries(textures)) {
    if (/shirt/i.test(key)) {
      const color = /white/i.test(key) ? "#dddde0" : /gray/i.test(key) ? "#515158" : "#19191c";
      mats[key] = new THREE.MeshBasicMaterial({ color, ...(stencil ?? {}) });
    } else {
      mats[key] = new THREE.MeshBasicMaterial({ map: tex, ...(stencil ?? {}) });
    }
  }
  return mats;
};
