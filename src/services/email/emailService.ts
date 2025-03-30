
import { supabase } from "@/integrations/supabase/client";
import { 
  EmailTemplate, 
  EmailTemplatePreview,
  EmailCampaign, 
  EmailCampaignPreview,
  EmailSequence,
  EmailCategory
} from "@/types/email";

export const emailService = {
  // Template functions
  async getTemplates(): Promise<EmailTemplatePreview[]> {
    const { data, error } = await supabase
      .from('email_templates')
      .select('id, name, subject, description, category, created_at, updated_at')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return (data || []).map(mapTemplateFromDB);
  },
  
  async getTemplatesByCategory(category: EmailCategory): Promise<EmailTemplatePreview[]> {
    const { data, error } = await supabase
      .from('email_templates')
      .select('id, name, subject, description, category, created_at, updated_at')
      .eq('category', category)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return (data || []).map(mapTemplateFromDB);
  },
  
  async getTemplateById(id: string): Promise<EmailTemplate | null> {
    const { data, error } = await supabase
      .from('email_templates')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null; // Record not found
      throw error;
    }
    
    return data ? mapFullTemplateFromDB(data) : null;
  },
  
  async createTemplate(template: Partial<EmailTemplate>): Promise<EmailTemplate> {
    const { data, error } = await supabase
      .from('email_templates')
      .insert([mapTemplateToDB(template)])
      .select('*')
      .single();
    
    if (error) throw error;
    
    return mapFullTemplateFromDB(data);
  },
  
  async updateTemplate(id: string, template: Partial<EmailTemplate>): Promise<EmailTemplate> {
    const { data, error } = await supabase
      .from('email_templates')
      .update(mapTemplateToDB(template))
      .eq('id', id)
      .select('*')
      .single();
    
    if (error) throw error;
    
    return mapFullTemplateFromDB(data);
  },
  
  async deleteTemplate(id: string): Promise<void> {
    const { error } = await supabase
      .from('email_templates')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },
  
  // Campaign functions
  async getCampaigns(): Promise<EmailCampaignPreview[]> {
    const { data, error } = await supabase
      .from('email_campaigns')
      .select('id, name, subject, status, scheduled_date, sent_date, total_recipients, opened, clicked, created_at, updated_at')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return (data || []).map(mapCampaignFromDB);
  },
  
  async getCampaignById(id: string): Promise<EmailCampaign | null> {
    const { data, error } = await supabase
      .from('email_campaigns')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null; // Record not found
      throw error;
    }
    
    return data ? mapFullCampaignFromDB(data) : null;
  },
  
  async createCampaign(campaign: Partial<EmailCampaign>): Promise<EmailCampaign> {
    const { data, error } = await supabase
      .from('email_campaigns')
      .insert([mapCampaignToDB(campaign)])
      .select('*')
      .single();
    
    if (error) throw error;
    
    return mapFullCampaignFromDB(data);
  },
  
  async updateCampaign(id: string, campaign: Partial<EmailCampaign>): Promise<EmailCampaign> {
    const { data, error } = await supabase
      .from('email_campaigns')
      .update(mapCampaignToDB(campaign))
      .eq('id', id)
      .select('*')
      .single();
    
    if (error) throw error;
    
    return mapFullCampaignFromDB(data);
  },
  
  async deleteCampaign(id: string): Promise<void> {
    const { error } = await supabase
      .from('email_campaigns')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },
  
  // Sequences functions
  async getSequences(): Promise<EmailSequence[]> {
    const { data, error } = await supabase
      .from('email_sequences')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return (data || []).map(mapSequenceFromDB);
  },
  
  async getSequenceById(id: string): Promise<EmailSequence | null> {
    const { data, error } = await supabase
      .from('email_sequences')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null; // Record not found
      throw error;
    }
    
    return data ? mapSequenceFromDB(data) : null;
  },
  
  async createSequence(sequence: Partial<EmailSequence>): Promise<EmailSequence> {
    const { data, error } = await supabase
      .from('email_sequences')
      .insert([mapSequenceToDB(sequence)])
      .select('*')
      .single();
    
    if (error) throw error;
    
    return mapSequenceFromDB(data);
  },
  
  async updateSequence(id: string, sequence: Partial<EmailSequence>): Promise<EmailSequence> {
    const { data, error } = await supabase
      .from('email_sequences')
      .update(mapSequenceToDB(sequence))
      .eq('id', id)
      .select('*')
      .single();
    
    if (error) throw error;
    
    return mapSequenceFromDB(data);
  },
  
  async deleteSequence(id: string): Promise<void> {
    const { error } = await supabase
      .from('email_sequences')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },
  
  // Send email functions
  async sendTestEmail(templateId: string, recipientEmail: string, personalizations?: Record<string, string>): Promise<void> {
    const { error } = await supabase.functions.invoke('send-test-email', {
      body: {
        templateId,
        recipientEmail,
        personalizations: personalizations || {}
      }
    });
    
    if (error) throw error;
  },
  
  async scheduleEmailCampaign(campaignId: string, scheduledDate: string): Promise<void> {
    const { error } = await supabase
      .from('email_campaigns')
      .update({ 
        status: 'scheduled',
        scheduled_date: scheduledDate 
      })
      .eq('id', campaignId);
    
    if (error) throw error;
  },
  
  async sendEmailCampaignNow(campaignId: string): Promise<void> {
    const { error } = await supabase.functions.invoke('trigger-email-campaign', {
      body: { campaignId }
    });
    
    if (error) throw error;
  },
  
  async pauseEmailCampaign(campaignId: string): Promise<void> {
    const { error } = await supabase
      .from('email_campaigns')
      .update({ status: 'paused' })
      .eq('id', campaignId);
    
    if (error) throw error;
  },
  
  async cancelEmailCampaign(campaignId: string): Promise<void> {
    const { error } = await supabase
      .from('email_campaigns')
      .update({ status: 'cancelled' })
      .eq('id', campaignId);
    
    if (error) throw error;
  }
};

