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
  type?: 'organ' | 'muscle' | 'bone' | 'skin';
  layer: 'skeleton' | 'muscle' | 'skin' | 'organ';
  recovery?: number; // Porcentaje de recuperación 0-100
}

interface Body3DProps {
  selectedPart: string | null;
  onPartClick: (partId: string) => void;
  activeLayers: {
    skeleton: boolean;
    muscle: boolean;
    skin: boolean;
    organ: boolean;
  };
  injuries: Array<{
    id: string;
    partId: string;
    type: string;
    date: string;
    recovery: number;
    description: string;
  }>;
}

// Función para obtener color según recuperación
function getRecoveryColor(recovery: number | undefined): string {
  if (recovery === undefined) return "#00d9ff"; // Color por defecto
  if (recovery < 30) return "#FF0000"; // Rojo
  if (recovery < 70) return "#FFA500"; // Naranja
  if (recovery < 100) return "#00FF7F"; // Verde
  return "#00d9ff"; // Completamente recuperado
}

function BodyPart3D({ 
  position, 
  scale, 
  color, 
  name, 
  id,
  type = 'muscle',
  layer,
  recovery,
  isSelected, 
  onClick,
  visible
}: BodyPart & { isSelected: boolean; onClick: (id: string) => void; visible: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // Determinar color basado en recuperación
  const finalColor = recovery !== undefined ? getRecoveryColor(recovery) : color;

  useFrame((state) => {
    if (meshRef.current && visible) {
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

  if (!visible) return null;

  const baseOpacity = type === 'organ' ? 0.5 : type === 'bone' ? 0.3 : type === 'skin' ? 0.15 : 0.25;
  const activeOpacity = type === 'organ' ? 0.9 : type === 'bone' ? 0.6 : type === 'skin' ? 0.4 : 0.5;

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
      {type === 'bone' ? (
        <capsuleGeometry args={[scale[0] * 0.4, scale[1] * 1.5, 8, 16]} />
      ) : type === 'organ' ? (
        <sphereGeometry args={[scale[0], 24, 24]} />
      ) : (
        <capsuleGeometry args={[scale[0] * 0.5, scale[1] * 1.2, 12, 24]} />
      )}
      <meshPhysicalMaterial
        color={finalColor}
        transparent
        opacity={isSelected || hovered ? activeOpacity : baseOpacity}
        emissive={finalColor}
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
  recovery,
  isSelected, 
  onClick,
  visible
}: { 
  position: [number, number, number];
  id: string;
  color: string;
  recovery?: number;
  isSelected: boolean; 
  onClick: (id: string) => void;
  visible: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const finalColor = recovery !== undefined ? getRecoveryColor(recovery) : color;

  useFrame((state) => {
    if (meshRef.current && visible) {
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

  if (!visible) return null;

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
      {id.includes('heart') || id.includes('corazón') ? (
        <sphereGeometry args={[1, 28, 28]} />
      ) : id.includes('lung') || id.includes('pulmón') ? (
        <group scale={[1, 1.4, 0.8]}>
          <sphereGeometry args={[1, 24, 24]} />
        </group>
      ) : id.includes('stomach') || id.includes('estómago') ? (
        <group scale={[1.2, 1, 0.9]}>
          <sphereGeometry args={[1, 22, 22]} />
        </group>
      ) : id.includes('liver') || id.includes('hígado') ? (
        <group scale={[1.5, 0.7, 1.1]}>
          <sphereGeometry args={[1, 20, 20]} />
        </group>
      ) : (
        <sphereGeometry args={[1, 24, 24]} />
      )}
      <meshPhysicalMaterial
        color={finalColor}
        transparent
        opacity={isSelected || hovered ? 0.9 : 0.6}
        emissive={finalColor}
        emissiveIntensity={isSelected || hovered ? 1.2 : 0.5}
        metalness={0.3}
        roughness={0.2}
        clearcoat={1}
        clearcoatRoughness={0.1}
      />
    </mesh>
  );
}

function Scene({ selectedPart, onPartClick, activeLayers, injuries }: Body3DProps) {
  const cyanColor = "#00d9ff";
  const darkCyanColor = "#0099cc";
  const brightCyanColor = "#00ffff";
  const redColor = "#ff0066";
  const skinColor = "#FFE4C4";
  const boneColor = "#F5F5DC";

  // Crear un mapa de lesiones para acceso rápido
  const injuryMap = new Map(
    injuries.map(injury => [injury.partId, injury.recovery])
  );
  
  const bodyParts: BodyPart[] = [
    // Cabeza y cuello
    { position: [0, 2.2, 0], scale: [0.6, 0.7, 0.6], color: boneColor, name: "Cráneo", id: "head", type: 'bone', layer: 'skeleton' },
    { position: [0, 1.85, 0], scale: [0.3, 0.35, 0.3], color: darkCyanColor, name: "Cuello", id: "neck", type: 'muscle', layer: 'muscle' },
    { position: [0, 2.2, 0], scale: [0.65, 0.75, 0.65], color: skinColor, name: "Piel Cabeza", id: "head-skin", type: 'skin', layer: 'skin' },
    
    // Torso y pecho - Huesos
    { position: [0, 1, 0], scale: [0.8, 1.1, 0.4], color: boneColor, name: "Caja Torácica", id: "ribcage", type: 'bone', layer: 'skeleton' },
    { position: [0, 0.3, 0], scale: [0.7, 0.6, 0.3], color: boneColor, name: "Pelvis", id: "pelvis", type: 'bone', layer: 'skeleton' },
    
    // Músculos del torso
    { position: [0, 1, 0.3], scale: [1, 1.2, 0.2], color: cyanColor, name: "Pecho", id: "chest", type: 'muscle', layer: 'muscle' },
    { position: [-0.4, 1.1, 0.3], scale: [0.35, 0.5, 0.15], color: darkCyanColor, name: "Pectoral Izq", id: "left-pectoral", type: 'muscle', layer: 'muscle' },
    { position: [0.4, 1.1, 0.3], scale: [0.35, 0.5, 0.15], color: darkCyanColor, name: "Pectoral Der", id: "right-pectoral", type: 'muscle', layer: 'muscle' },
    { position: [0, 0.3, 0.25], scale: [0.9, 0.8, 0.2], color: cyanColor, name: "Abdomen", id: "abs", type: 'muscle', layer: 'muscle' },
    { position: [0, 0.3, 0.25], scale: [0.6, 0.7, 0.15], color: darkCyanColor, name: "Core", id: "core", type: 'muscle', layer: 'muscle' },
    
    // Piel del torso
    { position: [0, 0.65, 0.35], scale: [1.1, 1.5, 0.25], color: skinColor, name: "Piel Torso", id: "torso-skin", type: 'skin', layer: 'skin' },
    
    // Espalda
    { position: [0, 1, -0.3], scale: [1, 1.2, 0.2], color: brightCyanColor, name: "Espalda", id: "back", type: 'muscle', layer: 'muscle' },
    { position: [0, 1.3, -0.35], scale: [0.8, 0.5, 0.2], color: darkCyanColor, name: "Trapecio", id: "trapezius", type: 'muscle', layer: 'muscle' },
    { position: [0, 0.8, -0.35], scale: [0.7, 0.6, 0.2], color: darkCyanColor, name: "Dorsales", id: "lats", type: 'muscle', layer: 'muscle' },
    { position: [0, 0.65, -0.35], scale: [1.1, 1.5, 0.25], color: skinColor, name: "Piel Espalda", id: "back-skin", type: 'skin', layer: 'skin' },
    
    // Hombros - Huesos
    { position: [-0.8, 1.3, 0], scale: [0.2, 0.15, 0.2], color: boneColor, name: "Clavícula Izq", id: "left-clavicle", type: 'bone', layer: 'skeleton' },
    { position: [0.8, 1.3, 0], scale: [0.2, 0.15, 0.2], color: boneColor, name: "Clavícula Der", id: "right-clavicle", type: 'bone', layer: 'skeleton' },
    { position: [-0.8, 0.9, 0], scale: [0.15, 0.7, 0.15], color: boneColor, name: "Húmero Izq", id: "left-humerus", type: 'bone', layer: 'skeleton' },
    { position: [0.8, 0.9, 0], scale: [0.15, 0.7, 0.15], color: boneColor, name: "Húmero Der", id: "right-humerus", type: 'bone', layer: 'skeleton' },
    
    // Músculos de hombros y brazos
    { position: [-0.8, 1.2, 0], scale: [0.25, 0.8, 0.25], color: brightCyanColor, name: "Hombro Izq", id: "left-shoulder", type: 'muscle', layer: 'muscle' },
    { position: [0.8, 1.2, 0], scale: [0.25, 0.8, 0.25], color: brightCyanColor, name: "Hombro Der", id: "right-shoulder", type: 'muscle', layer: 'muscle' },
    { position: [-0.8, 1.3, 0], scale: [0.3, 0.3, 0.3], color: darkCyanColor, name: "Deltoides Izq", id: "left-deltoid", type: 'muscle', layer: 'muscle' },
    { position: [0.8, 1.3, 0], scale: [0.3, 0.3, 0.3], color: darkCyanColor, name: "Deltoides Der", id: "right-deltoid", type: 'muscle', layer: 'muscle' },
    
    // Piel de hombros
    { position: [-0.8, 1.2, 0], scale: [0.35, 0.9, 0.35], color: skinColor, name: "Piel Hombro Izq", id: "left-shoulder-skin", type: 'skin', layer: 'skin' },
    { position: [0.8, 1.2, 0], scale: [0.35, 0.9, 0.35], color: skinColor, name: "Piel Hombro Der", id: "right-shoulder-skin", type: 'skin', layer: 'skin' },
    
    // Bíceps y tríceps
    { position: [-0.8, 0.5, 0.1], scale: [0.18, 0.6, 0.18], color: cyanColor, name: "Bíceps Izq", id: "left-bicep", type: 'muscle', layer: 'muscle' },
    { position: [0.8, 0.5, 0.1], scale: [0.18, 0.6, 0.18], color: cyanColor, name: "Bíceps Der", id: "right-bicep", type: 'muscle', layer: 'muscle' },
    { position: [-0.8, 0.5, -0.1], scale: [0.18, 0.6, 0.18], color: darkCyanColor, name: "Tríceps Izq", id: "left-tricep", type: 'muscle', layer: 'muscle' },
    { position: [0.8, 0.5, -0.1], scale: [0.18, 0.6, 0.18], color: darkCyanColor, name: "Tríceps Der", id: "right-tricep", type: 'muscle', layer: 'muscle' },
    
    // Piel de brazos
    { position: [-0.8, 0.5, 0], scale: [0.25, 0.7, 0.25], color: skinColor, name: "Piel Brazo Izq", id: "left-arm-skin", type: 'skin', layer: 'skin' },
    { position: [0.8, 0.5, 0], scale: [0.25, 0.7, 0.25], color: skinColor, name: "Piel Brazo Der", id: "right-arm-skin", type: 'skin', layer: 'skin' },
    
    // Antebrazos - Huesos
    { position: [-0.8, -0.2, 0], scale: [0.12, 0.55, 0.12], color: boneColor, name: "Radio/Cúbito Izq", id: "left-forearm-bones", type: 'bone', layer: 'skeleton' },
    { position: [0.8, -0.2, 0], scale: [0.12, 0.55, 0.12], color: boneColor, name: "Radio/Cúbito Der", id: "right-forearm-bones", type: 'bone', layer: 'skeleton' },
    
    // Músculos de antebrazos
    { position: [-0.8, -0.2, 0], scale: [0.15, 0.6, 0.15], color: brightCyanColor, name: "Antebrazo Izq", id: "left-forearm", type: 'muscle', layer: 'muscle' },
    { position: [0.8, -0.2, 0], scale: [0.15, 0.6, 0.15], color: brightCyanColor, name: "Antebrazo Der", id: "right-forearm", type: 'muscle', layer: 'muscle' },
    
    // Piel de antebrazos
    { position: [-0.8, -0.2, 0], scale: [0.18, 0.65, 0.18], color: skinColor, name: "Piel Antebrazo Izq", id: "left-forearm-skin", type: 'skin', layer: 'skin' },
    { position: [0.8, -0.2, 0], scale: [0.18, 0.65, 0.18], color: skinColor, name: "Piel Antebrazo Der", id: "right-forearm-skin", type: 'skin', layer: 'skin' },
    
    // Manos
    { position: [-0.8, -0.6, 0], scale: [0.12, 0.15, 0.08], color: boneColor, name: "Mano Izq", id: "left-hand", type: 'bone', layer: 'skeleton' },
    { position: [0.8, -0.6, 0], scale: [0.12, 0.15, 0.08], color: boneColor, name: "Mano Der", id: "right-hand", type: 'bone', layer: 'skeleton' },
    { position: [-0.8, -0.6, 0], scale: [0.14, 0.17, 0.1], color: skinColor, name: "Piel Mano Izq", id: "left-hand-skin", type: 'skin', layer: 'skin' },
    { position: [0.8, -0.6, 0], scale: [0.14, 0.17, 0.1], color: skinColor, name: "Piel Mano Der", id: "right-hand-skin", type: 'skin', layer: 'skin' },
    
    // Glúteos y cadera
    { position: [0, -0.1, -0.2], scale: [0.8, 0.4, 0.3], color: darkCyanColor, name: "Glúteos", id: "glutes", type: 'muscle', layer: 'muscle' },
    { position: [0, -0.1, 0], scale: [0.9, 0.3, 0.4], color: boneColor, name: "Cadera", id: "hips", type: 'bone', layer: 'skeleton' },
    { position: [0, -0.1, -0.1], scale: [0.95, 0.5, 0.45], color: skinColor, name: "Piel Cadera", id: "hip-skin", type: 'skin', layer: 'skin' },
    
    // Piernas - Huesos
    { position: [-0.3, -0.8, 0], scale: [0.2, 1.1, 0.2], color: boneColor, name: "Fémur Izq", id: "left-femur", type: 'bone', layer: 'skeleton' },
    { position: [0.3, -0.8, 0], scale: [0.2, 1.1, 0.2], color: boneColor, name: "Fémur Der", id: "right-femur", type: 'bone', layer: 'skeleton' },
    
    // Músculos - Cuádriceps
    { position: [-0.3, -0.8, 0.05], scale: [0.3, 1.2, 0.25], color: brightCyanColor, name: "Cuádriceps Izq", id: "left-quad", type: 'muscle', layer: 'muscle' },
    { position: [0.3, -0.8, 0.05], scale: [0.3, 1.2, 0.25], color: brightCyanColor, name: "Cuádriceps Der", id: "right-quad", type: 'muscle', layer: 'muscle' },
    
    // Isquiotibiales
    { position: [-0.3, -0.8, -0.15], scale: [0.25, 1.1, 0.25], color: darkCyanColor, name: "Isquio Izq", id: "left-hamstring", type: 'muscle', layer: 'muscle' },
    { position: [0.3, -0.8, -0.15], scale: [0.25, 1.1, 0.25], color: darkCyanColor, name: "Isquio Der", id: "right-hamstring", type: 'muscle', layer: 'muscle' },
    
    // Aductores
    { position: [-0.15, -0.9, 0], scale: [0.15, 1, 0.15], color: cyanColor, name: "Aductor Izq", id: "left-adductor", type: 'muscle', layer: 'muscle' },
    { position: [0.15, -0.9, 0], scale: [0.15, 1, 0.15], color: cyanColor, name: "Aductor Der", id: "right-adductor", type: 'muscle', layer: 'muscle' },
    
    // Piel de muslos
    { position: [-0.3, -0.8, 0], scale: [0.35, 1.25, 0.35], color: skinColor, name: "Piel Muslo Izq", id: "left-thigh-skin", type: 'skin', layer: 'skin' },
    { position: [0.3, -0.8, 0], scale: [0.35, 1.25, 0.35], color: skinColor, name: "Piel Muslo Der", id: "right-thigh-skin", type: 'skin', layer: 'skin' },
    
    // Pantorrillas - Huesos
    { position: [-0.3, -2.1, 0], scale: [0.15, 0.7, 0.15], color: boneColor, name: "Tibia/Peroné Izq", id: "left-tibia", type: 'bone', layer: 'skeleton' },
    { position: [0.3, -2.1, 0], scale: [0.15, 0.7, 0.15], color: boneColor, name: "Tibia/Peroné Der", id: "right-tibia", type: 'bone', layer: 'skeleton' },
    
    // Músculos de pantorrillas
    { position: [-0.3, -2.1, -0.05], scale: [0.25, 0.8, 0.25], color: brightCyanColor, name: "Pantorrilla Izq", id: "left-calf", type: 'muscle', layer: 'muscle' },
    { position: [0.3, -2.1, -0.05], scale: [0.25, 0.8, 0.25], color: brightCyanColor, name: "Pantorrilla Der", id: "right-calf", type: 'muscle', layer: 'muscle' },
    
    // Tibiales
    { position: [-0.3, -2.1, 0.12], scale: [0.15, 0.7, 0.15], color: darkCyanColor, name: "Tibial Izq", id: "left-tibial", type: 'muscle', layer: 'muscle' },
    { position: [0.3, -2.1, 0.12], scale: [0.15, 0.7, 0.15], color: darkCyanColor, name: "Tibial Der", id: "right-tibial", type: 'muscle', layer: 'muscle' },
    
    // Piel de pantorrillas
    { position: [-0.3, -2.1, 0], scale: [0.3, 0.85, 0.3], color: skinColor, name: "Piel Pantorrilla Izq", id: "left-calf-skin", type: 'skin', layer: 'skin' },
    { position: [0.3, -2.1, 0], scale: [0.3, 0.85, 0.3], color: skinColor, name: "Piel Pantorrilla Der", id: "right-calf-skin", type: 'skin', layer: 'skin' },
    
    // Pies
    { position: [-0.3, -2.6, 0.05], scale: [0.2, 0.1, 0.25], color: boneColor, name: "Pie Izq", id: "left-foot", type: 'bone', layer: 'skeleton' },
    { position: [0.3, -2.6, 0.05], scale: [0.2, 0.1, 0.25], color: boneColor, name: "Pie Der", id: "right-foot", type: 'bone', layer: 'skeleton' },
    { position: [-0.3, -2.6, 0.05], scale: [0.22, 0.12, 0.28], color: skinColor, name: "Piel Pie Izq", id: "left-foot-skin", type: 'skin', layer: 'skin' },
    { position: [0.3, -2.6, 0.05], scale: [0.22, 0.12, 0.28], color: skinColor, name: "Piel Pie Der", id: "right-foot-skin", type: 'skin', layer: 'skin' },
  ];

  // Órganos con sus capas
  const organs = [
    { id: "heart", position: [0, 0.9, 0.15] as [number, number, number], color: redColor },
    { id: "left-lung", position: [-0.25, 0.95, 0.1] as [number, number, number], color: cyanColor },
    { id: "right-lung", position: [0.25, 0.95, 0.1] as [number, number, number], color: cyanColor },
    { id: "stomach", position: [0, 0.2, 0.15] as [number, number, number], color: darkCyanColor },
    { id: "liver", position: [-0.15, 0.5, 0.2] as [number, number, number], color: "#ff6600" },
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
      {organs.map((organ) => (
        <OrganMesh
          key={organ.id}
          position={organ.position}
          id={organ.id}
          color={organ.color}
          recovery={injuryMap.get(organ.id)}
          isSelected={selectedPart === organ.id}
          onClick={onPartClick}
          visible={activeLayers.organ}
        />
      ))}
      
      {bodyParts.map((part) => (
        <BodyPart3D
          key={part.id}
          {...part}
          recovery={injuryMap.get(part.id)}
          isSelected={selectedPart === part.id}
          onClick={onPartClick}
          visible={activeLayers[part.layer]}
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

export default function Body3D({ selectedPart, onPartClick, activeLayers, injuries }: Body3DProps) {
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
        <Scene selectedPart={selectedPart} onPartClick={onPartClick} activeLayers={activeLayers} injuries={injuries} />
      </Canvas>
    </div>
  );
}
