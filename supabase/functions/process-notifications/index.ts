
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN');
const twilioPhoneNumber = Deno.env.get('TWILIO_PHONE_NUMBER');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { notification_ids } = await req.json();

    // Get notifications with recipient profile info
    const { data: notifications, error: notificationError } = await supabase
      .from('work_order_notifications')
      .select('*, profiles!recipient_id(*)')
      .in('id', notification_ids)
      .is('sent_at', null);

    if (notificationError) throw notificationError;

    for (const notification of notifications) {
      const recipientProfile = notification.profiles;
      if (!recipientProfile) continue;

      // Get recipient's notification preferences
      const preferences = recipientProfile.notification_preferences || {
        email: true,
        sms: false,
        push: true
      };

      // Send email if enabled
      if (preferences.email && recipientProfile.email) {
        try {
          await resend.emails.send({
            from: "notifications@yourdomain.com",
            to: recipientProfile.email,
            subject: notification.title,
            html: `<p>${notification.message}</p>`,
          });
        } catch (error) {
          console.error('Email error:', error);
        }
      }

      // Send SMS if enabled
      if (preferences.sms && recipientProfile.phone) {
        try {
          await fetch(
            `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${btoa(`${twilioAccountSid}:${twilioAuthToken}`)}`,
              },
              body: new URLSearchParams({
                'To': recipientProfile.phone,
                'From': twilioPhoneNumber,
                'Body': notification.message,
              }).toString(),
            }
          );
        } catch (error) {
          console.error('SMS error:', error);
        }
      }

      // Update notification status
      await supabase
        .from('work_order_notifications')
        .update({ 
          status: 'sent', 
          sent_at: new Date().toISOString() 
        })
        .eq('id', notification.id);
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error processing notifications:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
