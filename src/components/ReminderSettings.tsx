import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Bell, Droplet, Dumbbell, Moon, Loader2 } from 'lucide-react';

interface ReminderSetting {
  id: string;
  reminder_type: 'workout' | 'hydration' | 'rest';
  enabled: boolean;
  frequency_hours: number;
  preferred_time: string | null;
}

const reminderConfig = {
  workout: {
    icon: Dumbbell,
    title: 'Recordatorios de Entrenamiento',
    description: 'Recibe recordatorios personalizados para mantener tu rutina de ejercicios',
    color: 'text-primary'
  },
  hydration: {
    icon: Droplet,
    title: 'Recordatorios de Hidratación',
    description: 'No olvides mantenerte hidratado durante el día',
    color: 'text-blue-500'
  },
  rest: {
    icon: Moon,
    title: 'Recordatorios de Descanso',
    description: 'Recordatorios sobre la importancia del descanso y recuperación',
    color: 'text-purple-500'
  }
};

export const ReminderSettings = () => {
  const [settings, setSettings] = useState<ReminderSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_reminder_settings')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      if (!data || data.length === 0) {
        // Create default settings
        const defaultSettings = [
          { user_id: user.id, reminder_type: 'workout', enabled: true, frequency_hours: 24 },
          { user_id: user.id, reminder_type: 'hydration', enabled: true, frequency_hours: 4 },
          { user_id: user.id, reminder_type: 'rest', enabled: true, frequency_hours: 168 }
        ];

        const { data: newData, error: insertError } = await supabase
          .from('user_reminder_settings')
          .insert(defaultSettings)
          .select();

        if (insertError) throw insertError;
        setSettings(newData || []);
      } else {
        setSettings(data);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las configuraciones",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (id: string, updates: Partial<ReminderSetting>) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('user_reminder_settings')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      setSettings(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
      
      toast({
        title: "Guardado",
        description: "Configuración actualizada correctamente"
      });
    } catch (error) {
      console.error('Error updating setting:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la configuración",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Bell className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Recordatorios Inteligentes</h3>
      </div>
      
      <p className="text-sm text-muted-foreground mb-6">
        FitCoach AI generará recordatorios personalizados basados en tu historial y actividad
      </p>

      <div className="space-y-6">
        {settings.map((setting) => {
          const config = reminderConfig[setting.reminder_type];
          const Icon = config.icon;

          return (
            <div key={setting.id} className="border rounded-lg p-4 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <Icon className={`h-5 w-5 mt-0.5 ${config.color}`} />
                  <div>
                    <h4 className="font-medium">{config.title}</h4>
                    <p className="text-sm text-muted-foreground">{config.description}</p>
                  </div>
                </div>
                <Switch
                  checked={setting.enabled}
                  onCheckedChange={(enabled) => updateSetting(setting.id, { enabled })}
                  disabled={saving}
                />
              </div>

              {setting.enabled && (
                <div className="pl-8 space-y-3">
                  <div>
                    <Label htmlFor={`frequency-${setting.id}`} className="text-sm">
                      Frecuencia (cada cuántas horas)
                    </Label>
                    <Input
                      id={`frequency-${setting.id}`}
                      type="number"
                      min="1"
                      value={setting.frequency_hours}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        if (value > 0) {
                          updateSetting(setting.id, { frequency_hours: value });
                        }
                      }}
                      className="mt-1 w-32"
                      disabled={saving}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
};
