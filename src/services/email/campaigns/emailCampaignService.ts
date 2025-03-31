
import { supabase } from '@/lib/supabase';
import { EmailCampaign, EmailCampaignStatus } from '@/types/email';

/**
 * Service for managing email campaigns
 */
export const emailCampaignService = {
  /**
   * Get a list of all email campaigns
   */
  async getCampaigns() {
    try {
      const { data, error } = await supabase
        .from('email_campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching email campaigns:', error);
      return { success: false, error };
    }
  },

  /**
   * Get a specific email campaign by ID
   */
  async getCampaignById(campaignId: string) {
    try {
      const { data, error } = await supabase
        .from('email_campaigns')
        .select('*')
        .eq('id', campaignId)
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching email campaign:', error);
      return { success: false, error };
    }
  },

  /**
   * Update an email campaign's status
   */
  async updateCampaignStatus(campaignId: string, status: EmailCampaignStatus) {
    try {
      const { data, error } = await supabase
        .from('email_campaigns')
        .update({ status })
        .eq('id', campaignId)
        .select();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error updating campaign status:', error);
      return { success: false, error };
    }
  },

  /**
   * Schedule an email campaign for future sending
   */
  async scheduleCampaign(campaignId: string, scheduledDate: string) {
    try {
      const { data, error } = await supabase
        .from('email_campaigns')
        .update({ 
          status: 'scheduled',
          scheduled_date: scheduledDate 
        })
        .eq('id', campaignId)
        .select();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error scheduling campaign:', error);
      return { success: false, error };
    }
  },

  /**
   * Trigger the immediate sending of an email campaign
   */
  async sendCampaignNow(campaignId: string) {
    try {
      // First update the campaign status
      const { error: updateError } = await supabase
        .from('email_campaigns')
        .update({ 
          status: 'sending',
        })
        .eq('id', campaignId);
      
      if (updateError) throw updateError;
      
      // Invoke the edge function to process the campaign
      const { data, error } = await supabase.functions.invoke('trigger-email-campaign', {
        body: { campaignId }
      });
      
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error sending campaign:', error);
      return { success: false, error };
    }
  }
};
