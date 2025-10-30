import { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

interface BodyPart {
  position: [number, number, number];
  scale: [number, number, number];
  color: string;
  name: string;
  id: string;
  type?: 'organ' | 'muscle' | 'bone';
}

interface Body3DProps {
  selectedPart: string | null;
  onPartClick: (partId: string) => void;
}

function BodyPart3D({ 
  position, 
  scale, 
  color, 
  name, 
  id,
  type = 'muscle',
  isSelected, 
  onClick 
}: BodyPart & { isSelected: boolean; onClick: (id: string) => void }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      if (isSelected || hovered) {
        meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.05;
      } else {
        meshRef.current.position.y = position[1];
      }
      
      // Efecto de pulso en el brillo
      const material = meshRef.current.material as THREE.MeshPhysicalMaterial;
      if (material.emissiveIntensity !== undefined) {
        material.emissiveIntensity = (isSelected || hovered) 
          ? 0.8 + Math.sin(state.clock.elapsedTime * 3) * 0.2
          : 0.3 + Math.sin(state.clock.elapsedTime * 1.5) * 0.1;
      }
    }
  });

  const baseOpacity = type === 'organ' ? 0.5 : type === 'bone' ? 0.3 : 0.25;
  const activeOpacity = type === 'organ' ? 0.9 : type === 'bone' ? 0.6 : 0.5;

  return (
    <mesh
      ref={meshRef}
      position={position}
      scale={scale}
      onClick={(e) => {
        e.stopPropagation();
        onClick(id);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = "auto";
      }}
    >
      <boxGeometry />
      <meshPhysicalMaterial
        color={color}
        transparent
        opacity={isSelected || hovered ? activeOpacity : baseOpacity}
        emissive={color}
        emissiveIntensity={isSelected || hovered ? 0.8 : 0.3}
        metalness={0.2}
        roughness={0.3}
        clearcoat={1}
        clearcoatRoughness={0.2}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function OrganMesh({ 
  position,
  id,
  color,
  isSelected, 
  onClick 
}: { 
  position: [number, number, number];
  id: string;
  color: string;
  isSelected: boolean; 
  onClick: (id: string) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 3) * 0.05 + 1;
      meshRef.current.scale.setScalar((isSelected || hovered ? 0.25 : 0.2) * pulse);
      
      const material = meshRef.current.material as THREE.MeshPhysicalMaterial;
      if (material.emissiveIntensity !== undefined) {
        material.emissiveIntensity = (isSelected || hovered) 
          ? 1.2 + Math.sin(state.clock.elapsedTime * 4) * 0.3
          : 0.5 + Math.sin(state.clock.elapsedTime * 2) * 0.2;
      }
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        onClick(id);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = "auto";
      }}
    >
      <sphereGeometry args={[1, 32, 32]} />
      <meshPhysicalMaterial
        color={color}
        transparent
        opacity={isSelected || hovered ? 0.9 : 0.6}
        emissive={color}
        emissiveIntensity={isSelected || hovered ? 1.2 : 0.5}
        metalness={0.3}
        roughness={0.2}
        clearcoat={1}
        clearcoatRoughness={0.1}
      />
    </mesh>
  );
}

