import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sphere } from '@react-three/drei';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';

// Animated network node
function NetworkNode({ position, color, delay = 0 }: { position: [number, number, number], color: string, delay?: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current && glowRef.current) {
      const t = state.clock.elapsedTime + delay;

      // Orbital movement
      const radius = 3;
      meshRef.current.position.x = position[0] + Math.cos(t * 0.3) * 0.5;
      meshRef.current.position.y = position[1] + Math.sin(t * 0.2) * 0.5;
      meshRef.current.position.z = position[2] + Math.sin(t * 0.25) * 0.5;

      // Pulsing glow
      const pulse = Math.sin(t * 2) * 0.3 + 1;
      glowRef.current.scale.setScalar(pulse);
      glowRef.current.position.copy(meshRef.current.position);
    }
  });

  return (
    <group>
      {/* Outer glow */}
      <mesh ref={glowRef} position={position}>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.2} />
      </mesh>

      {/* Main sphere */}
      <mesh ref={meshRef} position={position}>
        <sphereGeometry args={[0.15, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
    </group>
  );
}

// Dynamic connection lines
function DynamicConnections() {
  const linesRef = useRef<THREE.LineSegments>(null);

  const nodePositions = useMemo(() => [
    new THREE.Vector3(-2.5, 1.5, 0),
    new THREE.Vector3(2.5, 1.5, 0),
    new THREE.Vector3(-2, -1.5, 1),
    new THREE.Vector3(2, -1.5, 1),
    new THREE.Vector3(0, 2, -1),
    new THREE.Vector3(0, -2, -1),
  ], []);

  useFrame((state) => {
    if (linesRef.current) {
      const t = state.clock.elapsedTime;
      const positions = linesRef.current.geometry.attributes.position.array as Float32Array;

      let idx = 0;
      for (let i = 0; i < nodePositions.length; i++) {
        for (let j = i + 1; j < nodePositions.length; j++) {
          const start = nodePositions[i];
          const end = nodePositions[j];

          // Animate line positions slightly
          positions[idx++] = start.x + Math.cos(t * 0.3 + i) * 0.5;
          positions[idx++] = start.y + Math.sin(t * 0.2 + i) * 0.5;
          positions[idx++] = start.z + Math.sin(t * 0.25 + i) * 0.5;

          positions[idx++] = end.x + Math.cos(t * 0.3 + j) * 0.5;
          positions[idx++] = end.y + Math.sin(t * 0.2 + j) * 0.5;
          positions[idx++] = end.z + Math.sin(t * 0.25 + j) * 0.5;
        }
      }

      linesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  const lineGeometry = useMemo(() => {
    const positions: number[] = [];

    for (let i = 0; i < nodePositions.length; i++) {
      for (let j = i + 1; j < nodePositions.length; j++) {
        positions.push(
          nodePositions[i].x, nodePositions[i].y, nodePositions[i].z,
          nodePositions[j].x, nodePositions[j].y, nodePositions[j].z
        );
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    return geometry;
  }, [nodePositions]);

  return (
    <lineSegments ref={linesRef} geometry={lineGeometry}>
      <lineBasicMaterial color="#0EA5E9" transparent opacity={0.2} />
    </lineSegments>
  );
}

// Central animated sphere
function CentralOrb() {
  const orbRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (orbRef.current) {
      orbRef.current.rotation.y = state.clock.elapsedTime * 0.3;
      orbRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.2;
    }
  });

  return (
    <group ref={orbRef}>
      <Float speed={2} rotationIntensity={0.3} floatIntensity={0.8}>
        {/* Main glass-like sphere */}
        <Sphere args={[1, 64, 64]}>
          <MeshDistortMaterial
            color="#0EA5E9"
            attach="material"
            distort={0.3}
            speed={2}
            roughness={0}
            metalness={0.1}
            transparent
            opacity={0.6}
          />
        </Sphere>

        {/* Inner core */}
        <Sphere args={[0.5, 32, 32]}>
          <meshStandardMaterial
            color="#22D3EE"
            emissive="#0EA5E9"
            emissiveIntensity={1}
            metalness={1}
            roughness={0}
          />
        </Sphere>

        {/* Outer glow ring */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.3, 0.03, 16, 100]} />
          <meshBasicMaterial color="#0EA5E9" transparent opacity={0.4} />
        </mesh>
      </Float>
    </group>
  );
}

// Particle field
function ParticleField() {
  const particlesRef = useRef<THREE.Points>(null);

  const particles = useMemo(() => {
    const count = 150;
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const radius = 8;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;

      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);
    }

    return positions;
  }, []);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.05;
      particlesRef.current.rotation.x = state.clock.elapsedTime * 0.02;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particles.length / 3}
          array={particles}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#0EA5E9"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

function Scene() {
  const colors = ['#0EA5E9', '#22D3EE', '#06B6D4', '#0891B2', '#67E8F9', '#A5F3FC'];

  return (
    <>
      {/* Enhanced lighting */}
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#0EA5E9" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#22D3EE" />
      <spotLight position={[0, 10, 0]} angle={0.3} penumbra={1} intensity={1} color="#ffffff" />

      {/* Particle background */}
      <ParticleField />

      {/* Central animated orb */}
      <CentralOrb />

      {/* Network nodes */}
      <NetworkNode position={[-2.5, 1.5, 0]} color={colors[0]} delay={0} />
      <NetworkNode position={[2.5, 1.5, 0]} color={colors[1]} delay={1} />
      <NetworkNode position={[-2, -1.5, 1]} color={colors[2]} delay={2} />
      <NetworkNode position={[2, -1.5, 1]} color={colors[3]} delay={3} />
      <NetworkNode position={[0, 2, -1]} color={colors[4]} delay={4} />
      <NetworkNode position={[0, -2, -1]} color={colors[5]} delay={5} />

      {/* Dynamic connection lines */}
      <DynamicConnections />
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
