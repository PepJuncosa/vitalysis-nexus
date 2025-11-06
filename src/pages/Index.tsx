import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Activity, Heart, Brain, TrendingUp, ArrowRight, Sparkles, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const features = [
  {
    icon: Activity,
    title: "Monitoreo en Tiempo Real",
    description: "Seguimiento continuo de tus métricas de salud y rendimiento con tecnología avanzada",
    color: "text-primary",
  },
  {
    icon: Brain,
    title: "Inteligencia Artificial",
    description: "Recomendaciones personalizadas basadas en IA para optimizar tu bienestar",
    color: "text-accent",
  },
  {
    icon: Heart,
    title: "Salud Integral",
    description: "Gestión completa de tu salud física, mental y nutricional en un solo lugar",
    color: "text-destructive",
  },
  {
    icon: TrendingUp,
    title: "Análisis Avanzado",
    description: "Visualiza tu progreso con gráficos detallados y métricas profesionales",
    color: "text-warning",
  },
];

const stats = [
  { value: "10K+", label: "Usuarios Activos" },
  { value: "98%", label: "Satisfacción" },
  { value: "24/7", label: "Soporte" },
  { value: "50+", label: "Especialistas" },
];

const Index = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-accent/5 to-background py-20 md:py-32">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="container relative z-10 mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-4xl text-center"
          >
            <Badge className="mb-4 shadow-glow" variant="outline">
              <Sparkles className="mr-1 h-3 w-3" />
              Plataforma de Bienestar Integral
            </Badge>
            <h1 className="mb-6 text-5xl font-bold tracking-tight md:text-6xl lg:text-7xl">
              Tu Salud y Rendimiento,
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                {" "}Optimizados
              </span>
            </h1>
            <p className="mb-8 text-lg text-muted-foreground md:text-xl">
              Monitoreo inteligente, análisis avanzado y asesoría profesional para alcanzar tu máximo potencial
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button asChild size="lg" className="btn-3d shadow-glow group">
                <Link to="/dashboard">
                  Comenzar Ahora
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="btn-3d">
                <Link to="/subscriptions">Ver Planes</Link>
              </Button>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-20 grid grid-cols-2 gap-4 md:grid-cols-4 lg:gap-8"
          >
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-primary md:text-4xl">{stat.value}</div>
                <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <Badge className="mb-4" variant="outline">
              <Shield className="mr-1 h-3 w-3" />
              Características Principales
            </Badge>
            <h2 className="text-3xl font-bold md:text-4xl">Todo lo que necesitas para tu bienestar</h2>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="card-hover h-full border-primary/10">
                    <CardContent className="p-6">
                      <div className={`mb-4 inline-flex rounded-lg bg-primary/10 p-3 ${feature.color}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-chart-4 to-accent p-12 text-white shadow-glow animate-gradient md:p-16"
          >
            <div className="relative z-10 mx-auto max-w-3xl text-center">
              <Zap className="mx-auto mb-4 h-12 w-12" />
              <h2 className="mb-4 text-3xl font-bold md:text-4xl">
                ¿Listo para transformar tu salud?
              </h2>
              <p className="mb-8 text-lg opacity-90">
                Únete a miles de usuarios que ya han mejorado su bienestar con nuestra plataforma
              </p>
              <Button asChild size="lg" variant="secondary" className="btn-3d shadow-xl">
                <Link to="/auth">
                  Crear Cuenta Gratis
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Index;
