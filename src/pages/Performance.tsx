import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import { Trophy, TrendingUp, ShoppingCart, Star } from "lucide-react";

const performanceData = [
  { day: "Lun", fuerza: 85, resistencia: 70 },
  { day: "Mar", fuerza: 88, resistencia: 75 },
  { day: "Mié", fuerza: 82, resistencia: 78 },
  { day: "Jue", fuerza: 90, resistencia: 72 },
  { day: "Vie", fuerza: 87, resistencia: 80 },
  { day: "Sáb", fuerza: 92, resistencia: 82 },
  { day: "Dom", fuerza: 85, resistencia: 77 },
];

const radarData = [
  { category: "Fuerza", value: 85 },
  { category: "Resistencia", value: 75 },
  { category: "Flexibilidad", value: 68 },
  { category: "Velocidad", value: 72 },
  { category: "Potencia", value: 80 },
];

const products = [
  {
    name: "Proteína Whey Premium",
    category: "Suplemento",
    rating: 4.8,
    price: "€49.99",
    image: "💪",
    recommended: "Alta recuperación muscular",
  },
  {
    name: "Banda Elástica Pro",
    category: "Equipamiento",
    rating: 4.5,
    price: "€29.99",
    image: "🏋️",
    recommended: "Mejora flexibilidad",
  },
  {
    name: "Monitor Cardíaco Elite",
    category: "Tecnología",
    rating: 4.9,
    price: "€199.99",
    image: "⌚",
    recommended: "Seguimiento preciso",
  },
];

export default function Performance() {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold mb-2">Rendimiento Deportivo</h1>
        <p className="text-muted-foreground">
          Analiza tu progreso y mejora con recomendaciones personalizadas
        </p>
      </motion.div>

      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "VO₂ Max", value: "52.3", unit: "ml/kg/min", trend: "+3%" },
          { label: "IMC", value: "23.4", unit: "kg/m²", trend: "-0.5" },
          { label: "Masa Magra", value: "68.2", unit: "kg", trend: "+2.1kg" },
          { label: "Horas Sueño", value: "7.5", unit: "hrs/día", trend: "+0.5" },
        ].map((metric, i) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">{metric.label}</span>
                  <Badge variant="secondary" className="text-xs">
                    {metric.trend}
                  </Badge>
                </div>
                <div className="text-3xl font-bold">
                  {metric.value}
                  <span className="text-lg text-muted-foreground ml-1">
                    {metric.unit}
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Progreso Semanal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="fuerza" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="resistencia" fill="hsl(var(--accent))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-warning" />
                Análisis Multidimensional
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="category" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar
                    name="Rendimiento"
                    dataKey="value"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.6}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Marketplace */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-primary" />
                Recomendaciones Personalizadas
              </CardTitle>
              <Button variant="outline" size="sm">
                Ver todo
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {products.map((product, i) => (
                <motion.div
                  key={product.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="border rounded-lg p-4 hover:shadow-lg transition-shadow"
                >
                  <div className="text-4xl mb-3">{product.image}</div>
                  <h3 className="font-semibold mb-1">{product.name}</h3>
                  <Badge variant="secondary" className="mb-2">
                    {product.category}
                  </Badge>
                  <div className="flex items-center gap-1 mb-2">
                    <Star className="h-4 w-4 fill-warning text-warning" />
                    <span className="text-sm font-medium">{product.rating}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {product.recommended}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold">{product.price}</span>
                    <Button size="sm">Comprar</Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
