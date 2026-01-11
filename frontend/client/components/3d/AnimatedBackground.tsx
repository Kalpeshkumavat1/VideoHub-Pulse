import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Sphere, PerspectiveCamera } from "@react-three/drei";
import { useRef } from "react";

function AnimatedSpheres() {
  const groupRef = useRef<any>(null);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.x += 0.0003;
      groupRef.current.rotation.y += 0.0005;
    }
  });

  return (
    <group ref={groupRef}>
      <Sphere args={[8, 64, 64]} position={[-15, 5, -10]}>
        <meshStandardMaterial
          color="#3b82f6"
          wireframe={true}
          emissive="#3b82f6"
          emissiveIntensity={0.2}
          opacity={0.3}
          transparent
        />
      </Sphere>

      <Sphere args={[12, 64, 64]} position={[20, -8, -15]}>
        <meshStandardMaterial
          color="#8b5cf6"
          wireframe={true}
          emissive="#8b5cf6"
          emissiveIntensity={0.2}
          opacity={0.2}
          transparent
        />
      </Sphere>

      <Sphere args={[6, 32, 32]} position={[0, 15, -20]}>
        <meshStandardMaterial
          color="#dc5a38"
          emissive="#dc5a38"
          emissiveIntensity={0.4}
          opacity={0.4}
          transparent
        />
      </Sphere>
    </group>
  );
}

interface AnimatedBackgroundProps {
  interactive?: boolean;
}

export function AnimatedBackground({ interactive = true }: AnimatedBackgroundProps) {
  return (
    <div className="absolute inset-0 w-full h-full">
      <Canvas
        dpr={[1, 2]}
        performance={{ min: 0.1 }}
        className="!absolute !inset-0"
      >
        <PerspectiveCamera makeDefault position={[0, 0, 35]} />
        <color attach="background" args={["#0f172a"]} />

        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, 5]} intensity={0.5} color="#8b5cf6" />

        <AnimatedSpheres />

        {interactive && (
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate
            autoRotateSpeed={0.5}
          />
        )}
      </Canvas>
    </div>
  );
}
