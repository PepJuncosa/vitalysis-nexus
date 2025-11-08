import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Trophy, Star, Zap, Target } from 'lucide-react';
import { motion } from 'framer-motion';

interface UserRewards {
  total_points: number;
  level: number;
}

export const RewardsPanel = () => {
  const { user } = useAuth();
  const [rewards, setRewards] = useState<UserRewards | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchRewards();
    }
  }, [user]);

  const fetchRewards = async () => {
    try {
      const { data, error } = await supabase
        .from('user_rewards')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setRewards(data);
      }
    } catch (error) {
      console.error('Error fetching rewards:', error);
    } finally {
      setLoading(false);
    }
  };

  const getNextLevelPoints = (level: number) => {
    if (level >= 10) return 10000;
    if (level >= 5) return 10000;
    if (level >= 3) return 5000;
    return 1000;
  };

  const getLevelProgress = () => {
    if (!rewards) return 0;
    const currentPoints = rewards.total_points;
    const nextLevelPoints = getNextLevelPoints(rewards.level);
    return (currentPoints / nextLevelPoints) * 100;
  };

  if (loading || !rewards) return null;

  return (
    <Card className="p-6 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Trophy className="h-6 w-6 text-primary" />
              Nivel {rewards.level}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {rewards.total_points.toLocaleString()} puntos totales
            </p>
          </div>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Star className="h-12 w-12 text-primary" />
          </motion.div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progreso al siguiente nivel</span>
            <span className="font-semibold text-foreground">
              {Math.min(getLevelProgress(), 100).toFixed(0)}%
            </span>
          </div>
          <Progress value={getLevelProgress()} className="h-3" />
        </div>

        {/* Earn Points Info */}
        <div className="grid grid-cols-2 gap-3">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-background/50 rounded-lg p-4 border border-border"
          >
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium text-muted-foreground">Entrenamientos</span>
            </div>
            <p className="text-2xl font-bold text-foreground">+50</p>
            <p className="text-xs text-muted-foreground">puntos</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-background/50 rounded-lg p-4 border border-border"
          >
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-accent" />
              <span className="text-xs font-medium text-muted-foreground">Objetivos</span>
            </div>
            <p className="text-2xl font-bold text-foreground">+100</p>
            <p className="text-xs text-muted-foreground">puntos</p>
          </motion.div>
        </div>

        {/* Tips */}
        <div className="bg-primary/10 rounded-lg p-4 border border-primary/20">
          <p className="text-sm text-foreground font-medium mb-2">💡 Gana más puntos:</p>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Completa entrenamientos (+50 pts)</li>
            <li>• Alcanza tus metas nutricionales (+30 pts)</li>
            <li>• Consume contenido educativo (+20 pts)</li>
            <li>• Logra objetivos (+100 pts)</li>
          </ul>
        </div>
      </div>
    </Card>
  );
};