-- Create table for user reminder settings
CREATE TABLE public.user_reminder_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reminder_type TEXT NOT NULL CHECK (reminder_type IN ('workout', 'hydration', 'rest')),
  enabled BOOLEAN NOT NULL DEFAULT true,
  frequency_hours INTEGER NOT NULL DEFAULT 24,
  preferred_time TIME,
  last_sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, reminder_type)
);

-- Enable RLS
ALTER TABLE public.user_reminder_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own reminder settings"
  ON public.user_reminder_settings
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own reminder settings"
  ON public.user_reminder_settings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reminder settings"
  ON public.user_reminder_settings
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reminder settings"
  ON public.user_reminder_settings
  FOR DELETE
  USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_user_reminder_settings_updated_at
  BEFORE UPDATE ON public.user_reminder_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default reminder settings for existing users
INSERT INTO public.user_reminder_settings (user_id, reminder_type, enabled, frequency_hours)
SELECT DISTINCT user_id, 'workout', true, 24
FROM public.user_rewards
ON CONFLICT DO NOTHING;

INSERT INTO public.user_reminder_settings (user_id, reminder_type, enabled, frequency_hours)
SELECT DISTINCT user_id, 'hydration', true, 4
FROM public.user_rewards
ON CONFLICT DO NOTHING;

INSERT INTO public.user_reminder_settings (user_id, reminder_type, enabled, frequency_hours)
SELECT DISTINCT user_id, 'rest', true, 168
FROM public.user_rewards
ON CONFLICT DO NOTHING;