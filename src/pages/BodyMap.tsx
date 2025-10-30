import { useState, Suspense } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Activity, TrendingUp, AlertTriangle, Rotate3D, Eye, Bone, Heart } from "lucide-react";
import Body3D from "@/components/Body3D";
import InjuryModal from "@/components/InjuryModal";
import InjuryHistory from "@/components/InjuryHistory";

const bodyParts: Record<string, { name: string; load: number; fatigue: number; growth: number; recovery: "green" | "yellow" | "red" }> = {
  // Cabeza y cuello
  head: { name: "Cabeza", load: 50, fatigue: 20, growth: 60, recovery: "green" },
  neck: { name: "Cuello", load: 55, fatigue: 35, growth: 62, recovery: "green" },
  
  // Torso
  chest: { name: "Pecho", load: 75, fatigue: 45, growth: 82, recovery: "green" },
  "left-pectoral": { name: "Pectoral Izquierdo", load: 76, fatigue: 46, growth: 83, recovery: "green" },
  "right-pectoral": { name: "Pectoral Derecho", load: 76, fatigue: 46, growth: 83, recovery: "green" },
  abs: { name: "Abdomen", load: 60, fatigue: 30, growth: 65, recovery: "green" },
  core: { name: "Core", load: 65, fatigue: 35, growth: 70, recovery: "green" },
  
  // Espalda
  back: { name: "Espalda", load: 72, fatigue: 48, growth: 76, recovery: "green" },
  trapezius: { name: "Trapecio", load: 70, fatigue: 45, growth: 74, recovery: "green" },
  lats: { name: "Dorsales", load: 74, fatigue: 50, growth: 78, recovery: "yellow" },
  
  // Hombros
  "left-shoulder": { name: "Hombro Izquierdo", load: 70, fatigue: 50, growth: 72, recovery: "green" },
  "right-shoulder": { name: "Hombro Derecho", load: 70, fatigue: 50, growth: 72, recovery: "green" },
  "left-deltoid": { name: "Deltoides Izquierdo", load: 72, fatigue: 52, growth: 74, recovery: "yellow" },
  "right-deltoid": { name: "Deltoides Derecho", load: 72, fatigue: 52, growth: 74, recovery: "yellow" },
  
  // Brazos
  "left-bicep": { name: "Bíceps Izquierdo", load: 68, fatigue: 55, growth: 70, recovery: "yellow" },
  "right-bicep": { name: "Bíceps Derecho", load: 68, fatigue: 55, growth: 70, recovery: "yellow" },
  "left-tricep": { name: "Tríceps Izquierdo", load: 67, fatigue: 54, growth: 69, recovery: "yellow" },
  "right-tricep": { name: "Tríceps Derecho", load: 67, fatigue: 54, growth: 69, recovery: "yellow" },
  
  // Antebrazos
  "left-forearm": { name: "Antebrazo Izquierdo", load: 62, fatigue: 48, growth: 66, recovery: "green" },
  "right-forearm": { name: "Antebrazo Derecho", load: 62, fatigue: 48, growth: 66, recovery: "green" },
  
  // Manos
  "left-hand": { name: "Mano Izquierda", load: 45, fatigue: 25, growth: 50, recovery: "green" },
  "right-hand": { name: "Mano Derecha", load: 45, fatigue: 25, growth: 50, recovery: "green" },
  
  // Glúteos y cadera
  glutes: { name: "Glúteos", load: 80, fatigue: 60, growth: 84, recovery: "yellow" },
  hips: { name: "Cadera", load: 58, fatigue: 40, growth: 62, recovery: "green" },
  
  // Piernas
  "left-quad": { name: "Cuádriceps Izquierdo", load: 85, fatigue: 70, growth: 88, recovery: "red" },
  "right-quad": { name: "Cuádriceps Derecho", load: 85, fatigue: 70, growth: 88, recovery: "red" },
  "left-hamstring": { name: "Isquiotibial Izquierdo", load: 80, fatigue: 65, growth: 85, recovery: "yellow" },
  "right-hamstring": { name: "Isquiotibial Derecho", load: 80, fatigue: 65, growth: 85, recovery: "yellow" },
  "left-adductor": { name: "Aductor Izquierdo", load: 70, fatigue: 55, growth: 73, recovery: "yellow" },
  "right-adductor": { name: "Aductor Derecho", load: 70, fatigue: 55, growth: 73, recovery: "yellow" },
  "left-calf": { name: "Pantorrilla Izquierda", load: 60, fatigue: 40, growth: 65, recovery: "green" },
  "right-calf": { name: "Pantorrilla Derecha", load: 60, fatigue: 40, growth: 65, recovery: "green" },
  "left-tibial": { name: "Tibial Izquierdo", load: 55, fatigue: 38, growth: 60, recovery: "green" },
  "right-tibial": { name: "Tibial Derecho", load: 55, fatigue: 38, growth: 60, recovery: "green" },
  
  // Pies
  "left-foot": { name: "Pie Izquierdo", load: 50, fatigue: 30, growth: 55, recovery: "green" },
  "right-foot": { name: "Pie Derecho", load: 50, fatigue: 30, growth: 55, recovery: "green" },
  
  // Órganos
  heart: { name: "Corazón", load: 72, fatigue: 30, growth: 95, recovery: "green" },
  "left-lung": { name: "Pulmón Izquierdo", load: 68, fatigue: 28, growth: 90, recovery: "green" },
  "right-lung": { name: "Pulmón Derecho", load: 68, fatigue: 28, growth: 90, recovery: "green" },
  stomach: { name: "Estómago", load: 55, fatigue: 25, growth: 75, recovery: "green" },
  liver: { name: "Hígado", load: 60, fatigue: 22, growth: 80, recovery: "green" },
};

