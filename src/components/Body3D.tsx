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
    // Cabeza y cuello - Proporciones anatómicas realistas
    { position: [0, 2.1, 0], scale: [0.55, 0.65, 0.55], color: boneColor, name: "Cráneo", id: "head", type: 'bone', layer: 'skeleton' },
    { position: [0, 1.7, 0], scale: [0.25, 0.3, 0.25], color: darkCyanColor, name: "Cuello", id: "neck", type: 'muscle', layer: 'muscle' },
    { position: [0, 2.1, 0], scale: [0.6, 0.7, 0.6], color: skinColor, name: "Piel Cabeza", id: "head-skin", type: 'skin', layer: 'skin' },
    { position: [0, 1.7, 0], scale: [0.28, 0.33, 0.28], color: skinColor, name: "Piel Cuello", id: "neck-skin", type: 'skin', layer: 'skin' },
    
    // Columna vertebral
    { position: [0, 0.8, -0.08], scale: [0.08, 1.4, 0.08], color: boneColor, name: "Columna", id: "spine", type: 'bone', layer: 'skeleton' },
    
    // Torso y pecho - Huesos con proporciones anatómicas
    { position: [0, 1.15, 0], scale: [0.75, 0.9, 0.35], color: boneColor, name: "Caja Torácica", id: "ribcage", type: 'bone', layer: 'skeleton' },
    { position: [0, 0.2, 0], scale: [0.65, 0.45, 0.3], color: boneColor, name: "Pelvis", id: "pelvis", type: 'bone', layer: 'skeleton' },
    
    // Esternón
    { position: [0, 1.15, 0.15], scale: [0.08, 0.4, 0.05], color: boneColor, name: "Esternón", id: "sternum", type: 'bone', layer: 'skeleton' },
    
    // Músculos del pecho - Posición más anatómica
    { position: [-0.25, 1.2, 0.22], scale: [0.28, 0.4, 0.18], color: "#d84a6f", name: "Pectoral Mayor Izq", id: "left-pectoral", type: 'muscle', layer: 'muscle' },
    { position: [0.25, 1.2, 0.22], scale: [0.28, 0.4, 0.18], color: "#d84a6f", name: "Pectoral Mayor Der", id: "right-pectoral", type: 'muscle', layer: 'muscle' },
    { position: [0, 0.65, 0.22], scale: [0.5, 0.7, 0.16], color: "#c9456d", name: "Abdomen", id: "abs", type: 'muscle', layer: 'muscle' },
    { position: [0, 0.65, 0.2], scale: [0.4, 0.6, 0.14], color: darkCyanColor, name: "Recto Abdominal", id: "rectus-abdominis", type: 'muscle', layer: 'muscle' },
    { position: [-0.35, 0.75, 0.18], scale: [0.15, 0.5, 0.12], color: cyanColor, name: "Oblicuo Izq", id: "left-oblique", type: 'muscle', layer: 'muscle' },
    { position: [0.35, 0.75, 0.18], scale: [0.15, 0.5, 0.12], color: cyanColor, name: "Oblicuo Der", id: "right-oblique", type: 'muscle', layer: 'muscle' },
    
    // Piel del torso - Envolvente natural
    { position: [0, 0.9, 0.25], scale: [0.85, 1.35, 0.22], color: skinColor, name: "Piel Torso Frontal", id: "torso-skin-front", type: 'skin', layer: 'skin' },
    
    // Músculos de la espalda - Anatomía realista
    { position: [0, 1.3, -0.18], scale: [0.6, 0.35, 0.15], color: "#b8385e", name: "Trapecio Superior", id: "trapezius-upper", type: 'muscle', layer: 'muscle' },
    { position: [0, 0.95, -0.18], scale: [0.55, 0.4, 0.15], color: "#a33558", name: "Trapecio Medio", id: "trapezius-mid", type: 'muscle', layer: 'muscle' },
    { position: [0, 0.65, -0.2], scale: [0.5, 0.35, 0.16], color: "#922f52", name: "Trapecio Inferior", id: "trapezius-lower", type: 'muscle', layer: 'muscle' },
    { position: [-0.25, 0.9, -0.22], scale: [0.32, 0.6, 0.18], color: brightCyanColor, name: "Dorsal Ancho Izq", id: "left-lat", type: 'muscle', layer: 'muscle' },
    { position: [0.25, 0.9, -0.22], scale: [0.32, 0.6, 0.18], color: brightCyanColor, name: "Dorsal Ancho Der", id: "right-lat", type: 'muscle', layer: 'muscle' },
    { position: [0, 0.35, -0.2], scale: [0.45, 0.4, 0.15], color: darkCyanColor, name: "Erector Espinal", id: "erector-spinae", type: 'muscle', layer: 'muscle' },
    
    // Piel de la espalda
    { position: [0, 0.9, -0.25], scale: [0.85, 1.35, 0.22], color: skinColor, name: "Piel Espalda", id: "back-skin", type: 'skin', layer: 'skin' },
    
    // Hombros - Huesos (clavículas y escápulas más realistas)
    { position: [-0.45, 1.45, 0.08], scale: [0.35, 0.08, 0.08], color: boneColor, name: "Clavícula Izq", id: "left-clavicle", type: 'bone', layer: 'skeleton' },
    { position: [0.45, 1.45, 0.08], scale: [0.35, 0.08, 0.08], color: boneColor, name: "Clavícula Der", id: "right-clavicle", type: 'bone', layer: 'skeleton' },
    { position: [-0.55, 1.25, -0.08], scale: [0.25, 0.35, 0.12], color: boneColor, name: "Escápula Izq", id: "left-scapula", type: 'bone', layer: 'skeleton' },
    { position: [0.55, 1.25, -0.08], scale: [0.25, 0.35, 0.12], color: boneColor, name: "Escápula Der", id: "right-scapula", type: 'bone', layer: 'skeleton' },
    
    // Húmeros (brazos superiores - huesos)
    { position: [-0.65, 0.85, 0], scale: [0.11, 0.55, 0.11], color: boneColor, name: "Húmero Izq", id: "left-humerus", type: 'bone', layer: 'skeleton' },
    { position: [0.65, 0.85, 0], scale: [0.11, 0.55, 0.11], color: boneColor, name: "Húmero Der", id: "right-humerus", type: 'bone', layer: 'skeleton' },
    
    // Deltoides (hombros) - Forma anatómica de tres cabezas
    { position: [-0.65, 1.35, 0.08], scale: [0.22, 0.25, 0.22], color: "#e05577", name: "Deltoides Anterior Izq", id: "left-deltoid-front", type: 'muscle', layer: 'muscle' },
    { position: [0.65, 1.35, 0.08], scale: [0.22, 0.25, 0.22], color: "#e05577", name: "Deltoides Anterior Der", id: "right-deltoid-front", type: 'muscle', layer: 'muscle' },
    { position: [-0.72, 1.35, 0], scale: [0.2, 0.22, 0.2], color: "#d84a6f", name: "Deltoides Lateral Izq", id: "left-deltoid-lateral", type: 'muscle', layer: 'muscle' },
    { position: [0.72, 1.35, 0], scale: [0.2, 0.22, 0.2], color: "#d84a6f", name: "Deltoides Lateral Der", id: "right-deltoid-lateral", type: 'muscle', layer: 'muscle' },
    { position: [-0.65, 1.35, -0.08], scale: [0.22, 0.25, 0.22], color: "#c9456d", name: "Deltoides Posterior Izq", id: "left-deltoid-rear", type: 'muscle', layer: 'muscle' },
    { position: [0.65, 1.35, -0.08], scale: [0.22, 0.25, 0.22], color: "#c9456d", name: "Deltoides Posterior Der", id: "right-deltoid-rear", type: 'muscle', layer: 'muscle' },
    
    // Piel de hombros
    { position: [-0.65, 1.25, 0], scale: [0.28, 0.4, 0.28], color: skinColor, name: "Piel Hombro Izq", id: "left-shoulder-skin", type: 'skin', layer: 'skin' },
    { position: [0.65, 1.25, 0], scale: [0.28, 0.4, 0.28], color: skinColor, name: "Piel Hombro Der", id: "right-shoulder-skin", type: 'skin', layer: 'skin' },
    
    // Bíceps y tríceps - Proporciones anatómicas
    { position: [-0.65, 0.85, 0.09], scale: [0.14, 0.5, 0.14], color: "#e66b8c", name: "Bíceps Braquial Izq", id: "left-bicep", type: 'muscle', layer: 'muscle' },
    { position: [0.65, 0.85, 0.09], scale: [0.14, 0.5, 0.14], color: "#e66b8c", name: "Bíceps Braquial Der", id: "right-bicep", type: 'muscle', layer: 'muscle' },
    { position: [-0.65, 0.9, -0.09], scale: [0.16, 0.55, 0.16], color: "#d84a6f", name: "Tríceps Braquial Izq", id: "left-tricep", type: 'muscle', layer: 'muscle' },
    { position: [0.65, 0.9, -0.09], scale: [0.16, 0.55, 0.16], color: "#d84a6f", name: "Tríceps Braquial Der", id: "right-tricep", type: 'muscle', layer: 'muscle' },
    { position: [-0.65, 0.95, 0], scale: [0.14, 0.45, 0.14], color: cyanColor, name: "Braquial Izq", id: "left-brachialis", type: 'muscle', layer: 'muscle' },
    { position: [0.65, 0.95, 0], scale: [0.14, 0.45, 0.14], color: cyanColor, name: "Braquial Der", id: "right-brachialis", type: 'muscle', layer: 'muscle' },
    
    // Piel de brazos superiores
    { position: [-0.65, 0.9, 0], scale: [0.2, 0.6, 0.2], color: skinColor, name: "Piel Brazo Izq", id: "left-arm-skin", type: 'skin', layer: 'skin' },
    { position: [0.65, 0.9, 0], scale: [0.2, 0.6, 0.2], color: skinColor, name: "Piel Brazo Der", id: "right-arm-skin", type: 'skin', layer: 'skin' },
    
    // Antebrazos - Huesos (radio y cúbito)
    { position: [-0.65, 0.35, 0.04], scale: [0.08, 0.45, 0.08], color: boneColor, name: "Radio Izq", id: "left-radius", type: 'bone', layer: 'skeleton' },
    { position: [0.65, 0.35, 0.04], scale: [0.08, 0.45, 0.08], color: boneColor, name: "Radio Der", id: "right-radius", type: 'bone', layer: 'skeleton' },
    { position: [-0.65, 0.35, -0.04], scale: [0.08, 0.47, 0.08], color: boneColor, name: "Cúbito Izq", id: "left-ulna", type: 'bone', layer: 'skeleton' },
    { position: [0.65, 0.35, -0.04], scale: [0.08, 0.47, 0.08], color: boneColor, name: "Cúbito Der", id: "right-ulna", type: 'bone', layer: 'skeleton' },
    
    // Músculos de antebrazos - Grupos flexores y extensores
    { position: [-0.65, 0.35, 0.08], scale: [0.12, 0.5, 0.12], color: brightCyanColor, name: "Flexores Izq", id: "left-forearm-flexors", type: 'muscle', layer: 'muscle' },
    { position: [0.65, 0.35, 0.08], scale: [0.12, 0.5, 0.12], color: brightCyanColor, name: "Flexores Der", id: "right-forearm-flexors", type: 'muscle', layer: 'muscle' },
    { position: [-0.65, 0.35, -0.08], scale: [0.11, 0.48, 0.11], color: darkCyanColor, name: "Extensores Izq", id: "left-forearm-extensors", type: 'muscle', layer: 'muscle' },
    { position: [0.65, 0.35, -0.08], scale: [0.11, 0.48, 0.11], color: darkCyanColor, name: "Extensores Der", id: "right-forearm-extensors", type: 'muscle', layer: 'muscle' },
    
    // Piel de antebrazos
    { position: [-0.65, 0.35, 0], scale: [0.16, 0.55, 0.16], color: skinColor, name: "Piel Antebrazo Izq", id: "left-forearm-skin", type: 'skin', layer: 'skin' },
    { position: [0.65, 0.35, 0], scale: [0.16, 0.55, 0.16], color: skinColor, name: "Piel Antebrazo Der", id: "right-forearm-skin", type: 'skin', layer: 'skin' },
    
    // Manos - Más anatómicas
    { position: [-0.65, -0.02, 0], scale: [0.1, 0.18, 0.06], color: boneColor, name: "Mano Izq", id: "left-hand", type: 'bone', layer: 'skeleton' },
    { position: [0.65, -0.02, 0], scale: [0.1, 0.18, 0.06], color: boneColor, name: "Mano Der", id: "right-hand", type: 'bone', layer: 'skeleton' },
    { position: [-0.65, -0.02, 0], scale: [0.12, 0.2, 0.08], color: skinColor, name: "Piel Mano Izq", id: "left-hand-skin", type: 'skin', layer: 'skin' },
    { position: [0.65, -0.02, 0], scale: [0.12, 0.2, 0.08], color: skinColor, name: "Piel Mano Der", id: "right-hand-skin", type: 'skin', layer: 'skin' },
    
    // Glúteos y cadera - Anatomía realista
    { position: [0, 0.05, -0.15], scale: [0.6, 0.35, 0.28], color: "#c9456d", name: "Glúteo Mayor", id: "gluteus-maximus", type: 'muscle', layer: 'muscle' },
    { position: [0, 0.15, -0.12], scale: [0.5, 0.2, 0.2], color: darkCyanColor, name: "Glúteo Medio", id: "gluteus-medius", type: 'muscle', layer: 'muscle' },
    { position: [0, 0.05, 0], scale: [0.7, 0.4, 0.35], color: boneColor, name: "Pelvis/Cadera", id: "hip-bones", type: 'bone', layer: 'skeleton' },
    { position: [0, 0.05, -0.08], scale: [0.75, 0.5, 0.38], color: skinColor, name: "Piel Cadera", id: "hip-skin", type: 'skin', layer: 'skin' },
    
    // Piernas - Fémures (huesos del muslo)
    { position: [-0.22, -0.6, 0], scale: [0.13, 0.85, 0.13], color: boneColor, name: "Fémur Izq", id: "left-femur", type: 'bone', layer: 'skeleton' },
    { position: [0.22, -0.6, 0], scale: [0.13, 0.85, 0.13], color: boneColor, name: "Fémur Der", id: "right-femur", type: 'bone', layer: 'skeleton' },
    
    // Cuádriceps (cuatro cabezas) - Anatomía detallada
    { position: [-0.22, -0.55, 0.11], scale: [0.24, 0.8, 0.2], color: "#e66b8c", name: "Cuádriceps Izq", id: "left-quad", type: 'muscle', layer: 'muscle' },
    { position: [0.22, -0.55, 0.11], scale: [0.24, 0.8, 0.2], color: "#e66b8c", name: "Cuádriceps Der", id: "right-quad", type: 'muscle', layer: 'muscle' },
    
    // Isquiotibiales (parte posterior del muslo)
    { position: [-0.22, -0.6, -0.12], scale: [0.2, 0.75, 0.18], color: "#d84a6f", name: "Isquiotibiales Izq", id: "left-hamstring", type: 'muscle', layer: 'muscle' },
    { position: [0.22, -0.6, -0.12], scale: [0.2, 0.75, 0.18], color: "#d84a6f", name: "Isquiotibiales Der", id: "right-hamstring", type: 'muscle', layer: 'muscle' },
    
    // Aductores (parte interna del muslo)
    { position: [-0.1, -0.65, 0], scale: [0.12, 0.7, 0.12], color: cyanColor, name: "Aductores Izq", id: "left-adductor", type: 'muscle', layer: 'muscle' },
    { position: [0.1, -0.65, 0], scale: [0.12, 0.7, 0.12], color: cyanColor, name: "Aductores Der", id: "right-adductor", type: 'muscle', layer: 'muscle' },
    
    // Piel de muslos
    { position: [-0.22, -0.6, 0], scale: [0.3, 0.9, 0.3], color: skinColor, name: "Piel Muslo Izq", id: "left-thigh-skin", type: 'skin', layer: 'skin' },
    { position: [0.22, -0.6, 0], scale: [0.3, 0.9, 0.3], color: skinColor, name: "Piel Muslo Der", id: "right-thigh-skin", type: 'skin', layer: 'skin' },
    
    // Rodillas
    { position: [-0.22, -1.15, 0.08], scale: [0.18, 0.18, 0.16], color: boneColor, name: "Rótula Izq", id: "left-patella", type: 'bone', layer: 'skeleton' },
    { position: [0.22, -1.15, 0.08], scale: [0.18, 0.18, 0.16], color: boneColor, name: "Rótula Der", id: "right-patella", type: 'bone', layer: 'skeleton' },
    
    // Pantorrillas - Huesos (tibia y peroné)
    { position: [-0.22, -1.65, 0], scale: [0.1, 0.75, 0.1], color: boneColor, name: "Tibia Izq", id: "left-tibia", type: 'bone', layer: 'skeleton' },
    { position: [0.22, -1.65, 0], scale: [0.1, 0.75, 0.1], color: boneColor, name: "Tibia Der", id: "right-tibia", type: 'bone', layer: 'skeleton' },
    { position: [-0.26, -1.65, -0.04], scale: [0.06, 0.7, 0.06], color: boneColor, name: "Peroné Izq", id: "left-fibula", type: 'bone', layer: 'skeleton' },
    { position: [0.26, -1.65, -0.04], scale: [0.06, 0.7, 0.06], color: boneColor, name: "Peroné Der", id: "right-fibula", type: 'bone', layer: 'skeleton' },
    
    // Músculos de pantorrillas - Gastrocnemio y sóleo
    { position: [-0.22, -1.55, -0.08], scale: [0.18, 0.5, 0.18], color: "#e66b8c", name: "Gastrocnemio Izq", id: "left-gastrocnemius", type: 'muscle', layer: 'muscle' },
    { position: [0.22, -1.55, -0.08], scale: [0.18, 0.5, 0.18], color: "#e66b8c", name: "Gastrocnemio Der", id: "right-gastrocnemius", type: 'muscle', layer: 'muscle' },
    { position: [-0.22, -1.75, -0.06], scale: [0.2, 0.35, 0.16], color: "#d84a6f", name: "Sóleo Izq", id: "left-soleus", type: 'muscle', layer: 'muscle' },
    { position: [0.22, -1.75, -0.06], scale: [0.2, 0.35, 0.16], color: "#d84a6f", name: "Sóleo Der", id: "right-soleus", type: 'muscle', layer: 'muscle' },
    
    // Tibiales anteriores
    { position: [-0.22, -1.65, 0.09], scale: [0.12, 0.65, 0.12], color: brightCyanColor, name: "Tibial Anterior Izq", id: "left-tibialis", type: 'muscle', layer: 'muscle' },
    { position: [0.22, -1.65, 0.09], scale: [0.12, 0.65, 0.12], color: brightCyanColor, name: "Tibial Anterior Der", id: "right-tibialis", type: 'muscle', layer: 'muscle' },
    
    // Piel de pantorrillas
    { position: [-0.22, -1.65, 0], scale: [0.24, 0.8, 0.24], color: skinColor, name: "Piel Pantorrilla Izq", id: "left-calf-skin", type: 'skin', layer: 'skin' },
    { position: [0.22, -1.65, 0], scale: [0.24, 0.8, 0.24], color: skinColor, name: "Piel Pantorrilla Der", id: "right-calf-skin", type: 'skin', layer: 'skin' },
    
    // Tobillos
    { position: [-0.22, -2.15, 0], scale: [0.14, 0.12, 0.14], color: boneColor, name: "Tobillo Izq", id: "left-ankle", type: 'bone', layer: 'skeleton' },
    { position: [0.22, -2.15, 0], scale: [0.14, 0.12, 0.14], color: boneColor, name: "Tobillo Der", id: "right-ankle", type: 'bone', layer: 'skeleton' },
    
    // Pies - Proporciones anatómicas realistas
    { position: [-0.22, -2.35, 0.06], scale: [0.16, 0.08, 0.22], color: boneColor, name: "Pie Izq", id: "left-foot", type: 'bone', layer: 'skeleton' },
    { position: [0.22, -2.35, 0.06], scale: [0.16, 0.08, 0.22], color: boneColor, name: "Pie Der", id: "right-foot", type: 'bone', layer: 'skeleton' },
    { position: [-0.22, -2.35, 0.06], scale: [0.18, 0.1, 0.25], color: skinColor, name: "Piel Pie Izq", id: "left-foot-skin", type: 'skin', layer: 'skin' },
    { position: [0.22, -2.35, 0.06], scale: [0.18, 0.1, 0.25], color: skinColor, name: "Piel Pie Der", id: "right-foot-skin", type: 'skin', layer: 'skin' },
  ];

  // Órganos internos con posiciones anatómicas precisas
  const organs = [
    { id: "heart", position: [-0.05, 1.05, 0.08] as [number, number, number], color: "#cc1f4a" },
    { id: "left-lung", position: [-0.2, 1.1, 0.05] as [number, number, number], color: "#ff6b9d" },
    { id: "right-lung", position: [0.18, 1.1, 0.05] as [number, number, number], color: "#ff6b9d" },
    { id: "stomach", position: [-0.08, 0.65, 0.12] as [number, number, number], color: "#e89bb5" },
    { id: "liver", position: [0.15, 0.75, 0.1] as [number, number, number], color: "#8b4513" },
    { id: "intestines", position: [0, 0.3, 0.1] as [number, number, number], color: "#d4a5a5" },
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
