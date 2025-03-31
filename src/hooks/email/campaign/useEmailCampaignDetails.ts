
import { useState } from 'react';
import { EmailCampaign } from '@/types/email';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { validateCampaignStatus, parseJsonField, parseABTest } from './utils/emailCampaignUtils';

export const useEmailCampaignDetails = () => {
  const [campaign, setCampaign] = useState<EmailCampaign | null>(null);
  const [loading, setLoading] = useState(false);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const { toast } = useToast();

  const fetchCampaignDetails = async (campaignId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('email_campaigns')
        .select('*')
        .eq('id', campaignId)
        .single();

      if (error) throw error;

      // Parse JSON fields
      const segment_ids = parseJsonField(data.segment_ids, []);
      const recipient_ids = parseJsonField(data.recipient_ids, []);
      const personalizations = parseJsonField(data.personalizations, {});
      const metadata = parseJsonField(data.metadata, {});
      const ab_test = parseABTest(data.ab_test);
      
      const formattedCampaign: EmailCampaign = {
        id: data.id,
        name: data.name,
        subject: data.subject,
        body: data.content || '',
        content: data.content,
        status: validateCampaignStatus(data.status),
        template_id: data.template_id,
        segment_ids: segment_ids,
        segment_id: undefined, // This isn't in the database, but included in the interface
        recipient_ids: recipient_ids,
        recipientIds: recipient_ids,
        personalizations: personalizations,
        metadata: metadata,
        abTest: ab_test,
        ab_test: ab_test,
        scheduled_at: data.scheduled_date,
        sent_at: data.sent_date,
        created_at: data.created_at,
        updated_at: data.updated_at,
        totalRecipients: data.total_recipients,
        total_recipients: data.total_recipients,
        opened: data.opened,
        clicked: data.clicked,
        scheduledDate: data.scheduled_date,
        sentDate: data.sent_date
      };
      
      // Fetch latest analytics data
      fetchCampaignAnalytics(campaignId).catch(console.error);
      
      setCampaign(formattedCampaign);
      return formattedCampaign;
    } catch (error) {
      console.error("Error fetching campaign details:", error);
      toast({
        title: "Error",
        description: "Failed to load campaign details",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Fetch the latest analytics data for a campaign
  const fetchCampaignAnalytics = async (campaignId: string) => {
    setAnalyticsLoading(true);
    try {
      // First check for analytics in the dedicated analytics table
      const { data: analyticsData, error: analyticsError } = await supabase
        .from('email_campaign_analytics')
        .select('*')
        .eq('campaign_id', campaignId)
        .single();
      
      if (analyticsError && analyticsError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        throw analyticsError;
      }
      
      if (analyticsData) {
        // Update the campaign with analytics data
        setCampaign(prevCampaign => {
          if (!prevCampaign) return null;
          
          return {
            ...prevCampaign,
            opened: analyticsData.opened,
            clicked: analyticsData.clicked,
            totalRecipients: analyticsData.sent,
            total_recipients: analyticsData.sent
          };
        });
      } else {
        // If no analytics data, check for events directly
        // Using RPC calls instead of direct table access to avoid type errors
        const { data: openData, error: openError } = await supabase.rpc(
          'count_email_events',
          { 
            campaign_id_param: campaignId,
            event_type_param: 'opened'
          }
        );
        
        const { data: clickData, error: clickError } = await supabase.rpc(
          'count_email_events',
          { 
            campaign_id_param: campaignId,
            event_type_param: 'clicked'
          }
        );
          
        if (openError) throw openError;
        if (clickError) throw clickError;
        
        const openCount = openData;
        const clickCount = clickData;
        
        if (openCount !== null || clickCount !== null) {
          setCampaign(prevCampaign => {
            if (!prevCampaign) return null;
            
            return {
              ...prevCampaign,
              opened: openCount || 0,
              clicked: clickCount || 0
            };
          });
        }
      }
    } catch (error) {
      console.error("Error fetching campaign analytics:", error);
      // Don't show toast for analytics errors to avoid disrupting the UI
    } finally {
      setAnalyticsLoading(false);
    }
  };

  return {
    campaign,
    loading: loading || analyticsLoading,
    fetchCampaignDetails,
    fetchCampaignAnalytics
  };
};
