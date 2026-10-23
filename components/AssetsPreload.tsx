import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { environmentPaths, ShirtType, studioTextures } from "@/lib/textures";
import { useGLTF, useTexture } from "@react-three/drei";

const SHIRTS = Object.keys(studioTextures.shirts) as ShirtType[];
const STUDIO_MODELS: Record<ShirtType, string> = {
  white: "/models/white/WhiteStudio.glb",
  sport: "/models/sport/SportStudio.glb",
  gray: "/models/gray/GrayStudio.glb",
};
const CUBE_SIDES = ["px.png", "nx.png", "py.png", "ny.png", "pz.png", "nz.png"];

function preloadShirt(shirt: ShirtType) {
  useGLTF.preload(STUDIO_MODELS[shirt]);
  useGLTF.preload("/models/ShirtScrolling.glb");
  for (const section of Object.values(studioTextures.shirts[shirt])) {
    for (const path of Object.values(section as Record<string, string>)) useTexture.preload(path);
  }
  for (const side of CUBE_SIDES) useTexture.preload(`${environmentPaths[shirt]}${side}`);
}

function constrained() {
  const nav = navigator as Navigator & {
    connection?: { saveData?: boolean; effectiveType?: string };
    deviceMemory?: number;
  };
  return (
    nav.connection?.saveData === true ||
    /(^|-)2g$/.test(nav.connection?.effectiveType ?? "") ||
    (nav.deviceMemory !== undefined && nav.deviceMemory <= 2)
  );
}

/**
 * Warms the asset cache in priority order: the current scene first, the
 * remaining garments only once the browser is idle and the connection allows.
 */
const AssetsPreload = () => {
  const pathname = usePathname();

  useEffect(() => {
    const current = SHIRTS.find((s) => pathname === `/shirts/${s}`);
    if (current) preloadShirt(current);
    else {
      useGLTF.preload("/models/main/MainStudio.glb");
      for (const path of Object.values(studioTextures.main)) useTexture.preload(path);
    }
    if (constrained()) return;

    const idle =
      window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 2500) as unknown as number);
    const cancel = window.cancelIdleCallback ?? window.clearTimeout;
    const handle = idle(() => SHIRTS.filter((s) => s !== current).forEach(preloadShirt));
    return () => cancel(handle);
  }, [pathname]);

  return null;
};

export default AssetsPreload;
