
import { useState } from 'react';
import { EmailCampaign } from '@/types/email';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { validateCampaignStatus, parseJsonField, parseABTest } from './utils/emailCampaignUtils';

export const useEmailCampaignDetails = () => {
  const [campaign, setCampaign] = useState<EmailCampaign | null>(null);
  const [loading, setLoading] = useState(false);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [abTestLoading, setAbTestLoading] = useState(false);
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

      // Update A/B test variant data if A/B testing is enabled
      updateABTestVariantMetrics(campaignId).catch(console.error);
      
    } catch (error) {
      console.error("Error fetching campaign analytics:", error);
      // Don't show toast for analytics errors to avoid disrupting the UI
    } finally {
      setAnalyticsLoading(false);
    }
  };

  // Update A/B test variant metrics based on current data
  const updateABTestVariantMetrics = async (campaignId: string) => {
    const currentCampaign = campaign || await fetchCampaignDetails(campaignId);
    if (!currentCampaign?.abTest?.enabled) return;

    try {
      const variants = currentCampaign.abTest.variants;
      const updatedVariants = await Promise.all(variants.map(async (variant) => {
        // Get open and click counts for this variant
        const { data: openData } = await supabase.rpc(
          'count_email_events',
          { 
            campaign_id_param: campaignId,
            event_type_param: 'opened',
            variant_id_param: variant.id
          }
        );
        
        const { data: clickData } = await supabase.rpc(
          'count_email_events',
          { 
            campaign_id_param: campaignId,
            event_type_param: 'clicked',
            variant_id_param: variant.id
          }
        );

        const openCount = openData || 0;
        const clickCount = clickData || 0;
        
        // Calculate metrics
        const openRate = variant.recipients > 0 ? openCount / variant.recipients : 0;
        const clickRate = variant.recipients > 0 ? clickCount / variant.recipients : 0;
        const clickToOpenRate = openCount > 0 ? clickCount / openCount : 0;
        
        return {
          ...variant,
          opened: openCount,
          clicked: clickCount,
          metrics: {
            openRate: openRate,
            clickRate: clickRate,
            clickToOpenRate: clickToOpenRate
          }
        };
      }));

      // Update campaign state with new variant data
      setCampaign(prevCampaign => {
        if (!prevCampaign || !prevCampaign.abTest) return prevCampaign;
        
        return {
          ...prevCampaign,
          abTest: {
            ...prevCampaign.abTest,
            variants: updatedVariants
          }
        };
      });
    } catch (error) {
      console.error("Error updating A/B test metrics:", error);
    }
  };

  // Select a winner for an A/B test
  const selectABTestWinner = async (campaignId: string, forceWinnerId?: string) => {
    setAbTestLoading(true);
    try {
      if (!campaign?.abTest?.enabled) {
        throw new Error("A/B testing is not enabled for this campaign");
      }

      let winnerId: string;

      if (forceWinnerId) {
        // Manually select the specified variant as winner
        winnerId = forceWinnerId;
      } else {
        // Use database function to calculate winner based on criteria
        const { data, error } = await supabase.rpc(
          'calculate_ab_test_winner',
          { 
            campaign_id: campaignId,
            criteria: campaign.abTest.winnerCriteria
          }
        );
        
        if (error) throw error;
        winnerId = data;
      }

      if (!winnerId) {
        throw new Error("Failed to determine a winner");
      }

      // Update local state
      setCampaign(prevCampaign => {
        if (!prevCampaign || !prevCampaign.abTest) return prevCampaign;
        
        return {
          ...prevCampaign,
          abTest: {
            ...prevCampaign.abTest,
            winnerId: winnerId,
            winnerSelectionDate: new Date().toISOString()
          }
        };
      });

      toast({
        title: "Winner Selected",
        description: "A/B test winner has been selected successfully",
      });

      return winnerId;
    } catch (error) {
      console.error("Error selecting A/B test winner:", error);
      toast({
        title: "Error",
        description: "Failed to select A/B test winner",
        variant: "destructive",
      });
      return null;
    } finally {
      setAbTestLoading(false);
    }
  };

  return {
    campaign,
    loading: loading || analyticsLoading || abTestLoading,
    fetchCampaignDetails,
    fetchCampaignAnalytics,
    selectABTestWinner,
    updateABTestVariantMetrics
  };
};
