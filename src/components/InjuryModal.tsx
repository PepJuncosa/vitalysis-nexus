import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";

interface InjuryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (injury: {
    partId: string;
    type: string;
    date: string;
    recovery: number;
    description: string;
  }) => void;
  selectedPart: string | null;
  partName: string;
}

export default function InjuryModal({ isOpen, onClose, onSave, selectedPart, partName }: InjuryModalProps) {
  const [injuryType, setInjuryType] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [recovery, setRecovery] = useState([50]);
  const [description, setDescription] = useState("");

  const handleSave = () => {
    if (!selectedPart || !injuryType) return;
    
    onSave({
      partId: selectedPart,
      type: injuryType,
      date,
      recovery: recovery[0],
      description
    });

    // Reset form
    setInjuryType("");
    setDate(new Date().toISOString().split('T')[0]);
    setRecovery([50]);
    setDescription("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-primary">
            Registrar Lesión - {partName}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="injury-type">Tipo de Lesión</Label>
            <Input
              id="injury-type"
              placeholder="Ej: Desgarro, Contractura, Fractura..."
              value={injuryType}
              onChange={(e) => setInjuryType(e.target.value)}
              className="border-primary/20 focus:border-primary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="injury-date">Fecha</Label>
            <Input
              id="injury-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border-primary/20 focus:border-primary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="recovery">
              Recuperación: {recovery[0]}%
            </Label>
            <Slider
              id="recovery"
              min={0}
              max={100}
              step={5}
              value={recovery}
              onValueChange={setRecovery}
              className="py-4"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción (opcional)</Label>
            <Textarea
              id="description"
              placeholder="Detalles adicionales sobre la lesión..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="border-primary/20 focus:border-primary min-h-[80px]"
            />
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSave}
            disabled={!injuryType}
            className="btn-3d"
          >
            Guardar Lesión
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
