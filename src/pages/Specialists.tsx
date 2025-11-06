import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star, Video, Calendar, Play, Award, Clock, Users, Search, Filter, MessageCircle, Heart, Crown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
    experience: "12 años",
    patients: "500+",
    certifications: ["Certificación Internacional en Nutrición Deportiva", "Máster en Nutrición Clínica"],
    price: "€60/sesión",
    languages: ["Español", "Inglés"],
    bio: "Especialista en nutrición deportiva con enfoque en atletas de alto rendimiento. Ayudo a optimizar el rendimiento a través de planes nutricionales personalizados.",
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
    experience: "10 años",
    patients: "650+",
    certifications: ["NSCA-CPT", "Especialista en Entrenamiento Funcional"],
    price: "€50/sesión",
    languages: ["Español"],
    bio: "Entrenador personal certificado especializado en transformación corporal y entrenamiento funcional. Mi enfoque combina ciencia y práctica.",
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
    experience: "15 años",
    patients: "800+",
    certifications: ["Fisioterapeuta Colegiada", "Especialista en Medicina Deportiva"],
    price: "€65/sesión",
    languages: ["Español", "Inglés", "Francés"],
    bio: "Fisioterapeuta especializada en prevención y recuperación de lesiones deportivas. Trabajo con atletas profesionales y amateurs.",
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
    experience: "8 años",
    patients: "300+",
    certifications: ["Psicólogo Deportivo", "Coach Certificado"],
    price: "€55/sesión",
    languages: ["Español", "Catalán"],
    bio: "Psicólogo deportivo especializado en rendimiento mental y gestión del estrés. Te ayudo a alcanzar tu máximo potencial mental.",
  },
];

const videos = [
  {
    id: 1,
    title: "Nutrición para ganar masa muscular",
    specialist: "Dr. Ana Martínez",
    duration: "15:32",
    views: "2.3K",
    thumbnail: "nutrition",
    category: "Nutrición",
  },
  {
    id: 2,
    title: "Rutina HIIT para principiantes",
    specialist: "Carlos Ruiz",
    duration: "12:18",
    views: "3.1K",
    thumbnail: "hiit",
    category: "Entrenamiento",
  },
  {
    id: 3,
    title: "Prevención de lesiones en running",
    specialist: "Dra. Laura Gómez",
    duration: "18:45",
    views: "1.8K",
    thumbnail: "running",
    category: "Fisioterapia",
  },
  {
    id: 4,
    title: "Mentalidad ganadora en competición",
    specialist: "Miguel Torres",
    duration: "14:20",
    views: "1.5K",
    thumbnail: "mindset",
    category: "Psicología",
  },
];

