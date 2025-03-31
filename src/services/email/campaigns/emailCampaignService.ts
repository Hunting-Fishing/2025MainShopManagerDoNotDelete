import { supabase } from '@/lib/supabase';
import { EmailCampaign, EmailCampaignStatus } from '@/types/email';
import { GenericResponse } from '../utils/supabaseHelper';
import { validateCampaignStatus, parseJsonField, parseABTest } from '@/hooks/email/campaign/utils/emailCampaignUtils';

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

      // Format the campaign data to match our expected types
      const formattedCampaigns: EmailCampaign[] = data.map(campaign => {
        const segment_ids = parseJsonField(campaign.segment_ids, []);
        const recipient_ids = parseJsonField(campaign.recipient_ids, []);
        const personalizations = parseJsonField(campaign.personalizations, {});
        const metadata = parseJsonField(campaign.metadata, {});
        const ab_test = parseABTest(campaign.ab_test);
        
        return {
          id: campaign.id,
          name: campaign.name,
          subject: campaign.subject,
          body: campaign.content || '',
          content: campaign.content,
          status: validateCampaignStatus(campaign.status),
          template_id: campaign.template_id,
          segment_ids: segment_ids,
          segment_id: segment_ids[0],
          recipient_ids: recipient_ids,
          recipientIds: recipient_ids,
          personalizations: personalizations,
          metadata: metadata,
          abTest: ab_test,
          ab_test: ab_test,
          scheduled_at: campaign.scheduled_date,
          scheduledAt: campaign.scheduled_date,
          sent_at: campaign.sent_date,
          sentAt: campaign.sent_date,
          created_at: campaign.created_at,
          createdAt: campaign.created_at,
          updated_at: campaign.updated_at,
          updatedAt: campaign.updated_at,
          totalRecipients: campaign.total_recipients || 0,
          total_recipients: campaign.total_recipients || 0,
          opened: campaign.opened || 0,
          clicked: campaign.clicked || 0
        };
      });

      return { data: formattedCampaigns, error: null };
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
      
      // Format the campaign data
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
        segment_id: segment_ids[0],
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
        totalRecipients: data.total_recipients || 0,
        total_recipients: data.total_recipients || 0,
        opened: data.opened || 0,
        clicked: data.clicked || 0
      };

      return { data: formattedCampaign, error: null };
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
      // Prepare data for insertion
      const segment_ids = campaign.segment_ids || campaign.segment_id ? [campaign.segment_id] : [];
      const recipient_ids = campaign.recipient_ids || campaign.recipientIds || [];
      
      const { data, error } = await supabase
        .from('email_campaigns')
        .insert({
          name: campaign.name || 'Untitled Campaign',
          subject: campaign.subject || '',
          content: campaign.content || campaign.body || '',
          status: campaign.status || 'draft',
          template_id: campaign.template_id,
          segment_ids: segment_ids,
          recipient_ids: recipient_ids,
          personalizations: campaign.personalizations || {},
          metadata: campaign.metadata || {},
          ab_test: campaign.abTest || campaign.ab_test || null,
          scheduled_date: campaign.scheduled_at || campaign.scheduledAt || null,
          total_recipients: campaign.totalRecipients || campaign.total_recipients || 0
        })
        .select()
        .single();

      if (error) throw error;
      
      // Format the created campaign
      const formattedCampaign: EmailCampaign = {
        id: data.id,
        name: data.name,
        subject: data.subject,
        body: data.content || '',
        content: data.content,
        status: validateCampaignStatus(data.status),
        template_id: data.template_id,
        segment_ids: parseJsonField(data.segment_ids, []),
        segment_id: parseJsonField(data.segment_ids, [])[0],
        recipient_ids: parseJsonField(data.recipient_ids, []),
        recipientIds: parseJsonField(data.recipient_ids, []),
        personalizations: parseJsonField(data.personalizations, {}),
        metadata: parseJsonField(data.metadata, {}),
        abTest: parseABTest(data.ab_test),
        ab_test: parseABTest(data.ab_test),
        scheduled_at: data.scheduled_date,
        scheduledAt: data.scheduled_date,
        sent_at: data.sent_date,
        sentAt: data.sent_date,
        created_at: data.created_at,
        createdAt: data.created_at,
        updated_at: data.updated_at,
        updatedAt: data.updated_at,
        totalRecipients: data.total_recipients || 0,
        total_recipients: data.total_recipients || 0,
        opened: data.opened || 0,
        clicked: data.clicked || 0
      };

      return { data: formattedCampaign, error: null };
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
    updates: Partial<EmailCampaign>
  ): Promise<GenericResponse<EmailCampaign>> {
    try {
      // Prepare data for update
      const updateData: any = {};
      
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.subject !== undefined) updateData.subject = updates.subject;
      if (updates.content !== undefined || updates.body !== undefined) {
        updateData.content = updates.content || updates.body;
      }
      if (updates.status !== undefined) updateData.status = updates.status;
      if (updates.template_id !== undefined) updateData.template_id = updates.template_id;
      
      if (updates.segment_ids !== undefined || updates.segment_id !== undefined) {
        updateData.segment_ids = updates.segment_ids || (updates.segment_id ? [updates.segment_id] : []);
      }
      
      if (updates.recipient_ids !== undefined || updates.recipientIds !== undefined) {
        updateData.recipient_ids = updates.recipient_ids || updates.recipientIds;
      }
      
      if (updates.personalizations !== undefined) updateData.personalizations = updates.personalizations;
      if (updates.metadata !== undefined) updateData.metadata = updates.metadata;
      if (updates.abTest !== undefined || updates.ab_test !== undefined) {
        updateData.ab_test = updates.abTest || updates.ab_test;
      }
      
      if (updates.scheduled_at !== undefined || updates.scheduledAt !== undefined) {
        updateData.scheduled_date = updates.scheduled_at || updates.scheduledAt;
      }
      
      if (updates.sent_at !== undefined || updates.sentAt !== undefined) {
        updateData.sent_date = updates.sent_at || updates.sentAt;
      }
      
      if (updates.totalRecipients !== undefined || updates.total_recipients !== undefined) {
        updateData.total_recipients = updates.totalRecipients || updates.total_recipients;
      }
      
      if (updates.opened !== undefined) updateData.opened = updates.opened;
      if (updates.clicked !== undefined) updateData.clicked = updates.clicked;
      
      const { data, error } = await supabase
        .from('email_campaigns')
        .update(updateData)
        .eq('id', campaignId)
        .select()
        .single();

      if (error) throw error;
      
      // Format the updated campaign
      const formattedCampaign: EmailCampaign = {
        id: data.id,
        name: data.name,
        subject: data.subject,
        body: data.content || '',
        content: data.content,
        status: validateCampaignStatus(data.status),
        template_id: data.template_id,
        segment_ids: parseJsonField(data.segment_ids, []),
        segment_id: parseJsonField(data.segment_ids, [])[0],
        recipient_ids: parseJsonField(data.recipient_ids, []),
        recipientIds: parseJsonField(data.recipient_ids, []),
        personalizations: parseJsonField(data.personalizations, {}),
        metadata: parseJsonField(data.metadata, {}),
        abTest: parseABTest(data.ab_test),
        ab_test: parseABTest(data.ab_test),
        scheduled_at: data.scheduled_date,
        scheduledAt: data.scheduled_date,
        sent_at: data.sent_date,
        sentAt: data.sent_date,
        created_at: data.created_at,
        createdAt: data.created_at,
        updated_at: data.updated_at,
        updatedAt: data.updated_at,
        totalRecipients: data.total_recipients || 0,
        total_recipients: data.total_recipients || 0,
        opened: data.opened || 0,
        clicked: data.clicked || 0
      };

      return { data: formattedCampaign, error: null };
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
  },

  /**
   * Schedule a campaign for future delivery
   */
  async scheduleCampaign(campaignId: string, scheduledDate: string): Promise<GenericResponse<boolean>> {
    try {
      const { error } = await supabase
        .from('email_campaigns')
        .update({ 
          status: 'scheduled' as EmailCampaignStatus,
          scheduled_date: scheduledDate 
        })
        .eq('id', campaignId);
        
      if (error) throw error;
      return { data: true, error: null };
    } catch (error) {
      console.error(`Error scheduling email campaign ${campaignId}:`, error);
      return { data: false, error };
    }
  },

  /**
   * Send a campaign immediately
   */
  async sendCampaignNow(campaignId: string): Promise<GenericResponse<boolean>> {
    try {
      // Call Supabase Edge Function to trigger the campaign
      const { data, error } = await supabase.functions.invoke('trigger-email-campaign', {
        body: { campaignId }
      });
      
      if (error) throw error;
      return { data: true, error: null };
    } catch (error) {
      console.error(`Error sending email campaign ${campaignId}:`, error);
      return { data: false, error };
    }
  },

  /**
   * Pause an in-progress campaign
   */
  async pauseCampaign(campaignId: string): Promise<GenericResponse<boolean>> {
    try {
      const { error } = await supabase
        .from('email_campaigns')
        .update({ 
          status: 'paused' as EmailCampaignStatus 
        })
        .eq('id', campaignId);
      
      if (error) throw error;
      return { data: true, error: null };
    } catch (error) {
      console.error(`Error pausing email campaign ${campaignId}:`, error);
      return { data: false, error };
    }
  },

  /**
   * Cancel a campaign
   */
  async cancelCampaign(campaignId: string): Promise<GenericResponse<boolean>> {
    try {
      const { error } = await supabase
        .from('email_campaigns')
        .update({ 
          status: 'cancelled' as EmailCampaignStatus 
        })
        .eq('id', campaignId);
      
      if (error) throw error;
      return { data: true, error: null };
    } catch (error) {
      console.error(`Error cancelling email campaign ${campaignId}:`, error);
      return { data: false, error };
    }
  },

  /**
   * Get campaign analytics
   */
  async getCampaignAnalytics(campaignId: string): Promise<GenericResponse<any>> {
    try {
      const { data, error } = await supabase
        .from('email_campaign_analytics')
        .select('*')
        .eq('campaign_id', campaignId)
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 is "Results contain 0 rows"
        throw error;
      }
      
      if (!data) {
        // If no analytics record exists, get counts from events
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
        
        return { 
          data: {
            opened: openData || 0,
            clicked: clickData || 0
          }, 
          error: null 
        };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error(`Error getting campaign analytics ${campaignId}:`, error);
      return { data: null, error };
    }
  }
};
