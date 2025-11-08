import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
      throw new Error('No authorization header');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Get conversation messages
    const { data: messages, error: messagesError } = await supabase
      .from('ai_coach_messages')
      .select('role, content')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (messagesError) throw messagesError;

    // Get user data for context
    const { data: userRewards } = await supabase
      .from('user_rewards')
      .select('*')
      .eq('user_id', user.id)
      .single();

    const { data: userActivities } = await supabase
      .from('user_activities')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    const { data: achievements } = await supabase
      .from('user_achievements')
      .select('*, achievements(*)')
      .eq('user_id', user.id);

    // Build context for AI
    const userContext = {
      points: userRewards?.total_points || 0,
      level: userRewards?.level || 1,
      recentActivities: userActivities || [],
      achievements: achievements || [],
    };

    const systemPrompt = `Eres un coach personal de salud y fitness altamente capacitado. Tu objetivo es motivar, educar y guiar al usuario en su viaje de bienestar.

Contexto del usuario:
- Nivel actual: ${userContext.level}
- Puntos totales: ${userContext.points}
- Actividades recientes: ${userContext.recentActivities.length}
- Logros desbloqueados: ${userContext.achievements.length}

Tus responsabilidades:
1. Analizar datos del usuario (rendimiento, nutrición, biométricos)
2. Ofrecer recomendaciones personalizadas sobre entrenamientos, dieta y recuperación
3. Proponer objetivos realistas y alcanzables
4. Responder preguntas sobre estadísticas y progreso
5. Motivar y celebrar los logros del usuario
6. Proporcionar contenido educativo relevante

Mantén un tono amigable, motivador y profesional. Usa emojis ocasionalmente para hacer la conversación más dinámica. Sé específico en tus recomendaciones basándote en los datos del usuario.`;

    // Call Lovable AI
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
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
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const assistantMessage = aiResponse.choices[0].message.content;

    // Save user message
    await supabase.from('ai_coach_messages').insert({
      conversation_id: conversationId,
      role: 'user',
      content: message,
    });

    // Save assistant message
    await supabase.from('ai_coach_messages').insert({
      conversation_id: conversationId,
      role: 'assistant',
      content: assistantMessage,
    });

    // Update conversation timestamp
    await supabase
      .from('ai_coach_conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId);

    return new Response(
      JSON.stringify({ message: assistantMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in ai-coach function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});