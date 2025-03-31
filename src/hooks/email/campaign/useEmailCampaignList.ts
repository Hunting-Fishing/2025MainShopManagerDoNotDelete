
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { EmailCampaignPreview, EmailCampaignStatus } from '@/types/email';
import { useToast } from '@/hooks/use-toast';

export function useEmailCampaignList() {
  const [campaigns, setCampaigns] = useState<EmailCampaignPreview[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    try {
      // @ts-ignore - Table exists in Supabase but not in TypeScript definitions
      const { data, error } = await supabase
        .from('email_campaigns')
        .select('id, name, subject, status, scheduled_at, sent_at, created_at, updated_at, total_recipients, opened, clicked, ab_test')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      const formattedCampaigns: EmailCampaignPreview[] = data.map((campaign: any) => ({
        id: campaign.id,
        name: campaign.name,
        subject: campaign.subject,
        status: campaign.status as EmailCampaignStatus,
        scheduled_at: campaign.scheduled_at,
        sent_at: campaign.sent_at,
        created_at: campaign.created_at,
        updated_at: campaign.updated_at,
        total_recipients: campaign.total_recipients || 0,
        has_ab_test: !!campaign.ab_test,
        opened: campaign.opened || 0,
        clicked: campaign.clicked || 0,
        totalRecipients: campaign.total_recipients || 0,
        scheduledDate: campaign.scheduled_at,
        sentDate: campaign.sent_at
      }));

      setCampaigns(formattedCampaigns);
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

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  return { campaigns, loading, fetchCampaigns };
}
