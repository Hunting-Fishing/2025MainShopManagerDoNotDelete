import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY is not configured');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { action, clientId, shopId, context } = await req.json();

    let systemPrompt = '';
    let userPrompt = '';

    if (action === 'suggest_workout') {
      // Fetch client data for context
      const { data: client } = await supabase.from('pt_clients').select('*').eq('id', clientId).single();
      const { data: recentMetrics } = await supabase.from('pt_body_metrics').select('*').eq('client_id', clientId).order('recorded_date', { ascending: false }).limit(5);
      const { data: recentLogs } = await supabase.from('pt_workout_logs').select('*').eq('client_id', clientId).order('completed_at', { ascending: false }).limit(10);
      const { data: exercises } = await supabase.from('pt_exercises').select('name, muscle_group, equipment, difficulty').eq('shop_id', shopId).limit(50);

      systemPrompt = `You are an expert personal trainer AI. Generate a workout plan based on the client's profile, recent activity, and available exercises. Return a structured workout with exercises, sets, reps, rest times, and notes. Be specific and practical.`;
      userPrompt = `Client Profile:
- Name: ${client?.first_name} ${client?.last_name}
- Fitness Level: ${client?.fitness_level || 'intermediate'}
- Goals: ${client?.goals || 'general fitness'}
- Injuries: ${client?.injuries || 'none reported'}
${context?.focus ? `- Focus Area: ${context.focus}` : ''}
${context?.duration ? `- Session Duration: ${context.duration} minutes` : ''}

Recent Metrics: ${JSON.stringify(recentMetrics?.slice(0, 3) || [])}
Recent Workouts: ${recentLogs?.length || 0} sessions completed recently
Available Exercises: ${exercises?.map(e => `${e.name} (${e.muscle_group}, ${e.difficulty})`).join(', ')}

Please suggest a complete workout session with warm-up, main exercises (with sets/reps/rest), and cooldown.`;

    } else if (action === 'summarize_checkins') {
      const { data: checkIns } = await supabase.from('pt_check_ins')
        .select('*').eq('client_id', clientId)
        .order('check_in_date', { ascending: false }).limit(8);
      const { data: client } = await supabase.from('pt_clients').select('first_name, last_name, goals').eq('id', clientId).single();

      systemPrompt = `You are a fitness analytics AI. Analyze the client's check-in data and provide a concise, actionable summary with trends, concerns, and recommendations for the trainer.`;
      userPrompt = `Client: ${client?.first_name} ${client?.last_name}
Goals: ${client?.goals || 'general fitness'}

Recent Check-ins (newest first):
${(checkIns || []).map((c: any) => `Date: ${c.check_in_date}, Weight: ${c.weight_kg}kg, Mood: ${c.mood}, Energy: ${c.energy_level}/10, Sleep: ${c.sleep_hours}h, Workout Compliance: ${c.workout_compliance || 'N/A'}/10, Soreness: ${c.soreness_level || 'N/A'}/10, Notes: ${c.notes || 'none'}`).join('\n')}

Provide: 1) Key trends, 2) Areas of concern, 3) Specific recommendations for the trainer.`;

    } else if (action === 'nutrition_advice') {
      const { data: client } = await supabase.from('pt_clients').select('*').eq('id', clientId).single();
      const { data: logs } = await supabase.from('pt_nutrition_logs')
        .select('*').eq('client_id', clientId)
        .order('log_date', { ascending: false }).limit(21);

      systemPrompt = `You are a sports nutrition advisor. Analyze the client's nutrition data and targets, then provide practical advice. Do not prescribe medical diets.`;
      userPrompt = `Client: ${client?.first_name} ${client?.last_name}
Goals: ${client?.goals || 'general fitness'}
Targets: Calories=${client?.calorie_target || 2000}, Protein=${client?.protein_target_g || 150}g
Recent meals logged: ${logs?.length || 0} entries
${logs?.length ? `Sample entries: ${JSON.stringify(logs.slice(0, 7))}` : 'No recent logs'}

Provide brief nutrition advice and meal suggestions aligned with their goals.`;

    } else {
      throw new Error(`Unknown action: ${action}`);
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }), {
          status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted. Please top up in workspace settings.' }), {
          status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errText = await response.text();
      console.error('AI gateway error:', response.status, errText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content || 'No response generated.';

    return new Response(JSON.stringify({ content, action }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('PT AI Assistant error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
