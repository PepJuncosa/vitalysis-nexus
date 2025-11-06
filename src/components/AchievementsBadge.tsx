import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Award, Calendar, Flame, Apple, Brain, X, Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  points: number;
  requirement_value: number;
  badge_color: string;
}

interface UserAchievement {
  id: string;
  achievement_id: string;
  progress: number;
  completed: boolean;
  completed_at: string | null;
  achievements: Achievement;
}

const iconMap: Record<string, any> = {
  Calendar,
  Trophy,
  Award,
  Flame,
  Apple,
  Brain,
};

export default function AchievementsBadge() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [achievements, setAchievements] = useState<UserAchievement[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [newAchievement, setNewAchievement] = useState<Achievement | null>(null);

  useEffect(() => {
    if (user) {
      loadAchievements();
      subscribeToAchievements();
    }
  }, [user]);

  const loadAchievements = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("user_achievements")
      .select("*, achievements(*)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading achievements:", error);
      return;
    }

    setAchievements(data || []);
    
    const points = data?.reduce((sum, ua) => 
      sum + (ua.completed ? ua.achievements.points : 0), 0
    ) || 0;
    setTotalPoints(points);
  };

  const subscribeToAchievements = () => {
    if (!user) return;

    const channel = supabase
      .channel(`achievements:${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_achievements",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === "UPDATE" && payload.new.completed && !payload.old.completed) {
            showAchievementUnlocked(payload.new.achievement_id);
          }
          loadAchievements();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const showAchievementUnlocked = async (achievementId: string) => {
    const { data } = await supabase
      .from("achievements")
      .select("*")
      .eq("id", achievementId)
      .single();

    if (data) {
      setNewAchievement(data);
      setTimeout(() => setNewAchievement(null), 5000);
    }
  };

  const completedCount = achievements.filter((a) => a.completed).length;

  return (
    <>
      {/* Achievement Unlock Notification */}
      <AnimatePresence>
        {newAchievement && (
          <motion.div
            initial={{ opacity: 0, y: -100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -100, scale: 0.8 }}
            className="fixed top-4 right-4 z-50"
          >
            <Card className="w-80 shadow-glow border-2 border-primary overflow-hidden">
              <div className="bg-gradient-to-r from-primary via-accent to-primary p-4 text-white animate-gradient">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-white/20 p-3">
                    <Trophy className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">¡Logro Desbloqueado!</p>
                    <p className="text-lg font-bold">{newAchievement.name}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="ml-auto text-white hover:bg-white/20"
                    onClick={() => setNewAchievement(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm mt-2 opacity-90">{newAchievement.description}</p>
                <p className="text-xs mt-1 font-semibold">+{newAchievement.points} puntos</p>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Achievement Badge Button */}
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className="relative btn-3d"
      >
        <Trophy className="h-4 w-4 mr-2 text-warning" />
        <span className="font-semibold">{totalPoints}</span>
        <Badge className="ml-2 bg-accent">{completedCount}</Badge>
      </Button>

      {/* Achievements Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <Trophy className="h-6 w-6 text-warning" />
              Mis Logros
              <Badge variant="secondary" className="ml-2">
                {totalPoints} puntos
              </Badge>
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 mt-4">
            {achievements.map((ua) => {
              const Icon = iconMap[ua.achievements.icon] || Trophy;
              const progressPercentage = (ua.progress / ua.achievements.requirement_value) * 100;

              return (
                <motion.div
                  key={ua.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <Card className={`${ua.completed ? "border-primary shadow-glow" : "opacity-60"}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div
                          className={`rounded-lg ${ua.achievements.badge_color} ${
                            ua.completed ? "" : "opacity-50"
                          } p-3 text-white`}
                        >
                          {ua.completed ? (
                            <Icon className="h-6 w-6" />
                          ) : (
                            <Lock className="h-6 w-6" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-bold text-lg">{ua.achievements.name}</h3>
                            <Badge
                              variant={ua.completed ? "default" : "secondary"}
                              className={ua.completed ? "bg-accent" : ""}
                            >
                              {ua.achievements.points} pts
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            {ua.achievements.description}
                          </p>
                          {!ua.completed && (
                            <>
                              <Progress value={progressPercentage} className="h-2 mb-2" />
                              <p className="text-xs text-muted-foreground">
                                Progreso: {ua.progress} / {ua.achievements.requirement_value}
                              </p>
                            </>
                          )}
                          {ua.completed && ua.completed_at && (
                            <p className="text-xs text-accent font-semibold">
                              ✓ Completado el{" "}
                              {new Date(ua.completed_at).toLocaleDateString("es-ES")}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
