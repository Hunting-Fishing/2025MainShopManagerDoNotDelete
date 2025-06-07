import { useState, useEffect } from 'react';
import { EmailCampaign } from '@/types/email';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { fetchCampaignAnalyticsData } from './utils/campaignAnalyticsUtils';

export const useEmailCampaignAnalytics = (campaignId: string | undefined) => {
  const [campaign, setCampaign] = useState<Partial<EmailCampaign>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchAnalytics = async (id?: string) => {
    if (!id && !campaignId) {
      console.warn("No campaign ID provided to fetchAnalytics");
      return;
    }
    
    const campaignIdToUse = id || campaignId;
    
    setLoading(true);
    setError(null);
    
    try {
      if (!campaignIdToUse) {
        throw new Error("Campaign ID is required to fetch analytics.");
      }
      
      const analyticsData = await fetchCampaignAnalyticsData(campaignIdToUse);
      setCampaign(analyticsData);
      return analyticsData;
    } catch (err) {
      console.error("Error fetching campaign analytics:", err);
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
      toast({
        title: "Error",
        description: "Failed to load email campaign analytics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (campaignId) {
      fetchAnalytics(campaignId);
    }
  }, [campaignId]);

  return { campaign, loading, error, fetchAnalytics };
};
