
import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  EmailCampaignAnalytics, 
  EmailCampaign,
  EmailCampaignTimelinePoint,
  EmailCampaignStatus,
  EmailABTest
} from '@/types/email';
import { useToast } from '@/hooks/use-toast';

interface GeoData {
  [country: string]: number;
}

interface DeviceData {
  desktop: number;
  mobile: number;
  tablet: number;
  other: number;
  emailClients?: {
    gmail: number;
    outlook: number;
    apple: number;
    yahoo: number;
    other: number;
  };
}

interface LinkData {
  [url: string]: number;
}

interface ComparisonDataPoint {
  id: string;
  name: string;
  openRate: number;
  clickRate: number;
  ctoRate: number;
}

export const useEmailCampaignAnalytics = () => {
  const [analytics, setAnalytics] = useState<EmailCampaignAnalytics | null>(null);
  const [campaignDetails, setCampaignDetails] = useState<EmailCampaign | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [geoData, setGeoData] = useState<GeoData | null>(null);
  const [deviceData, setDeviceData] = useState<DeviceData | null>(null);
  const [linkData, setLinkData] = useState<LinkData | null>(null);
  const [comparisonData, setComparisonData] = useState<ComparisonDataPoint[] | null>(null);
  const [selectedCampaignsForComparison, setSelectedCampaignsForComparison] = useState<string[]>([]);
  
  const { toast } = useToast();

  // Function to fetch aggregated analytics data
  const fetchAggregatedData = async (campaignId: string, dimension: string) => {
    try {
      const { data, error } = await supabase
        .from('email_analytics_aggregates')
        .select('*')
        .eq('campaign_id', campaignId)
        .eq('dimension', dimension);
      
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error(`Error fetching ${dimension} data:`, err);
      return [];
    }
  };

  const fetchCampaignAnalytics = useCallback(async (campaignId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch campaign details
      const { data: campaignData, error: campaignError } = await supabase
        .from('email_campaigns')
        .select('*')
        .eq('id', campaignId)
        .single();
      
      if (campaignError) throw campaignError;
      
      // Process recipient_ids to ensure it's an array
      let recipientIds: string[] = [];
      if (Array.isArray(campaignData.recipient_ids)) {
        recipientIds = campaignData.recipient_ids as string[];
      } else if (campaignData.recipient_ids) {
        try {
          const parsed = JSON.parse(campaignData.recipient_ids as string);
          if (Array.isArray(parsed)) {
            recipientIds = parsed;
          }
        } catch {
          // If parsing fails, use empty array
          recipientIds = [];
        }
      }
      
      // Process segment_ids to ensure it's an array
      let segmentIds: string[] = [];
      if (Array.isArray(campaignData.segment_ids)) {
        segmentIds = campaignData.segment_ids as string[];
      } else if (campaignData.segment_ids) {
        try {
          const parsed = JSON.parse(campaignData.segment_ids as string);
          if (Array.isArray(parsed)) {
            segmentIds = parsed;
          }
        } catch {
          // If parsing fails, use empty array
          segmentIds = [];
        }
      }
      
      // Process personalizations to ensure it's a Record<string, any>
      let personalizations: Record<string, any> = {};
      if (typeof campaignData.personalizations === 'object' && campaignData.personalizations !== null) {
        personalizations = campaignData.personalizations as Record<string, any>;
      } else if (campaignData.personalizations) {
        try {
          const parsed = JSON.parse(campaignData.personalizations as string);
          if (typeof parsed === 'object') {
            personalizations = parsed;
          }
        } catch {
          // If parsing fails, use empty object
          personalizations = {};
        }
      }
      
      // Process metadata to ensure it's a Record<string, any>
      let metadata: Record<string, any> = {};
      if (typeof campaignData.metadata === 'object' && campaignData.metadata !== null) {
        metadata = campaignData.metadata as Record<string, any>;
      } else if (campaignData.metadata) {
        try {
          const parsed = JSON.parse(campaignData.metadata as string);
          if (typeof parsed === 'object') {
            metadata = parsed;
          }
        } catch {
          // If parsing fails, use empty object
          metadata = {};
        }
      }
      
      // Process ab_test to ensure it's an EmailABTest or null
      let abTest: EmailABTest | null = null;
      if (typeof campaignData.ab_test === 'object' && campaignData.ab_test !== null) {
        // Validate the structure matches EmailABTest
        const testData = campaignData.ab_test as any;
        if (
          typeof testData.enabled === 'boolean' &&
          Array.isArray(testData.variants) &&
          typeof testData.winnerCriteria === 'string'
        ) {
          abTest = {
            enabled: testData.enabled,
            variants: testData.variants,
            winnerCriteria: testData.winnerCriteria as 'open_rate' | 'click_rate',
            winnerSelectionDate: testData.winnerSelectionDate,
            winnerId: testData.winnerId
          };
        }
      } else if (campaignData.ab_test) {
        try {
          const parsed = JSON.parse(campaignData.ab_test as string);
          if (
            typeof parsed === 'object' && 
            typeof parsed.enabled === 'boolean' && 
            Array.isArray(parsed.variants) && 
            typeof parsed.winnerCriteria === 'string'
          ) {
            abTest = {
              enabled: parsed.enabled,
              variants: parsed.variants,
              winnerCriteria: parsed.winnerCriteria as 'open_rate' | 'click_rate',
              winnerSelectionDate: parsed.winnerSelectionDate,
              winnerId: parsed.winnerId
            };
          }
        } catch {
          // If parsing fails, abTest remains null
        }
      }
      
      // Add the missing 'body' property to make it compatible with EmailCampaign
      const campaignWithBody: EmailCampaign = {
        ...campaignData,
        body: campaignData.content || '', // Using content as body or empty string if not available
        status: campaignData.status as EmailCampaignStatus, // Explicitly cast to EmailCampaignStatus
        recipient_ids: recipientIds,
        segment_ids: segmentIds,
        personalizations,
        metadata,
        ab_test: abTest
      };
      
      setCampaignDetails(campaignWithBody);
      
      // Fetch analytics data
      const { data: analyticsData, error: analyticsError } = await supabase
        .from('email_campaign_analytics')
        .select('*')
        .eq('campaign_id', campaignId)
        .single();
      
      if (analyticsError) throw analyticsError;
      
      // Get real-time events for timeline data
      const { data: eventsData, error: eventsError } = await supabase
        .from('email_events')
        .select('event_type, created_at, event_data')
        .eq('campaign_id', campaignId)
        .order('created_at', { ascending: true });
      
      if (eventsError) throw eventsError;
      
      // Process timeline data from real events
      const timelineMap = new Map<string, EmailCampaignTimelinePoint>();
      
      eventsData.forEach(event => {
        const date = new Date(event.created_at);
        const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD format
        
        if (!timelineMap.has(dateKey)) {
          timelineMap.set(dateKey, {
            date: dateKey,
            opens: 0,
            clicks: 0,
            unsubscribes: 0,
            complaints: 0
          });
        }
        
        const point = timelineMap.get(dateKey)!;
        
        if (event.event_type === 'opened') {
          point.opens += 1;
        } else if (event.event_type === 'clicked') {
          point.clicks += 1;
        } else if (event.event_type === 'unsubscribed') {
          point.unsubscribes += 1;
        } else if (event.event_type === 'complained') {
          point.complaints += 1;
        }
      });
      
      const timelineData = Array.from(timelineMap.values());
      
      // Format the analytics data
      const formattedAnalytics: EmailCampaignAnalytics = {
        id: analyticsData.id,
        name: analyticsData.name,
        campaign_id: analyticsData.campaign_id,
        sent: analyticsData.sent,
        delivered: analyticsData.delivered,
        opened: analyticsData.opened,
        clicked: analyticsData.clicked,
        bounced: analyticsData.bounced,
        complained: analyticsData.complained,
        unsubscribed: analyticsData.unsubscribed,
        open_rate: analyticsData.open_rate,
        click_rate: analyticsData.click_rate,
        click_to_open_rate: analyticsData.click_to_open_rate,
        bounced_rate: analyticsData.bounced_rate,
        unsubscribe_rate: analyticsData.unsubscribe_rate,
        timeline: timelineData,
        created_at: analyticsData.created_at,
        updated_at: analyticsData.updated_at
      };
      
      setAnalytics(formattedAnalytics);
      
      // Fetch real geo data
      const geoAggregates = await fetchAggregatedData(campaignId, 'country');
      if (geoAggregates.length > 0) {
        const geoMap: GeoData = {};
        geoAggregates.forEach(item => {
          geoMap[item.value] = item.count;
        });
        setGeoData(geoMap);
      } else {
        // Fallback for backward compatibility
        setGeoData({});
      }
      
      // Fetch real device data
      const deviceAggregates = await fetchAggregatedData(campaignId, 'device');
      if (deviceAggregates.length > 0) {
        const deviceMap: DeviceData = {
          desktop: 0,
          mobile: 0,
          tablet: 0,
          other: 0,
          emailClients: {
            gmail: 0,
            outlook: 0,
            apple: 0,
            yahoo: 0,
            other: 0
          }
        };
        
        deviceAggregates.forEach(item => {
          if (['desktop', 'mobile', 'tablet'].includes(item.value)) {
            deviceMap[item.value as keyof typeof deviceMap] = item.count;
          } else {
            deviceMap.other += item.count;
          }
        });
        
        // Fetch email client data
        const clientAggregates = await fetchAggregatedData(campaignId, 'email_client');
        if (clientAggregates.length > 0 && deviceMap.emailClients) {
          clientAggregates.forEach(item => {
            if (['gmail', 'outlook', 'apple', 'yahoo'].includes(item.value)) {
              deviceMap.emailClients![item.value as keyof typeof deviceMap.emailClients] = item.count;
            } else {
              deviceMap.emailClients!.other += item.count;
            }
          });
        }
        
        setDeviceData(deviceMap);
      } else {
        // Fallback empty data
        setDeviceData({
          desktop: 0,
          mobile: 0,
          tablet: 0,
          other: 0,
          emailClients: {
            gmail: 0,
            outlook: 0,
            apple: 0,
            yahoo: 0,
            other: 0
          }
        });
      }
      
      // Fetch link click data
      const linkAggregates = await fetchAggregatedData(campaignId, 'link');
      if (linkAggregates.length > 0) {
        const linkMap: LinkData = {};
        linkAggregates.forEach(item => {
          linkMap[item.value] = item.count;
        });
        setLinkData(linkMap);
      } else {
        setLinkData({});
      }
      
    } catch (err) {
      console.error('Error fetching campaign analytics:', err);
      setError(err as Error);
      toast({
        title: 'Error fetching analytics',
        description: (err as Error).message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);
  
  const compareCampaigns = useCallback(async (currentCampaignId: string, campaignIds?: string[]) => {
    setLoading(true);
    
    try {
      // If specific campaign IDs aren't provided, fetch recent campaigns
      if (!campaignIds || campaignIds.length === 0) {
        const { data: recentCampaigns, error } = await supabase
          .from('email_campaigns')
          .select('id, name, status')
          .eq('status', 'sent')
          .neq('id', currentCampaignId)
          .order('created_at', { ascending: false })
          .limit(5);
        
        if (error) throw error;
        
        campaignIds = recentCampaigns.map(c => c.id);
        setSelectedCampaignsForComparison(campaignIds);
      }
      
      // Include the current campaign in the comparison
      const allCampaignIds = [currentCampaignId, ...campaignIds];
      
      // Fetch analytics for all campaigns
      const { data: analyticsData, error: analyticsError } = await supabase
        .from('email_campaign_analytics')
        .select('campaign_id, name, open_rate, click_rate, click_to_open_rate')
        .in('campaign_id', allCampaignIds);
      
      if (analyticsError) throw analyticsError;
      
      // Format for chart display
      const comparisonDataPoints: ComparisonDataPoint[] = analyticsData.map(item => ({
        id: item.campaign_id,
        name: item.name,
        openRate: parseFloat(String(item.open_rate)),
        clickRate: parseFloat(String(item.click_rate)),
        ctoRate: parseFloat(String(item.click_to_open_rate))
      }));
      
      setComparisonData(comparisonDataPoints);
      
    } catch (err) {
      console.error('Error comparing campaigns:', err);
      toast({
        title: 'Error comparing campaigns',
        description: (err as Error).message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return {
    analytics,
    campaignDetails,
    loading,
    error,
    geoData,
    deviceData,
    linkData,
    fetchCampaignAnalytics,
    compareCampaigns,
    comparisonData,
    selectedCampaignsForComparison
  };
};
