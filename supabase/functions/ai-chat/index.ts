import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionId, message, action } = await req.json();

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Get session context
    const { data: session } = await supabase
      .from('ai_chat_sessions')
      .select('*, ai_chat_messages(*)')
      .eq('id', sessionId)
      .single();

    if (!session) {
      throw new Error('Chat session not found');
    }

    // Build conversation history
    const messages = [
      {
        role: 'system',
        content: `You are an AI assistant for an automotive service management system. 
        You help with customer support, service recommendations, and general inquiries.
        Be helpful, professional, and concise. Session type: ${session.session_type}`
      },
      ...(session.ai_chat_messages || []).map((msg: any) => ({
        role: msg.role,
        content: msg.content
      })),
      {
        role: 'user',
        content: message
      }
    ];

    // Call OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const aiResponse = await response.json();
    const assistantMessage = aiResponse.choices[0].message.content;

    // Analyze sentiment
    const sentimentResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Analyze the sentiment of the following message and return a score between -1 (very negative) and 1 (very positive). Respond only with a number.'
          },
          {
            role: 'user',
            content: message
          }
        ],
        temperature: 0,
        max_tokens: 10,
      }),
    });

    let sentimentScore = 0;
    if (sentimentResponse.ok) {
      const sentimentData = await sentimentResponse.json();
      sentimentScore = parseFloat(sentimentData.choices[0].message.content) || 0;
    }

    // Update session with sentiment
    await supabase
      .from('ai_chat_sessions')
      .update({
        sentiment_score: sentimentScore,
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionId);

    return new Response(JSON.stringify({
      content: assistantMessage,
      sentiment_score: sentimentScore,
      metadata: {
        model: 'gpt-4o-mini',
        tokens_used: aiResponse.usage?.total_tokens || 0
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in AI chat function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});