import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, TrendingUp, AlertTriangle } from "lucide-react";

const bodyParts = {
  chest: { name: "Pecho", load: 75, fatigue: 45, growth: 82, recovery: "green" },
  arms: { name: "Brazos", load: 68, fatigue: 55, growth: 70, recovery: "yellow" },
  abs: { name: "Abdomen", load: 60, fatigue: 30, growth: 65, recovery: "green" },
  legs: { name: "Piernas", load: 85, fatigue: 70, growth: 88, recovery: "red" },
  back: { name: "Espalda", load: 72, fatigue: 48, growth: 76, recovery: "green" },
};

export default function BodyMap() {
  const [selectedPart, setSelectedPart] = useState<keyof typeof bodyParts | null>(null);
  const [gender, setGender] = useState<"male" | "female">("male");

  const part = selectedPart ? bodyParts[selectedPart] : null;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold mb-2">Análisis Corporal Interactivo</h1>
        <p className="text-muted-foreground">
          Explora tu cuerpo y descubre estadísticas detalladas de cada zona
        </p>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Body Visualization */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Modelo 3D</CardTitle>
                <Tabs value={gender} onValueChange={(v) => setGender(v as "male" | "female")}>
                  <TabsList>
                    <TabsTrigger value="male">Masculino</TabsTrigger>
                    <TabsTrigger value="female">Femenino</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative aspect-[3/4] bg-secondary/20 rounded-lg overflow-hidden">
                <svg
                  viewBox="0 0 300 500"
                  className="w-full h-full"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Head */}
                  <ellipse cx="150" cy="60" rx="40" ry="50" fill="hsl(var(--muted))" />
                  
                  {/* Chest */}
                  <motion.rect
                    x="110"
                    y="110"
                    width="80"
                    height="80"
                    rx="10"
                    fill={selectedPart === "chest" ? "hsl(var(--primary))" : "hsl(var(--muted))"}
                    className="cursor-pointer transition-colors"
                    onClick={() => setSelectedPart("chest")}
                    whileHover={{ fill: "hsl(var(--primary) / 0.8)" }}
                  />
                  
                  {/* Arms */}
                  <motion.rect
                    x="50"
                    y="120"
                    width="50"
                    height="100"
                    rx="25"
                    fill={selectedPart === "arms" ? "hsl(var(--primary))" : "hsl(var(--muted))"}
                    className="cursor-pointer transition-colors"
                    onClick={() => setSelectedPart("arms")}
                    whileHover={{ fill: "hsl(var(--primary) / 0.8)" }}
                  />
                  <motion.rect
                    x="200"
                    y="120"
                    width="50"
                    height="100"
                    rx="25"
                    fill={selectedPart === "arms" ? "hsl(var(--primary))" : "hsl(var(--muted))"}
                    className="cursor-pointer transition-colors"
                    onClick={() => setSelectedPart("arms")}
                    whileHover={{ fill: "hsl(var(--primary) / 0.8)" }}
                  />
                  
                  {/* Abs */}
                  <motion.rect
                    x="120"
                    y="200"
                    width="60"
                    height="80"
                    rx="8"
                    fill={selectedPart === "abs" ? "hsl(var(--primary))" : "hsl(var(--muted))"}
                    className="cursor-pointer transition-colors"
                    onClick={() => setSelectedPart("abs")}
                    whileHover={{ fill: "hsl(var(--primary) / 0.8)" }}
                  />
                  
                  {/* Legs */}
                  <motion.rect
                    x="115"
                    y="290"
                    width="30"
                    height="150"
                    rx="15"
                    fill={selectedPart === "legs" ? "hsl(var(--primary))" : "hsl(var(--muted))"}
                    className="cursor-pointer transition-colors"
                    onClick={() => setSelectedPart("legs")}
                    whileHover={{ fill: "hsl(var(--primary) / 0.8)" }}
                  />
                  <motion.rect
                    x="155"
                    y="290"
                    width="30"
                    height="150"
                    rx="15"
                    fill={selectedPart === "legs" ? "hsl(var(--primary))" : "hsl(var(--muted))"}
                    className="cursor-pointer transition-colors"
                    onClick={() => setSelectedPart("legs")}
                    whileHover={{ fill: "hsl(var(--primary) / 0.8)" }}
                  />
                </svg>
                
                <div className="absolute bottom-4 left-0 right-0 text-center">
                  <p className="text-sm text-muted-foreground">
                    Haz clic en una zona para ver sus estadísticas
                  </p>
                </div>
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
