import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star, Video, Calendar, Play } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const specialists = [
  {
    id: 1,
    name: "Dr. Ana Martínez",
    specialty: "Nutrición Deportiva",
    rating: 4.9,
    reviews: 156,
    available: true,
    avatar: "AM",
    color: "bg-primary",
  },
  {
    id: 2,
    name: "Carlos Ruiz",
    specialty: "Entrenamiento Personal",
    rating: 4.8,
    reviews: 203,
    available: true,
    avatar: "CR",
    color: "bg-accent",
  },
  {
    id: 3,
    name: "Dra. Laura Gómez",
    specialty: "Fisioterapia",
    rating: 4.9,
    reviews: 178,
    available: false,
    avatar: "LG",
    color: "bg-warning",
  },
  {
    id: 4,
    name: "Miguel Torres",
    specialty: "Psicología Deportiva",
    rating: 4.7,
    reviews: 92,
    available: true,
    avatar: "MT",
    color: "bg-chart-4",
  },
];

const videos = [
  {
    id: 1,
    title: "Nutrición para ganar masa muscular",
    specialist: "Dr. Ana Martínez",
    duration: "15:32",
    views: "2.3K",
  },
  {
    id: 2,
    title: "Rutina HIIT para principiantes",
    specialist: "Carlos Ruiz",
    duration: "12:18",
    views: "3.1K",
  },
  {
    id: 3,
    title: "Prevención de lesiones en running",
    specialist: "Dra. Laura Gómez",
    duration: "18:45",
    views: "1.8K",
  },
];

export default function Specialists() {
  const [selectedSpecialist, setSelectedSpecialist] = useState<number | null>(null);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold mb-2">Especialistas</h1>
        <p className="text-muted-foreground">
          Conecta con profesionales certificados para optimizar tu salud
        </p>
      </motion.div>

      {/* Specialists Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {specialists.map((specialist, i) => (
          <motion.div
            key={specialist.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  <Avatar className={`h-20 w-20 ${specialist.color} mb-4`}>
                    <AvatarFallback className="text-white text-xl">
                      {specialist.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="font-semibold mb-1">{specialist.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {specialist.specialty}
                  </p>
                  <div className="flex items-center gap-1 mb-3">
                    <Star className="h-4 w-4 fill-warning text-warning" />
                    <span className="text-sm font-medium">{specialist.rating}</span>
                    <span className="text-xs text-muted-foreground">
                      ({specialist.reviews})
                    </span>
                  </div>
                  <Badge
                    variant={specialist.available ? "default" : "secondary"}
                    className={specialist.available ? "bg-accent" : ""}
                  >
                    {specialist.available ? "Disponible" : "No disponible"}
                  </Badge>
                  <div className="flex gap-2 mt-4 w-full">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => setSelectedSpecialist(specialist.id)}
                        >
                          <Video className="h-4 w-4 mr-1" />
                          Ver perfil
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>{specialist.name}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="aspect-video bg-secondary rounded-lg flex items-center justify-center">
                            <Play className="h-16 w-16 text-muted-foreground" />
                          </div>
                          <div className="space-y-2">
                            <h4 className="font-semibold">Sobre el especialista</h4>
                            <p className="text-sm text-muted-foreground">
                              Profesional certificado con más de 10 años de experiencia
                              en {specialist.specialty.toLowerCase()}. Especializado en
                              trabajar con atletas de alto rendimiento y personas que
                              buscan mejorar su salud integral.
                            </p>
                          </div>
                          <Button className="w-full">
                            <Calendar className="h-4 w-4 mr-2" />
                            Agendar consulta
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button
                      size="sm"
                      className="flex-1"
                      disabled={!specialist.available}
                    >
                      <Calendar className="h-4 w-4 mr-1" />
                      Agendar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Videos Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5 text-primary" />
                Contenido Educativo Reciente
              </CardTitle>
              <Button variant="outline" size="sm">
                Ver todo
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {videos.map((video, i) => (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="group cursor-pointer"
                >
                  <div className="aspect-video bg-secondary rounded-lg mb-3 relative overflow-hidden flex items-center justify-center">
                    <Play className="h-12 w-12 text-muted-foreground group-hover:text-primary transition-colors" />
                    <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                      {video.duration}
                    </div>
                  </div>
                  <h4 className="font-semibold mb-1 group-hover:text-primary transition-colors">
                    {video.title}
                  </h4>
                  <p className="text-sm text-muted-foreground mb-1">
                    {video.specialist}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {video.views} visualizaciones
                  </p>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