function Scene({ selectedPart, onPartClick }: Body3DProps) {
  const cyanColor = "#00d9ff";
  const darkCyanColor = "#0099cc";
  const brightCyanColor = "#00ffff";
  const redColor = "#ff0066";
  
  const bodyParts: BodyPart[] = [
    // Cabeza y cuello
    { position: [0, 2.2, 0], scale: [0.6, 0.7, 0.6], color: cyanColor, name: "Cabeza", id: "head", type: 'bone' },
    { position: [0, 1.85, 0], scale: [0.3, 0.35, 0.3], color: darkCyanColor, name: "Cuello", id: "neck", type: 'muscle' },
    
    // Torso y pecho
    { position: [0, 1, 0], scale: [1, 1.2, 0.6], color: cyanColor, name: "Pecho", id: "chest", type: 'muscle' },
    { position: [-0.4, 1.1, 0.3], scale: [0.35, 0.5, 0.15], color: darkCyanColor, name: "Pectoral Izq", id: "left-pectoral", type: 'muscle' },
    { position: [0.4, 1.1, 0.3], scale: [0.35, 0.5, 0.15], color: darkCyanColor, name: "Pectoral Der", id: "right-pectoral", type: 'muscle' },
    { position: [0, 0.3, 0], scale: [0.9, 0.8, 0.5], color: cyanColor, name: "Abdomen", id: "abs", type: 'muscle' },
    { position: [0, 0.3, 0.25], scale: [0.6, 0.7, 0.15], color: darkCyanColor, name: "Core", id: "core", type: 'muscle' },
    
    // Espalda
    { position: [0, 1, -0.3], scale: [1, 1.2, 0.3], color: brightCyanColor, name: "Espalda", id: "back", type: 'muscle' },
    { position: [0, 1.3, -0.35], scale: [0.8, 0.5, 0.2], color: darkCyanColor, name: "Trapecio", id: "trapezius", type: 'muscle' },
    { position: [0, 0.8, -0.35], scale: [0.7, 0.6, 0.2], color: darkCyanColor, name: "Dorsales", id: "lats", type: 'muscle' },
    
    // Hombros y brazos
    { position: [-0.8, 1.2, 0], scale: [0.25, 0.8, 0.25], color: brightCyanColor, name: "Hombro Izq", id: "left-shoulder", type: 'muscle' },
    { position: [0.8, 1.2, 0], scale: [0.25, 0.8, 0.25], color: brightCyanColor, name: "Hombro Der", id: "right-shoulder", type: 'muscle' },
    { position: [-0.8, 1.3, 0], scale: [0.3, 0.3, 0.3], color: darkCyanColor, name: "Deltoides Izq", id: "left-deltoid", type: 'muscle' },
    { position: [0.8, 1.3, 0], scale: [0.3, 0.3, 0.3], color: darkCyanColor, name: "Deltoides Der", id: "right-deltoid", type: 'muscle' },
    
    // Bíceps y tríceps
    { position: [-0.8, 0.5, 0.1], scale: [0.18, 0.6, 0.18], color: cyanColor, name: "Bíceps Izq", id: "left-bicep", type: 'muscle' },
    { position: [0.8, 0.5, 0.1], scale: [0.18, 0.6, 0.18], color: cyanColor, name: "Bíceps Der", id: "right-bicep", type: 'muscle' },
    { position: [-0.8, 0.5, -0.1], scale: [0.18, 0.6, 0.18], color: darkCyanColor, name: "Tríceps Izq", id: "left-tricep", type: 'muscle' },
    { position: [0.8, 0.5, -0.1], scale: [0.18, 0.6, 0.18], color: darkCyanColor, name: "Tríceps Der", id: "right-tricep", type: 'muscle' },
    
    // Antebrazos
    { position: [-0.8, -0.2, 0], scale: [0.15, 0.6, 0.15], color: brightCyanColor, name: "Antebrazo Izq", id: "left-forearm", type: 'muscle' },
    { position: [0.8, -0.2, 0], scale: [0.15, 0.6, 0.15], color: brightCyanColor, name: "Antebrazo Der", id: "right-forearm", type: 'muscle' },
    
    // Manos
    { position: [-0.8, -0.6, 0], scale: [0.12, 0.15, 0.08], color: cyanColor, name: "Mano Izq", id: "left-hand", type: 'bone' },
    { position: [0.8, -0.6, 0], scale: [0.12, 0.15, 0.08], color: cyanColor, name: "Mano Der", id: "right-hand", type: 'bone' },
    
    // Glúteos y cadera
    { position: [0, -0.1, -0.2], scale: [0.8, 0.4, 0.3], color: darkCyanColor, name: "Glúteos", id: "glutes", type: 'muscle' },
    { position: [0, -0.1, 0], scale: [0.9, 0.3, 0.4], color: cyanColor, name: "Cadera", id: "hips", type: 'bone' },
    
    // Piernas - Cuádriceps
    { position: [-0.3, -0.8, 0.05], scale: [0.3, 1.2, 0.25], color: brightCyanColor, name: "Cuádriceps Izq", id: "left-quad", type: 'muscle' },
    { position: [0.3, -0.8, 0.05], scale: [0.3, 1.2, 0.25], color: brightCyanColor, name: "Cuádriceps Der", id: "right-quad", type: 'muscle' },
    
    // Isquiotibiales
    { position: [-0.3, -0.8, -0.15], scale: [0.25, 1.1, 0.25], color: darkCyanColor, name: "Isquio Izq", id: "left-hamstring", type: 'muscle' },
    { position: [0.3, -0.8, -0.15], scale: [0.25, 1.1, 0.25], color: darkCyanColor, name: "Isquio Der", id: "right-hamstring", type: 'muscle' },
    
    // Aductores
    { position: [-0.15, -0.9, 0], scale: [0.15, 1, 0.15], color: cyanColor, name: "Aductor Izq", id: "left-adductor", type: 'muscle' },
    { position: [0.15, -0.9, 0], scale: [0.15, 1, 0.15], color: cyanColor, name: "Aductor Der", id: "right-adductor", type: 'muscle' },
    
    // Pantorrillas
    { position: [-0.3, -2.1, 0], scale: [0.25, 0.8, 0.25], color: brightCyanColor, name: "Pantorrilla Izq", id: "left-calf", type: 'muscle' },
    { position: [0.3, -2.1, 0], scale: [0.25, 0.8, 0.25], color: brightCyanColor, name: "Pantorrilla Der", id: "right-calf", type: 'muscle' },
    
    // Tibiales
    { position: [-0.3, -2.1, 0.12], scale: [0.15, 0.7, 0.15], color: darkCyanColor, name: "Tibial Izq", id: "left-tibial", type: 'muscle' },
    { position: [0.3, -2.1, 0.12], scale: [0.15, 0.7, 0.15], color: darkCyanColor, name: "Tibial Der", id: "right-tibial", type: 'muscle' },
    
    // Pies
    { position: [-0.3, -2.6, 0.05], scale: [0.2, 0.1, 0.25], color: cyanColor, name: "Pie Izq", id: "left-foot", type: 'bone' },
    { position: [0.3, -2.6, 0.05], scale: [0.2, 0.1, 0.25], color: cyanColor, name: "Pie Der", id: "right-foot", type: 'bone' },
  ];

  return (
    <>
      {/* Iluminación estilo rayos X */}
      <ambientLight intensity={0.3} color="#00d9ff" />
      <pointLight position={[0, 3, 5]} intensity={1.5} color="#00ffff" />
      <pointLight position={[0, 0, -5]} intensity={1} color="#0099cc" />
      <pointLight position={[5, 1, 0]} intensity={0.8} color="#00d9ff" />
      <pointLight position={[-5, 1, 0]} intensity={0.8} color="#00d9ff" />
      <hemisphereLight args={["#00ffff", "#003366", 0.5]} />
      
      {/* Órganos internos */}
      <OrganMesh 
        position={[0, 0.9, 0.15]} 
        id="heart" 
        color={redColor}
        isSelected={selectedPart === "heart"} 
        onClick={onPartClick} 
      />
      <OrganMesh 
        position={[-0.25, 0.95, 0.1]} 
        id="left-lung" 
        color={cyanColor}
        isSelected={selectedPart === "left-lung"} 
        onClick={onPartClick} 
      />
      <OrganMesh 
        position={[0.25, 0.95, 0.1]} 
        id="right-lung" 
        color={cyanColor}
        isSelected={selectedPart === "right-lung"} 
        onClick={onPartClick} 
      />
      <OrganMesh 
        position={[0, 0.2, 0.15]} 
        id="stomach" 
        color={darkCyanColor}
        isSelected={selectedPart === "stomach"} 
        onClick={onPartClick} 
      />
      <OrganMesh 
        position={[-0.15, 0.5, 0.2]} 
        id="liver" 
        color="#ff6600"
        isSelected={selectedPart === "liver"} 
        onClick={onPartClick} 
      />
      
      {bodyParts.map((part) => (
        <BodyPart3D
          key={part.id}
          {...part}
          isSelected={selectedPart === part.id}
          onClick={onPartClick}
        />
      ))}
      
      <OrbitControls 
        enableZoom={true}
        enablePan={true}
        minDistance={4}
        maxDistance={12}
        autoRotate
        autoRotateSpeed={0.5}
        maxPolarAngle={Math.PI * 0.9}
        minPolarAngle={Math.PI * 0.1}
      />
      
      {/* Fondo oscuro para efecto rayos X */}
      <mesh position={[0, 0, -8]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshBasicMaterial color="#000814" />
      </mesh>
    </>
  );
}

export default function Body3D({ selectedPart, onPartClick }: Body3DProps) {
  return (
    <div className="w-full h-full">
      <Canvas 
        camera={{ position: [0, 0.5, 6], fov: 50 }}
        className="rounded-lg"
        gl={{ 
          antialias: true,
          alpha: true,
          powerPreference: "high-performance"
        }}
        style={{ background: 'radial-gradient(circle at center, #001a33 0%, #000000 100%)' }}
      >
        <Scene selectedPart={selectedPart} onPartClick={onPartClick} />
      </Canvas>
    </div>
  );
}
