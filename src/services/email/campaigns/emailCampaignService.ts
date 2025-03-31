
import { supabase } from '@/lib/supabase';
import { EmailCampaign, EmailABTest } from '@/types/email';
import { GenericResponse, parseJsonField } from '../utils/supabaseHelper';

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

      // Map data to EmailCampaign type, ensuring all required fields are present
      const campaigns: EmailCampaign[] = data.map(campaign => ({
        id: campaign.id,
        name: campaign.name,
        subject: campaign.subject,
        body: campaign.content || '',
        content: campaign.content,
        status: campaign.status,
        template_id: campaign.template_id,
        segment_ids: Array.isArray(campaign.segment_ids) ? campaign.segment_ids : [],
        recipient_ids: Array.isArray(campaign.recipient_ids) ? campaign.recipient_ids : [],
        personalizations: typeof campaign.personalizations === 'object' ? campaign.personalizations : {},
        metadata: typeof campaign.metadata === 'object' ? campaign.metadata : {},
        ab_test: parseJsonField<EmailABTest | null>(campaign.ab_test, null),
        abTest: parseJsonField<EmailABTest | null>(campaign.ab_test, null),
        scheduled_at: campaign.scheduled_date,
        scheduledAt: campaign.scheduled_date,
        sent_at: campaign.sent_date,
        sentAt: campaign.sent_date,
        created_at: campaign.created_at,
        createdAt: campaign.created_at,
        updated_at: campaign.updated_at,
        updatedAt: campaign.updated_at,
        totalRecipients: campaign.total_recipients,
        total_recipients: campaign.total_recipients,
        opened: campaign.opened,
        clicked: campaign.clicked
      }));

      return { data: campaigns, error: null };
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

      // Convert to EmailCampaign type
      const campaign: EmailCampaign = {
        id: data.id,
        name: data.name,
        subject: data.subject,
        body: data.content || '',
        content: data.content,
        status: data.status,
        template_id: data.template_id,
        segment_ids: Array.isArray(data.segment_ids) ? data.segment_ids : [],
        recipient_ids: Array.isArray(data.recipient_ids) ? data.recipient_ids : [],
        personalizations: typeof data.personalizations === 'object' ? data.personalizations : {},
        metadata: typeof data.metadata === 'object' ? data.metadata : {},
        ab_test: parseJsonField<EmailABTest | null>(data.ab_test, null),
        abTest: parseJsonField<EmailABTest | null>(data.ab_test, null),
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

      return { data: campaign, error: null };
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
      // Convert the ab_test object to a JSON-serializable value
      let abTestData = null;
      if (campaign.abTest || campaign.ab_test) {
        abTestData = campaign.abTest || campaign.ab_test;
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
          ab_test: abTestData
        })
        .select()
        .single();
    
      if (error) throw error;

      // Convert to EmailCampaign type
      const newCampaign: EmailCampaign = {
        id: data.id,
        name: data.name,
        subject: data.subject,
        body: data.content || '',
        content: data.content,
        status: data.status,
        template_id: data.template_id,
        segment_ids: Array.isArray(data.segment_ids) ? data.segment_ids : [],
        recipient_ids: Array.isArray(data.recipient_ids) ? data.recipient_ids : [],
        personalizations: typeof data.personalizations === 'object' ? data.personalizations : {},
        metadata: typeof data.metadata === 'object' ? data.metadata : {},
        ab_test: parseJsonField<EmailABTest | null>(data.ab_test, null),
        abTest: parseJsonField<EmailABTest | null>(data.ab_test, null),
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

      return { data: newCampaign, error: null };
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
      // Prepare ab_test data
      let abTestData = null;
      if (campaign.abTest || campaign.ab_test) {
        abTestData = campaign.abTest || campaign.ab_test;
      }

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
          ab_test: abTestData
        })
        .eq('id', campaignId)
        .select()
        .single();

      if (error) throw error;

      // Convert to EmailCampaign type
      const updatedCampaign: EmailCampaign = {
        id: data.id,
        name: data.name,
        subject: data.subject,
        body: data.content || '',
        content: data.content,
        status: data.status,
        template_id: data.template_id,
        segment_ids: Array.isArray(data.segment_ids) ? data.segment_ids : [],
        recipient_ids: Array.isArray(data.recipient_ids) ? data.recipient_ids : [],
        personalizations: typeof data.personalizations === 'object' ? data.personalizations : {},
        metadata: typeof data.metadata === 'object' ? data.metadata : {},
        ab_test: parseJsonField<EmailABTest | null>(data.ab_test, null),
        abTest: parseJsonField<EmailABTest | null>(data.ab_test, null),
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

      return { data: updatedCampaign, error: null };
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