export default function Specialists() {
  const [selectedSpecialist, setSelectedSpecialist] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSpecialty, setFilterSpecialty] = useState("all");
  const [favorites, setFavorites] = useState<number[]>([]);
  const { user, isPremium } = useAuth();
  const navigate = useNavigate();

  const toggleFavorite = (id: number) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(fav => fav !== id) : [...prev, id]
    );
  };

  const filteredSpecialists = specialists.filter(specialist => {
    const matchesSearch = specialist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      specialist.specialty.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterSpecialty === "all" || specialist.specialty === filterSpecialty;
    return matchesSearch && matchesFilter;
  });

  const handleBooking = (specialistId: number) => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    if (!isPremium) {
      navigate('/subscriptions');
      return;
    }
    
    // Logic for premium users - sessions included
    alert('✅ Sesión agendada exitosamente - Incluida en tu plan Premium');
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl p-8 bg-gradient-to-br from-primary/10 via-accent/10 to-transparent border border-primary/20"
      >
        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Especialistas Certificados
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Conecta con profesionales de élite para optimizar tu salud y rendimiento deportivo
            </p>
            {isPremium && (
              <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary/10 to-accent/10 rounded-full border border-primary/20">
                <Crown className="h-5 w-5 text-primary" />
                <span className="font-semibold text-primary">Sesiones ilimitadas incluidas en tu plan Premium</span>
              </div>
            )}
          </motion.div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/2 w-64 h-64 bg-accent/5 rounded-full blur-3xl" />
      </motion.div>

      {/* Search and Filter Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col md:flex-row gap-4"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar especialista o especialidad..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterSpecialty} onValueChange={setFilterSpecialty}>
          <SelectTrigger className="w-full md:w-[250px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filtrar por especialidad" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las especialidades</SelectItem>
            <SelectItem value="Nutrición Deportiva">Nutrición Deportiva</SelectItem>
            <SelectItem value="Entrenamiento Personal">Entrenamiento Personal</SelectItem>
            <SelectItem value="Fisioterapia">Fisioterapia</SelectItem>
            <SelectItem value="Psicología Deportiva">Psicología Deportiva</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      {/* Specialists Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredSpecialists.map((specialist, i) => (
          <motion.div
            key={specialist.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ y: -8 }}
          >
            <Card className="relative overflow-hidden group card-hover border-primary/10">
              {/* Favorite Button */}
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-3 right-3 z-10 h-8 w-8 p-0 rounded-full bg-background/80 backdrop-blur-sm"
                onClick={() => toggleFavorite(specialist.id)}
              >
                <Heart
                  className={`h-4 w-4 transition-colors ${
                    favorites.includes(specialist.id)
                      ? "fill-destructive text-destructive"
                      : "text-muted-foreground"
                  }`}
                />
              </Button>

              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  {/* Avatar with gradient border */}
                  <div className="relative mb-4">
                    <div className={`absolute inset-0 ${specialist.color} opacity-20 blur-xl rounded-full`} />
                    <Avatar className={`relative h-24 w-24 ${specialist.color} ring-4 ring-background`}>
                      <AvatarFallback className="text-white text-2xl font-bold">
                        {specialist.avatar}
                      </AvatarFallback>
                    </Avatar>
                    {specialist.available && (
                      <div className="absolute bottom-0 right-0 h-6 w-6 bg-accent rounded-full border-4 border-background" />
                    )}
                  </div>

                  <h3 className="font-bold text-lg mb-1">{specialist.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {specialist.specialty}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-warning text-warning" />
                      <span className="text-sm font-semibold">{specialist.rating}</span>
                      <span className="text-xs text-muted-foreground">
                        ({specialist.reviews})
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Users className="h-3 w-3" />
                      {specialist.patients}
                    </div>
                  </div>

                  {/* Quick Info */}
                  <div className="flex items-center gap-2 mb-4 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{specialist.experience} exp.</span>
                    <span className="mx-1">•</span>
                    {isPremium ? (
                      <Badge variant="secondary" className="bg-accent/20 text-accent text-xs">
                        <Crown className="h-3 w-3 mr-1" />
                        Incluido
                      </Badge>
                    ) : (
                      <span className="font-semibold text-primary">{specialist.price}</span>
                    )}
                  </div>

                  <Badge
                    variant={specialist.available ? "default" : "secondary"}
                    className={specialist.available ? "bg-accent mb-4" : "mb-4"}
                  >
                    {specialist.available ? "Disponible ahora" : "No disponible"}
                  </Badge>

                  {/* Action Buttons */}
                  <div className="flex gap-2 w-full">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => setSelectedSpecialist(specialist.id)}
                        >
                          Ver perfil
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <div className="flex items-start gap-4 mb-4">
                            <Avatar className={`h-20 w-20 ${specialist.color}`}>
                              <AvatarFallback className="text-white text-2xl">
                                {specialist.avatar}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 text-left">
                              <DialogTitle className="text-2xl mb-2">{specialist.name}</DialogTitle>
                              <p className="text-muted-foreground">{specialist.specialty}</p>
                              <div className="flex items-center gap-3 mt-2">
                                <div className="flex items-center gap-1">
                                  <Star className="h-4 w-4 fill-warning text-warning" />
                                  <span className="font-semibold">{specialist.rating}</span>
                                  <span className="text-sm text-muted-foreground">({specialist.reviews} reseñas)</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </DialogHeader>

                        <Tabs defaultValue="about" className="w-full">
                          <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="about">Sobre mí</TabsTrigger>
                            <TabsTrigger value="certifications">Certificaciones</TabsTrigger>
                            <TabsTrigger value="schedule">Horario</TabsTrigger>
                          </TabsList>
                          
                          <TabsContent value="about" className="space-y-4">
                            <div className="aspect-video bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg flex items-center justify-center relative overflow-hidden group/video cursor-pointer">
                              <div className="absolute inset-0 bg-black/40 group-hover/video:bg-black/30 transition-colors" />
                              <Play className="relative h-16 w-16 text-white group-hover/video:scale-110 transition-transform" />
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                              <div className="text-center p-4 rounded-lg bg-secondary/50">
                                <Award className="h-5 w-5 mx-auto mb-2 text-primary" />
                                <p className="text-2xl font-bold">{specialist.experience}</p>
                                <p className="text-xs text-muted-foreground">Experiencia</p>
                              </div>
                              <div className="text-center p-4 rounded-lg bg-secondary/50">
                                <Users className="h-5 w-5 mx-auto mb-2 text-accent" />
                                <p className="text-2xl font-bold">{specialist.patients}</p>
                                <p className="text-xs text-muted-foreground">Pacientes</p>
                              </div>
                              <div className="text-center p-4 rounded-lg bg-secondary/50">
                                <MessageCircle className="h-5 w-5 mx-auto mb-2 text-warning" />
                                <p className="text-2xl font-bold">{specialist.reviews}</p>
                                <p className="text-xs text-muted-foreground">Reseñas</p>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <h4 className="font-semibold flex items-center gap-2">
                                <Award className="h-4 w-4 text-primary" />
                                Biografía
                              </h4>
                              <p className="text-sm text-muted-foreground leading-relaxed">
                                {specialist.bio}
                              </p>
                            </div>

                            <div className="space-y-2">
                              <h4 className="font-semibold">Idiomas</h4>
                              <div className="flex gap-2 flex-wrap">
                                {specialist.languages.map((lang) => (
                                  <Badge key={lang} variant="secondary">
                                    {lang}
                                  </Badge>
                                ))}
                              </div>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg border border-primary/20">
                              <div>
                                <p className="text-sm text-muted-foreground">
                                  {isPremium ? "Incluido en tu plan" : "Precio por sesión"}
                                </p>
                                {isPremium ? (
                                  <div className="flex items-center gap-2">
                                    <Crown className="h-5 w-5 text-accent" />
                                    <p className="text-2xl font-bold text-accent">Gratis</p>
                                  </div>
                                ) : (
                                  <p className="text-2xl font-bold text-primary">{specialist.price}</p>
                                )}
                              </div>
                              {!isPremium && (
                                <Badge className="bg-accent">
                                  Primera consulta -20%
                                </Badge>
                              )}
                            </div>
                          </TabsContent>
                          
                          <TabsContent value="certifications" className="space-y-3">
                            {specialist.certifications.map((cert, idx) => (
                              <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50 border border-border/50">
                                <Award className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                                <div>
                                  <p className="font-medium">{cert}</p>
                                  <p className="text-xs text-muted-foreground">Certificación verificada</p>
                                </div>
                              </div>
                            ))}
                          </TabsContent>
                          
                          <TabsContent value="schedule" className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                              Consulta la disponibilidad y agenda tu cita directamente.
                            </p>
                            <div className="aspect-video bg-secondary/50 rounded-lg flex items-center justify-center">
                              <Calendar className="h-12 w-12 text-muted-foreground" />
                            </div>
                          </TabsContent>
                        </Tabs>

                        <div className="flex gap-3 pt-4">
                          <Button 
                            className="flex-1" 
                            disabled={!specialist.available}
                            onClick={() => handleBooking(specialist.id)}
                          >
                            <Calendar className="h-4 w-4 mr-2" />
                            {isPremium ? "Agendar (Incluido)" : "Agendar consulta"}
                          </Button>
                          <Button variant="outline" size="icon">
                            <MessageCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button
                      size="sm"
                      className="flex-1 btn-3d"
                      disabled={!specialist.available}
                      onClick={() => handleBooking(specialist.id)}
                    >
                      <Calendar className="h-4 w-4 mr-1" />
                      {isPremium ? "Incluido" : "Agendar"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredSpecialists.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <p className="text-muted-foreground">No se encontraron especialistas con estos criterios</p>
        </motion.div>
      )}

      {/* Videos Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="overflow-hidden border-border/50">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Video className="h-6 w-6 text-primary" />
                  Contenido Educativo
                </CardTitle>
                <CardDescription className="mt-1">
                  Videos y recursos de nuestros especialistas
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" className="btn-3d">
                Ver todo
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {videos.map((video, i) => (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + i * 0.05 }}
                  whileHover={{ y: -4 }}
                  className="group cursor-pointer"
                >
                  <div className="relative">
                    <div className="aspect-video bg-gradient-to-br from-primary/10 via-accent/10 to-transparent rounded-xl mb-3 relative overflow-hidden flex items-center justify-center border border-border/50 group-hover:border-primary/50 transition-colors">
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                      <Play className="relative h-12 w-12 text-primary group-hover:scale-110 transition-transform drop-shadow-lg" />
                      <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
                        {video.duration}
                      </div>
                      <Badge className="absolute top-2 left-2 bg-primary/90 backdrop-blur-sm">
                        {video.category}
                      </Badge>
                    </div>
                    <h4 className="font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                      {video.title}
                    </h4>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        {video.specialist}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Users className="h-3 w-3" />
                        {video.views}
                      </div>
                    </div>
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
