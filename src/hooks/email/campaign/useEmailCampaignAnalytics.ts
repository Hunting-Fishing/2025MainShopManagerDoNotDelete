
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

interface ComparisonDataPoint {
  id: string;
  name: string;
  openRate: number;
  clickRate: number;
  ctoRate: number;
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

// Helper to create synthetic geo data
const createSyntheticGeoData = (openedCount: number): GeoData => {
  return {
    'United States': Math.floor(openedCount * 0.4),
    'United Kingdom': Math.floor(openedCount * 0.15),
    'Canada': Math.floor(openedCount * 0.12),
    'Australia': Math.floor(openedCount * 0.08),
    'Germany': Math.floor(openedCount * 0.06),
    'France': Math.floor(openedCount * 0.05),
    'India': Math.floor(openedCount * 0.04),
    'Brazil': Math.floor(openedCount * 0.03),
    'Japan': Math.floor(openedCount * 0.02),
    'Other': Math.floor(openedCount * 0.05),
  };
};

// Helper to create synthetic device data
const createSyntheticDeviceData = (openedCount: number): DeviceData => {
  return {
    desktop: Math.floor(openedCount * 0.45),
    mobile: Math.floor(openedCount * 0.4),
    tablet: Math.floor(openedCount * 0.1),
    other: Math.floor(openedCount * 0.05),
    emailClients: {
      gmail: Math.floor(openedCount * 0.35),
      outlook: Math.floor(openedCount * 0.25),
      apple: Math.floor(openedCount * 0.2),
      yahoo: Math.floor(openedCount * 0.1),
      other: Math.floor(openedCount * 0.1)
    }
  };
};

// Main hook
export const useEmailCampaignAnalytics = () => {
  const [analytics, setAnalytics] = useState<EmailCampaignAnalytics | null>(null);
  const [campaignDetails, setCampaignDetails] = useState<EmailCampaign | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [geoData, setGeoData] = useState<GeoData | null>(null);
  const [deviceData, setDeviceData] = useState<DeviceData | null>(null);
  const [comparisonData, setComparisonData] = useState<ComparisonDataPoint[] | null>(null);
  const [selectedCampaignsForComparison, setSelectedCampaignsForComparison] = useState<string[]>([]);
  
  const { toast } = useToast();

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
      
      // Create synthetic data based on analytics
      setGeoData(createSyntheticGeoData(analyticsData.opened));
      setDeviceData(createSyntheticDeviceData(analyticsData.opened));
      
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
    fetchCampaignAnalytics,
    compareCampaigns,
    comparisonData,
    selectedCampaignsForComparison
  };
};
