import { Activity, Calendar, Percent, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Injury {
  id: string;
  partId: string;
  partName: string;
  type: string;
  date: string;
  recovery: number;
  description: string;
}

interface InjuryHistoryProps {
  injuries: Injury[];
  onDelete: (id: string) => void;
}

function getRecoveryColor(recovery: number): string {
  if (recovery < 30) return "text-red-500";
  if (recovery < 70) return "text-orange-500";
  if (recovery < 100) return "text-green-500";
  return "text-cyan-500";
}

function getRecoveryBgColor(recovery: number): string {
  if (recovery < 30) return "bg-red-500/20 border-red-500/50";
  if (recovery < 70) return "bg-orange-500/20 border-orange-500/50";
  if (recovery < 100) return "bg-green-500/20 border-green-500/50";
  return "bg-cyan-500/20 border-cyan-500/50";
}

export default function InjuryHistory({ injuries, onDelete }: InjuryHistoryProps) {
  if (injuries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-6">
        <Activity className="w-16 h-16 text-muted-foreground/30 mb-4" />
        <p className="text-muted-foreground">No hay lesiones registradas</p>
        <p className="text-sm text-muted-foreground/70 mt-2">
          Haz clic en una parte del cuerpo para registrar una lesión
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full pr-4">
      <div className="space-y-3">
        {injuries.map((injury) => (
          <div
            key={injury.id}
            className={`p-4 rounded-lg border-2 ${getRecoveryBgColor(injury.recovery)} 
            transition-all duration-300 hover:shadow-glow hover:scale-[1.02]`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h4 className="font-bold text-foreground">{injury.partName}</h4>
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                  <Activity className="w-3 h-3" />
                  {injury.type}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(injury.id)}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(injury.date).toLocaleDateString('es-ES')}
              </span>
            </div>

            <div className="mt-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Percent className="w-3 h-3" />
                  Recuperación
                </span>
                <span className={`text-sm font-bold ${getRecoveryColor(injury.recovery)}`}>
                  {injury.recovery}%
                </span>
              </div>
              <div className="w-full bg-background/50 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    injury.recovery < 30 ? 'bg-red-500' :
                    injury.recovery < 70 ? 'bg-orange-500' :
                    injury.recovery < 100 ? 'bg-green-500' : 'bg-cyan-500'
                  }`}
                  style={{ width: `${injury.recovery}%` }}
                />
              </div>
            </div>

            {injury.description && (
              <p className="text-xs text-muted-foreground mt-3 italic">
                {injury.description}
              </p>
            )}
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
