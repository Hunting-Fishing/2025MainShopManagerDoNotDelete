
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@1.0.0";

// Get the Resend API key from the environment variables
const resendApiKey = Deno.env.get("RESEND_API_KEY") || "";
const resend = new Resend(resendApiKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailCampaignRequest {
  campaignId: string;
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
    const { campaignId } = await req.json() as EmailCampaignRequest;

    // Validate request
    if (!campaignId) {
      return new Response(JSON.stringify({ error: "Campaign ID is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Fetch the campaign from Supabase
    const { data: campaignData, error: campaignError } = await req.supabaseClient
      .from("email_campaigns")
      .select("*, email_templates!inner(*)")
      .eq("id", campaignId)
      .single();

    if (campaignError) {
      return new Response(JSON.stringify({ error: "Campaign not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Update campaign status to 'sending'
    const { error: updateError } = await req.supabaseClient
      .from("email_campaigns")
      .update({ 
        status: "sending",
        sent_date: new Date().toISOString()
      })
      .eq("id", campaignId);

    if (updateError) {
      return new Response(JSON.stringify({ error: "Failed to update campaign status" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Get recipients for the campaign
    let recipientIds = campaignData.recipient_ids || [];
    
    // If segment IDs are specified, fetch those recipients
    if (campaignData.segment_ids && campaignData.segment_ids.length > 0) {
      const { data: segmentCustomers, error: segmentError } = await req.supabaseClient
        .from("customer_segment_assignments")
        .select("customer_id")
        .in("segment_id", campaignData.segment_ids);
        
      if (!segmentError && segmentCustomers) {
        const segmentCustomerIds = segmentCustomers.map(sc => sc.customer_id);
        recipientIds = [...new Set([...recipientIds, ...segmentCustomerIds])];
      }
    }
    
    // Fetch customer details for recipients
    const { data: customers, error: customersError } = await req.supabaseClient
      .from("customers")
      .select("id, email, first_name, last_name")
      .in("id", recipientIds);
      
    if (customersError) {
      return new Response(JSON.stringify({ error: "Failed to fetch recipients" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Use the campaign template to send emails
    const template = campaignData.email_templates;
    const sentCount = 0;
    
    // Process in batches to avoid overwhelming the API
    const batchSize = 50;
    for (let i = 0; i < customers.length; i += batchSize) {
      const batch = customers.slice(i, i + batchSize);
      
      // Create analytics entry or update existing one
      const now = new Date().toISOString();
      const { data: analyticsData, error: analyticsError } = await req.supabaseClient
        .from("email_campaign_analytics")
        .upsert({
          campaign_id: campaignId,
          name: campaignData.name,
          sent: customers.length,
          delivered: 0, // Will be updated as emails are delivered
          opened: 0,
          clicked: 0,
          bounced: 0,
          complained: 0,
          unsubscribed: 0,
          created_at: now,
          updated_at: now
        }, { onConflict: 'campaign_id' })
        .select();
    }

    // Update the campaign with total recipients
    await req.supabaseClient
      .from("email_campaigns")
      .update({ 
        total_recipients: customers.length,
        status: customers.length > 0 ? "sending" : "completed"
      })
      .eq("id", campaignId);

    return new Response(JSON.stringify({ 
      message: "Campaign sending initiated",
      campaignId,
      recipientCount: customers.length
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
