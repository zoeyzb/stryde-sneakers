import { useFrame } from "@react-three/fiber";
import { easing } from "maath";
import { useReducedMotion } from "@/lib/useReducedMotion";

const Rig = () => {
  const reducedMotion = useReducedMotion();
  return useFrame((state, delta) => {
    const x = reducedMotion ? 0 : state.pointer.x;
    easing.damp3(
      state.camera.position,
      [x * 0.5, 0.7, 3 - Math.abs(x * 0.2)],
      1,
      delta
    );
    state.camera.lookAt(0, 0.7, 0);
  });
};
export default Rig;
