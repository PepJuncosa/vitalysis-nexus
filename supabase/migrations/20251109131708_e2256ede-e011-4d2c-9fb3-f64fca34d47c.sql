-- Tabla para almacenar conexiones de wearables
CREATE TABLE IF NOT EXISTS public.wearable_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  provider TEXT NOT NULL CHECK (provider IN ('fitbit', 'garmin', 'apple_health')),
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  connected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_sync_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, provider)
);

-- Tabla para almacenar datos sincronizados
CREATE TABLE IF NOT EXISTS public.wearable_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  connection_id UUID REFERENCES public.wearable_connections(id) ON DELETE CASCADE,
  data_type TEXT NOT NULL CHECK (data_type IN ('steps', 'heart_rate', 'sleep', 'calories', 'distance', 'active_minutes')),
  value NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL,
  source TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_wearable_connections_user_id ON public.wearable_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_wearable_connections_provider ON public.wearable_connections(provider);
CREATE INDEX IF NOT EXISTS idx_wearable_data_user_id ON public.wearable_data(user_id);
CREATE INDEX IF NOT EXISTS idx_wearable_data_type ON public.wearable_data(data_type);
CREATE INDEX IF NOT EXISTS idx_wearable_data_recorded_at ON public.wearable_data(recorded_at);

-- Habilitar RLS
ALTER TABLE public.wearable_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wearable_data ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para wearable_connections
CREATE POLICY "Users can view their own wearable connections"
  ON public.wearable_connections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own wearable connections"
  ON public.wearable_connections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own wearable connections"
  ON public.wearable_connections FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own wearable connections"
  ON public.wearable_connections FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas RLS para wearable_data
CREATE POLICY "Users can view their own wearable data"
  ON public.wearable_data FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own wearable data"
  ON public.wearable_data FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Trigger para actualizar updated_at
CREATE TRIGGER update_wearable_connections_updated_at
  BEFORE UPDATE ON public.wearable_connections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();