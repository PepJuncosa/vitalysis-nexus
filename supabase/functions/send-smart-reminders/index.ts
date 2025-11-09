import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Starting smart reminders check...');

    // Get reminder settings that need to be sent
    const now = new Date();
    const { data: reminders, error: remindersError } = await supabaseClient
      .from('user_reminder_settings')
      .select('*')
      .eq('enabled', true);

    if (remindersError) {
      console.error('Error fetching reminders:', remindersError);
      throw remindersError;
    }

    console.log(`Found ${reminders?.length || 0} active reminder settings`);

    let sentCount = 0;

    for (const reminder of reminders || []) {
      // Check if enough time has passed since last reminder
      if (reminder.last_sent_at) {
        const lastSent = new Date(reminder.last_sent_at);
        const hoursSinceLastSent = (now.getTime() - lastSent.getTime()) / (1000 * 60 * 60);
        
        if (hoursSinceLastSent < reminder.frequency_hours) {
          continue; // Skip this reminder, not enough time has passed
        }
      }

      // Get user's activity data for context
      const { data: activities } = await supabaseClient
        .from('user_activities')
        .select('*')
        .eq('user_id', reminder.user_id)
        .order('created_at', { ascending: false })
        .limit(10);

      const { data: rewards } = await supabaseClient
        .from('user_rewards')
        .select('*')
        .eq('user_id', reminder.user_id)
        .single();

      // Build context for AI
      const userContext = `
Usuario con nivel ${rewards?.level || 1} y ${rewards?.total_points || 0} puntos.
Actividades recientes: ${activities?.length || 0}
Última actividad: ${activities?.[0]?.created_at || 'Sin actividades recientes'}
`;

      const reminderPrompts = {
        workout: `Genera un recordatorio motivador y personalizado para hacer ejercicio. El usuario tiene este historial: ${userContext}. Sé breve (máximo 2 líneas) y específico basándote en sus actividades recientes.`,
        hydration: `Genera un recordatorio amigable sobre hidratación. Contexto del usuario: ${userContext}. Sé breve (máximo 2 líneas) y motivador.`,
        rest: `Genera un recordatorio sobre la importancia del descanso y recuperación. Contexto: ${userContext}. Sé breve (máximo 2 líneas) y empático.`
      };

      const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
      if (!LOVABLE_API_KEY) {
        console.error('LOVABLE_API_KEY not configured');
        continue;
      }

      // Call Lovable AI to generate personalized message
      const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { 
              role: 'system', 
              content: 'Eres FitCoach AI, un coach de fitness motivador. Genera recordatorios breves, personalizados y motivadores en español.'
            },
            { 
              role: 'user', 
              content: reminderPrompts[reminder.reminder_type as keyof typeof reminderPrompts]
            }
          ],
        }),
      });

      if (!aiResponse.ok) {
        console.error('AI API error:', aiResponse.status);
        continue;
      }

      const aiData = await aiResponse.json();
      const reminderMessage = aiData.choices[0].message.content;

      const titles = {
        workout: '💪 Hora de Entrenar',
        hydration: '💧 Momento de Hidratarse',
        rest: '😴 Tiempo de Descanso'
      };

      // Create notification
      const { error: notificationError } = await supabaseClient
        .from('notifications')
        .insert({
          user_id: reminder.user_id,
          type: 'reminder',
          title: titles[reminder.reminder_type as keyof typeof titles],
          message: reminderMessage,
          metadata: {
            reminder_type: reminder.reminder_type,
            ai_generated: true
          }
        });

      if (notificationError) {
        console.error('Error creating notification:', notificationError);
        continue;
      }

      // Update last_sent_at
      await supabaseClient
        .from('user_reminder_settings')
        .update({ last_sent_at: now.toISOString() })
        .eq('id', reminder.id);

      sentCount++;
      console.log(`Sent ${reminder.reminder_type} reminder to user ${reminder.user_id}`);
    }

    console.log(`Successfully sent ${sentCount} reminders`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        sentCount,
        totalChecked: reminders?.length || 0
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in send-smart-reminders:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
