import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Bluetooth, 
  BluetoothConnected, 
  Search, 
  Heart, 
  Activity,
  Scale,
  Watch,
  Power,
  Signal
} from "lucide-react";
import { BleClient, BleDevice } from '@capacitor-community/bluetooth-le';

interface ConnectedDevice {
  device: BleDevice;
  type: 'heart_rate' | 'scale' | 'fitness_tracker' | 'unknown';
  data?: any;
}

export default function BluetoothDevices() {
  const [isScanning, setIsScanning] = useState(false);
  const [devices, setDevices] = useState<BleDevice[]>([]);
  const [connectedDevices, setConnectedDevices] = useState<ConnectedDevice[]>([]);
  const [isBluetoothEnabled, setIsBluetoothEnabled] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    initializeBluetooth();
    return () => {
      // Cleanup: disconnect all devices
      connectedDevices.forEach(({ device }) => {
        BleClient.disconnect(device.deviceId).catch(console.error);
      });
    };
  }, []);

  const initializeBluetooth = async () => {
    try {
      await BleClient.initialize();
      const enabled = await BleClient.isEnabled();
      setIsBluetoothEnabled(enabled);
      
      if (!enabled) {
        toast({
          title: "Bluetooth desactivado",
          description: "Por favor, activa el Bluetooth en tu dispositivo",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error initializing Bluetooth:', error);
      toast({
        title: "Error",
        description: "No se pudo inicializar Bluetooth",
        variant: "destructive",
      });
    }
  };

  const scanForDevices = async () => {
    try {
      setIsScanning(true);
      setDevices([]);

      await BleClient.requestLEScan(
        {
          // Filtros opcionales para servicios específicos
          // services: ['0000180d-0000-1000-8000-00805f9b34fb'] // Heart Rate
        },
        (result) => {
          setDevices((prev) => {
            // Evitar duplicados
            if (prev.find(d => d.deviceId === result.device.deviceId)) {
              return prev;
            }
            return [...prev, result.device];
          });
        }
      );

      // Detener escaneo después de 10 segundos
      setTimeout(async () => {
        await BleClient.stopLEScan();
        setIsScanning(false);
        
        toast({
          title: "Escaneo completado",
          description: `Se encontraron ${devices.length} dispositivos`,
        });
      }, 10000);
    } catch (error) {
      console.error('Error scanning:', error);
      setIsScanning(false);
      toast({
        title: "Error",
        description: "No se pudieron buscar dispositivos",
        variant: "destructive",
      });
    }
  };

  const connectToDevice = async (device: BleDevice) => {
    try {
      await BleClient.connect(device.deviceId, (deviceId) => {
        console.log(`Device ${deviceId} disconnected`);
        setConnectedDevices(prev => 
          prev.filter(d => d.device.deviceId !== deviceId)
        );
        toast({
          title: "Dispositivo desconectado",
          description: device.name || device.deviceId,
        });
      });

      // Determinar tipo de dispositivo basado en servicios
      const deviceType = detectDeviceType(device);

      const connectedDevice: ConnectedDevice = {
        device,
        type: deviceType,
      };

      setConnectedDevices(prev => [...prev, connectedDevice]);

      // Iniciar lectura de datos según el tipo de dispositivo
      startDataCollection(connectedDevice);

      toast({
        title: "Dispositivo conectado",
        description: device.name || device.deviceId,
      });

      // Remover de la lista de dispositivos disponibles
      setDevices(prev => prev.filter(d => d.deviceId !== device.deviceId));
    } catch (error) {
      console.error('Error connecting:', error);
      toast({
        title: "Error de conexión",
        description: "No se pudo conectar al dispositivo",
        variant: "destructive",
      });
    }
  };

  const disconnectDevice = async (deviceId: string) => {
    try {
      await BleClient.disconnect(deviceId);
      setConnectedDevices(prev => 
        prev.filter(d => d.device.deviceId !== deviceId)
      );
      toast({
        title: "Dispositivo desconectado",
        description: "El dispositivo ha sido desconectado exitosamente",
      });
    } catch (error) {
      console.error('Error disconnecting:', error);
      toast({
        title: "Error",
        description: "No se pudo desconectar el dispositivo",
        variant: "destructive",
      });
    }
  };

  const detectDeviceType = (device: BleDevice): ConnectedDevice['type'] => {
    const name = device.name?.toLowerCase() || '';
    
    if (name.includes('heart') || name.includes('hr') || name.includes('polar')) {
      return 'heart_rate';
    } else if (name.includes('scale') || name.includes('weight')) {
      return 'scale';
    } else if (name.includes('band') || name.includes('fit') || name.includes('watch')) {
      return 'fitness_tracker';
    }
    
    return 'unknown';
  };

  const startDataCollection = async (connectedDevice: ConnectedDevice) => {
    const { device, type } = connectedDevice;
    
    try {
      // UUIDs estándar de Bluetooth
      const HEART_RATE_SERVICE = '0000180d-0000-1000-8000-00805f9b34fb';
      const HEART_RATE_MEASUREMENT = '00002a37-0000-1000-8000-00805f9b34fb';
      
      if (type === 'heart_rate') {
        await BleClient.startNotifications(
          device.deviceId,
          HEART_RATE_SERVICE,
          HEART_RATE_MEASUREMENT,
          (value) => {
            // Parse heart rate data (primer byte después de flags)
            const heartRate = new DataView(value.buffer).getUint8(1);
            
            setConnectedDevices(prev => 
              prev.map(d => 
                d.device.deviceId === device.deviceId 
                  ? { ...d, data: { heartRate } }
                  : d
              )
            );
          }
        );
      }
      // Aquí se pueden añadir más tipos de dispositivos
    } catch (error) {
      console.error('Error starting data collection:', error);
    }
  };

  const getDeviceIcon = (type: ConnectedDevice['type']) => {
    switch (type) {
      case 'heart_rate': return Heart;
      case 'scale': return Scale;
      case 'fitness_tracker': return Watch;
      default: return Bluetooth;
    }
  };

  const getDeviceTypeLabel = (type: ConnectedDevice['type']) => {
    switch (type) {
      case 'heart_rate': return 'Monitor Cardíaco';
      case 'scale': return 'Báscula';
      case 'fitness_tracker': return 'Pulsera Fitness';
      default: return 'Dispositivo';
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold mb-2">Dispositivos Bluetooth</h1>
        <p className="text-muted-foreground">
          Conecta tus dispositivos de salud y fitness
        </p>
      </motion.div>

      {/* Status Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isBluetoothEnabled ? (
                  <BluetoothConnected className="h-8 w-8 text-primary" />
                ) : (
                  <Bluetooth className="h-8 w-8 text-muted-foreground" />
                )}
                <div>
                  <p className="font-semibold">
                    Bluetooth {isBluetoothEnabled ? 'Activado' : 'Desactivado'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {connectedDevices.length} dispositivo(s) conectado(s)
                  </p>
                </div>
              </div>
              <Button
                onClick={scanForDevices}
                disabled={!isBluetoothEnabled || isScanning}
                className="gap-2"
              >
                <Search className="h-4 w-4" />
                {isScanning ? 'Buscando...' : 'Buscar Dispositivos'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Connected Devices */}
      {connectedDevices.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-xl font-semibold mb-4">Dispositivos Conectados</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {connectedDevices.map(({ device, type, data }) => {
              const Icon = getDeviceIcon(type);
              return (
                <Card key={device.deviceId}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-primary/10">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">
                            {device.name || 'Dispositivo sin nombre'}
                          </CardTitle>
                          <CardDescription>
                            {getDeviceTypeLabel(type)}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge variant="secondary" className="gap-1">
                        <Signal className="h-3 w-3" />
                        Conectado
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {data && type === 'heart_rate' && data.heartRate && (
                      <div className="flex items-center gap-2 p-3 bg-accent/10 rounded-lg">
                        <Activity className="h-5 w-5 text-accent" />
                        <div>
                          <p className="text-sm text-muted-foreground">Frecuencia Cardíaca</p>
                          <p className="text-2xl font-bold">{data.heartRate} BPM</p>
                        </div>
                      </div>
                    )}
                    <Button
                      variant="outline"
                      className="w-full gap-2"
                      onClick={() => disconnectDevice(device.deviceId)}
                    >
                      <Power className="h-4 w-4" />
                      Desconectar
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Available Devices */}
      {devices.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-xl font-semibold mb-4">Dispositivos Disponibles</h2>
          <div className="grid gap-4">
            {devices.map((device) => (
              <Card key={device.deviceId} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Bluetooth className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-semibold">
                          {device.name || 'Dispositivo sin nombre'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {device.deviceId}
                        </p>
                      </div>
                    </div>
                    <Button onClick={() => connectToDevice(device)}>
                      Conectar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>
      )}

      {/* Empty State */}
      {!isScanning && devices.length === 0 && connectedDevices.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Bluetooth className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No hay dispositivos</h3>
          <p className="text-muted-foreground mb-6">
            Presiona "Buscar Dispositivos" para encontrar dispositivos Bluetooth cercanos
          </p>
        </motion.div>
      )}
    </div>
  );
}
