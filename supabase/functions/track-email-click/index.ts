
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
      
      // Extract link content/type information
      const linkData = {
        full_url: targetUrl,
        domain: new URL(targetUrl).hostname,
        path: new URL(targetUrl).pathname,
        timestamp: new Date().toISOString()
      };
      
      // Create enhanced event data
      const eventData = { 
        tracking_id: trackingId,
        target_url: targetUrl,
        user_agent: userAgent,
        ip: ip,
        device_type: deviceType,
        email_client: emailClient,
        geo: geoData,
        link_data: linkData
      };
      
      // Record the click event with enhanced data
      const { error } = await req.supabaseClient
        .from("email_events")
        .insert({
          campaign_id: campaignId,
          recipient_id: recipientId,
          event_type: "clicked",
          event_data: eventData
        });
        
      if (error) {
        console.error("Error recording click event:", error);
      }
      
      // Update the tracking record
      await req.supabaseClient
        .from("email_tracking")
        .update({ 
          clicked_at: new Date().toISOString(),
          clicked_url: targetUrl,
          device_type: deviceType,
          email_client: emailClient,
          country: geoData.country || null,
          city: geoData.city || null
        })
        .eq("tracking_id", trackingId);
        
      // Update campaign analytics
      await incrementCampaignClicks(req.supabaseClient, campaignId);
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

async function incrementCampaignClicks(supabase, campaignId) {
  try {
    // Get the current analytics
    const { data: analytics, error: getError } = await supabase
      .from("email_campaign_analytics")
      .select("clicked, click_rate, opened, click_to_open_rate, sent")
      .eq("campaign_id", campaignId)
      .single();
    
    if (getError || !analytics) {
      console.error("Error fetching analytics:", getError);
      return;
    }
    
    // Calculate new values
    const clicked = (analytics.clicked || 0) + 1;
    const sent = analytics.sent || 0;
    const opened = analytics.opened || 0;
    const clickRate = sent > 0 ? Math.round((clicked / sent) * 100) : 0;
    const clickToOpenRate = opened > 0 ? Math.round((clicked / opened) * 100) : 0;
    
    // Update analytics
    const { error: updateError } = await supabase
      .from("email_campaign_analytics")
      .update({ 
        clicked: clicked,
        click_rate: clickRate,
        click_to_open_rate: clickToOpenRate
      })
      .eq("campaign_id", campaignId);
    
    if (updateError) {
      console.error("Error updating analytics:", updateError);
    }
    
    // Also update the campaign
    await supabase
      .from("email_campaigns")
      .update({ clicked: clicked })
      .eq("id", campaignId);
      
  } catch (error) {
    console.error("Error in incrementCampaignClicks:", error);
  }
}
