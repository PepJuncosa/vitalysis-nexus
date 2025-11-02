import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.409ced781be4490e8ea5bef8e983c4f5',
  appName: 'vitalysis-nexus',
  webDir: 'dist',
  server: {
    url: 'https://409ced78-1be4-490e-8ea5-bef8e983c4f5.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    BluetoothLe: {
      displayStrings: {
        scanning: "Buscando dispositivos...",
        cancel: "Cancelar",
        availableDevices: "Dispositivos disponibles",
        noDeviceFound: "No se encontraron dispositivos"
      }
    }
  }
};

export default config;
