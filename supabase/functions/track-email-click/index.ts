
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

serve(async (req) => {
  // Get tracking params from URL
  const url = new URL(req.url);
  const trackingId = url.searchParams.get('t');
  const campaignId = url.searchParams.get('c');
  const recipientId = url.searchParams.get('r');
  const targetUrl = url.searchParams.get('u');
  
  console.log(`Email click tracked: Campaign ${campaignId}, Recipient ${recipientId}, Target URL ${targetUrl}, Tracking ID ${trackingId}`);
  
  if (!targetUrl) {
    return new Response("Missing target URL", { status: 400 });
  }
  
  try {
    if (trackingId && campaignId && recipientId) {
      // Record the click event
      const { error } = await req.supabaseClient
        .from("email_events")
        .insert({
          campaign_id: campaignId,
          recipient_id: recipientId,
          event_type: "clicked",
          event_data: { 
            tracking_id: trackingId,
            target_url: targetUrl,
            user_agent: req.headers.get("user-agent") || "",
            ip: req.headers.get("x-forwarded-for") || req.headers.get("cf-connecting-ip") || ""
          }
        });
        
      if (error) {
        console.error("Error recording click event:", error);
      }
      
      // Update the tracking record
      await req.supabaseClient
        .from("email_tracking")
        .update({ 
          clicked_at: new Date().toISOString(),
          clicked_url: targetUrl
        })
        .eq("tracking_id", trackingId);
        
      // Update campaign analytics
      await req.supabaseClient.rpc("increment_campaign_clicks", { campaign_id: campaignId });
    }
  } catch (error) {
    console.error("Error in email click tracking:", error);
  }
  
  // Redirect to the target URL
  return new Response(null, {
    status: 302,
    headers: {
      "Location": targetUrl,
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate"
    }
  });
});
