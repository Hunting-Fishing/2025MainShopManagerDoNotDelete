import { supabase } from "@/integrations/supabase/client";
import {
  Email,
  EmailTemplate,
  EmailTemplatePreview,
  EmailCategory,
  EmailCampaign,
  EmailCampaignPreview,
  EmailCampaignAnalytics,
  EmailCampaignTimelinePoint,
  EmailSequence,
  EmailSequenceStep,
  EmailSequenceEnrollment,
  EmailTemplateVariable,
  EmailABTest,
  EmailABTestResult,
} from "@/types/email";

class EmailService {
  // Template functions
  async getTemplates(id?: string, category?: EmailCategory): Promise<EmailTemplatePreview[] | EmailTemplate> {
    try {
      if (id) {
        const { data, error } = await supabase
          .from('email_templates')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        
        // Convert the database object to the EmailTemplate interface
        const template: EmailTemplate = {
          id: data.id,
          name: data.name,
          subject: data.subject,
          description: data.description,
          category: data.category,
          content: data.content,
          created_at: data.created_at,
          updated_at: data.updated_at,
          variables: data.variables || [],
          is_archived: data.is_archived || false
        };
        
        return template;
      }

      let query = supabase.from('email_templates').select('*');
      
      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      // Convert the array of database objects to EmailTemplatePreview array
      const templates: EmailTemplatePreview[] = data.map(item => ({
        id: item.id,
        name: item.name,
        subject: item.subject,
        category: item.category,
        created_at: item.created_at,
        description: item.description
      }));

      return templates;
    } catch (error) {
      console.error("Error getting email templates:", error);
      throw error;
    }
  }

  async getTemplateById(id: string): Promise<EmailTemplate | null> {
    try {
      return await this.getTemplates(id) as EmailTemplate;
    } catch (error) {
      console.error("Error getting email template:", error);
      return null;
    }
  }

