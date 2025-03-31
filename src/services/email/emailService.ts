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
        let ab_test: EmailABTest | null = null;

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
            const parsedAbTest = JSON.parse(abTestStr);
            // Ensure it's a valid object
            if (parsedAbTest && typeof parsedAbTest === 'object') {
              ab_test = parsedAbTest as EmailABTest;
            }
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
      const recipientIdsJson = JSON.stringify(campaign.recipientIds || campaign.recipient_ids || []);
      const personalizationsJson = JSON.stringify(campaign.personalizations || {});
      const metadataJson = JSON.stringify(campaign.metadata || {});
      const abTestJson = campaign.abTest || campaign.ab_test ? JSON.stringify(campaign.abTest || campaign.ab_test) : null;

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

      // Convert the string JSON back to objects
      let parsedRecipientIds: string[] = [];
      let parsedSegmentIds: string[] = [];
      let parsedPersonalizations: Record<string, any> = {};
      let parsedMetadata: Record<string, any> = {};
      let parsedAbTest: EmailABTest | null = null;

      try {
        if (data.recipient_ids) {
          parsedRecipientIds = JSON.parse(typeof data.recipient_ids === 'string' ? data.recipient_ids : JSON.stringify(data.recipient_ids));
        }
        if (data.segment_ids) {
          parsedSegmentIds = JSON.parse(typeof data.segment_ids === 'string' ? data.segment_ids : JSON.stringify(data.segment_ids));
        }
        if (data.personalizations) {
          parsedPersonalizations = JSON.parse(typeof data.personalizations === 'string' ? data.personalizations : JSON.stringify(data.personalizations));
        }
        if (data.metadata) {
          parsedMetadata = JSON.parse(typeof data.metadata === 'string' ? data.metadata : JSON.stringify(data.metadata));
        }
        if (data.ab_test) {
          const abTestParsed = JSON.parse(typeof data.ab_test === 'string' ? data.ab_test : JSON.stringify(data.ab_test));
          if (abTestParsed && typeof abTestParsed === 'object') {
            parsedAbTest = abTestParsed as EmailABTest;
          }
        }
      } catch (e) {
        console.error("Error parsing returned JSON data:", e);
      }

      const newCampaign: EmailCampaign = {
        id: data.id,
        name: data.name,
        subject: data.subject,
        body: data.content || '',
        content: data.content,
        status: data.status as EmailCampaignStatus,
        template_id: data.template_id,
        recipient_ids: parsedRecipientIds,
        recipientIds: parsedRecipientIds,
        segment_ids: parsedSegmentIds,
        segmentIds: parsedSegmentIds,
        personalizations: parsedPersonalizations,
        metadata: parsedMetadata,
        ab_test: parsedAbTest,
        abTest: parsedAbTest,
        scheduled_at: data.scheduled_date,
        scheduledDate: data.scheduled_date,
        sent_at: data.sent_date,
        sentDate: data.sent_date,
        created_at: data.created_at,
        updated_at: data.updated_at,
        total_recipients: data.total_recipients || 0,
        totalRecipients: data.total_recipients || 0,
        opened: data.opened || 0,
        clicked: data.clicked || 0
      };
      
      return newCampaign;
    } catch (error) {
      console.error("Error creating email campaign:", error);
      return null;
    }
  }

  async updateCampaign(id: string, campaign: Partial<EmailCampaign>): Promise<EmailCampaign | null> {
    try {
      // Convert complex objects to JSON strings
      const segmentIdsJson = JSON.stringify(campaign.segment_ids || campaign.segmentIds || []);
      const recipientIdsJson = JSON.stringify(campaign.recipientIds || campaign.recipient_ids || []);
      const personalizationsJson = JSON.stringify(campaign.personalizations || {});
      const metadataJson = JSON.stringify(campaign.metadata || {});
      const abTestJson = campaign.abTest || campaign.ab_test ? JSON.stringify(campaign.abTest || campaign.ab_test) : null;

      const { data, error } = await supabase
        .from('email_campaigns')
        .update({
          name: campaign.name,
          subject: campaign.subject,
          content: campaign.body || campaign.content,
          status: campaign.status as string,
          scheduled_date: campaign.scheduled_at || campaign.scheduledDate,
          template_id: campaign.template_id || campaign.templateId,
          segment_ids: segmentIdsJson,
          recipient_ids: recipientIdsJson,
          personalizations: personalizationsJson,
          metadata: metadataJson,
          ab_test: abTestJson
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Convert the string JSON back to objects
      let parsedRecipientIds: string[] = [];
      let parsedSegmentIds: string[] = [];
      let parsedPersonalizations: Record<string, any> = {};
      let parsedMetadata: Record<string, any> = {};
      let parsedAbTest: EmailABTest | null = null;

      try {
        if (data.recipient_ids) {
          parsedRecipientIds = JSON.parse(typeof data.recipient_ids === 'string' ? data.recipient_ids : JSON.stringify(data.recipient_ids));
        }
        if (data.segment_ids) {
          parsedSegmentIds = JSON.parse(typeof data.segment_ids === 'string' ? data.segment_ids : JSON.stringify(data.segment_ids));
        }
        if (data.personalizations) {
          parsedPersonalizations = JSON.parse(typeof data.personalizations === 'string' ? data.personalizations : JSON.stringify(data.personalizations));
        }
        if (data.metadata) {
          parsedMetadata = JSON.parse(typeof data.metadata === 'string' ? data.metadata : JSON.stringify(data.metadata));
        }
        if (data.ab_test) {
          const abTestParsed = JSON.parse(typeof data.ab_test === 'string' ? data.ab_test : JSON.stringify(data.ab_test));
          if (abTestParsed && typeof abTestParsed === 'object') {
            parsedAbTest = abTestParsed as EmailABTest;
          }
        }
      } catch (e) {
        console.error("Error parsing returned JSON data:", e);
      }

      const updatedCampaign: EmailCampaign = {
        id: data.id,
        name: data.name,
        subject: data.subject,
        body: data.content || '',
        content: data.content,
        status: data.status as EmailCampaignStatus,
        template_id: data.template_id,
        recipient_ids: parsedRecipientIds,
        recipientIds: parsedRecipientIds,
        segment_ids: parsedSegmentIds,
        segmentIds: parsedSegmentIds,
        personalizations: parsedPersonalizations,
        metadata: parsedMetadata,
        ab_test: parsedAbTest,
        abTest: parsedAbTest,
        scheduled_at: data.scheduled_date,
        scheduledDate: data.scheduled_date,
        sent_at: data.sent_date,
        sentDate: data.sent_date,
        created_at: data.created_at,
        updated_at: data.updated_at,
        total_recipients: data.total_recipients || 0,
        totalRecipients: data.total_recipients || 0,
        opened: data.opened || 0,
        clicked: data.clicked || 0
      };
      
      return updatedCampaign;
    } catch (error) {
      console.error("Error updating email campaign:", error);
      return null;
    }
  }

  async scheduleCampaign(id: string, date: string): Promise<EmailCampaign> {
    try {
      const { data, error } = await supabase
        .from('email_campaigns')
        .update({ 
          status: 'scheduled' as EmailCampaignStatus,
          scheduled_date: date 
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      // Create minimal valid EmailCampaign object
      return { 
        id: data.id, 
        scheduled_at: data.scheduled_date,
        name: data.name,
        subject: data.subject,
        body: data.content || '',
        status: data.status as EmailCampaignStatus,
        created_at: data.created_at,
        updated_at: data.updated_at,
        recipient_ids: [],
        segment_ids: [],
        personalizations: {},
        metadata: {}
      };
    } catch (error) {
      console.error("Error scheduling campaign:", error);
      throw error;
    }
  }

  async sendCampaignNow(id: string): Promise<EmailCampaign> {
    try {
      const { data, error } = await supabase
        .from('email_campaigns')
        .update({ 
          status: 'sending' as EmailCampaignStatus,
          sent_date: new Date().toISOString() 
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      // Create minimal valid EmailCampaign object
      return { 
        id: data.id, 
        status: data.status as EmailCampaignStatus,
        name: data.name,
        subject: data.subject,
        body: data.content || '',
        created_at: data.created_at,
        updated_at: data.updated_at,
        recipient_ids: [],
        segment_ids: [],
        personalizations: {},
        metadata: {}
      };
    } catch (error) {
      console.error("Error sending campaign now:", error);
      throw error;
    }
  }

  async pauseCampaign(id: string): Promise<EmailCampaign> {
    try {
      const { data, error } = await supabase
        .from('email_campaigns')
        .update({ 
          status: 'paused' as EmailCampaignStatus 
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      // Create minimal valid EmailCampaign object
      return { 
        id: data.id, 
        status: data.status as EmailCampaignStatus,
        name: data.name,
        subject: data.subject,
        body: data.content || '',
        created_at: data.created_at,
        updated_at: data.updated_at,
        recipient_ids: [],
        segment_ids: [],
        personalizations: {},
        metadata: {}
      };
    } catch (error) {
      console.error("Error pausing campaign:", error);
      throw error;
    }
  }

  async cancelCampaign(id: string): Promise<EmailCampaign> {
    try {
      const { data, error } = await supabase
        .from('email_campaigns')
        .update({ 
          status: 'cancelled' as EmailCampaignStatus 
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      // Create minimal valid EmailCampaign object
      return { 
        id: data.id, 
        status: data.status as EmailCampaignStatus,
        name: data.name,
        subject: data.subject,
        body: data.content || '',
        created_at: data.created_at,
        updated_at: data.updated_at,
        recipient_ids: [],
        segment_ids: [],
        personalizations: {},
        metadata: {}
      };
    } catch (error) {
      console.error("Error cancelling campaign:", error);
      throw error;
    }
  }

  async getSegments(id?: string): Promise<any> {
    try {
      if (id) {
        const { data, error } = await supabase
          .from('customer_segments')
          .select('*')
          .eq('id', id)
          .single();
          
        if (error) throw error;
        return data;
      }
      
      const { data, error } = await supabase
        .from('customer_segments')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error fetching segments:", error);
      throw error;
    }
  }

  async createSegment(segment: any): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('customer_segments')
        .insert({
          name: segment.name,
          description: segment.description,
          color: segment.color
        })
        .select()
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error creating segment:", error);
      throw error;
    }
  }

  async updateSegment(id: string, updates: any): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('customer_segments')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error updating segment:", error);
      throw error;
    }
  }

  async deleteSegment(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('customer_segments')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error deleting segment:", error);
      return false;
    }
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
    try {
      const { data: updatedSequence, error: sequenceError } = await supabase
        .from('email_sequences')
        .update({
          name: updates.name,
          description: updates.description,
          trigger_type: updates.triggerType || updates.trigger_type,
          trigger_event: updates.triggerEvent || updates.trigger_event,
          is_active: updates.isActive || updates.is_active
        })
        .eq('id', id)
        .select()
        .single();

      if (sequenceError) throw sequenceError;

      return {
        id: updatedSequence.id,
        name: updatedSequence.name,
        description: updatedSequence.description,
        steps: [], // Steps need to be fetched separately
        created_at: updatedSequence.created_at,
        updated_at: updatedSequence.updated_at,
        triggerType: updatedSequence.trigger_type as 'manual' | 'event' | 'schedule',
        triggerEvent: updatedSequence.trigger_event,
        isActive: updatedSequence.is_active
      };
    } catch (error) {
      console.error("Error updating email sequence:", error);
      return null;
    }
  }

  async deleteSequence(id: string): Promise<boolean> {
    try {
      // First delete all steps
      const { error: stepsError } = await supabase
        .from('email_sequence_steps')
        .delete()
        .eq('sequence_id', id);
        
      if (stepsError) throw stepsError;
      
      // Then delete the sequence
      const { error: sequenceError } = await supabase
        .from('email_sequences')
        .delete()
        .eq('id', id);
        
      if (sequenceError) throw sequenceError;
      
      return true;
    } catch (error) {
      console.error("Error deleting sequence:", error);
      return false;
    }
  }

  async getSequenceSteps(sequenceId: string): Promise<EmailSequenceStep[]> {
    try {
      const { data, error } = await supabase
        .from('email_sequence_steps')
        .select('*')
        .eq('sequence_id', sequenceId)
        .order('position', { ascending: true });
        
      if (error) throw error;
      
      return data.map(step => {
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
    } catch (error) {
      console.error("Error getting sequence steps:", error);
      throw error;
    }
  }

  async createSequenceStep(step: EmailSequenceStep): Promise<EmailSequenceStep> {
    try {
      const { data, error } = await supabase
        .from('email_sequence_steps')
        .insert({
          sequence_id: step.sequence_id,
          name: step.name,
          template_id: step.templateId || step.email_template_id,
          delay_hours: step.delayHours || 0,
          delay_type: step.delayType || 'fixed',
          position: step.position || 0,
          is_active: step.isActive !== undefined ? step.isActive : true,
          condition_type: step.condition?.type,
          condition_value: step.condition?.value,
          condition_operator: step.condition?.operator
        })
        .select()
        .single();
        
      if (error) throw error;
      
      return {
        id: data.id,
        sequence_id: data.sequence_id,
        type: data.delay_hours > 0 ? 'delay' : 'email',
        order: data.position,
        delay_duration: data.delay_hours ? `${data.delay_hours} hours` : undefined,
        email_template_id: data.template_id,
        created_at: data.created_at,
        updated_at: data.updated_at,
        name: data.name,
        templateId: data.template_id,
        delayHours: data.delay_hours,
        delayType: (data.delay_type || 'fixed') as 'fixed' | 'business_days',
        position: data.position,
        isActive: data.is_active,
        condition: data.condition_type ? {
          type: data.condition_type as 'event' | 'property',
          value: data.condition_value,
          operator: data.condition_operator as '=' | '!=' | '>' | '<' | '>=' | '<='
        } : undefined
      };
    } catch (error) {
      console.error("Error creating sequence step:", error);
      throw error;
    }
  }

  async updateSequenceStep(stepId: string, updates: Partial<EmailSequenceStep>): Promise<EmailSequenceStep> {
    try {
      const updateData: any = {};
      
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.templateId || updates.email_template_id) updateData.template_id = updates.templateId || updates.email_template_id;
      if (updates.delayHours !== undefined) updateData.delay_hours = updates.delayHours;
      if (updates.delayType) updateData.delay_type = updates.delayType;
      if (updates.position !== undefined) updateData.position = updates.position;
      if (updates.isActive !== undefined) updateData.is_active = updates.isActive;
      
      if (updates.condition) {
        updateData.condition_type = updates.condition.type;
        updateData.condition_value = updates.condition.value;
        updateData.condition_operator = updates.condition.operator;
      }
      
      const { data, error } = await supabase
        .from('email_sequence_steps')
        .update(updateData)
        .eq('id', stepId)
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        id: data.id,
        sequence_id: data.sequence_id,
        type: data.delay_hours > 0 ? 'delay' : 'email',
        order: data.position,
        delay_duration: data.delay_hours ? `${data.delay_hours} hours` : undefined,
        email_template_id: data.template_id,
        created_at: data.created_at,
        updated_at: data.updated_at,
        name: data.name,
        templateId: data.template_id,
        delayHours: data.delay_hours,
        delayType: (data.delay_type || 'fixed') as 'fixed' | 'business_days',
        position: data.position,
        isActive: data.is_active,
        condition: data.condition_type ? {
          type: data.condition_type as 'event' | 'property',
          value: data.condition_value,
          operator: data.condition_operator as '=' | '!=' | '>' | '<' | '>=' | '<='
        } : undefined
      };
    } catch (error) {
      console.error("Error updating sequence step:", error);
      throw error;
    }
  }

  async deleteSequenceStep(stepId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('email_sequence_steps')
        .delete()
        .eq('id', stepId);
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error("Error deleting sequence step:", error);
      return false;
    }
  }

  async triggerSequenceProcessing(sequenceId?: string): Promise<boolean> {
    try {
      // Call the Supabase Edge Function to process sequences
      const { error } = await supabase.functions.invoke('process-email-sequences', {
        body: { 
          sequenceId,
          action: 'process' 
        }
      });
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error triggering sequence processing:", error);
      return false;
    }
  }

  async updateSequenceAnalytics(sequenceId: string): Promise<boolean> {
    try {
      // Call the Supabase Edge Function to update analytics
      const { error } = await supabase.functions.invoke('process-email-sequences', {
        body: { 
          sequenceId,
          action: 'updateAnalytics' 
        }
      });
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error updating sequence analytics:", error);
      return false;
    }
  }

  async pauseSequenceEnrollment(enrollmentId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('email_sequence_enrollments')
        .update({ 
          status: 'paused',
          updated_at: new Date().toISOString() 
        })
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
        .update({ 
          status: 'active',
          updated_at: new Date().toISOString() 
        })
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
        .update({ 
          status: 'cancelled',
          updated_at: new Date().toISOString(),
          completed_at: new Date().toISOString()
        })
        .eq('id', enrollmentId);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error cancelling sequence enrollment:", error);
      return false;
    }
  }

  async sendTestEmail(templateId: string, recipientEmail: string, personalizations?: Record<string, string>): Promise<boolean> {
    try {
      // Call an edge function to send the test email
      const { error } = await supabase.functions.invoke('send-test-email', {
        body: { 
          templateId,
          recipientEmail,
          personalizations: personalizations || {}
        }
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
