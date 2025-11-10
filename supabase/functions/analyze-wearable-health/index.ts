import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.2';

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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          persistSession: false,
        },
      }
    );

    const { userId } = await req.json();

    console.log(`Analyzing health data for user: ${userId}`);

    // Get today's data
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data: todayData, error: dataError } = await supabaseClient
      .from('wearable_data')
      .select('*')
      .eq('user_id', userId)
      .gte('recorded_at', today.toISOString());

    if (dataError) {
      console.error('Error fetching data:', dataError);
      throw dataError;
    }

    const notifications = [];

    // Analyze steps (goal: 10,000 steps/day)
    const stepsData = todayData?.filter(d => d.data_type === 'steps') || [];
    const totalSteps = stepsData.reduce((sum, d) => sum + Number(d.value), 0);
    
    const currentHour = new Date().getHours();
    if (currentHour >= 18 && totalSteps < 5000) {
      notifications.push({
        type: 'activity_reminder',
        title: '¡Tiempo de moverse!',
        context: `Has dado ${totalSteps.toLocaleString()} pasos hoy`,
        priority: 'medium'
      });
    }

    // Analyze heart rate (normal: 60-100 bpm)
    const heartRateData = todayData?.filter(d => d.data_type === 'heart_rate') || [];
    if (heartRateData.length > 0) {
      const latestHR = heartRateData[heartRateData.length - 1];
      const hrValue = Number(latestHR.value);
      
      if (hrValue > 100) {
        notifications.push({
          type: 'heart_rate_alert',
          title: 'Frecuencia cardíaca elevada',
          context: `Tu frecuencia cardíaca está en ${hrValue} bpm`,
          priority: 'high'
        });
      } else if (hrValue < 50) {
        notifications.push({
          type: 'heart_rate_alert',
          title: 'Frecuencia cardíaca baja',
          context: `Tu frecuencia cardíaca está en ${hrValue} bpm`,
          priority: 'medium'
        });
      }
    }

    // Analyze sleep (goal: 7-9 hours)
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const { data: sleepData } = await supabaseClient
      .from('wearable_data')
      .select('*')
      .eq('user_id', userId)
      .eq('data_type', 'sleep')
      .gte('recorded_at', yesterday.toISOString())
      .lte('recorded_at', today.toISOString());

    if (sleepData && sleepData.length > 0) {
      const lastSleep = Number(sleepData[sleepData.length - 1].value);
      if (lastSleep < 6) {
        notifications.push({
          type: 'sleep_alert',
          title: 'Sueño insuficiente',
          context: `Solo dormiste ${lastSleep.toFixed(1)} horas anoche`,
          priority: 'medium'
        });
      }
    }

    // Generate AI-powered notification messages
    if (notifications.length > 0) {
      const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
      if (!LOVABLE_API_KEY) {
        throw new Error('LOVABLE_API_KEY not configured');
      }

      for (const notification of notifications) {
        try {
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
                  content: 'Eres un asistente de salud amigable que genera mensajes motivadores y útiles. Responde en español de forma concisa (máximo 2 oraciones) y motivadora.'
                },
                {
                  role: 'user',
                  content: `Genera un mensaje ${notification.priority === 'high' ? 'urgente pero tranquilizador' : 'motivador'} sobre: ${notification.title}. Contexto: ${notification.context}`
                }
              ],
              max_completion_tokens: 100,
            }),
          });

          if (aiResponse.ok) {
            const aiData = await aiResponse.json();
            const message = aiData.choices?.[0]?.message?.content;
            
            if (message) {
              // Insert notification
              await supabaseClient
                .from('notifications')
                .insert({
                  user_id: userId,
                  type: notification.type,
                  title: notification.title,
                  message: message,
                  metadata: { 
                    context: notification.context,
                    priority: notification.priority 
                  }
                });

              console.log(`Created ${notification.type} notification for user ${userId}`);
            }
          } else {
            console.error('AI API error:', await aiResponse.text());
          }
        } catch (error) {
          console.error(`Error generating AI message for ${notification.type}:`, error);
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        analyzed: true,
        notifications_created: notifications.length,
        message: `Creadas ${notifications.length} notificaciones inteligentes`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
