// Preload only the homepage scene. Product scenes are loaded on navigation,
// preserving all original meshes, branded textures, videos and GSAP animations.
import { useGLTF, useTexture } from "@react-three/drei";
import { studioTextures } from "@/lib/textures";
useGLTF.preload("/models/main/MainStudio.glb");
Object.values(studioTextures.main).forEach((path) => useTexture.preload(path));
export default function AssetsPreload() { return null; }
