-- Create subscription plans table
CREATE TABLE public.subscription_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  interval TEXT NOT NULL CHECK (interval IN ('month', 'year')),
  features JSONB NOT NULL DEFAULT '[]',
  stripe_price_id TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user subscriptions table
CREATE TABLE public.user_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.subscription_plans(id),
  stripe_subscription_id TEXT,
  status TEXT NOT NULL CHECK (status IN ('active', 'inactive', 'cancelled', 'past_due')),
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, plan_id)
);

-- Create products table for marketplace
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  rating DECIMAL(2,1) DEFAULT 0,
  stock INTEGER DEFAULT 0,
  features JSONB DEFAULT '[]',
  is_premium BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscription_plans (public read)
CREATE POLICY "Anyone can view active subscription plans"
  ON public.subscription_plans FOR SELECT
  USING (is_active = true);

-- RLS Policies for user_subscriptions
CREATE POLICY "Users can view their own subscriptions"
  ON public.user_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscriptions"
  ON public.user_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions"
  ON public.user_subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for products
CREATE POLICY "Anyone can view products"
  ON public.products FOR SELECT
  USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_subscription_plans_updated_at
  BEFORE UPDATE ON public.subscription_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON public.user_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample subscription plans
INSERT INTO public.subscription_plans (name, description, price, interval, features) VALUES
('Básico', 'Acceso a funcionalidades básicas', 9.99, 'month', '["Mapa corporal 3D", "Historial de lesiones", "Análisis básico"]'),
('Premium', 'Todas las funcionalidades + contenido exclusivo', 19.99, 'month', '["Todo en Básico", "Análisis avanzado de rendimiento", "Recomendaciones personalizadas IA", "Marketplace premium", "Soporte prioritario"]'),
('Anual Premium', 'Plan Premium con descuento anual', 199.99, 'year', '["Todo en Premium", "2 meses gratis", "Acceso anticipado a nuevas funciones"]');

-- Insert sample products
INSERT INTO public.products (name, description, category, price, image_url, rating, stock, features, is_premium) VALUES
('Proteína Whey Premium', 'Proteína de suero de alta calidad con 25g de proteína por porción. Ideal para recuperación muscular post-entrenamiento.', 'Suplemento', 49.99, '💪', 4.8, 150, '["25g proteína por porción", "Sabor chocolate", "Sin azúcares añadidos", "Fácil digestión"]', false),
('Banda Elástica Pro', 'Set de 5 bandas elásticas de resistencia variable. Perfectas para ejercicios de movilidad y fortalecimiento.', 'Equipamiento', 29.99, '🏋️', 4.5, 200, '["5 niveles de resistencia", "Material látex premium", "Incluye bolsa de transporte", "Guía de ejercicios"]', false),
('Monitor Cardíaco Elite', 'Monitor de frecuencia cardíaca con GPS integrado y análisis avanzado de métricas deportivas.', 'Tecnología', 199.99, '⌚', 4.9, 50, '["GPS integrado", "Resistente al agua", "Batería 7 días", "Análisis VO2 Max", "Conexión Bluetooth"]', true),
('Esterilla Yoga Pro', 'Esterilla antideslizante de 6mm, ideal para yoga, pilates y estiramientos.', 'Equipamiento', 39.99, '🧘', 4.7, 100, '["6mm grosor", "Antideslizante", "Eco-friendly", "Incluye correa"]', false),
('Creatina Monohidrato', 'Creatina pura micronizada para mejorar fuerza y potencia muscular.', 'Suplemento', 24.99, '⚡', 4.6, 180, '["100% pura", "Micronizada", "Sin sabor", "300g"]', false),
('Rodillo de Espuma', 'Rodillo de espuma para masaje muscular y recuperación post-ejercicio.', 'Recuperación', 34.99, '🎯', 4.8, 120, '["Textura 3D", "Alta densidad", "45cm longitud", "Incluye guía"]', true)