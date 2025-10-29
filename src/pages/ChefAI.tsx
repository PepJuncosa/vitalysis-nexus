import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ChefHat, Camera, Send, Clock, Flame, TrendingUp } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

const sampleRecipes = [
  {
    id: 1,
    name: "Ensalada Proteica Post-Entreno",
    calories: 420,
    time: "15 min",
    difficulty: "Fácil",
    macros: { protein: 45, carbs: 25, fats: 15 },
  },
  {
    id: 2,
    name: "Bowl de Quinoa y Pollo",
    calories: 520,
    time: "25 min",
    difficulty: "Media",
    macros: { protein: 52, carbs: 48, fats: 18 },
  },
  {
    id: 3,
    name: "Batido Verde Energizante",
    calories: 280,
    time: "5 min",
    difficulty: "Fácil",
    macros: { protein: 20, carbs: 35, fats: 8 },
  },
];

export default function ChefAI() {
  const [activeMode, setActiveMode] = useState<"data" | "visual">("data");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold mb-2">Chef IA</h1>
        <p className="text-muted-foreground">
          Tu asistente culinario inteligente para recetas personalizadas
        </p>
      </motion.div>

      {/* Mode Selector */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Tabs value={activeMode} onValueChange={(v) => setActiveMode(v as "data" | "visual")}>
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="data">
              <TrendingUp className="h-4 w-4 mr-2" />
              Modo Datos
            </TabsTrigger>
            <TabsTrigger value="visual">
              <Camera className="h-4 w-4 mr-2" />
              Modo Visual
            </TabsTrigger>
          </TabsList>

          <TabsContent value="data" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ChefHat className="h-5 w-5 text-primary" />
                  Genera recetas por objetivos nutricionales
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Calorías objetivo</label>
                    <Input
                      type="number"
                      placeholder="500"
                      value={calories}
                      onChange={(e) => setCalories(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Proteínas (g)</label>
                    <Input
                      type="number"
                      placeholder="40"
                      value={protein}
                      onChange={(e) => setProtein(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Objetivo nutricional</label>
                  <Textarea
                    placeholder="Ej: Ganar músculo, reducir grasa, aumentar energía..."
                    rows={3}
                  />
                </div>
                <Button className="w-full">
                  <Send className="h-4 w-4 mr-2" />
                  Generar Recetas
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="visual" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5 text-primary" />
                  Sube una foto de tus ingredientes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-border rounded-lg p-12 text-center hover:border-primary transition-colors cursor-pointer">
                  <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Arrastra una imagen o haz clic para seleccionar
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Formatos: JPG, PNG (máx. 10MB)
                  </p>
                </div>
                <Button className="w-full" disabled>
                  <Send className="h-4 w-4 mr-2" />
                  Analizar Ingredientes
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  Esta función requiere Lovable Cloud para procesar imágenes con IA
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Sample Recipes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Recetas Sugeridas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {sampleRecipes.map((recipe, i) => (
                <motion.div
                  key={recipe.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="border rounded-lg p-4 hover:shadow-lg transition-shadow"
                >
                  <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg mb-3 flex items-center justify-center">
                    <ChefHat className="h-12 w-12 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{recipe.name}</h3>
                  <div className="flex gap-2 mb-3">
                    <Badge variant="secondary">
                      <Clock className="h-3 w-3 mr-1" />
                      {recipe.time}
                    </Badge>
                    <Badge variant="secondary">
                      <Flame className="h-3 w-3 mr-1" />
                      {recipe.calories} kcal
                    </Badge>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Proteínas:</span>
                      <span className="font-medium">{recipe.macros.protein}g</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Carbohidratos:</span>
                      <span className="font-medium">{recipe.macros.carbs}g</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Grasas:</span>
                      <span className="font-medium">{recipe.macros.fats}g</span>
                    </div>
                  </div>
                  <Button className="w-full mt-4" variant="outline" size="sm">
                    Ver receta completa
                  </Button>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
