
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
      await req.supabaseClient.rpc("increment_campaign_clicks", { 
        campaign_id: campaignId,
        device_type: deviceType,
        country: geoData.country || null,
        url_domain: linkData.domain
      });
      
      // Also update analytics aggregates for various dimensions
      await updateAnalyticsAggregates(req.supabaseClient, campaignId, 'device', deviceType);
      await updateAnalyticsAggregates(req.supabaseClient, campaignId, 'link', linkData.domain);
      if (geoData.country) {
        await updateAnalyticsAggregates(req.supabaseClient, campaignId, 'country', geoData.country);
      }
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

async function updateAnalyticsAggregates(supabase, campaignId, dimension, value) {
  try {
    // Check if the aggregate record exists
    const { data: existing } = await supabase
      .from("email_analytics_aggregates")
      .select("*")
      .eq("campaign_id", campaignId)
      .eq("dimension", dimension)
      .eq("value", value)
      .single();
    
    if (existing) {
      // Update existing record
      await supabase
        .from("email_analytics_aggregates")
        .update({ count: existing.count + 1 })
        .eq("id", existing.id);
    } else {
      // Create new record
      await supabase
        .from("email_analytics_aggregates")
        .insert({
          campaign_id: campaignId,
          dimension: dimension,
          value: value,
          count: 1
        });
    }
  } catch (error) {
    console.error(`Error updating analytics aggregates for ${dimension}:`, error);
  }
}
