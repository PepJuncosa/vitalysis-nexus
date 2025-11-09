import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Watch, 
  Activity, 
  Heart, 
  Moon, 
  Zap,
  RefreshCw,
  Unlink,
  TrendingUp
} from 'lucide-react';

interface WearableConnection {
  id: string;
  provider: string;
  connected_at: string;
  last_sync_at: string | null;
  is_active: boolean;
}

interface WearableStats {
  steps: number;
  heart_rate: number;
  sleep: number;
  calories: number;
}

const providers = [
  {
    id: 'fitbit',
    name: 'Fitbit',
    icon: Watch,
    color: 'text-blue-500',
    description: 'Sincroniza pasos, frecuencia cardíaca y sueño',
  },
  {
    id: 'garmin',
    name: 'Garmin',
    icon: Activity,
    color: 'text-cyan-500',
    description: 'Datos de actividades y rendimiento deportivo',
  },
  {
    id: 'apple_health',
    name: 'Apple Health',
    icon: Heart,
    color: 'text-red-500',
    description: 'Integración con datos de salud de iPhone',
  },
];

export default function Wearables() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [connections, setConnections] = useState<WearableConnection[]>([]);
  const [stats, setStats] = useState<WearableStats>({
    steps: 0,
    heart_rate: 0,
    sleep: 0,
    calories: 0,
  });
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadConnections();
      loadStats();
    }
  }, [user]);

  const loadConnections = async () => {
    try {
      const { data, error } = await supabase
        .from('wearable_connections')
        .select('*')
        .eq('user_id', user?.id)
        .eq('is_active', true);

      if (error) throw error;
      setConnections(data || []);
    } catch (error) {
      console.error('Error loading connections:', error);
    }
  };

  const loadStats = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from('wearable_data')
        .select('data_type, value')
        .eq('user_id', user?.id)
        .gte('recorded_at', today.toISOString());

      if (error) throw error;

      const statsData: WearableStats = {
        steps: 0,
        heart_rate: 0,
        sleep: 0,
        calories: 0,
      };

      data?.forEach((item) => {
        if (item.data_type in statsData) {
          statsData[item.data_type as keyof WearableStats] = Number(item.value);
        }
      });

      setStats(statsData);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const connectDevice = async (providerId: string) => {
    setLoading(true);
    try {
      // In production, this would redirect to OAuth flow
      toast({
        title: 'Conectando dispositivo',
        description: `Iniciando conexión con ${providerId}...`,
      });

      // Mock connection for demo
      const { error } = await supabase
        .from('wearable_connections')
        .insert({
          user_id: user?.id,
          provider: providerId,
          is_active: true,
        });

      if (error) throw error;

      await loadConnections();
      
      toast({
        title: '¡Conectado!',
        description: `${providerId} conectado exitosamente`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo conectar el dispositivo',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const syncData = async (connectionId: string) => {
    setSyncing(connectionId);
    try {
      const { data, error } = await supabase.functions.invoke('sync-wearable-data', {
        body: { connectionId },
      });

      if (error) throw error;

      await loadStats();
      await loadConnections();

      toast({
        title: 'Sincronización completa',
        description: data.message || 'Datos actualizados',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo sincronizar los datos',
        variant: 'destructive',
      });
    } finally {
      setSyncing(null);
    }
  };

  const disconnectDevice = async (connectionId: string) => {
    try {
      const { error } = await supabase
        .from('wearable_connections')
        .update({ is_active: false })
        .eq('id', connectionId);

      if (error) throw error;

      await loadConnections();
      
      toast({
        title: 'Dispositivo desconectado',
        description: 'Se ha desconectado el dispositivo exitosamente',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo desconectar el dispositivo',
        variant: 'destructive',
      });
    }
  };

  const isConnected = (providerId: string) => {
    return connections.some((c) => c.provider === providerId);
  };

  const getConnection = (providerId: string) => {
    return connections.find((c) => c.provider === providerId);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold mb-2">Dispositivos Wearables</h1>
        <p className="text-muted-foreground">
          Conecta tus dispositivos para sincronizar automáticamente tus datos de salud
        </p>
      </motion.div>

      {/* Stats Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-full">
              <Activity className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pasos Hoy</p>
              <p className="text-2xl font-bold">{stats.steps.toLocaleString()}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-500/10 rounded-full">
              <Heart className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Frecuencia Cardíaca</p>
              <p className="text-2xl font-bold">{stats.heart_rate} bpm</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-500/10 rounded-full">
              <Moon className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Sueño</p>
              <p className="text-2xl font-bold">{stats.sleep.toFixed(1)}h</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-500/10 rounded-full">
              <Zap className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Calorías</p>
              <p className="text-2xl font-bold">{stats.calories.toLocaleString()}</p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Available Devices */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-2xl font-bold mb-4">Dispositivos Disponibles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {providers.map((provider) => {
            const connected = isConnected(provider.id);
            const connection = getConnection(provider.id);
            const Icon = provider.icon;

            return (
              <Card key={provider.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 bg-background rounded-full ${provider.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{provider.name}</h3>
                      {connected && (
                        <Badge variant="outline" className="mt-1">
                          Conectado
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-4">
                  {provider.description}
                </p>

                {connected && connection ? (
                  <div className="space-y-2">
                    {connection.last_sync_at && (
                      <p className="text-xs text-muted-foreground">
                        Última sincronización:{' '}
                        {new Date(connection.last_sync_at).toLocaleString()}
                      </p>
                    )}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => syncData(connection.id)}
                        disabled={syncing === connection.id}
                        className="flex-1"
                      >
                        <RefreshCw className={`w-4 h-4 mr-2 ${syncing === connection.id ? 'animate-spin' : ''}`} />
                        Sincronizar
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => disconnectDevice(connection.id)}
                      >
                        <Unlink className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    className="w-full"
                    onClick={() => connectDevice(provider.id)}
                    disabled={loading}
                  >
                    Conectar
                  </Button>
                )}
              </Card>
            );
          })}
        </div>
      </motion.div>

      {/* Insights */}
      {connections.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-bold">Perspectivas</h2>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm">
                  Tus dispositivos están sincronizando datos automáticamente. Revisa tu
                  dashboard para ver tendencias y recomendaciones personalizadas.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