  async createTemplate(template: Partial<EmailTemplate>): Promise<EmailTemplate | null> {
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .insert({
          name: template.name,
          subject: template.subject,
          description: template.description,
          category: template.category,
          content: template.content,
          variables: template.variables || []
        })
        .select()
        .single();

      if (error) throw error;

      // Convert the database object to the EmailTemplate interface
      const newTemplate: EmailTemplate = {
        id: data.id,
        name: data.name,
        subject: data.subject,
        description: data.description,
        category: data.category,
        content: data.content,
        created_at: data.created_at,
        updated_at: data.updated_at,
        variables: data.variables || []
      };
      
      return newTemplate;
    } catch (error) {
      console.error("Error creating email template:", error);
      return null;
    }
  }

  async updateTemplate(id: string, template: Partial<EmailTemplate>): Promise<EmailTemplate | null> {
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .update({
          name: template.name,
          subject: template.subject,
          description: template.description,
          category: template.category,
          content: template.content,
          variables: template.variables || []
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Convert the database object to the EmailTemplate interface
      const updatedTemplate: EmailTemplate = {
        id: data.id,
        name: data.name,
        subject: data.subject,
        description: data.description,
        category: data.category,
        content: data.content,
        created_at: data.created_at,
        updated_at: data.updated_at,
        variables: data.variables || []
      };
      
      return updatedTemplate;
    } catch (error) {
      console.error("Error updating email template:", error);
      return null;
    }
  }

  async deleteTemplate(id: string): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, 500);
    });
  }

  async getCampaigns(id?: string): Promise<EmailCampaignPreview[] | EmailCampaign> {
    try {
      if (id) {
        const { data, error } = await supabase
          .from('email_campaigns')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        
        // Convert database object to EmailCampaign
        const campaign: EmailCampaign = {
          id: data.id,
          name: data.name,
          subject: data.subject,
          body: data.content || '', // Map content to body for compatibility
          content: data.content,
          status: data.status,
          template_id: data.template_id,
          segment_ids: data.segment_ids,
          recipientIds: data.recipient_ids,
          personalizations: data.personalizations,
          metadata: data.metadata,
          abTest: data.ab_test,
          scheduled_at: data.scheduled_date,
          sent_at: data.sent_date,
          created_at: data.created_at,
          updated_at: data.updated_at,
          totalRecipients: data.total_recipients,
          opened: data.opened,
          clicked: data.clicked,
          scheduledDate: data.scheduled_date,
          sentDate: data.sent_date
        };
        
        return campaign;
      }

      const { data, error } = await supabase
        .from('email_campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Convert database objects to EmailCampaignPreview array
      const campaigns: EmailCampaignPreview[] = data.map(item => ({
        id: item.id,
        name: item.name,
        subject: item.subject,
        status: item.status,
        scheduled_at: item.scheduled_date,
        sent_at: item.sent_date,
        created_at: item.created_at,
        total_recipients: item.total_recipients,
        opened: item.opened,
        clicked: item.clicked,
        // Support for UI properties
        totalRecipients: item.total_recipients,
        scheduledDate: item.scheduled_date,
        sentDate: item.sent_date
      }));

      return campaigns;
    } catch (error) {
      console.error("Error getting email campaigns:", error);
      throw error;
    }
  }

  async createCampaign(campaign: Partial<EmailCampaign>): Promise<EmailCampaign | null> {
    try {
      const { data, error } = await supabase
        .from('email_campaigns')
        .insert({
          name: campaign.name,
          subject: campaign.subject,
          content: campaign.body || campaign.content,
          status: campaign.status || 'draft',
          scheduled_date: campaign.scheduled_at || campaign.scheduledDate,
          template_id: campaign.template_id || campaign.templateId,
          content: campaign.content,
          segment_ids: campaign.segment_ids || campaign.segmentIds,
          recipient_ids: campaign.recipientIds,
          personalizations: campaign.personalizations,
          metadata: campaign.metadata,
          ab_test: campaign.abTest
        })
        .select()
        .single();

      if (error) throw error;

      // Convert database object to EmailCampaign
      const newCampaign: EmailCampaign = {
        id: data.id,
        name: data.name,
        subject: data.subject,
        body: data.content,
        content: data.content,
        status: data.status,
        template_id: data.template_id,
        scheduled_at: data.scheduled_date,
        scheduledDate: data.scheduled_date,
        sent_at: data.sent_date,
        sentDate: data.sent_date,
        created_at: data.created_at,
        updated_at: data.updated_at,
        totalRecipients: data.total_recipients,
        opened: data.opened,
        clicked: data.clicked
      };
      
      return newCampaign;
    } catch (error) {
      console.error("Error creating email campaign:", error);
      return null;
    }
  }

  async updateCampaign(id: string, campaign: Partial<EmailCampaign>): Promise<EmailCampaign | null> {
    try {
      const { data, error } = await supabase
        .from('email_campaigns')
        .update({
          name: campaign.name,
          subject: campaign.subject,
          content: campaign.body || campaign.content,
          status: campaign.status,
          scheduled_date: campaign.scheduled_at || campaign.scheduledDate,
          template_id: campaign.template_id || campaign.templateId,
          content: campaign.content,
          segment_ids: campaign.segment_ids || campaign.segmentIds,
          recipient_ids: campaign.recipientIds,
          personalizations: campaign.personalizations,
          metadata: campaign.metadata,
          ab_test: campaign.abTest
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Convert database object to EmailCampaign
      const updatedCampaign: EmailCampaign = {
        id: data.id,
        name: data.name,
        subject: data.subject,
        body: data.content,
        content: data.content,
        status: data.status,
        template_id: data.template_id,
        scheduled_at: data.scheduled_date,
        scheduledDate: data.scheduled_date,
        sent_at: data.sent_date,
        sentDate: data.sent_date,
        created_at: data.created_at,
        updated_at: data.updated_at,
        totalRecipients: data.total_recipients,
        opened: data.opened,
        clicked: data.clicked
      };
      
      return updatedCampaign;
    } catch (error) {
      console.error("Error updating email campaign:", error);
      return null;
    }
  }

  async scheduleCampaign(id: string, date: string): Promise<EmailCampaign> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ ...mockCampaigns.find((campaign) => campaign.id === id), scheduled_at: date } as EmailCampaign);
      }, 500);
    });
  }

  async sendCampaignNow(id: string): Promise<EmailCampaign> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ ...mockCampaigns.find((campaign) => campaign.id === id), status: 'sending' } as EmailCampaign);
      }, 500);
    });
  }

  async pauseCampaign(id: string): Promise<EmailCampaign> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ ...mockCampaigns.find((campaign) => campaign.id === id), status: 'paused' } as EmailCampaign);
      }, 500);
    });
  }

  async cancelCampaign(id: string): Promise<EmailCampaign> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ ...mockCampaigns.find((campaign) => campaign.id === id), status: 'cancelled' } as EmailCampaign);
      }, 500);
    });
  }

  async getSegments(id?: string): Promise<EmailSegment | EmailSegment[]> {
    return id ? mockSegments.find((segment) => segment.id === id) as EmailSegment : mockSegments;
  }

  async createSegment(segment: EmailSegment): Promise<EmailSegment> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ ...segment, id: Math.random().toString() });
      }, 500);
    });
  }

  async updateSegment(id: string, updates: Partial<EmailSegment>): Promise<EmailSegment> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ ...mockSegments.find((segment) => segment.id === id), ...updates } as EmailSegment);
      }, 500);
    });
  }

  async deleteSegment(id: string): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, 500);
    });
  }

  async getSequences(): Promise<EmailSequence[]> {
    try {
      const { data: sequencesData, error: sequenceError } = await supabase
        .from('email_sequences')
        .select('*')
        .order('created_at', { ascending: false });

      if (sequenceError) throw sequenceError;

      const sequences: EmailSequence[] = [];

      for (const seq of sequencesData) {
        // Get steps for each sequence
        const { data: stepsData, error: stepsError } = await supabase
          .from('email_sequence_steps')
          .select('*')
          .eq('sequence_id', seq.id)
          .order('position', { ascending: true });

        if (stepsError) throw stepsError;

        // Map database steps to EmailSequenceStep interface
        const steps: EmailSequenceStep[] = stepsData.map(step => ({
          id: step.id,
          sequence_id: step.sequence_id,
          type: step.delay_hours > 0 ? 'delay' : 'email',
          order: step.position,
          delay_duration: step.delay_hours ? `${step.delay_hours} hours` : undefined,
          email_template_id: step.template_id,
          created_at: step.created_at,
          updated_at: step.updated_at,
          // UI properties
          name: step.name,
          templateId: step.template_id,
          delayHours: step.delay_hours,
          delayType: step.delay_type,
          position: step.position,
          isActive: step.is_active,
          condition: step.condition_type ? {
            type: step.condition_type as 'event' | 'property',
            value: step.condition_value,
            operator: step.condition_operator as '=' | '!=' | '>' | '<' | '>=' | '<='
          } : undefined
        }));

        // Add sequence with its steps to the result
        sequences.push({
          id: seq.id,
          name: seq.name,
          description: seq.description,
          steps,
          created_at: seq.created_at,
          updated_at: seq.updated_at,
          // UI properties
          triggerType: seq.trigger_type,
          triggerEvent: seq.trigger_event,
          isActive: seq.is_active
        });
      }

      return sequences;
    } catch (error) {
      console.error("Error getting email sequences:", error);
      throw error;
    }
  }

  async getSequenceById(id: string): Promise<EmailSequence | null> {
    try {
      const { data: sequence, error: sequenceError } = await supabase
        .from('email_sequences')
        .select('*')
        .eq('id', id)
        .single();

      if (sequenceError) throw sequenceError;

      // Get steps for the sequence
      const { data: stepsData, error: stepsError } = await supabase
        .from('email_sequence_steps')
        .select('*')
        .eq('sequence_id', id)
        .order('position', { ascending: true });

      if (stepsError) throw stepsError;

      // Map database steps to EmailSequenceStep interface
      const steps: EmailSequenceStep[] = stepsData.map(step => ({
        id: step.id,
        sequence_id: step.sequence_id,
        type: step.delay_hours > 0 ? 'delay' : 'email',
        order: step.position,
        delay_duration: step.delay_hours ? `${step.delay_hours} hours` : undefined,
        email_template_id: step.template_id,
        created_at: step.created_at,
        updated_at: step.updated_at,
        // UI properties
        name: step.name,
        templateId: step.template_id,
        delayHours: step.delay_hours,
        delayType: step.delay_type,
        position: step.position,
        isActive: step.is_active,
        condition: step.condition_type ? {
          type: step.condition_type as 'event' | 'property',
          value: step.condition_value,
          operator: step.condition_operator as '=' | '!=' | '>' | '<' | '>=' | '<='
        } : undefined
      }));

      // Construct and return the sequence with its steps
      return {
        id: sequence.id,
        name: sequence.name,
        description: sequence.description,
        steps,
        created_at: sequence.created_at,
        updated_at: sequence.updated_at,
        // UI properties
        triggerType: sequence.trigger_type,
        triggerEvent: sequence.trigger_event,
        isActive: sequence.is_active
      };
    } catch (error) {
      console.error("Error getting email sequence:", error);
      return null;
    }
  }

  async createSequence(sequence: Partial<EmailSequence>): Promise<EmailSequence | null> {
    try {
      // Insert the sequence
      const { data: newSequence, error: sequenceError } = await supabase
        .from('email_sequences')
        .insert({
          name: sequence.name,
          description: sequence.description,
          trigger_type: sequence.triggerType || sequence.trigger_type,
          trigger_event: sequence.triggerEvent || sequence.trigger_event,
          is_active: sequence.isActive || sequence.is_active || false
        })
        .select()
        .single();

      if (sequenceError) throw sequenceError;

      const steps: EmailSequenceStep[] = [];
      
      // Insert steps if any
      if (sequence.steps && sequence.steps.length > 0) {
        for (const [index, step] of sequence.steps.entries()) {
          const stepData = {
            sequence_id: newSequence.id,
            name: step.name,
            template_id: step.templateId || step.email_template_id,
            delay_hours: step.delayHours || 0,
            delay_type: step.delayType || 'fixed',
            position: step.position || index,
            is_active: step.isActive !== undefined ? step.isActive : true,
            condition_type: step.condition?.type,
            condition_value: step.condition?.value,
            condition_operator: step.condition?.operator
          };

          const { data: newStep, error: stepError } = await supabase
            .from('email_sequence_steps')
            .insert(stepData)
            .select()
            .single();

          if (stepError) throw stepError;
          
          // Map database step to EmailSequenceStep interface
          steps.push({
            id: newStep.id,
            sequence_id: newStep.sequence_id,
            type: newStep.delay_hours > 0 ? 'delay' : 'email',
            order: newStep.position,
            delay_duration: newStep.delay_hours ? `${newStep.delay_hours} hours` : undefined,
            email_template_id: newStep.template_id,
            created_at: newStep.created_at,
            updated_at: newStep.updated_at,
            // UI properties
            name: newStep.name,
            templateId: newStep.template_id,
            delayHours: newStep.delay_hours,
            delayType: newStep.delay_type,
            position: newStep.position,
            isActive: newStep.is_active,
            condition: newStep.condition_type ? {
              type: newStep.condition_type as 'event' | 'property',
              value: newStep.condition_value,
              operator: newStep.condition_operator as '=' | '!=' | '>' | '<' | '>=' | '<='
            } : undefined
          });
        }
      }

      // Return the new sequence with its steps
      return {
        id: newSequence.id,
        name: newSequence.name,
        description: newSequence.description,
        steps,
        created_at: newSequence.created_at,
        updated_at: newSequence.updated_at,
        // UI properties
        triggerType: newSequence.trigger_type,
        triggerEvent: newSequence.trigger_event,
        isActive: newSequence.is_active
      };
    } catch (error) {
      console.error("Error creating email sequence:", error);
      return null;
    }
  }

  async updateSequence(id: string, updates: Partial<EmailSequence>): Promise<EmailSequence | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ ...mockSequences.find((sequence) => sequence.id === id), ...updates } as EmailSequence);
      }, 500);
    });
  }

  async deleteSequence(id: string): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, 500);
    });
  }

  async getSequenceSteps(sequenceId: string): Promise<EmailSequenceStep[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([]);
      }, 500);
    });
  }

  async createSequenceStep(step: EmailSequenceStep): Promise<EmailSequenceStep> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ ...step, id: Math.random().toString() });
      }, 500);
    });
  }

  async updateSequenceStep(id: string, updates: Partial<EmailSequenceStep>): Promise<EmailSequenceStep> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ ...[]?.find((step) => step.id === id), ...updates } as EmailSequenceStep);
      }, 500);
    });
  }

  async deleteSequenceStep(id: string): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, 500);
    });
  }

  async getEnrollments(id?: string): Promise<EmailSequenceEnrollment | EmailSequenceEnrollment[]> {
    return id ? mockEnrollments.find((enrollment) => enrollment.id === id) as EmailSequenceEnrollment : mockEnrollments;
  }

  async enrollCustomerInSequence(enrollment: EmailSequenceEnrollment): Promise<EmailSequenceEnrollment> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ ...enrollment, id: Math.random().toString() });
      }, 500);
    });
  }

  async updateEnrollment(id: string, updates: Partial<EmailSequenceEnrollment>): Promise<EmailSequenceEnrollment> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ ...mockEnrollments.find((enrollment) => enrollment.id === id), ...updates } as EmailSequenceEnrollment);
      }, 500);
    });
  }

  async cancelEnrollment(id: string): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, 500);
    });
  }

  async getCustomerSequenceEnrollments(customerId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('email_sequence_enrollments')
        .select('*')
        .eq('customer_id', customerId);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error getting customer sequence enrollments:", error);
      throw error;
    }
  }

  async pauseSequenceEnrollment(enrollmentId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('email_sequence_enrollments')
        .update({ status: 'paused' })
        .eq('id', enrollmentId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error pausing sequence enrollment:", error);
      return false;
    }
  }

  async resumeSequenceEnrollment(enrollmentId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('email_sequence_enrollments')
        .update({ status: 'active' })
        .eq('id', enrollmentId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error resuming sequence enrollment:", error);
      return false;
    }
  }

  async cancelSequenceEnrollment(enrollmentId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('email_sequence_enrollments')
        .update({ status: 'cancelled' })
        .eq('id', enrollmentId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error cancelling sequence enrollment:", error);
      return false;
    }
  }

  async getCampaignAnalytics(campaignId: string): Promise<EmailCampaignAnalytics | null> {
    try {
      const { data, error } = await supabase
        .from('email_campaign_analytics')
        .select('*')
        .eq('campaign_id', campaignId)
        .single();

      if (error) throw error;
      
      // Convert database timeline JSON to EmailCampaignTimelinePoint array
      let timelinePoints: EmailCampaignTimelinePoint[] = [];
      if (data.timeline) {
        try {
          timelinePoints = (typeof data.timeline === 'string' ? 
            JSON.parse(data.timeline) : data.timeline) as EmailCampaignTimelinePoint[];
          
          // Ensure required properties exist
          timelinePoints = timelinePoints.map(point => ({
            date: point.date,
            opens: point.opens || 0,
            clicks: point.clicks || 0,
            unsubscribes: point.unsubscribes || 0,
            complaints: point.complaints || 0
          }));
        } catch (e) {
          console.error("Error parsing timeline data:", e);
          timelinePoints = [];
        }
      }

      const analytics: EmailCampaignAnalytics = {
        id: data.id,
        name: data.name,
        campaign_id: data.campaign_id,
        sent: data.sent,
        delivered: data.delivered,
        opened: data.opened,
        clicked: data.clicked,
        bounced: data.bounced,
        complained: data.complained,
        unsubscribed: data.unsubscribed,
        open_rate: data.open_rate,
        click_rate: data.click_rate,
        click_to_open_rate: data.click_to_open_rate,
        bounced_rate: data.bounced_rate,
        unsubscribe_rate: data.unsubscribe_rate,
        timeline: timelinePoints,
        created_at: data.created_at,
        updated_at: data.updated_at
      };
      
      return analytics;
    } catch (error) {
      console.error("Error getting campaign analytics:", error);
      return null;
    }
  }

  async getSequenceAnalytics(sequenceId: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('email_sequence_analytics')
        .select('*')
        .eq('sequence_id', sequenceId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Record not found, return default analytics
          return {
            id: null,
            sequence_id: sequenceId,
            total_enrollments: 0,
            active_enrollments: 0,
            completed_enrollments: 0,
            conversion_rate: 0,
            average_time_to_complete: 0,
            updated_at: new Date().toISOString()
          };
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error("Error getting sequence analytics:", error);
      throw error;
    }
  }
  
  async sendTestEmail(templateId: string, recipientEmail: string, personalizations?: Record<string, string>): Promise<boolean> {
    try {
      const { data, error } = await supabase.functions.invoke('send-test-email', {
        body: { templateId, recipientEmail, personalizations }
      });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error sending test email:", error);
      return false;
    }
  }
}

export const emailService = new EmailService();
