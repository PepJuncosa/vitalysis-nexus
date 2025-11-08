import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Star, TrendingUp, Award } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

interface UserRewards {
  total_points: number;
  level: number;
}

export const PointsTracker = () => {
  const { user } = useAuth();
  const [rewards, setRewards] = useState<UserRewards | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadRewards();
    }
  }, [user]);

  const loadRewards = async () => {
    const { data } = await supabase
      .from('user_rewards')
      .select('*')
      .eq('user_id', user?.id)
      .maybeSingle();

    setRewards(data);
  };

  const awardPoints = async (type: 'workout' | 'nutrition' | 'education' | 'goal_completed', points: number, description: string) => {
    try {
      const { error } = await supabase
        .from('user_activities')
        .insert({
          user_id: user?.id,
          activity_type: type,
          points_earned: points,
          description
        });

      if (error) throw error;

      toast({
        title: "¡Puntos ganados!",
        description: `+${points} puntos por ${description}`,
      });

      loadRewards();
    } catch (error) {
      console.error('Error awarding points:', error);
    }
  };

  if (!rewards) {
    return null;
  }

  const nextLevelPoints = rewards.level < 3 ? 1000 : rewards.level < 5 ? 5000 : 10000;
  const progress = (rewards.total_points % nextLevelPoints) / nextLevelPoints * 100;

  return (
    <Card className="p-6 bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary rounded-full">
              <Trophy className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Nivel {rewards.level}</h3>
              <p className="text-sm text-muted-foreground">{rewards.total_points} puntos totales</p>
            </div>
          </div>
          <Star className="h-8 w-8 text-accent" />
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progreso al siguiente nivel</span>
            <span className="font-semibold">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-primary to-accent"
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => awardPoints('workout', 50, 'Completar entrenamiento')}
            className="gap-2"
          >
            <TrendingUp className="h-4 w-4" />
            Entrenamiento
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => awardPoints('nutrition', 30, 'Meta nutricional')}
            className="gap-2"
          >
            <Award className="h-4 w-4" />
            Nutrición
          </Button>
        </div>
      </div>
    </Card>
  );
};
