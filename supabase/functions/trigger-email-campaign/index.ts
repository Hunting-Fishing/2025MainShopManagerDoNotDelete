
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
    let sentCount = 0;
    let errorCount = 0;
    
    // Process in batches to avoid overwhelming the API
    const batchSize = 50;
    for (let i = 0; i < customers.length; i += batchSize) {
      const batch = customers.slice(i, i + batchSize);
      
      // Send emails to each recipient in the batch
      const sendPromises = batch.map(async (customer) => {
        try {
          // Personalize the email content
          let personalizedSubject = campaignData.subject;
          let personalizedContent = campaignData.content || template.content;
          
          // Apply basic personalization
          personalizedSubject = personalizedSubject
            .replace(/{{first_name}}/g, customer.first_name || "")
            .replace(/{{last_name}}/g, customer.last_name || "")
            .replace(/{{email}}/g, customer.email || "");
            
          personalizedContent = personalizedContent
            .replace(/{{first_name}}/g, customer.first_name || "")
            .replace(/{{last_name}}/g, customer.last_name || "")
            .replace(/{{email}}/g, customer.email || "");
            
          // Apply custom personalizations if any
          if (campaignData.personalizations) {
            const customVars = campaignData.personalizations[customer.id] || {};
            Object.entries(customVars).forEach(([key, value]) => {
              const regex = new RegExp(`{{${key}}}`, "g");
              personalizedSubject = personalizedSubject.replace(regex, value as string);
              personalizedContent = personalizedContent.replace(regex, value as string);
            });
          }
          
          // Add tracking pixel for open tracking
          const trackingId = crypto.randomUUID();
          const trackingPixel = `<img src="${Deno.env.get("SUPABASE_URL")}/functions/track-email-open?t=${trackingId}&c=${campaignId}&r=${customer.id}" width="1" height="1" alt="">`;
          
          // Add at the end of the email body
          if (personalizedContent.includes('</body>')) {
            personalizedContent = personalizedContent.replace('</body>', `${trackingPixel}</body>`);
          } else {
            personalizedContent = `${personalizedContent}${trackingPixel}`;
          }
          
          // Process links for click tracking
          // This is a simplified version - a full implementation would parse the HTML and modify all links
          const linkRegex = /<a\s+(?:[^>]*?\s+)?href=(["'])(https?:\/\/[^"']+)\1/gi;
          let match;
          while ((match = linkRegex.exec(personalizedContent)) !== null) {
            const originalUrl = match[2];
            const trackingUrl = `${Deno.env.get("SUPABASE_URL")}/functions/track-email-click?t=${trackingId}&c=${campaignId}&r=${customer.id}&u=${encodeURIComponent(originalUrl)}`;
            personalizedContent = personalizedContent.replace(`href="${originalUrl}"`, `href="${trackingUrl}"`);
          }
          
          // Store tracking info in the database
          await req.supabaseClient
            .from("email_tracking")
            .insert({
              tracking_id: trackingId,
              campaign_id: campaignId,
              recipient_id: customer.id,
              email: customer.email,
              sent_at: new Date().toISOString()
            });
            
          // Send the email using Resend
          const { data: emailData, error: emailError } = await resend.emails.send({
            from: `${campaignData.from_name || "Company"} <${campaignData.from_email || "noreply@example.com"}>`,
            to: customer.email,
            subject: personalizedSubject,
            html: personalizedContent
          });
          
          if (emailError) {
            console.error(`Failed to send email to ${customer.email}:`, emailError);
            errorCount++;
          } else {
            sentCount++;
            
            // Log successful send
            await req.supabaseClient
              .from("email_events")
              .insert({
                campaign_id: campaignId,
                recipient_id: customer.id,
                event_type: "sent",
                event_data: { 
                  email_id: emailData.id,
                  recipient: customer.email
                }
              });
          }
        } catch (err) {
          console.error(`Error sending to ${customer.email}:`, err);
          errorCount++;
        }
      });
      
      // Wait for all emails in this batch to be sent
      await Promise.all(sendPromises);
    }

    // Create analytics entry or update existing one
    const now = new Date().toISOString();
    const { data: analyticsData, error: analyticsError } = await req.supabaseClient
      .from("email_campaign_analytics")
      .upsert({
        campaign_id: campaignId,
        name: campaignData.name,
        sent: sentCount,
        delivered: sentCount, // Assume all sent emails are delivered initially
        opened: 0,
        clicked: 0,
        bounced: 0,
        complained: 0,
        unsubscribed: 0,
        created_at: now,
        updated_at: now
      }, { onConflict: 'campaign_id' })
      .select();

    // Update the campaign with total recipients and completion status
    await req.supabaseClient
      .from("email_campaigns")
      .update({ 
        total_recipients: sentCount,
        status: sentCount > 0 ? (errorCount > 0 ? "partial" : "completed") : "failed"
      })
      .eq("id", campaignId);

    return new Response(JSON.stringify({ 
      message: "Campaign sending completed",
      campaignId,
      sent: sentCount,
      errors: errorCount,
      total: customers.length
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
