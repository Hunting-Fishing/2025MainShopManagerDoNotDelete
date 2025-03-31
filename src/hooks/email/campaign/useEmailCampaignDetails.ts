import { useState } from 'react';
import { EmailCampaign } from '@/types/email';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { validateCampaignStatus, parseJsonField, parseABTest } from './utils/emailCampaignUtils';
import { abTestingService } from '@/services/email';

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
        segment_id: undefined,
        recipient_ids: recipient_ids,
        recipientIds: recipient_ids,
        personalizations: personalizations,
        metadata: metadata,
        abTest: ab_test,
        ab_test: ab_test,
        scheduled_at: data.scheduled_date,
        scheduledAt: data.scheduled_date,
        sent_at: data.sent_date,
        sentAt: data.sent_date,
        created_at: data.created_at,
        createdAt: data.created_at,
        updated_at: data.updated_at,
        updatedAt: data.updated_at,
        totalRecipients: data.total_recipients,
        total_recipients: data.total_recipients,
        opened: data.opened,
        clicked: data.clicked
      };
      
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

  const fetchCampaignAnalytics = async (campaignId: string) => {
    setAnalyticsLoading(true);
    try {
      const { data: analyticsData, error: analyticsError } = await supabase
        .from('email_campaign_analytics')
        .select('*')
        .eq('campaign_id', campaignId)
        .single();
      
      if (analyticsError && analyticsError.code !== 'PGRST116') {
        throw analyticsError;
      }
      
      if (analyticsData) {
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

      updateABTestVariantMetrics(campaignId).catch(console.error);
      
    } catch (error) {
      console.error("Error fetching campaign analytics:", error);
      toast({
        title: "Error",
        description: "Failed to load campaign analytics",
        variant: "destructive",
      });
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const updateABTestVariantMetrics = async (campaignId: string) => {
    const currentCampaign = campaign || await fetchCampaignDetails(campaignId);
    if (!currentCampaign?.abTest?.enabled) return;

    try {
      const variants = currentCampaign.abTest.variants;
      const updatedVariants = await Promise.all(variants.map(async (variant) => {
        // @ts-ignore - custom query
        const { data: events } = await supabase
          .from('email_events')
          .select('*')
          .eq('campaign_id', campaignId)
          .eq('event_type', 'opened');
        
        const variantEvents = events?.filter(event => 
          event.event_data && 
          typeof event.event_data === 'object' && 
          'variant_id' in event.event_data && 
          event.event_data.variant_id === variant.id
        ) || [];
        
        const openCount = variantEvents.length;
        
        // @ts-ignore - custom query
        const { data: clickEvents } = await supabase
          .from('email_events')
          .select('*')
          .eq('campaign_id', campaignId)
          .eq('event_type', 'clicked');
        
        const variantClickEvents = clickEvents?.filter(event => 
          event.event_data && 
          typeof event.event_data === 'object' && 
          'variant_id' in event.event_data && 
          event.event_data.variant_id === variant.id
        ) || [];
        
        const clickCount = variantClickEvents.length;
        
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

  const selectABTestWinner = async (campaignId: string, forceWinnerId?: string) => {
    setAbTestLoading(true);
    try {
      if (!campaign?.abTest?.enabled) {
        throw new Error("A/B testing is not enabled for this campaign");
      }

      const { data, error } = await abTestingService.selectABTestWinner(campaignId, forceWinnerId);
      
      if (error || !data) {
        throw new Error(error || "Failed to determine a winner");
      }

      const winnerId = data.winnerId;
      const winnerSelectionDate = data.winnerSelectionDate;
      const confidenceLevel = data.confidenceLevel;

      if (!winnerId) {
        throw new Error("Failed to determine a winner");
      }

      setCampaign(prevCampaign => {
        if (!prevCampaign || !prevCampaign.abTest) return prevCampaign;
        
        const updatedVariants = prevCampaign.abTest.variants.map(variant => {
          const isWinner = variant.id === winnerId;
          
          let improvement = undefined;
          if (isWinner) {
            const winnerMetric = prevCampaign.abTest.winnerCriteria === 'open_rate' 
              ? variant.metrics?.openRate 
              : variant.metrics?.clickRate;
              
            const otherVariants = prevCampaign.abTest.variants.filter(v => v.id !== winnerId);
            const otherMetrics = otherVariants.map(v => 
              prevCampaign.abTest.winnerCriteria === 'open_rate' 
                ? v.metrics?.openRate 
                : v.metrics?.clickRate
            ).filter(rate => rate !== undefined);
            
            const avgOtherRate = otherMetrics.length > 0 
              ? otherMetrics.reduce((sum, rate) => sum + (rate || 0), 0) / otherMetrics.length 
              : 0;
            
            if (winnerMetric && avgOtherRate > 0) {
              improvement = ((winnerMetric - avgOtherRate) / avgOtherRate) * 100;
            }
          }
          
          return {
            ...variant,
            improvement: isWinner ? improvement : undefined
          };
        });
        
        return {
          ...prevCampaign,
          abTest: {
            ...prevCampaign.abTest,
            winnerId: winnerId,
            winnerSelectionDate: winnerSelectionDate,
            variants: updatedVariants,
            confidenceLevel
          }
        };
      });

      toast({
        title: "Winner Selected",
        description: `A/B test winner has been selected${confidenceLevel ? ` with ${confidenceLevel}% confidence` : ''}`,
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
