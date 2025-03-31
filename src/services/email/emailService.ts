import { supabase } from "@/lib/supabase";
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
  EmailCampaignStatus
} from "@/types/email";

const mockCampaigns: EmailCampaign[] = [];
const mockSegments: { id: string, name: string, description?: string, criteria: any[], created_at: string, updated_at: string }[] = [];
const mockSequences: EmailSequence[] = [];
const mockEnrollments: EmailSequenceEnrollment[] = [];

interface EmailSegment {
  id: string;
  name: string;
  description?: string;
  criteria: any[];
  created_at: string;
  updated_at: string;
}

class EmailService {
  async getTemplates(id?: string, category?: EmailCategory): Promise<EmailTemplatePreview[] | EmailTemplate> {
    try {
      if (id) {
        const { data, error } = await supabase
          .from('email_templates')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        
        // Parse the variables array from JSON
        let parsedVariables: EmailTemplateVariable[] = [];
        try {
          if (data.variables) {
            // First convert unknown type to string if needed
            const variablesStr = typeof data.variables === 'string' 
              ? data.variables 
              : JSON.stringify(data.variables);
            
            // Then parse safely
            parsedVariables = JSON.parse(variablesStr) as EmailTemplateVariable[];
          }
        } catch (e) {
          console.error("Error parsing variables:", e);
          parsedVariables = [];
        }
        
        const template: EmailTemplate = {
          id: data.id,
          name: data.name,
          subject: data.subject,
          description: data.description,
          category: data.category as EmailCategory,
          content: data.content,
          created_at: data.created_at,
          updated_at: data.updated_at,
          variables: parsedVariables,
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

      const templates: EmailTemplatePreview[] = data.map(item => ({
        id: item.id,
        name: item.name,
        subject: item.subject,
        category: item.category as EmailCategory,
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
      // Convert variables array to JSON string for storage
      const variablesJson = template.variables ? JSON.stringify(template.variables) : '[]';

      const { data, error } = await supabase
        .from('email_templates')
        .insert({
          name: template.name,
          subject: template.subject,
          description: template.description,
          category: template.category as string,
          content: template.content,
          variables: variablesJson
        })
        .select()
        .single();

      if (error) throw error;

      // Parse the variables JSON back to an array for the returned object
      let parsedVariables: EmailTemplateVariable[] = [];
      try {
        parsedVariables = JSON.parse(data.variables as string) as EmailTemplateVariable[];
      } catch (e) {
        console.error("Error parsing variables:", e);
      }

      const newTemplate: EmailTemplate = {
        id: data.id,
        name: data.name,
        subject: data.subject,
        description: data.description,
        category: data.category as EmailCategory,
        content: data.content,
        created_at: data.created_at,
        updated_at: data.updated_at,
        variables: parsedVariables
      };
      
      return newTemplate;
    } catch (error) {
      console.error("Error creating email template:", error);
      return null;
    }
  }

  async updateTemplate(id: string, template: Partial<EmailTemplate>): Promise<EmailTemplate | null> {
    try {
      // Convert variables array to JSON string for storage
      const variablesJson = template.variables ? JSON.stringify(template.variables) : '[]';

      const { data, error } = await supabase
        .from('email_templates')
        .update({
          name: template.name,
          subject: template.subject,
          description: template.description,
          category: template.category as string,
          content: template.content,
          variables: variablesJson
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Parse the variables JSON back to an array for the returned object
      let parsedVariables: EmailTemplateVariable[] = [];
      try {
        parsedVariables = JSON.parse(data.variables as string) as EmailTemplateVariable[];
      } catch (e) {
        console.error("Error parsing variables:", e);
      }

      const updatedTemplate: EmailTemplate = {
        id: data.id,
        name: data.name,
        subject: data.subject,
        description: data.description,
        category: data.category as EmailCategory,
        content: data.content,
        created_at: data.created_at,
        updated_at: data.updated_at,
        variables: parsedVariables
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
        
        // Parse JSON fields
        let segment_ids: string[] = [];
        let recipient_ids: string[] = [];
        let personalizations: Record<string, any> = {};
        let metadata: Record<string, any> = {};
        let ab_test: EmailABTest | undefined;

        try {
          // Parse segment_ids
          if (data.segment_ids) {
            const segmentIdsStr = typeof data.segment_ids === 'string' 
              ? data.segment_ids 
              : JSON.stringify(data.segment_ids);
            segment_ids = JSON.parse(segmentIdsStr) as string[];
          }
          
          // Parse recipient_ids
          if (data.recipient_ids) {
            const recipientIdsStr = typeof data.recipient_ids === 'string' 
              ? data.recipient_ids 
              : JSON.stringify(data.recipient_ids);
            recipient_ids = JSON.parse(recipientIdsStr) as string[];
          }
          
          // Parse personalizations
          if (data.personalizations) {
            const personalizationsStr = typeof data.personalizations === 'string' 
              ? data.personalizations 
              : JSON.stringify(data.personalizations);
            personalizations = JSON.parse(personalizationsStr);
          }
          
          // Parse metadata
          if (data.metadata) {
            const metadataStr = typeof data.metadata === 'string' 
              ? data.metadata 
              : JSON.stringify(data.metadata);
            metadata = JSON.parse(metadataStr);
          }
          
          // Parse AB test
          if (data.ab_test) {
            const abTestStr = typeof data.ab_test === 'string' 
              ? data.ab_test 
              : JSON.stringify(data.ab_test);
            ab_test = JSON.parse(abTestStr) as EmailABTest;
          }
        } catch (e) {
          console.error("Error parsing campaign JSON fields:", e);
        }
        
        const campaign: EmailCampaign = {
          id: data.id,
          name: data.name,
          subject: data.subject,
          body: data.content || '',
          content: data.content,
          status: data.status as EmailCampaignStatus,
          template_id: data.template_id,
          segment_ids: segment_ids,
          recipientIds: recipient_ids,
          personalizations: personalizations,
          metadata: metadata,
          abTest: ab_test,
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

      const campaigns: EmailCampaignPreview[] = data.map(item => ({
        id: item.id,
        name: item.name,
        subject: item.subject,
        status: item.status as EmailCampaignStatus,
        scheduled_at: item.scheduled_date,
        sent_at: item.sent_date,
        created_at: item.created_at,
        total_recipients: item.total_recipients,
        opened: item.opened,
        clicked: item.clicked,
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
      // Convert complex objects to JSON strings
      const segmentIdsJson = JSON.stringify(campaign.segment_ids || campaign.segmentIds || []);
      const recipientIdsJson = JSON.stringify(campaign.recipientIds || []);
      const personalizationsJson = JSON.stringify(campaign.personalizations || {});
      const metadataJson = JSON.stringify(campaign.metadata || {});
      const abTestJson = campaign.abTest ? JSON.stringify(campaign.abTest) : null;

      const { data, error } = await supabase
        .from('email_campaigns')
        .insert({
          name: campaign.name,
          subject: campaign.subject,
          content: campaign.body || campaign.content,
          status: (campaign.status || 'draft') as string,
          scheduled_date: campaign.scheduled_at || campaign.scheduledDate,
          template_id: campaign.template_id || campaign.templateId,
          segment_ids: segmentIdsJson,
          recipient_ids: recipientIdsJson,
          personalizations: personalizationsJson,
          metadata: metadataJson,
          ab_test: abTestJson
        })
        .select()
        .single();

      if (error) throw error;

      const newCampaign: EmailCampaign = {
        id: data.id,
        name: data.name,
        subject: data.subject,
        body: data.content,
        content: data.content,
        status: data.status as EmailCampaignStatus,
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
      const updateData: any = {
        name: campaign.name,
        subject: campaign.subject,
        content: campaign.body || campaign.content,
        status: campaign.status as string,
        scheduled_date: campaign.scheduled_at || campaign.scheduledDate,
        template_id: campaign.template_id || campaign.templateId
      };
      
      if (campaign.segment_ids || campaign.segmentIds) {
        updateData.segment_ids = JSON.stringify(campaign.segment_ids || campaign.segmentIds);
      }
      
      if (campaign.recipientIds) {
        updateData.recipient_ids = JSON.stringify(campaign.recipientIds);
      }
      
      if (campaign.personalizations) {
        updateData.personalizations = JSON.stringify(campaign.personalizations);
      }
      
      if (campaign.metadata) {
        updateData.metadata = JSON.stringify(campaign.metadata);
      }
      
      if (campaign.abTest) {
        updateData.ab_test = JSON.stringify(campaign.abTest);
      }

      const { data, error } = await supabase
        .from('email_campaigns')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updatedCampaign: EmailCampaign = {
        id: data.id,
        name: data.name,
        subject: data.subject,
        body: data.content,
        content: data.content,
        status: data.status as EmailCampaignStatus,
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
    return { 
      id, 
      scheduled_at: date,
      name: '',
      subject: '',
      body: '',
      status: 'scheduled' as EmailCampaignStatus,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  async sendCampaignNow(id: string): Promise<EmailCampaign> {
    return { 
      id, 
      status: 'sending' as EmailCampaignStatus,
      name: '',
      subject: '',
      body: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  async pauseCampaign(id: string): Promise<EmailCampaign> {
    return { 
      id, 
      status: 'paused' as EmailCampaignStatus,
      name: '',
      subject: '',
      body: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  async cancelCampaign(id: string): Promise<EmailCampaign> {
    return { 
      id, 
      status: 'cancelled' as EmailCampaignStatus,
      name: '',
      subject: '',
      body: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  async getSegments(id?: string): Promise<EmailSegment | EmailSegment[]> {
    return id ? { id, name: '', criteria: [], created_at: '', updated_at: '' } : [];
  }

  async createSegment(segment: EmailSegment): Promise<EmailSegment> {
    return { ...segment, id: Math.random().toString() };
  }

  async updateSegment(id: string, updates: Partial<EmailSegment>): Promise<EmailSegment> {
    return { ...updates, id, criteria: [], created_at: '', updated_at: '' } as EmailSegment;
  }

  async deleteSegment(id: string): Promise<boolean> {
    return true;
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
        const { data: stepsData, error: stepsError } = await supabase
          .from('email_sequence_steps')
          .select('*')
          .eq('sequence_id', seq.id)
          .order('position', { ascending: true });

        if (stepsError) throw stepsError;

        const steps: EmailSequenceStep[] = stepsData.map(step => {
          // Parse condition object if it exists
          let condition = undefined;
          if (step.condition_type) {
            condition = {
              type: step.condition_type as 'event' | 'property',
              value: step.condition_value,
              operator: step.condition_operator as '=' | '!=' | '>' | '<' | '>=' | '<='
            };
          }

          return {
            id: step.id,
            sequence_id: step.sequence_id,
            type: step.delay_hours > 0 ? 'delay' : 'email',
            order: step.position,
            delay_duration: step.delay_hours ? `${step.delay_hours} hours` : undefined,
            email_template_id: step.template_id,
            created_at: step.created_at,
            updated_at: step.updated_at,
            name: step.name,
            templateId: step.template_id,
            delayHours: step.delay_hours,
            delayType: (step.delay_type === 'business_days' ? 'business_days' : 'fixed') as 'fixed' | 'business_days',
            position: step.position,
            isActive: step.is_active,
            condition: condition
          };
        });

        sequences.push({
          id: seq.id,
          name: seq.name,
          description: seq.description,
          steps,
          created_at: seq.created_at,
          updated_at: seq.updated_at,
          triggerType: seq.trigger_type as 'manual' | 'event' | 'schedule',
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

      const { data: stepsData, error: stepsError } = await supabase
        .from('email_sequence_steps')
        .select('*')
        .eq('sequence_id', id)
        .order('position', { ascending: true });

      if (stepsError) throw stepsError;

      const steps: EmailSequenceStep[] = stepsData.map(step => {
        // Parse condition object if it exists
        let condition = undefined;
        if (step.condition_type) {
          condition = {
            type: step.condition_type as 'event' | 'property',
            value: step.condition_value,
            operator: step.condition_operator as '=' | '!=' | '>' | '<' | '>=' | '<='
          };
        }

        return {
          id: step.id,
          sequence_id: step.sequence_id,
          type: step.delay_hours > 0 ? 'delay' : 'email',
          order: step.position,
          delay_duration: step.delay_hours ? `${step.delay_hours} hours` : undefined,
          email_template_id: step.template_id,
          created_at: step.created_at,
          updated_at: step.updated_at,
          name: step.name,
          templateId: step.template_id,
          delayHours: step.delay_hours,
          delayType: (step.delay_type === 'business_days' ? 'business_days' : 'fixed') as 'fixed' | 'business_days',
          position: step.position,
          isActive: step.is_active,
          condition: condition
        };
      });

      return {
        id: sequence.id,
        name: sequence.name,
        description: sequence.description,
        steps,
        created_at: sequence.created_at,
        updated_at: sequence.updated_at,
        triggerType: sequence.trigger_type as 'manual' | 'event' | 'schedule',
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
      const { data: newSequence, error: sequenceError } = await supabase
        .from('email_sequences')
        .insert({
          name: sequence.name,
          description: sequence.description,
          trigger_type: (sequence.triggerType || sequence.trigger_type) as string,
          trigger_event: sequence.triggerEvent || sequence.trigger_event,
          is_active: sequence.isActive || sequence.is_active || false
        })
        .select()
        .single();

      if (sequenceError) throw sequenceError;

      const steps: EmailSequenceStep[] = [];
      
      if (sequence.steps && sequence.steps.length > 0) {
        for (const [index, step] of sequence.steps.entries()) {
          const stepData = {
            sequence_id: newSequence.id,
            name: step.name,
            template_id: step.templateId || step.email_template_id,
            delay_hours: step.delayHours || 0,
            delay_type: (step.delayType || 'fixed') as 'fixed' | 'business_days',
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
          
          steps.push({
            id: newStep.id,
            sequence_id: newStep.sequence_id,
            type: newStep.delay_hours > 0 ? 'delay' : 'email',
            order: newStep.position,
            delay_duration: newStep.delay_hours ? `${newStep.delay_hours} hours` : undefined,
            email_template_id: newStep.template_id,
            created_at: newStep.created_at,
            updated_at: newStep.updated_at,
            name: newStep.name,
            templateId: newStep.template_id,
            delayHours: newStep.delay_hours,
            delayType: (newStep.delay_type || 'fixed') as 'fixed' | 'business_days',
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

      return {
        id: newSequence.id,
        name: newSequence.name,
        description: newSequence.description,
        steps,
        created_at: newSequence.created_at,
        updated_at: newSequence.updated_at,
        triggerType: newSequence.trigger_type as 'manual' | 'event' | 'schedule',
        triggerEvent: newSequence.trigger_event,
        isActive: newSequence.is_active
      };
    } catch (error) {
      console.error("Error creating email sequence:", error);
      return null;
    }
  }

  async updateSequence(id: string, updates: Partial<EmailSequence>): Promise<EmailSequence | null> {
    return { 
      ...updates, 
      id, 
      steps: updates.steps || [],
      created_at: '',
      updated_at: ''
    } as EmailSequence;
  }

  async deleteSequence(id: string): Promise<boolean> {
    return true;
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
    if (id) {
      return {
        id,
        sequence_id: '',
        customer_id: '',
        status: 'active',
        created_at: '',
        updated_at: ''
      };
    }
    return [];
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
      
      let timelinePoints: EmailCampaignTimelinePoint[] = [];
      if (data.timeline) {
        try {
          timelinePoints = (typeof data.timeline === 'string' ? 
            JSON.parse(data.timeline) : data.timeline) as EmailCampaignTimelinePoint[];
          
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
      console.error("Error sending
