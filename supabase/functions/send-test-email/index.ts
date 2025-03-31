
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TestEmailRequest {
  email: string;
  subject: string;
  content: string;
  senderEmail?: string;
  senderName?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  try {
    const { 
      email, 
      subject, 
      content, 
      senderEmail = "test@example.com", 
      senderName = "Test Email" 
    } = await req.json() as TestEmailRequest;

    // Validate request
    if (!email) {
      return new Response(JSON.stringify({ error: "Recipient email is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (!subject) {
      return new Response(JSON.stringify({ error: "Subject is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (!content) {
      return new Response(JSON.stringify({ error: "Email content is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Log the email details (to be replaced with actual email sending)
    console.log("Sending test email:", {
      to: email,
      from: `${senderName} <${senderEmail}>`,
      subject: `[TEST] ${subject}`,
      html: content
    });

    // Record the test send in the database
    const { error: dbError } = await req.supabaseClient
      .from('email_events')
      .insert({
        event_type: 'test_sent',
        recipient_id: null,
        campaign_id: null,
        event_data: {
          recipient: email,
          subject: subject,
          timestamp: new Date().toISOString()
        }
      });

    if (dbError) {
      console.error("Error logging test email:", dbError);
    }

    // In a real implementation, you would send the email using a service like SendGrid, Mailgun, etc.
    // For now, we'll simulate a successful send
    
    return new Response(JSON.stringify({ 
      success: true,
      message: "Test email sent successfully (simulated)" 
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
