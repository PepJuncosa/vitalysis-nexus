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
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          persistSession: false,
        },
      }
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { provider, code, state } = await req.json();

    console.log(`Processing OAuth callback for ${provider}`);

    let tokenData;
    if (provider === 'fitbit') {
      tokenData = await exchangeFitbitToken(code);
    } else if (provider === 'garmin') {
      tokenData = await exchangeGarminToken(code);
    } else {
      throw new Error('Unsupported provider');
    }

    // Store connection
    const { data: connection, error: insertError } = await supabaseClient
      .from('wearable_connections')
      .upsert({
        user_id: user.id,
        provider,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        token_expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
        is_active: true,
        metadata: { scope: tokenData.scope }
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error storing connection:', insertError);
      throw insertError;
    }

    return new Response(
      JSON.stringify({ success: true, connection }),
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

async function exchangeFitbitToken(code: string) {
  const clientId = Deno.env.get('FITBIT_CLIENT_ID');
  const clientSecret = Deno.env.get('FITBIT_CLIENT_SECRET');
  const redirectUri = `${Deno.env.get('SUPABASE_URL')}/functions/v1/wearable-oauth-callback`;

  const credentials = btoa(`${clientId}:${clientSecret}`);
  
  const response = await fetch('https://api.fitbit.com/oauth2/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: clientId!,
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
    }),
  });

  if (!response.ok) {
    throw new Error(`Fitbit token exchange failed: ${await response.text()}`);
  }

  return await response.json();
}

async function exchangeGarminToken(code: string) {
  // Garmin uses OAuth 1.0a, which is more complex
  // This is a simplified version - production would need full OAuth 1.0a implementation
  const consumerKey = Deno.env.get('GARMIN_CONSUMER_KEY');
  const consumerSecret = Deno.env.get('GARMIN_CONSUMER_SECRET');

  // For now, return mock data - full implementation would require OAuth 1.0a library
  return {
    access_token: code,
    refresh_token: '',
    expires_in: 31536000, // 1 year
    scope: 'activities'
  };
}
