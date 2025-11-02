import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  interval: string;
  features: string[];
  stripe_price_id?: string;
}

export default function Subscriptions() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchPlans();
  }, []);

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

  const handleSubscribe = async (planId: string) => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Autenticación requerida",
          description: "Debes iniciar sesión para suscribirte",
          variant: "destructive",
        });
        return;
      }

      // Here you would integrate with Stripe
      toast({
        title: "Proximamente",
        description: "La integración con pagos estará disponible pronto",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un error al procesar la suscripción",
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
      </motion.div>

      <div className="grid gap-6 md:grid-cols-3 max-w-6xl mx-auto">
        {plans.map((plan, index) => {
          const Icon = getPlanIcon(plan.name);
          const isPremium = plan.name.toLowerCase().includes('premium');
          
          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`relative h-full ${isPremium ? 'border-primary shadow-glow' : ''}`}>
                {isPremium && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-primary to-accent text-white">
                      Popular
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
                    variant={isPremium ? "default" : "outline"}
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={loading}
                  >
                    Suscribirse
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
