"use client";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

/**
 * The CAP crew — three cap characters (Content, Analytics, Production)
 * drawn with simple geometry. They bob, and their eyes follow the pointer.
 */
type CapProps = { color: string; position: [number, number, number]; phase: number; tilt: number };

function Eye({ x }: { x: number }) {
  const pupil = useRef<THREE.Mesh>(null);
  const { pointer } = useThree();
  useFrame(() => {
    if (!pupil.current) return;
    pupil.current.position.x = THREE.MathUtils.lerp(pupil.current.position.x, pointer.x * 0.035, 0.12);
    pupil.current.position.y = THREE.MathUtils.lerp(pupil.current.position.y, pointer.y * 0.035, 0.12);
  });
  return (
    <group position={[x, 0, 0]}>
      <mesh scale={[1, 1.25, 0.4]}>
        <sphereGeometry args={[0.085, 24, 24]} />
        <meshStandardMaterial color="#f8f6f1" roughness={0.4} />
      </mesh>
      <mesh ref={pupil} position={[0, 0, 0.03]}>
        <sphereGeometry args={[0.045, 20, 20]} />
        <meshStandardMaterial color="#1b1a17" roughness={0.3} />
      </mesh>
    </group>
  );
}

function Cap({ color, position, phase, tilt }: CapProps) {
  const g = useRef<THREE.Group>(null);
  const { pointer } = useThree();
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ color, roughness: 0.75, metalness: 0 }), [color]);

  useFrame(({ clock }) => {
    if (!g.current) return;
    const t = clock.getElapsedTime() + phase;
    g.current.position.y = position[1] + Math.sin(t * 1.4) * 0.08;
    g.current.rotation.y = THREE.MathUtils.lerp(g.current.rotation.y, pointer.x * 0.5 + tilt, 0.05);
    g.current.rotation.x = THREE.MathUtils.lerp(g.current.rotation.x, -pointer.y * 0.25, 0.05);
    g.current.rotation.z = Math.sin(t * 0.9) * 0.04;
  });

  return (
    <group ref={g} position={position}>
      {/* crown */}
      <mesh material={mat} castShadow scale={[1, 0.82, 1]}>
        <sphereGeometry args={[0.62, 48, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
      </mesh>
      <mesh material={mat} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.62, 48]} />
      </mesh>
      {/* button */}
      <mesh material={mat} position={[0, 0.51, 0]}>
        <sphereGeometry args={[0.06, 16, 16]} />
      </mesh>
      {/* brim */}
      <mesh material={mat} position={[0, 0.01, 0.55]} scale={[1, 0.12, 0.9]} castShadow>
        <cylinderGeometry args={[0.5, 0.52, 0.3, 48, 1, false, -Math.PI / 2, Math.PI]} />
      </mesh>
      {/* face */}
      <group position={[0, 0.27, 0.52]} rotation={[-0.35, 0, 0]}>
        <Eye x={-0.15} />
        <Eye x={0.15} />
      </group>
    </group>
  );
}

function Floor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.75, 0]} receiveShadow>
      <circleGeometry args={[6, 64]} />
      <shadowMaterial opacity={0.12} />
    </mesh>
  );
}

/** Pulls the camera back on narrow (portrait) screens so all three caps stay in frame. */
function FitCamera() {
  const { camera, size } = useThree();
  useFrame(() => {
    const cam = camera as THREE.PerspectiveCamera;
    const aspect = size.width / Math.max(1, size.height);
    const halfWidthNeeded = 2.75; // outer caps sit at ±1.75 and are ~1.6 wide, plus a little air
    const fit = halfWidthNeeded / (Math.tan(THREE.MathUtils.degToRad(cam.fov / 2)) * aspect);
    const z = Math.max(5.2, fit);
    if (Math.abs(cam.position.z - z) > 0.01) {
      cam.position.z = z;
    }
  });
  return null;
}

export default function MascotScene() {
  return (
    <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 0.8, 5.2], fov: 36 }} gl={{ antialias: true, alpha: true }}>
      <FitCamera />
      <ambientLight intensity={1.1} />
      <directionalLight position={[3, 5, 4]} intensity={1.6} castShadow shadow-mapSize={[1024, 1024]} />
      <directionalLight position={[-4, 2, -2]} intensity={0.4} color="#ffe9d6" />
      <Cap color="#cf8a5f" position={[-1.75, -0.15, 0]} phase={0} tilt={0.35} />
      <Cap color="#6fae8b" position={[0, 0.05, -0.4]} phase={1.2} tilt={0} />
      <Cap color="#8a7bb5" position={[1.75, -0.15, 0]} phase={2.4} tilt={-0.35} />
      <Floor />
    </Canvas>
  );
}
