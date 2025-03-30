
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN');
const twilioPhoneNumber = Deno.env.get('TWILIO_PHONE_NUMBER');

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client with admin privileges
    const supabase = createClient(
      supabaseUrl,
      supabaseServiceKey
    );

    const { phoneNumber, message, customerId, templateId } = await req.json();

    console.log(`Sending SMS to ${phoneNumber}: ${message}`);
    
    if (!phoneNumber || !message) {
      throw new Error('Phone number and message are required');
    }

    // Ensure phone number is in E.164 format
    let formattedPhoneNumber = phoneNumber;
    if (!phoneNumber.startsWith('+')) {
      formattedPhoneNumber = `+${phoneNumber.replace(/\D/g, '')}`;
    }

    // Send SMS using Twilio API
    const twilioResponse = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${btoa(`${twilioAccountSid}:${twilioAuthToken}`)}`,
        },
        body: new URLSearchParams({
          'To': formattedPhoneNumber,
          'From': twilioPhoneNumber,
          'Body': message,
        }).toString(),
      }
    );

    const twilioData = await twilioResponse.json();

    if (!twilioResponse.ok) {
      console.error('Twilio API error:', twilioData);
      throw new Error(`Twilio error: ${twilioData.message || 'Unknown error'}`);
    }

    // Log the SMS in the database
    const { data: logData, error: logError } = await supabase
      .from('sms_logs')
      .insert({
        customer_id: customerId,
        template_id: templateId,
        phone_number: formattedPhoneNumber,
        message: message,
        status: twilioData.status,
        twilio_sid: twilioData.sid
      })
      .select('id')
      .single();

    if (logError) {
      console.error('Error logging SMS:', logError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        sid: twilioData.sid,
        status: twilioData.status,
        logId: logData?.id
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error sending SMS:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to send SMS' 
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
