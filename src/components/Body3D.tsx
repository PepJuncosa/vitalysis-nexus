import { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, MeshWobbleMaterial } from "@react-three/drei";
import * as THREE from "three";

interface BodyPart {
  position: [number, number, number];
  scale: [number, number, number];
  color: string;
  name: string;
  id: string;
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
  isSelected, 
  onClick 
}: BodyPart & { isSelected: boolean; onClick: (id: string) => void }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current && (isSelected || hovered)) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.05;
    } else if (meshRef.current) {
      meshRef.current.position.y = position[1];
    }
  });

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
      <MeshWobbleMaterial
        color={isSelected || hovered ? color : "#6b7280"}
        factor={isSelected ? 0.3 : 0.1}
        speed={isSelected ? 2 : 1}
        transparent
        opacity={isSelected || hovered ? 1 : 0.7}
        emissive={isSelected || hovered ? color : "#000000"}
        emissiveIntensity={isSelected || hovered ? 0.5 : 0}
      />
    </mesh>
  );
}

function Heart3D({ 
  isSelected, 
  onClick 
}: { isSelected: boolean; onClick: (id: string) => void }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 3) * 0.05 + 1;
      meshRef.current.scale.setScalar((isSelected || hovered ? 0.25 : 0.2) * pulse);
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={[0, 0.8, 0.3]}
      onClick={(e) => {
        e.stopPropagation();
        onClick("heart");
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
      <MeshWobbleMaterial
        color={isSelected || hovered ? "#ef4444" : "#6b7280"}
        factor={0.5}
        speed={3}
        transparent
        opacity={isSelected || hovered ? 1 : 0.7}
        emissive={isSelected || hovered ? "#ef4444" : "#000000"}
        emissiveIntensity={isSelected || hovered ? 0.8 : 0}
      />
    </mesh>
  );
}

function Scene({ selectedPart, onPartClick }: Body3DProps) {
  const bodyParts: BodyPart[] = [
    // Head
    { position: [0, 2.2, 0], scale: [0.6, 0.7, 0.6], color: "#0ea5e9", name: "Cabeza", id: "head" },
    
    // Chest & Torso
    { position: [0, 1, 0], scale: [1, 1.2, 0.6], color: "#0ea5e9", name: "Pecho", id: "chest" },
    { position: [0, 0.3, 0], scale: [0.9, 0.8, 0.5], color: "#0ea5e9", name: "Abdomen", id: "abs" },
    
    // Arms
    { position: [-0.8, 1.2, 0], scale: [0.25, 0.8, 0.25], color: "#f59e0b", name: "Hombro Izq", id: "left-shoulder" },
    { position: [-0.8, 0.3, 0], scale: [0.2, 0.7, 0.2], color: "#f59e0b", name: "Brazo Izq", id: "left-arm" },
    { position: [0.8, 1.2, 0], scale: [0.25, 0.8, 0.25], color: "#f59e0b", name: "Hombro Der", id: "right-shoulder" },
    { position: [0.8, 0.3, 0], scale: [0.2, 0.7, 0.2], color: "#f59e0b", name: "Brazo Der", id: "right-arm" },
    
    // Back
    { position: [0, 1, -0.3], scale: [1, 1.2, 0.3], color: "#22c55e", name: "Espalda", id: "back" },
    
    // Legs
    { position: [-0.3, -0.8, 0], scale: [0.3, 1.2, 0.3], color: "#8b5cf6", name: "Cuádriceps Izq", id: "left-quad" },
    { position: [0.3, -0.8, 0], scale: [0.3, 1.2, 0.3], color: "#8b5cf6", name: "Cuádriceps Der", id: "right-quad" },
    { position: [-0.3, -0.8, -0.15], scale: [0.25, 1.1, 0.25], color: "#8b5cf6", name: "Isquio Izq", id: "left-hamstring" },
    { position: [0.3, -0.8, -0.15], scale: [0.25, 1.1, 0.25], color: "#8b5cf6", name: "Isquio Der", id: "right-hamstring" },
    { position: [-0.3, -2.1, 0], scale: [0.25, 0.8, 0.3], color: "#8b5cf6", name: "Pantorrilla Izq", id: "left-calf" },
    { position: [0.3, -2.1, 0], scale: [0.25, 0.8, 0.3], color: "#8b5cf6", name: "Pantorrilla Der", id: "right-calf" },
  ];

  return (
    <>
      <ambientLight intensity={0.6} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
      <spotLight position={[-10, 10, -10]} angle={0.15} penumbra={1} intensity={0.5} />
      <pointLight position={[0, 5, 5]} intensity={0.5} color="#0ea5e9" />
      
      <Heart3D isSelected={selectedPart === "heart"} onClick={onPartClick} />
      
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
        enablePan={false}
        minDistance={3}
        maxDistance={8}
        autoRotate
        autoRotateSpeed={1}
      />
    </>
  );
}

export default function Body3D({ selectedPart, onPartClick }: Body3DProps) {
  return (
    <div className="w-full h-full">
      <Canvas 
        camera={{ position: [0, 1, 5], fov: 50 }}
        className="rounded-lg"
      >
        <Scene selectedPart={selectedPart} onPartClick={onPartClick} />
      </Canvas>
    </div>
  );
}
