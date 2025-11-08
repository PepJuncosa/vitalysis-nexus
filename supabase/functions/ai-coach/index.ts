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
    const { conversationId, message } = await req.json();
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // Get user data
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) throw new Error('Unauthorized');

    // Get user's data for context
    const [activitiesData, rewardsData, achievementsData] = await Promise.all([
      supabaseClient.from('user_activities').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10),
      supabaseClient.from('user_rewards').select('*').eq('user_id', user.id).maybeSingle(),
      supabaseClient.from('user_achievements')
        .select('*, achievements(*)')
        .eq('user_id', user.id)
    ]);

    // Get conversation history
    const { data: messagesData } = await supabaseClient
      .from('ai_coach_messages')
      .select('role, content')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    const messages = messagesData || [];

    // Build context for AI
    const userContext = `
Usuario: ${user.email}
Nivel actual: ${rewardsData.data?.level || 1}
Puntos totales: ${rewardsData.data?.total_points || 0}
Logros desbloqueados: ${achievementsData.data?.length || 0}

Actividades recientes:
${activitiesData.data?.map(a => `- ${a.activity_type}: ${a.description || 'Sin descripción'} (${a.points_earned} puntos)`).join('\n') || 'Sin actividades recientes'}
`;

    const systemPrompt = `Eres un coach personal de salud y fitness altamente cualificado. Tu nombre es "FitCoach AI". 

Tu rol es analizar los datos del usuario y proporcionar:
1. Recomendaciones personalizadas sobre entrenamientos basadas en su historial
2. Consejos de nutrición adaptados a sus objetivos
3. Estrategias de recuperación y descanso
4. Contenido educativo relevante
5. Objetivos realistas y alcanzables

Datos del usuario:
${userContext}

Características de tu comunicación:
- Sé motivador pero realista
- Usa un tono amigable y profesional
- Proporciona datos específicos y cuantificables
- Pregunta sobre las necesidades y metas del usuario
- Celebra los logros y progreso
- Adapta tus recomendaciones al nivel actual del usuario

IMPORTANTE: Responde en español y mantén las respuestas concisas pero informativas.`;

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Call Lovable AI
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages,
          { role: 'user', content: message }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const assistantMessage = aiData.choices[0].message.content;

    // Save messages to database
    await supabaseClient.from('ai_coach_messages').insert([
      {
        conversation_id: conversationId,
        role: 'user',
        content: message
      },
      {
        conversation_id: conversationId,
        role: 'assistant',
        content: assistantMessage
      }
    ]);

    return new Response(
      JSON.stringify({ message: assistantMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in ai-coach function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
