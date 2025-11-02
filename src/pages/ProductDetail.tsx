import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, ShoppingCart, Crown, ArrowLeft, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, useParams } from "react-router-dom";

interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  image_url: string;
  rating: number;
  stock: number;
  features: string[];
  is_premium: boolean;
}

export default function ProductDetail() {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      fetchProduct(id);
    }
  }, [id]);

  const fetchProduct = async (productId: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    if (error) {
      toast({
        title: "Error",
        description: "No se pudo cargar el producto",
        variant: "destructive",
      });
      navigate('/marketplace');
      return;
    }

    setProduct(data as Product);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        onClick={() => navigate('/marketplace')}
        className="gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver al Marketplace
      </Button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid gap-8 lg:grid-cols-2"
      >
        {/* Product Image Section */}
        <Card>
          <CardContent className="p-8">
            <div className="relative">
              <div className="text-9xl text-center mb-6">
                {product.image_url}
              </div>
              {product.is_premium && (
                <Badge className="absolute top-0 right-0 bg-gradient-to-r from-primary to-accent">
                  <Crown className="h-4 w-4 mr-1" />
                  Premium
                </Badge>
              )}
            </div>
            <div className="flex items-center justify-center gap-4 pt-4 border-t">
              <div className="flex items-center gap-1">
                <Star className="h-5 w-5 fill-warning text-warning" />
                <span className="text-lg font-semibold">{product.rating}</span>
              </div>
              <Badge variant="secondary">
                {product.stock} en stock
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Product Info Section */}
        <div className="space-y-6">
          <div>
            <Badge variant="secondary" className="mb-3">
              {product.category}
            </Badge>
            <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {product.description}
            </p>
          </div>

          <Card>
            <CardContent className="p-6 space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-3">Características:</h3>
                <ul className="space-y-2">
                  {(product.features as string[]).map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary shadow-glow">
            <CardContent className="p-6">
              <div className="flex items-end justify-between mb-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Precio</p>
                  <span className="text-4xl font-bold">€{product.price}</span>
                </div>
                <Badge variant="secondary" className="text-lg">
                  Envío Gratis
                </Badge>
              </div>
              <Button size="lg" className="w-full gap-2">
                <ShoppingCart className="h-5 w-5" />
                Añadir al Carrito
              </Button>
              <p className="text-xs text-muted-foreground text-center mt-3">
                Entrega estimada: 2-3 días laborables
              </p>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}