// Utility mapping functions
function mapTemplateFromDB(dbTemplate: any): EmailTemplatePreview {
  return {
    id: dbTemplate.id,
    name: dbTemplate.name,
    subject: dbTemplate.subject,
    description: dbTemplate.description,
    category: dbTemplate.category,
    createdAt: dbTemplate.created_at,
    updatedAt: dbTemplate.updated_at
  };
}

function mapFullTemplateFromDB(dbTemplate: any): EmailTemplate {
  return {
    ...mapTemplateFromDB(dbTemplate),
    content: dbTemplate.content,
    variables: dbTemplate.variables || [],
    isArchived: dbTemplate.is_archived || false
  };
}

function mapTemplateToDB(template: Partial<EmailTemplate>): Record<string, any> {
  const dbTemplate: Record<string, any> = {};
  
  if (template.name) dbTemplate.name = template.name;
  if (template.subject) dbTemplate.subject = template.subject;
  if (template.description) dbTemplate.description = template.description;
  if (template.category) dbTemplate.category = template.category;
  if (template.content) dbTemplate.content = template.content;
  if (template.variables) dbTemplate.variables = template.variables;
  if (typeof template.isArchived === 'boolean') dbTemplate.is_archived = template.isArchived;
  
  return dbTemplate;
}

function mapCampaignFromDB(dbCampaign: any): EmailCampaignPreview {
  return {
    id: dbCampaign.id,
    name: dbCampaign.name,
    subject: dbCampaign.subject,
    status: dbCampaign.status,
    scheduledDate: dbCampaign.scheduled_date,
    sentDate: dbCampaign.sent_date,
    totalRecipients: dbCampaign.total_recipients || 0,
    opened: dbCampaign.opened || 0,
    clicked: dbCampaign.clicked || 0,
    createdAt: dbCampaign.created_at,
    updatedAt: dbCampaign.updated_at
  };
}

function mapFullCampaignFromDB(dbCampaign: any): EmailCampaign {
  return {
    ...mapCampaignFromDB(dbCampaign),
    templateId: dbCampaign.template_id,
    content: dbCampaign.content,
    segmentIds: dbCampaign.segment_ids || [],
    recipientIds: dbCampaign.recipient_ids || [],
    personalizations: dbCampaign.personalizations || [],
    metadata: dbCampaign.metadata || {},
    abTest: dbCampaign.ab_test || null,
  };
}

function mapCampaignToDB(campaign: Partial<EmailCampaign>): Record<string, any> {
  const dbCampaign: Record<string, any> = {};
  
  if (campaign.name) dbCampaign.name = campaign.name;
  if (campaign.subject) dbCampaign.subject = campaign.subject;
  if (campaign.status) dbCampaign.status = campaign.status;
  if (campaign.scheduledDate) dbCampaign.scheduled_date = campaign.scheduledDate;
  if (campaign.sentDate) dbCampaign.sent_date = campaign.sentDate;
  if (campaign.totalRecipients !== undefined) dbCampaign.total_recipients = campaign.totalRecipients;
  if (campaign.opened !== undefined) dbCampaign.opened = campaign.opened;
  if (campaign.clicked !== undefined) dbCampaign.clicked = campaign.clicked;
  if (campaign.templateId) dbCampaign.template_id = campaign.templateId;
  if (campaign.content) dbCampaign.content = campaign.content;
  if (campaign.segmentIds) dbCampaign.segment_ids = campaign.segmentIds;
  if (campaign.recipientIds) dbCampaign.recipient_ids = campaign.recipientIds;
  if (campaign.personalizations) dbCampaign.personalizations = campaign.personalizations;
  if (campaign.metadata) dbCampaign.metadata = campaign.metadata;
  if (campaign.abTest) dbCampaign.ab_test = campaign.abTest;
  
  return dbCampaign;
}

function mapSequenceFromDB(dbSequence: any): EmailSequence {
  return {
    id: dbSequence.id,
    name: dbSequence.name,
    description: dbSequence.description,
    trigger: dbSequence.trigger,
    triggerEvent: dbSequence.trigger_event,
    steps: dbSequence.steps || [],
    isActive: dbSequence.is_active,
    createdAt: dbSequence.created_at,
    updatedAt: dbSequence.updated_at
  };
}

function mapSequenceToDB(sequence: Partial<EmailSequence>): Record<string, any> {
  const dbSequence: Record<string, any> = {};
  
  if (sequence.name) dbSequence.name = sequence.name;
  if (sequence.description) dbSequence.description = sequence.description;
  if (sequence.trigger) dbSequence.trigger = sequence.trigger;
  if (sequence.triggerEvent) dbSequence.trigger_event = sequence.triggerEvent;
  if (sequence.steps) dbSequence.steps = sequence.steps;
  if (typeof sequence.isActive === 'boolean') dbSequence.is_active = sequence.isActive;
  
  return dbSequence;
}
