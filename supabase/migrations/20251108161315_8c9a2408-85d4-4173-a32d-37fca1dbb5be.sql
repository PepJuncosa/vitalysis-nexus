-- Create table for user activity tracking
CREATE TABLE IF NOT EXISTS public.user_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('workout', 'nutrition', 'education', 'goal_completed')),
  points_earned INTEGER NOT NULL DEFAULT 0,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for user points/rewards
CREATE TABLE IF NOT EXISTS public.user_rewards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  total_points INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for AI coach conversations
CREATE TABLE IF NOT EXISTS public.ai_coach_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for AI coach messages
CREATE TABLE IF NOT EXISTS public.ai_coach_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.ai_coach_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_coach_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_coach_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_activities
CREATE POLICY "Users can view their own activities"
  ON public.user_activities FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own activities"
  ON public.user_activities FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_rewards
CREATE POLICY "Users can view their own rewards"
  ON public.user_rewards FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own rewards"
  ON public.user_rewards FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own rewards"
  ON public.user_rewards FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for ai_coach_conversations
CREATE POLICY "Users can view their own AI conversations"
  ON public.ai_coach_conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own AI conversations"
  ON public.ai_coach_conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own AI conversations"
  ON public.ai_coach_conversations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own AI conversations"
  ON public.ai_coach_conversations FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for ai_coach_messages
CREATE POLICY "Users can view messages from their conversations"
  ON public.ai_coach_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.ai_coach_conversations
      WHERE id = ai_coach_messages.conversation_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create messages in their conversations"
  ON public.ai_coach_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.ai_coach_conversations
      WHERE id = ai_coach_messages.conversation_id
      AND user_id = auth.uid()
    )
  );

-- Create triggers for updated_at
CREATE TRIGGER update_user_rewards_updated_at
  BEFORE UPDATE ON public.user_rewards
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ai_coach_conversations_updated_at
  BEFORE UPDATE ON public.ai_coach_conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to award points and update achievements
CREATE OR REPLACE FUNCTION public.award_points_and_check_achievements()
RETURNS TRIGGER AS $$
DECLARE
  v_total_points INTEGER;
  v_new_level INTEGER;
  v_activity_count INTEGER;
BEGIN
  -- Insert or update user_rewards
  INSERT INTO public.user_rewards (user_id, total_points)
  VALUES (NEW.user_id, NEW.points_earned)
  ON CONFLICT (user_id)
  DO UPDATE SET 
    total_points = user_rewards.total_points + NEW.points_earned,
    level = CASE
      WHEN user_rewards.total_points + NEW.points_earned >= 10000 THEN 10
      WHEN user_rewards.total_points + NEW.points_earned >= 5000 THEN 5
      WHEN user_rewards.total_points + NEW.points_earned >= 1000 THEN 3
      ELSE user_rewards.level
    END,
    updated_at = now()
  RETURNING total_points, level INTO v_total_points, v_new_level;

  -- Check for achievements based on activity type
  IF NEW.activity_type = 'workout' THEN
    SELECT COUNT(*) INTO v_activity_count
    FROM public.user_activities
    WHERE user_id = NEW.user_id AND activity_type = 'workout';
    
    -- Award "Primera Sesión" achievement
    IF v_activity_count = 1 THEN
      INSERT INTO public.user_achievements (user_id, achievement_id)
      SELECT NEW.user_id, id FROM public.achievements WHERE id = 'primera-sesion'
      ON CONFLICT DO NOTHING;
    END IF;
    
    -- Award "Guerrero del Fitness" achievement (10 workouts)
    IF v_activity_count >= 10 THEN
      INSERT INTO public.user_achievements (user_id, achievement_id)
      SELECT NEW.user_id, id FROM public.achievements WHERE id = 'guerrero-fitness'
      ON CONFLICT DO NOTHING;
    END IF;
  END IF;

  -- Check for points-based achievements
  IF v_total_points >= 100 THEN
    INSERT INTO public.user_achievements (user_id, achievement_id)
    SELECT NEW.user_id, id FROM public.achievements WHERE id = 'coleccionista'
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to award points automatically
CREATE TRIGGER award_points_on_activity
  AFTER INSERT ON public.user_activities
  FOR EACH ROW
  EXECUTE FUNCTION public.award_points_and_check_achievements();

-- Enable Realtime for AI coach messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.ai_coach_messages;