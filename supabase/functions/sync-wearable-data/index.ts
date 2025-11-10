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

    const { connectionId } = await req.json();

    console.log(`Syncing data for connection: ${connectionId}`);

    // Get connection details
    const { data: connection, error: connectionError } = await supabaseClient
      .from('wearable_connections')
      .select('*')
      .eq('id', connectionId)
      .eq('user_id', user.id)
      .single();

    if (connectionError || !connection) {
      throw new Error('Connection not found');
    }

    let syncedData: any[] = [];

    if (connection.provider === 'fitbit') {
      syncedData = await syncFitbitData(connection, user.id);
    } else if (connection.provider === 'garmin') {
      syncedData = await syncGarminData(connection, user.id);
    }

    // Store synced data
    if (syncedData.length > 0) {
      const { error: insertError } = await supabaseClient
        .from('wearable_data')
        .insert(syncedData);

      if (insertError) {
        console.error('Error storing data:', insertError);
        throw insertError;
      }
    }

    // Update last sync time
    await supabaseClient
      .from('wearable_connections')
      .update({ last_sync_at: new Date().toISOString() })
      .eq('id', connectionId);

    // Trigger intelligent health analysis in background
    if (syncedData.length > 0) {
      fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/analyze-wearable-health`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id })
      }).catch(err => console.error('Error triggering health analysis:', err));
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        synced: syncedData.length,
        message: `Sincronizados ${syncedData.length} registros` 
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

async function syncFitbitData(connection: any, userId: string) {
  const today = new Date().toISOString().split('T')[0];
  const data = [];

  try {
    // Fetch activities
    const activitiesResponse = await fetch(
      `https://api.fitbit.com/1/user/-/activities/date/${today}.json`,
      {
        headers: {
          'Authorization': `Bearer ${connection.access_token}`,
        },
      }
    );

    if (activitiesResponse.ok) {
      const activities = await activitiesResponse.json();
      const summary = activities.summary;

      if (summary) {
        data.push({
          user_id: userId,
          connection_id: connection.id,
          data_type: 'steps',
          value: summary.steps || 0,
          unit: 'steps',
          recorded_at: new Date().toISOString(),
          source: 'fitbit',
          metadata: {}
        });

        data.push({
          user_id: userId,
          connection_id: connection.id,
          data_type: 'calories',
          value: summary.caloriesOut || 0,
          unit: 'kcal',
          recorded_at: new Date().toISOString(),
          source: 'fitbit',
          metadata: {}
        });

        data.push({
          user_id: userId,
          connection_id: connection.id,
          data_type: 'distance',
          value: summary.distances?.[0]?.distance || 0,
          unit: 'km',
          recorded_at: new Date().toISOString(),
          source: 'fitbit',
          metadata: {}
        });

        data.push({
          user_id: userId,
          connection_id: connection.id,
          data_type: 'active_minutes',
          value: summary.veryActiveMinutes || 0,
          unit: 'minutes',
          recorded_at: new Date().toISOString(),
          source: 'fitbit',
          metadata: {}
        });
      }
    }

    // Fetch heart rate
    const heartResponse = await fetch(
      `https://api.fitbit.com/1/user/-/activities/heart/date/${today}/1d.json`,
      {
        headers: {
          'Authorization': `Bearer ${connection.access_token}`,
        },
      }
    );

    if (heartResponse.ok) {
      const heartData = await heartResponse.json();
      const restingHR = heartData['activities-heart']?.[0]?.value?.restingHeartRate;

      if (restingHR) {
        data.push({
          user_id: userId,
          connection_id: connection.id,
          data_type: 'heart_rate',
          value: restingHR,
          unit: 'bpm',
          recorded_at: new Date().toISOString(),
          source: 'fitbit',
          metadata: { type: 'resting' }
        });
      }
    }

    // Fetch sleep
    const sleepResponse = await fetch(
      `https://api.fitbit.com/1.2/user/-/sleep/date/${today}.json`,
      {
        headers: {
          'Authorization': `Bearer ${connection.access_token}`,
        },
      }
    );

    if (sleepResponse.ok) {
      const sleepData = await sleepResponse.json();
      const totalMinutes = sleepData.summary?.totalMinutesAsleep;

      if (totalMinutes) {
        data.push({
          user_id: userId,
          connection_id: connection.id,
          data_type: 'sleep',
          value: totalMinutes / 60,
          unit: 'hours',
          recorded_at: new Date().toISOString(),
          source: 'fitbit',
          metadata: {}
        });
      }
    }
  } catch (error) {
    console.error('Error fetching Fitbit data:', error);
  }

  return data;
}

async function syncGarminData(connection: any, userId: string) {
  // Garmin API implementation would go here
  // For now, return empty array as Garmin requires OAuth 1.0a
  console.log('Garmin sync not yet implemented');
  return [];
}
