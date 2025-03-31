
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

// Create a transparent 1x1 pixel GIF
const TRANSPARENT_GIF = Uint8Array.from([
  0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00, 0x01, 0x00, 0x80, 0x00, 0x00, 0xff, 0xff, 0xff,
  0x00, 0x00, 0x00, 0x2c, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0x02, 0x02, 0x44,
  0x01, 0x00, 0x3b
]);

serve(async (req) => {
  // Get tracking params from URL
  const url = new URL(req.url);
  const trackingId = url.searchParams.get('t');
  const campaignId = url.searchParams.get('c');
  const recipientId = url.searchParams.get('r');
  
  console.log(`Email open tracked: Campaign ${campaignId}, Recipient ${recipientId}, Tracking ID ${trackingId}`);
  
  try {
    if (trackingId && campaignId && recipientId) {
      // Record the open event
      const { error } = await req.supabaseClient
        .from("email_events")
        .insert({
          campaign_id: campaignId,
          recipient_id: recipientId,
          event_type: "opened",
          event_data: { 
            tracking_id: trackingId,
            user_agent: req.headers.get("user-agent") || "",
            ip: req.headers.get("x-forwarded-for") || req.headers.get("cf-connecting-ip") || ""
          }
        });
        
      if (error) {
        console.error("Error recording open event:", error);
      }
      
      // Update the tracking record
      await req.supabaseClient
        .from("email_tracking")
        .update({ opened_at: new Date().toISOString() })
        .eq("tracking_id", trackingId);
        
      // Update campaign analytics
      await req.supabaseClient.rpc("increment_campaign_opens", { campaign_id: campaignId });
    }
  } catch (error) {
    console.error("Error in email open tracking:", error);
  }
  
  // Return a transparent GIF image regardless of whether tracking succeeded
  return new Response(TRANSPARENT_GIF, {
    status: 200,
    headers: {
      "Content-Type": "image/gif",
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      "Pragma": "no-cache",
      "Expires": "0"
    }
  });
});
