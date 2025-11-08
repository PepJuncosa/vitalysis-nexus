-- Fix security warning by setting search_path for the function
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;