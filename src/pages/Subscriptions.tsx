import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Sparkles, Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useSearchParams } from "react-router-dom";

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  interval: string;
  features: string[];
  stripe_price_id?: string;
  stripe_product_id?: string;
}

const SUBSCRIPTION_TIERS = {
  premium: {
    price_id: "price_1SPS6lADGPosc1JvBgK1Y9Gq",
    product_id: "prod_TMARhd5DIPYBVy",
  },
  basic: {
    price_id: "price_1SPS6wADGPosc1JvYWtxoEjD",
    product_id: "prod_TMARAnlKCgjQwt",
  },
};

export default function Subscriptions() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user, subscriptionStatus, isPremium, checkSubscription } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    fetchPlans();
    
    // Check for success/cancel params
    if (searchParams.get('success')) {
      toast({
        title: "¡Suscripción exitosa!",
        description: "Tu suscripción se ha activado correctamente",
      });
      checkSubscription();
    } else if (searchParams.get('canceled')) {
      toast({
        title: "Suscripción cancelada",
        description: "Has cancelado el proceso de suscripción",
        variant: "destructive",
      });
    }
  }, [searchParams]);

  const fetchPlans = async () => {
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true)
      .order('price', { ascending: true });

    if (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los planes",
        variant: "destructive",
      });
      return;
    }

    setPlans((data || []) as SubscriptionPlan[]);
  };

  const handleSubscribe = async (priceId: string) => {
    if (!user) {
      navigate('/auth');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId },
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Ocurrió un error al procesar la suscripción",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo abrir el portal de gestión",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getPlanIcon = (planName: string) => {
    if (planName.toLowerCase().includes('premium')) return Crown;
    if (planName.toLowerCase().includes('anual')) return Sparkles;
    return Check;
  };

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Elige tu Plan
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Desbloquea todo el potencial de tu entrenamiento con funciones premium
        </p>
        
        {subscriptionStatus.subscribed && (
          <div className="flex items-center justify-center gap-3">
            <Badge className="bg-accent">
              Plan Activo: {isPremium ? "Premium" : "Básico"}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={handleManageSubscription}
              disabled={loading}
            >
              <Settings className="h-4 w-4 mr-2" />
              Gestionar Suscripción
            </Button>
          </div>
        )}
      </motion.div>

      <div className="grid gap-6 md:grid-cols-2 max-w-5xl mx-auto">
        {plans.map((plan, index) => {
          const Icon = getPlanIcon(plan.name);
          const isPlanPremium = plan.name.toLowerCase().includes('premium');
          const isCurrentPlan = subscriptionStatus.subscribed && 
            subscriptionStatus.product_id === (isPlanPremium ? SUBSCRIPTION_TIERS.premium.product_id : SUBSCRIPTION_TIERS.basic.product_id);
          
          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`relative h-full ${isPlanPremium ? 'border-primary shadow-glow' : ''} ${isCurrentPlan ? 'ring-2 ring-accent' : ''}`}>
                {isPlanPremium && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-primary to-accent text-white">
                      Popular
                    </Badge>
                  </div>
                )}
                
                {isCurrentPlan && (
                  <div className="absolute -top-3 right-4">
                    <Badge className="bg-accent">
                      Tu Plan Actual
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">€{plan.price}</span>
                    <span className="text-muted-foreground">/{plan.interval === 'month' ? 'mes' : 'año'}</span>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {(plan.features as string[]).map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button
                    className="w-full"
                    variant={isPlanPremium ? "default" : "outline"}
                    onClick={() => handleSubscribe(isPlanPremium ? SUBSCRIPTION_TIERS.premium.price_id : SUBSCRIPTION_TIERS.basic.price_id)}
                    disabled={loading || isCurrentPlan}
                  >
                    {isCurrentPlan ? "Plan Actual" : "Suscribirse"}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="max-w-3xl mx-auto"
      >
        <Card>
          <CardHeader>
            <CardTitle>Preguntas Frecuentes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">¿Puedo cancelar en cualquier momento?</h3>
              <p className="text-sm text-muted-foreground">
                Sí, puedes cancelar tu suscripción en cualquier momento sin compromiso.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">¿Qué métodos de pago aceptan?</h3>
              <p className="text-sm text-muted-foreground">
                Aceptamos todas las tarjetas de crédito principales a través de Stripe.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">¿Hay garantía de devolución?</h3>
              <p className="text-sm text-muted-foreground">
                Ofrecemos una garantía de devolución de 30 días si no estás satisfecho.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
