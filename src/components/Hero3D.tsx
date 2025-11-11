import { Canvas, useFrame } from '@react-three/fiber';
import { Float, OrbitControls } from '@react-three/drei';
import { useRef, useState } from 'react';
import * as THREE from 'three';

interface FloatingDocumentProps {
  position: [number, number, number];
  rotation: [number, number, number];
  color: string;
  delay?: number;
}

function FloatingDocument({ position, rotation, color, delay = 0 }: FloatingDocumentProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      // Gentle floating animation
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + delay) * 0.3;
      meshRef.current.rotation.y += 0.002;

      // Scale on hover
      const targetScale = hovered ? 1.1 : 1;
      meshRef.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        0.1
      );
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      rotation={rotation}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Document shape */}
      <boxGeometry args={[1.2, 1.6, 0.05]} />
      <meshStandardMaterial
        color={color}
        roughness={0.3}
        metalness={0.1}
      />

      {/* Paper lines detail */}
      <mesh position={[0, 0.3, 0.026]}>
        <planeGeometry args={[0.8, 0.05]} />
        <meshBasicMaterial color="#ffffff" opacity={0.3} transparent />
      </mesh>
      <mesh position={[0, 0.15, 0.026]}>
        <planeGeometry args={[0.8, 0.05]} />
        <meshBasicMaterial color="#ffffff" opacity={0.3} transparent />
      </mesh>
      <mesh position={[0, 0, 0.026]}>
        <planeGeometry args={[0.8, 0.05]} />
        <meshBasicMaterial color="#ffffff" opacity={0.3} transparent />
      </mesh>
    </mesh>
  );
}

function ConnectionLines() {
  const points = [
    new THREE.Vector3(-2, 1, 0),
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(2, 1, 0),
  ];

  const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);

  return (
    <line geometry={lineGeometry}>
      <lineBasicMaterial color="#0891B2" opacity={0.3} transparent linewidth={2} />
    </line>
  );
}

function CenterIcon() {
  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
      <mesh position={[0, 0, 0]}>
        {/* Central share icon - using a stylized shape */}
        <torusGeometry args={[0.3, 0.08, 16, 32]} />
        <meshStandardMaterial
          color="#0891B2"
          emissive="#0891B2"
          emissiveIntensity={0.3}
        />
      </mesh>
      {/* Inner glow sphere */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshBasicMaterial color="#0EA5E9" transparent opacity={0.6} />
      </mesh>
    </Float>
  );
}

function Scene() {
  // ShareKit brand colors - cyan/ocean theme
  const colors = ['#0891B2', '#0EA5E9', '#06B6D4', '#22D3EE'];

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} />

      {/* Central sharing icon */}
      <CenterIcon />

      {/* Floating documents in circular arrangement */}
      <FloatingDocument
        position={[-2, 1, 0]}
        rotation={[0.2, -0.3, 0.1]}
        color={colors[0]}
        delay={0}
      />
      <FloatingDocument
        position={[0, -0.5, -1]}
        rotation={[-0.1, 0.2, -0.1]}
        color={colors[1]}
        delay={1}
      />
      <FloatingDocument
        position={[2, 1, 0]}
        rotation={[0.1, 0.3, -0.2]}
        color={colors[2]}
        delay={2}
      />
      <FloatingDocument
        position={[0, 2, 1]}
        rotation={[-0.2, 0, 0.1]}
        color={colors[3]}
        delay={3}
      />

      {/* Connection lines (shows sharing concept) */}
      <ConnectionLines />

      {/* Orbit controls for user interaction */}
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        maxPolarAngle={Math.PI / 2}
        minPolarAngle={Math.PI / 3}
        autoRotate
        autoRotateSpeed={0.5}
      />
    </>
  );
}

export default function Hero3D() {
  return (
    <div className="w-full h-[400px] md:h-[500px] pointer-events-auto">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 50 }}
        style={{ background: 'transparent' }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}
