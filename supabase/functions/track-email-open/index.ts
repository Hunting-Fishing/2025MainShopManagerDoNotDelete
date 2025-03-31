
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
      // Parse user agent for device/client info
      const userAgent = req.headers.get("user-agent") || "";
      const ip = req.headers.get("x-forwarded-for") || req.headers.get("cf-connecting-ip") || "";
      
      // Get geolocation data from Cloudflare if available
      let geoData = {};
      if (req.cf) {
        geoData = {
          country: req.cf.country,
          city: req.cf.city,
          continent: req.cf.continent,
          latitude: req.cf.latitude,
          longitude: req.cf.longitude,
          region: req.cf.region,
          timezone: req.cf.timezone
        };
      }
      
      // Detect device type
      const isMobile = /Mobile|Android|iPhone|iPad|iPod|Windows Phone/i.test(userAgent);
      const isTablet = /Tablet|iPad/i.test(userAgent);
      const deviceType = isTablet ? 'tablet' : (isMobile ? 'mobile' : 'desktop');
      
      // Detect email client
      let emailClient = 'other';
      if (userAgent.includes('Thunderbird')) emailClient = 'thunderbird';
      else if (userAgent.includes('Outlook')) emailClient = 'outlook';
      else if (userAgent.includes('Apple-Mail')) emailClient = 'apple';
      else if (userAgent.includes('Gmail')) emailClient = 'gmail';
      else if (userAgent.includes('Yahoo')) emailClient = 'yahoo';
      
      // Create enhanced event data
      const eventData = { 
        tracking_id: trackingId,
        user_agent: userAgent,
        ip: ip,
        device_type: deviceType,
        email_client: emailClient,
        geo: geoData,
        timestamp: new Date().toISOString()
      };
      
      // Record the open event with enhanced data
      const { error } = await req.supabaseClient
        .from("email_events")
        .insert({
          campaign_id: campaignId,
          recipient_id: recipientId,
          event_type: "opened",
          event_data: eventData
        });
        
      if (error) {
        console.error("Error recording open event:", error);
      }
      
      // Update the tracking record
      await req.supabaseClient
        .from("email_tracking")
        .update({ 
          opened_at: new Date().toISOString(),
          device_type: deviceType,
          email_client: emailClient,
          country: geoData.country || null,
          city: geoData.city || null
        })
        .eq("tracking_id", trackingId);
        
      // Update campaign analytics
      await incrementCampaignOpens(req.supabaseClient, campaignId);
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

async function incrementCampaignOpens(supabase, campaignId) {
  try {
    // Get the current analytics
    const { data: analytics, error: getError } = await supabase
      .from("email_campaign_analytics")
      .select("opened, open_rate, sent")
      .eq("campaign_id", campaignId)
      .single();
    
    if (getError || !analytics) {
      console.error("Error fetching analytics:", getError);
      return;
    }
    
    // Calculate new values
    const opened = (analytics.opened || 0) + 1;
    const sent = analytics.sent || 0;
    const openRate = sent > 0 ? Math.round((opened / sent) * 100) : 0;
    
    // Update analytics
    const { error: updateError } = await supabase
      .from("email_campaign_analytics")
      .update({ 
        opened: opened,
        open_rate: openRate
      })
      .eq("campaign_id", campaignId);
    
    if (updateError) {
      console.error("Error updating analytics:", updateError);
    }
    
    // Also update the campaign
    await supabase
      .from("email_campaigns")
      .update({ opened: opened })
      .eq("id", campaignId);
      
  } catch (error) {
    console.error("Error in incrementCampaignOpens:", error);
  }
}
