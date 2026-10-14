// Load only assets for the current view. Preloading every collection and video
// on the homepage caused unnecessary bandwidth and a prolonged blank loader.
import { useGLTF } from "@react-three/drei";
useGLTF.preload("/models/main/MainStudio.glb");
export default function AssetsPreload() { return null; }
