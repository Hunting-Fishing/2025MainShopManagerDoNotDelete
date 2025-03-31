
import { useState } from 'react';
import { EmailCampaign } from '@/types/email';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export const useEmailCampaignDetails = () => {
  const [campaign, setCampaign] = useState<EmailCampaign | null>(null);
  const [loading, setLoading] = useState(false);
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
      let segment_ids: string[] = [];
      let recipient_ids: string[] = [];
      let personalizations: Record<string, any> = {};
      let metadata: Record<string, any> = {};
      let ab_test = null;

      try {
        // Parse segment_ids
        if (data.segment_ids) {
          segment_ids = parseJsonField(data.segment_ids, []);
        }
        
        // Parse recipient_ids
        if (data.recipient_ids) {
          recipient_ids = parseJsonField(data.recipient_ids, []);
        }
        
        // Parse personalizations
        if (data.personalizations) {
          personalizations = parseJsonField(data.personalizations, {});
        }
        
        // Parse metadata
        if (data.metadata) {
          metadata = parseJsonField(data.metadata, {});
        }
        
        // Parse AB test
        if (data.ab_test) {
          ab_test = parseJsonField(data.ab_test, null);
        }
      } catch (e) {
        console.error("Error parsing campaign JSON fields:", e);
      }
      
      const formattedCampaign: EmailCampaign = {
        id: data.id,
        name: data.name,
        subject: data.subject,
        body: data.content || '',
        content: data.content,
        status: data.status,
        template_id: data.template_id,
        segment_ids: segment_ids,
        segment_id: data.segment_id,
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

  // Helper function to parse JSON fields
  const parseJsonField = (field: any, defaultValue: any) => {
    try {
      const fieldStr = typeof field === 'string' ? field : JSON.stringify(field);
      const parsed = JSON.parse(fieldStr);
      return parsed;
    } catch (e) {
      console.error("Error parsing JSON field:", e);
      return defaultValue;
    }
  };

  return {
    campaign,
    loading,
    fetchCampaignDetails
  };
};
