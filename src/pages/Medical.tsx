import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileHeart,
  User,
  Activity,
  AlertTriangle,
  Download,
  QrCode,
  Calendar,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

const medicalData = {
  personal: {
    age: 28,
    weight: 75,
    height: 178,
    bmi: 23.7,
    bloodType: "O+",
  },
  history: [
    { date: "2024-01-15", condition: "Esguince tobillo derecho", status: "Recuperado" },
    { date: "2023-08-22", condition: "Tendinitis rotuliana", status: "En tratamiento" },
  ],
  allergies: ["Polen", "Frutos secos"],
  analytics: [
    { test: "Hemoglobina", value: "15.2 g/dL", range: "13.5-17.5", status: "normal" },
    { test: "Colesterol Total", value: "195 mg/dL", range: "<200", status: "normal" },
    { test: "Glucosa", value: "92 mg/dL", range: "70-100", status: "normal" },
    { test: "Vitamina D", value: "28 ng/mL", range: "30-100", status: "low" },
  ],
};

export default function Medical() {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Ficha Médica Digital</h1>
            <p className="text-muted-foreground">
              Tu historial médico y analíticas en un solo lugar
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <QrCode className="h-4 w-4 mr-2" />
              Generar QR
            </Button>
            <Button>
              <Download className="h-4 w-4 mr-2" />
              Exportar PDF
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Personal Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Datos Personales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Edad</p>
                <p className="text-2xl font-bold">{medicalData.personal.age} años</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Peso</p>
                <p className="text-2xl font-bold">{medicalData.personal.weight} kg</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Altura</p>
                <p className="text-2xl font-bold">{medicalData.personal.height} cm</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">IMC</p>
                <p className="text-2xl font-bold">{medicalData.personal.bmi}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Grupo Sanguíneo</p>
                <p className="text-2xl font-bold">{medicalData.personal.bloodType}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Medical History */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Historial Clínico
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {medicalData.history.map((item, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{item.condition}</p>
                      <p className="text-sm text-muted-foreground">{item.date}</p>
                    </div>
                    <Badge
                      variant={item.status === "Recuperado" ? "default" : "secondary"}
                      className={item.status === "Recuperado" ? "bg-accent" : ""}
                    >
                      {item.status}
                    </Badge>
                  </div>
                  {i < medicalData.history.length - 1 && <Separator />}
                </div>
              ))}

              <div className="pt-4">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-warning" />
                  Alergias
                </h4>
                <div className="flex gap-2 flex-wrap">
                  {medicalData.allergies.map((allergy) => (
                    <Badge key={allergy} variant="destructive">
                      {allergy}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Analytics */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Analíticas Recientes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {medicalData.analytics.map((test, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{test.test}</p>
                        {test.status === "low" && (
                          <AlertTriangle className="h-4 w-4 text-warning" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Rango: {test.range}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">{test.value}</p>
                      <Badge
                        variant={test.status === "normal" ? "default" : "secondary"}
                        className={
                          test.status === "normal"
                            ? "bg-accent"
                            : "bg-warning text-warning-foreground"
                        }
                      >
                        {test.status === "normal" ? "Normal" : "Bajo"}
                      </Badge>
                    </div>
                  </div>
                  {i < medicalData.analytics.length - 1 && <Separator />}
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Alerts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="border-l-4 border-l-warning">
          <CardContent className="p-6">
            <div className="flex gap-4">
              <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold mb-1">Alerta de Salud</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Tus niveles de Vitamina D están por debajo del rango óptimo. Se
                  recomienda:
                </p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Aumentar exposición solar (15-20 min diarios)</li>
                  <li>• Considerar suplementación (consulta con especialista)</li>
                  <li>• Incluir más alimentos ricos en vitamina D</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