interface Injury {
  id: string;
  partId: string;
  partName: string;
  type: string;
  date: string;
  recovery: number;
  description: string;
}

export default function BodyMap() {
  const [selectedPart, setSelectedPart] = useState<string | null>(null);
  const [isInjuryModalOpen, setIsInjuryModalOpen] = useState(false);
  const [injuries, setInjuries] = useState<Injury[]>([]);
  const [activeLayers, setActiveLayers] = useState({
    skeleton: true,
    muscle: true,
    skin: true,
    organ: true,
  });

  const part = selectedPart ? bodyParts[selectedPart] : null;

  const handlePartClick = (partId: string) => {
    setSelectedPart(partId);
  };

  const handleRegisterInjury = () => {
    if (selectedPart) {
      setIsInjuryModalOpen(true);
    }
  };

  const handleSaveInjury = (injuryData: Omit<Injury, 'id' | 'partName'>) => {
    const part = bodyParts[injuryData.partId];
    const newInjury: Injury = {
      ...injuryData,
      id: Date.now().toString(),
      partName: part?.name || injuryData.partId,
    };
    setInjuries([...injuries, newInjury]);
  };

  const handleDeleteInjury = (id: string) => {
    setInjuries(injuries.filter(injury => injury.id !== id));
  };

  const toggleLayer = (layer: keyof typeof activeLayers) => {
    setActiveLayers(prev => ({ ...prev, [layer]: !prev[layer] }));
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Rotate3D className="h-8 w-8 text-primary animate-spin-slow" />
          Análisis Corporal Interactivo 3D
        </h1>
        <p className="text-muted-foreground">
          Explora el cuerpo por capas y gestiona lesiones con seguimiento visual
        </p>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Panel - Layer Controls */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          <Card className="border-2 border-primary/20 shadow-glow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-primary" />
                Control de Capas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-background/50 hover:bg-background/80 transition-colors">
                <Label htmlFor="skeleton" className="flex items-center gap-2 cursor-pointer">
                  <Bone className="w-4 h-4" />
                  <span>Esqueleto</span>
                </Label>
                <Switch
                  id="skeleton"
                  checked={activeLayers.skeleton}
                  onCheckedChange={() => toggleLayer('skeleton')}
                />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-background/50 hover:bg-background/80 transition-colors">
                <Label htmlFor="muscle" className="flex items-center gap-2 cursor-pointer">
                  <Activity className="w-4 h-4" />
                  <span>Músculos</span>
                </Label>
                <Switch
                  id="muscle"
                  checked={activeLayers.muscle}
                  onCheckedChange={() => toggleLayer('muscle')}
                />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-background/50 hover:bg-background/80 transition-colors">
                <Label htmlFor="organ" className="flex items-center gap-2 cursor-pointer">
                  <Heart className="w-4 h-4" />
                  <span>Órganos</span>
                </Label>
                <Switch
                  id="organ"
                  checked={activeLayers.organ}
                  onCheckedChange={() => toggleLayer('organ')}
                />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-background/50 hover:bg-background/80 transition-colors">
                <Label htmlFor="skin" className="flex items-center gap-2 cursor-pointer">
                  <Eye className="w-4 h-4" />
                  <span>Piel</span>
                </Label>
                <Switch
                  id="skin"
                  checked={activeLayers.skin}
                  onCheckedChange={() => toggleLayer('skin')}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-primary/20 shadow-glow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                {part ? part.name : "Selecciona una zona"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {part ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                    <span className="text-sm font-medium">Estado de Recuperación</span>
                    <Badge
                      variant={
                        part.recovery === "green"
                          ? "default"
                          : part.recovery === "yellow"
                          ? "secondary"
                          : "destructive"
                      }
                      className={
                        part.recovery === "green"
                          ? "bg-accent"
                          : part.recovery === "yellow"
                          ? "bg-warning"
                          : ""
                      }
                    >
                      {part.recovery === "green"
                        ? "Óptimo"
                        : part.recovery === "yellow"
                        ? "Moderado"
                        : "Descanso"}
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">Carga</span>
                        <span className="text-muted-foreground">{part.load}%</span>
                      </div>
                      <Progress value={part.load} className="h-2" />
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">Fatiga</span>
                        <span className="text-muted-foreground">{part.fatigue}%</span>
                      </div>
                      <Progress value={part.fatigue} className="h-2" />
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">Crecimiento</span>
                        <span className="text-muted-foreground">{part.growth}%</span>
                      </div>
                      <Progress value={part.growth} className="h-2" />
                    </div>
                  </div>

                  <Button 
                    onClick={handleRegisterInjury}
                    className="w-full btn-3d"
                  >
                    Registrar Lesión
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-center text-center p-4">
                  <div className="space-y-2">
                    <Activity className="h-8 w-8 text-muted-foreground mx-auto" />
                    <p className="text-xs text-muted-foreground">
                      Selecciona una zona del cuerpo
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Center - 3D Model */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="lg:col-span-2"
        >
          <Card className="h-full overflow-hidden border-2 border-primary/20 shadow-glow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Rotate3D className="h-5 w-5 text-primary" />
                Modelo Anatómico 3D
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Arrastra para rotar • Scroll para zoom
              </p>
            </CardHeader>
            <CardContent className="p-0">
              <div className="relative h-[700px] bg-gradient-to-br from-background via-secondary/30 to-background">
                <Suspense fallback={
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center space-y-2">
                      <Rotate3D className="h-12 w-12 text-primary mx-auto animate-spin" />
                      <p className="text-sm text-muted-foreground">Cargando modelo 3D...</p>
                    </div>
                  </div>
                }>
                  <Body3D 
                    selectedPart={selectedPart} 
                    onPartClick={handlePartClick}
                    activeLayers={activeLayers}
                    injuries={injuries}
                  />
                </Suspense>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Injury History Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="border-2 border-primary/20 shadow-glow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Historial de Lesiones
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Seguimiento visual de recuperación y gestión de lesiones
            </p>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <InjuryHistory injuries={injuries} onDelete={handleDeleteInjury} />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <InjuryModal
        isOpen={isInjuryModalOpen}
        onClose={() => setIsInjuryModalOpen(false)}
        onSave={handleSaveInjury}
        selectedPart={selectedPart}
        partName={selectedPart ? bodyParts[selectedPart]?.name || '' : ''}
      />
    </div>
  );
}
