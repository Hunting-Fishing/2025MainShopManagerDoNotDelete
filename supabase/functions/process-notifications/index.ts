
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { Resend } from "npm:resend@2.0.0"
import { supabase } from "@supabase/supabase-js"

const resend = new Resend(Deno.env.get("RESEND_API_KEY"))
const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID')
const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN')
const twilioPhoneNumber = Deno.env.get('TWILIO_PHONE_NUMBER')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function sendEmail(recipientEmail: string, subject: string, message: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'notifications@yourdomain.com',
      to: recipientEmail,
      subject: subject,
      html: message,
    })

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error('Email error:', error)
    return { success: false, error }
  }
}

async function sendSMS(phoneNumber: string, message: string) {
  try {
    const twilioResponse = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${btoa(`${twilioAccountSid}:${twilioAuthToken}`)}`,
        },
        body: new URLSearchParams({
          'To': phoneNumber,
          'From': twilioPhoneNumber,
          'Body': message,
        }).toString(),
      }
    )

    const data = await twilioResponse.json()
    return { success: true, data }
  } catch (error) {
    console.error('SMS error:', error)
    return { success: false, error }
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { notification_ids } = await req.json()

    for (const notificationId of notification_ids) {
      // Get notification details
      const { data: notification, error: notificationError } = await supabase
        .from('work_order_notifications')
        .select('*, profiles!recipient_id(*)')
        .eq('id', notificationId)
        .single()

      if (notificationError) throw notificationError

      const recipientProfile = notification.profiles
      if (!recipientProfile) continue

      // Check notification preferences
      const preferences = recipientProfile.notification_preferences || {
        email: true,
        sms: false,
        push: true
      }

      // Send email if enabled
      if (preferences.email && recipientProfile.email) {
        await sendEmail(
          recipientProfile.email,
          notification.title,
          notification.message
        )
      }

      // Send SMS if enabled
      if (preferences.sms && recipientProfile.phone) {
        await sendSMS(
          recipientProfile.phone,
          notification.message
        )
      }

      // Update notification status
      await supabase
        .from('work_order_notifications')
        .update({ status: 'sent', sent_at: new Date().toISOString() })
        .eq('id', notificationId)
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error processing notifications:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
