
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useEmailCampaignDetails } from '@/hooks/email/campaign/useEmailCampaignDetails';
import { EmailCampaign, EmailCampaignStatus } from '@/types/email';

export function useEmailCampaigns() {
  const { toast } = useToast();
  const { 
    createCampaign, 
    updateCampaign, 
    deleteCampaign, 
    isLoading: detailsLoading 
  } = useEmailCampaignDetails();
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    try {
      // @ts-ignore - Table exists in Supabase but not in TypeScript definitions
      const { data, error } = await supabase
        .from('email_campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setCampaigns(data);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      toast({
        title: 'Error',
        description: 'Failed to load campaigns',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const scheduleCampaign = useCallback(async (campaign: Partial<EmailCampaign>, scheduledDate: string) => {
    try {
      // Update with scheduled status and date
      const result = await updateCampaign(campaign.id!, {
        ...campaign,
        status: 'scheduled' as EmailCampaignStatus,
        scheduled_at: scheduledDate,
        scheduled_for: scheduledDate
      });
      
      if (result) {
        toast({
          title: 'Campaign Scheduled',
          description: `Campaign "${campaign.name}" has been scheduled for ${new Date(scheduledDate).toLocaleString()}`,
        });
        
        // Refresh campaign list
        await fetchCampaigns();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error scheduling campaign:', error);
      toast({
        title: 'Error',
        description: 'Failed to schedule campaign',
        variant: 'destructive',
      });
      return false;
    }
  }, [updateCampaign, fetchCampaigns, toast]);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  return {
    campaigns,
    loading: loading || detailsLoading,
    fetchCampaigns,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    scheduleCampaign
  };
}
