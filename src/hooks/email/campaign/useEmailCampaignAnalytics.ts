
import { useState } from 'react';
import { EmailCampaignAnalytics, EmailCampaignTimelinePoint } from '@/types/email';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export const useEmailCampaignAnalytics = () => {
  const [analytics, setAnalytics] = useState<EmailCampaignAnalytics | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const { toast } = useToast();

  const fetchCampaignAnalytics = async (campaignId: string) => {
    setAnalyticsLoading(true);
    try {
      const { data, error } = await supabase
        .from('email_campaign_analytics')
        .select('*')
        .eq('campaign_id', campaignId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') { // Not found error
          // Create placeholder analytics
          return createPlaceholderAnalytics(campaignId);
        }
        throw error;
      }

      // Parse timeline JSON
      let timeline: EmailCampaignTimelinePoint[] = [];
      try {
        if (data.timeline) {
          const timelineStr = typeof data.timeline === 'string' 
            ? data.timeline 
            : JSON.stringify(data.timeline);
          timeline = JSON.parse(timelineStr) as EmailCampaignTimelinePoint[];
        }
      } catch (e) {
        console.error("Error parsing timeline:", e);
        timeline = [];
      }

      const formattedAnalytics: EmailCampaignAnalytics = {
        id: data.id,
        name: data.name || '',
        campaign_id: data.campaign_id,
        sent: data.sent || 0,
        delivered: data.delivered || 0,
        opened: data.opened || 0,
        clicked: data.clicked || 0,
        bounced: data.bounced || 0,
        complained: data.complained || 0,
        unsubscribed: data.unsubscribed || 0,
        open_rate: data.open_rate || 0,
        click_rate: data.click_rate || 0,
        click_to_open_rate: data.click_to_open_rate || 0,
        bounced_rate: data.bounced_rate || 0,
        unsubscribe_rate: data.unsubscribe_rate || 0,
        timeline: timeline,
        created_at: data.created_at,
        updated_at: data.updated_at
      };
      
      setAnalytics(formattedAnalytics);
      return formattedAnalytics;
    } catch (error) {
      console.error("Error fetching campaign analytics:", error);
      toast({
        title: "Error",
        description: "Failed to load campaign analytics",
        variant: "destructive",
      });
      return null;
    } finally {
      setAnalyticsLoading(false);
    }
  };

  // Helper to create placeholder analytics when none exist
  const createPlaceholderAnalytics = (campaignId: string): EmailCampaignAnalytics => {
    const now = new Date().toISOString();
    const placeholderAnalytics: EmailCampaignAnalytics = {
      id: 'placeholder',
      name: '',
      campaign_id: campaignId,
      sent: 0,
      delivered: 0,
      opened: 0,
      clicked: 0,
      bounced: 0,
      complained: 0,
      unsubscribed: 0,
      open_rate: 0,
      click_rate: 0,
      click_to_open_rate: 0,
      bounced_rate: 0,
      unsubscribe_rate: 0,
      timeline: [],
      created_at: now,
      updated_at: now
    };
    
    setAnalytics(placeholderAnalytics);
    return placeholderAnalytics;
  };

  return {
    analytics,
    analyticsLoading,
    fetchCampaignAnalytics
  };
};
