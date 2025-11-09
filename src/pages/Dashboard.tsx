import { motion } from "framer-motion";
import { Activity, Heart, Zap, Moon, TrendingUp, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { PointsTracker } from "@/components/PointsTracker";
import { ReminderSettings } from "@/components/ReminderSettings";

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
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-chart-4 to-accent p-8 text-white shadow-glow animate-gradient"
      >
        <div className="relative z-10">
          <h1 className="text-4xl font-bold mb-2 animate-fade-in">¡Bienvenido de vuelta!</h1>
          <p className="text-lg opacity-90 mb-6">
            Tu estado de bienestar general está excelente
          </p>
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="text-7xl font-bold drop-shadow-lg">{wellnessScore}</div>
              <div className="absolute -inset-4 bg-white/10 rounded-full blur-xl -z-10" />
            </div>
            <div>
              <div className="text-sm font-semibold opacity-90 tracking-wider">WELLNESS SCORE</div>
              <div className="flex items-center gap-1 text-sm mt-1 bg-white/20 rounded-full px-3 py-1 backdrop-blur-sm">
                <TrendingUp className="h-4 w-4" />
                <span className="font-medium">+5 esta semana</span>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute right-0 top-0 h-full w-1/2 opacity-10">
          <svg viewBox="0 0 200 200" className="h-full w-full">
            <circle cx="100" cy="100" r="80" fill="none" stroke="currentColor" strokeWidth="0.5" />
          </svg>
        </div>
      </motion.div>

      {/* Points Tracker */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <PointsTracker />
      </motion.div>

      {/* Reminder Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <ReminderSettings />
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
              whileHover={{ scale: 1.05 }}
            >
              <Card className="card-hover border-primary/10 group">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`rounded-lg bg-primary/10 p-3 ${metric.color} group-hover:scale-110 transition-transform`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <Badge 
                      variant={metric.status === "alto" ? "default" : "secondary"}
                      className="shadow-sm"
                    >
                      {metric.status}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground font-medium">{metric.label}</p>
                    <p className="text-3xl font-bold tracking-tight">{metric.value}</p>
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
        <Card className="border-primary/10 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="rounded-lg bg-primary/10 p-2">
                <Activity className="h-5 w-5 text-primary" />
              </div>
              Objetivos del Mes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {goals.map((goal, index) => (
              <motion.div 
                key={goal.name} 
                className="space-y-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
              >
                <div className="flex justify-between text-sm">
                  <span className="font-semibold">{goal.name}</span>
                  <span className="text-muted-foreground font-medium">
                    {goal.current} / {goal.target}
                  </span>
                </div>
                <Progress value={goal.progress} className="h-3 shadow-sm" />
              </motion.div>
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
        <Card className="border-l-4 border-l-accent shadow-md bg-gradient-to-r from-accent/5 to-transparent">
          <CardContent className="p-6">
            <div className="flex gap-4">
              <div className="rounded-lg bg-accent/10 p-3 h-fit">
                <AlertCircle className="h-5 w-5 text-accent" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-2">Recomendación del día</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
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
