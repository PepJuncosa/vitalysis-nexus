import { useState, Suspense } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Activity, TrendingUp, AlertTriangle, Rotate3D } from "lucide-react";
import Body3D from "@/components/Body3D";

const bodyParts: Record<string, { name: string; load: number; fatigue: number; growth: number; recovery: "green" | "yellow" | "red" }> = {
  chest: { name: "Pecho", load: 75, fatigue: 45, growth: 82, recovery: "green" },
  abs: { name: "Abdomen", load: 60, fatigue: 30, growth: 65, recovery: "green" },
  back: { name: "Espalda", load: 72, fatigue: 48, growth: 76, recovery: "green" },
  "left-arm": { name: "Brazo Izquierdo", load: 68, fatigue: 55, growth: 70, recovery: "yellow" },
  "right-arm": { name: "Brazo Derecho", load: 68, fatigue: 55, growth: 70, recovery: "yellow" },
  "left-shoulder": { name: "Hombro Izquierdo", load: 70, fatigue: 50, growth: 72, recovery: "green" },
  "right-shoulder": { name: "Hombro Derecho", load: 70, fatigue: 50, growth: 72, recovery: "green" },
  "left-quad": { name: "Cuádriceps Izquierdo", load: 85, fatigue: 70, growth: 88, recovery: "red" },
  "right-quad": { name: "Cuádriceps Derecho", load: 85, fatigue: 70, growth: 88, recovery: "red" },
  "left-hamstring": { name: "Isquiotibial Izquierdo", load: 80, fatigue: 65, growth: 85, recovery: "yellow" },
  "right-hamstring": { name: "Isquiotibial Derecho", load: 80, fatigue: 65, growth: 85, recovery: "yellow" },
  "left-calf": { name: "Pantorrilla Izquierda", load: 60, fatigue: 40, growth: 65, recovery: "green" },
  "right-calf": { name: "Pantorrilla Derecha", load: 60, fatigue: 40, growth: 65, recovery: "green" },
  heart: { name: "Corazón", load: 72, fatigue: 30, growth: 95, recovery: "green" },
  head: { name: "Cabeza", load: 50, fatigue: 20, growth: 60, recovery: "green" },
};

export default function BodyMap() {
  const [selectedPart, setSelectedPart] = useState<string | null>(null);

  const part = selectedPart ? bodyParts[selectedPart] : null;

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
          Rota el modelo, haz clic en cualquier zona y descubre estadísticas detalladas
        </p>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Body Visualization */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="h-full overflow-hidden border-2 border-primary/20 shadow-glow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Rotate3D className="h-5 w-5 text-primary" />
                Modelo Corporal 3D
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Arrastra para rotar • Scroll para zoom
              </p>
            </CardHeader>
            <CardContent className="p-0">
              <div className="relative h-[600px] bg-gradient-to-br from-background via-secondary/30 to-background">
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
                    onPartClick={(id) => setSelectedPart(id)}
                  />
                </Suspense>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats Panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                {part ? part.name : "Selecciona una zona"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {part ? (
                <div className="space-y-6">
                  {/* Recovery Status */}
                  <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                    <span className="font-medium">Estado de Recuperación</span>
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
                        : "Necesita descanso"}
                    </Badge>
                  </div>

                  {/* Metrics */}
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-medium">Carga Muscular</span>
                        <span className="text-muted-foreground">{part.load}%</span>
                      </div>
                      <Progress value={part.load} className="h-2" />
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-medium">Nivel de Fatiga</span>
                        <span className="text-muted-foreground">{part.fatigue}%</span>
                      </div>
                      <Progress value={part.fatigue} className="h-2" />
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-medium">Crecimiento Muscular</span>
                        <span className="text-muted-foreground">{part.growth}%</span>
                      </div>
                      <Progress value={part.growth} className="h-2" />
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div className="border-l-4 border-l-primary p-4 bg-primary/5 rounded-r-lg">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Recomendaciones
                    </h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Mantén el entrenamiento actual</li>
                      <li>• Aumenta proteínas en 15g diarios</li>
                      <li>• Considera 1 día adicional de descanso</li>
                    </ul>
                  </div>

                  {part.recovery === "red" && (
                    <div className="border-l-4 border-l-destructive p-4 bg-destructive/5 rounded-r-lg">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                        Alerta
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Esta zona requiere más recuperación antes del próximo
                        entrenamiento intenso.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-center p-8">
                  <div className="space-y-2">
                    <Activity className="h-12 w-12 text-muted-foreground mx-auto" />
                    <p className="text-muted-foreground">
                      Selecciona una parte del cuerpo para ver estadísticas detalladas
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
