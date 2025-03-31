
import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  EmailCampaignAnalytics, 
  EmailCampaign,
  EmailCampaignTimelinePoint
} from '@/types/email';
import { useToast } from '@/hooks/use-toast';
import { validateCampaignStatus, parseJsonField, parseABTest } from './utils/emailCampaignUtils';

// Interfaces for different data types
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

interface AnalyticsAggregate {
  id: string;
  campaign_id: string;
  dimension: string;
  value: string;
  count: number;
  created_at: string;
}

// Helper function to parse campaign details
const parseCampaignDetails = (campaignData: any): EmailCampaign => {
  // Process recipient_ids and segment_ids
  const recipientIds = parseJsonField(campaignData.recipient_ids, []);
  const segmentIds = parseJsonField(campaignData.segment_ids, []);
  
  // Process personalizations and metadata
  const personalizations = parseJsonField(campaignData.personalizations, {});
  const metadata = parseJsonField(campaignData.metadata, {});
  
  // Process ab_test
  const abTest = parseABTest(campaignData.ab_test);

  return {
    id: campaignData.id,
    name: campaignData.name,
    subject: campaignData.subject,
    body: campaignData.content || '',
    content: campaignData.content,
    status: validateCampaignStatus(campaignData.status),
    template_id: campaignData.template_id,
    segment_ids: segmentIds,
    segment_id: undefined, // Not in the database schema
    recipient_ids: recipientIds,
    recipientIds: recipientIds,
    personalizations: personalizations,
    metadata: metadata,
    abTest: abTest,
    ab_test: abTest,
    scheduled_at: campaignData.scheduled_date,
    sent_at: campaignData.sent_date,
    created_at: campaignData.created_at,
    updated_at: campaignData.updated_at,
    totalRecipients: campaignData.total_recipients,
    total_recipients: campaignData.total_recipients,
    opened: campaignData.opened,
    clicked: campaignData.clicked,
    scheduledDate: campaignData.scheduled_date,
    sentDate: campaignData.sent_date
  };
};

// Helper function to parse timeline data
const parseTimelineData = (analyticsData: any): EmailCampaignTimelinePoint[] => {
  if (Array.isArray(analyticsData.timeline)) {
    return analyticsData.timeline.map((point: any) => ({
      date: point.date || '',
      opens: point.opens || 0,
      clicks: point.clicks || 0,
      unsubscribes: point.unsubscribes || 0,
      complaints: point.complaints || 0
    }));
  } 
  
  const parsed = parseJsonField(analyticsData.timeline, []);
  if (Array.isArray(parsed)) {
    return parsed.map(point => ({
      date: point.date || '',
      opens: point.opens || 0,
      clicks: point.clicks || 0,
      unsubscribes: point.unsubscribes || 0,
      complaints: point.complaints || 0
    }));
  }
  
  return [];
};

// Main hook
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
  const fetchAggregatedData = async (campaignId: string, dimension: string): Promise<AnalyticsAggregate[]> => {
    try {
      // We have to use RPC because the table may not be in the TypeScript definitions yet
      const { data, error } = await supabase
        .rpc('get_campaign_analytics_by_dimension', {
          campaign_id_param: campaignId,
          dimension_param: dimension
        });
      
      if (error) {
        console.error(`Error fetching ${dimension} data:`, error);
        // Try alternative direct query as fallback
        try {
          const { data: directData, error: directError } = await supabase
            .from('email_analytics_aggregates')
            .select('*')
            .eq('campaign_id', campaignId)
            .eq('dimension', dimension);
            
          if (directError) throw directError;
          return directData as AnalyticsAggregate[];
        } catch (fallbackError) {
          console.error('Fallback query failed:', fallbackError);
          return [];
        }
      }
      
      return data || [];
    } catch (err) {
      console.error(`Error fetching ${dimension} data:`, err);
      return [];
    }
  };

  // Fetch campaign analytics data
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
      
      // Process campaign data
      const formattedCampaign = parseCampaignDetails(campaignData);
      setCampaignDetails(formattedCampaign);
      
      // Fetch analytics data
      const { data: analyticsData, error: analyticsError } = await supabase
        .from('email_campaign_analytics')
        .select('*')
        .eq('campaign_id', campaignId)
        .single();
      
      if (analyticsError) throw analyticsError;
      
      // Parse timeline data
      const timelineData = parseTimelineData(analyticsData);
      
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
        geoAggregates.forEach((item: AnalyticsAggregate) => {
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
        
        deviceAggregates.forEach((item: AnalyticsAggregate) => {
          if (['desktop', 'mobile', 'tablet'].includes(item.value)) {
            deviceMap[item.value as keyof Pick<DeviceData, 'desktop' | 'mobile' | 'tablet' | 'other'>] = item.count;
          } else {
            deviceMap.other += item.count;
          }
        });
        
        // Fetch email client data
        const clientAggregates = await fetchAggregatedData(campaignId, 'email_client');
        if (clientAggregates.length > 0 && deviceMap.emailClients) {
          clientAggregates.forEach((item: AnalyticsAggregate) => {
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
        linkAggregates.forEach((item: AnalyticsAggregate) => {
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
  
  // Compare campaigns
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
      const comparisonDataPoints: ComparisonDataPoint[] = analyticsData.map((item: any) => ({
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
