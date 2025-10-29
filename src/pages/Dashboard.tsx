import { motion } from "framer-motion";
import { Activity, Heart, Zap, Moon, TrendingUp, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

const metrics = [
  {
    icon: Heart,
    label: "Frecuencia Cardíaca",
    value: "72 bpm",
    status: "normal",
    color: "text-accent",
  },
  {
    icon: Activity,
    label: "Actividad Diaria",
    value: "8,432 pasos",
    status: "alto",
    color: "text-primary",
  },
  {
    icon: Zap,
    label: "Calorías Quemadas",
    value: "2,340 kcal",
    status: "normal",
    color: "text-warning",
  },
  {
    icon: Moon,
    label: "Horas de Sueño",
    value: "7.5 hrs",
    status: "normal",
    color: "text-chart-4",
  },
];

const goals = [
  { name: "Pérdida de Grasa", progress: 65, target: "15%", current: "18%" },
  { name: "Masa Muscular", progress: 80, target: "75kg", current: "72kg" },
  { name: "VO₂ Max", progress: 45, target: "55", current: "48" },
];

export default function Dashboard() {
  const wellnessScore = 87;

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-accent p-8 text-white"
      >
        <div className="relative z-10">
          <h1 className="text-4xl font-bold mb-2">¡Bienvenido de vuelta!</h1>
          <p className="text-lg opacity-90 mb-6">
            Tu estado de bienestar general está excelente
          </p>
          <div className="flex items-center gap-4">
            <div className="text-6xl font-bold">{wellnessScore}</div>
            <div>
              <div className="text-sm opacity-80">WELLNESS SCORE</div>
              <div className="flex items-center gap-1 text-sm">
                <TrendingUp className="h-4 w-4" />
                <span>+5 esta semana</span>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute right-0 top-0 h-full w-1/2 opacity-10">
          <svg
            viewBox="0 0 200 200"
            className="h-full w-full"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill="currentColor"
              d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,79.6,-45.8C87.4,-32.6,90,-16.3,88.5,-0.9C87,14.6,81.4,29.2,73.1,42.6C64.8,56,53.8,68.2,40.3,75.8C26.8,83.4,10.8,86.4,-4.9,84.9C-20.6,83.4,-36.1,77.4,-48.9,68.3C-61.7,59.2,-71.8,47,-77.4,33.1C-83,19.2,-84.1,3.6,-81.7,-10.9C-79.3,-25.4,-73.4,-38.8,-64.4,-50.1C-55.4,-61.4,-43.3,-70.6,-29.8,-78.3C-16.3,-86,-8.1,-92.2,2.6,-96.5C13.3,-100.8,30.6,-83.6,44.7,-76.4Z"
              transform="translate(100 100)"
            />
          </svg>
        </div>
      </motion.div>

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Icon className={`h-8 w-8 ${metric.color}`} />
                    <Badge variant={metric.status === "alto" ? "default" : "secondary"}>
                      {metric.status}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">{metric.label}</p>
                    <p className="text-2xl font-bold">{metric.value}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Goals Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Objetivos del Mes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {goals.map((goal) => (
              <div key={goal.name} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{goal.name}</span>
                  <span className="text-muted-foreground">
                    {goal.current} / {goal.target}
                  </span>
                </div>
                <Progress value={goal.progress} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="border-l-4 border-l-accent">
          <CardContent className="p-6">
            <div className="flex gap-4">
              <AlertCircle className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold mb-1">Recomendación del día</h3>
                <p className="text-sm text-muted-foreground">
                  Has mejorado un 8% en fuerza esta semana. Considera aumentar la
                  ingesta de proteínas para optimizar la recuperación muscular.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
