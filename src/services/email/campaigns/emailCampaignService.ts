import { supabase } from '@/lib/supabase';
import { EmailCampaign, EmailABTest } from '@/types/email';
import { GenericResponse } from '../utils/supabaseHelper';

/**
 * Service for managing email campaigns
 */
export const emailCampaignService = {
  /**
   * Get all email campaigns
   */
  async getCampaigns(): Promise<GenericResponse<EmailCampaign[]>> {
    try {
      const { data, error } = await supabase
        .from('email_campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { data: data as EmailCampaign[], error: null };
    } catch (error) {
      console.error('Error getting email campaigns:', error);
      return { data: null, error };
    }
  },

  /**
   * Get a campaign by ID
   */
  async getCampaignById(campaignId: string): Promise<GenericResponse<EmailCampaign>> {
    try {
      const { data, error } = await supabase
        .from('email_campaigns')
        .select('*')
        .eq('id', campaignId)
        .single();

      if (error) throw error;

      return { data: data as EmailCampaign, error: null };
    } catch (error) {
      console.error(`Error getting email campaign ${campaignId}:`, error);
      return { data: null, error };
    }
  },

  /**
   * Create a new email campaign
   */
  async createCampaign(campaign: Partial<EmailCampaign>): Promise<GenericResponse<EmailCampaign>> {
    try {
      // Convert the ab_test object to a JSON string if present
      let abTestJson = null;
      if (campaign.abTest || campaign.ab_test) {
        abTestJson = JSON.stringify(campaign.abTest || campaign.ab_test);
      }

      const { data, error } = await supabase
        .from('email_campaigns')
        .insert({
          name: campaign.name,
          subject: campaign.subject,
          content: campaign.content || campaign.body,
          status: 'draft',
          template_id: campaign.template_id || campaign.templateId,
          segment_ids: campaign.segment_ids || campaign.segmentIds || [],
          recipient_ids: campaign.recipient_ids || campaign.recipientIds || [],
          personalizations: campaign.personalizations || {},
          metadata: campaign.metadata || {},
          ab_test: abTestJson
        })
        .select()
        .single();
    
      if (error) throw error;

      return { data: data as EmailCampaign, error: null };
    } catch (error) {
      console.error('Error creating email campaign:', error);
      return { data: null, error };
    }
  },

  /**
   * Update an existing email campaign
   */
  async updateCampaign(
    campaignId: string,
    campaign: Partial<EmailCampaign>
  ): Promise<GenericResponse<EmailCampaign>> {
    try {
      const { data, error } = await supabase
        .from('email_campaigns')
        .update({
          name: campaign.name,
          subject: campaign.subject,
          content: campaign.content || campaign.body,
          status: campaign.status,
          template_id: campaign.template_id || campaign.templateId,
          segment_ids: campaign.segment_ids || campaign.segmentIds,
          recipient_ids: campaign.recipient_ids || campaign.recipientIds,
          personalizations: campaign.personalizations,
          metadata: campaign.metadata,
          ab_test: campaign.ab_test as any
        })
        .eq('id', campaignId)
        .select()
        .single();

      if (error) throw error;

      return { data: data as EmailCampaign, error: null };
    } catch (error) {
      console.error(`Error updating email campaign ${campaignId}:`, error);
      return { data: null, error };
    }
  },

  /**
   * Delete an email campaign
   */
  async deleteCampaign(campaignId: string): Promise<GenericResponse<boolean>> {
    try {
      const { error } = await supabase
        .from('email_campaigns')
        .delete()
        .eq('id', campaignId);

      if (error) throw error;

      return { data: true, error: null };
    } catch (error) {
      console.error(`Error deleting email campaign ${campaignId}:`, error);
      return { data: false, error };
    }
  }
};
