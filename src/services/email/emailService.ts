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
          segment_id: undefined, // This field isn't in the database schema
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

  async updateSequence(id: string, sequence: Partial<EmailSequence>): Promise<EmailSequence | null> {
    try {
      const { data: updatedSequence, error: sequenceError } = await supabase
        .from('email_sequences')
        .update({
          name: sequence.name,
          description: sequence.description,
          trigger_type: (sequence.triggerType || sequence.trigger_type) as string,
          trigger_event: sequence.triggerEvent || sequence.trigger_event,
          is_active: sequence.isActive || sequence.is_active
        })
        .eq('id', id)
        .select()
        .single();

      if (sequenceError) throw sequenceError;

      // Handle steps if provided
      if (sequence.steps && sequence.steps.length > 0) {
        // Delete existing steps
        const { error: deleteError } = await supabase
          .from('email_sequence_steps')
          .delete()
          .eq('sequence_id', id);

        if (deleteError) throw deleteError;

        // Insert new steps
        for (const [index, step] of sequence.steps.entries()) {
          const stepData = {
            sequence_id: id,
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

          const { error: stepError } = await supabase
            .from('email_sequence_steps')
            .insert(stepData);

          if (stepError) throw stepError;
        }
      }

      // Fetch the updated sequence with steps
      return await this.getSequenceById(id);
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
      console.error("Error deleting email sequence:", error);
      return false;
    }
  }

  async getSequenceEnrollments(sequenceId?: string): Promise<EmailSequenceEnrollment[]> {
    try {
      let query = supabase
        .from('email_sequence_enrollments')
        .select('*');
      
      if (sequenceId) {
        query = query.eq('sequence_id', sequenceId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      return data.map(item => {
        // Parse metadata if it exists
        let parsedMetadata: Record<string, any> = {};
        if (item.metadata) {
          try {
            parsedMetadata = typeof item.metadata === 'string'
              ? JSON.parse(item.metadata)
              : item.metadata as Record<string, any>;
          } catch (e) {
            console.error("Error parsing metadata:", e);
          }
        }

        // Ensure status is one of the allowed values
        let status: 'active' | 'paused' | 'completed' | 'cancelled' = 'active';
        if (item.status === 'paused' || item.status === 'completed' || item.status === 'cancelled') {
          status = item.status;
        }

        return {
          id: item.id,
          sequence_id: item.sequence_id,
          sequenceId: item.sequence_id,
          customer_id: item.customer_id,
          customerId: item.customer_id,
          status: status,
          current_step_id: item.current_step_id,
          currentStepId: item.current_step_id,
          created_at: item.created_at,
          updated_at: item.updated_at,
          completed_at: item.completed_at,
          completedAt: item.completed_at,
          startedAt: item.created_at,
          nextSendTime: item.next_send_time,
          metadata: parsedMetadata
        };
      });
    } catch (error) {
      console.error("Error getting sequence enrollments:", error);
      return [];
    }
  }

  async enrollCustomerInSequence(sequenceId: string, customerId: string): Promise<EmailSequenceEnrollment | null> {
    try {
      const { data, error } = await supabase
        .from('email_sequence_enrollments')
        .insert({
          sequence_id: sequenceId,
          customer_id: customerId,
          status: 'active',
          started_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Parse metadata if it exists
      let parsedMetadata: Record<string, any> = {};
      if (data.metadata) {
        try {
          parsedMetadata = typeof data.metadata === 'string'
            ? JSON.parse(data.metadata)
            : data.metadata as Record<string, any>;
        } catch (e) {
          console.error("Error parsing metadata:", e);
        }
      }

      return {
        id: data.id,
        sequence_id: data.sequence_id,
        sequenceId: data.sequence_id,
        customer_id: data.customer_id,
        customerId: data.customer_id,
        status: 'active',
        current_step_id: data.current_step_id,
        currentStepId: data.current_step_id,
        created_at: data.created_at,
        updated_at: data.updated_at,
        completed_at: data.completed_at,
        completedAt: data.completed_at,
        startedAt: data.started_at,
        nextSendTime: data.next_send_time,
        metadata: parsedMetadata
      };
    } catch (error) {
      console.error("Error enrolling customer in sequence:", error);
      return null;
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
      console.error("Error pausing enrollment:", error);
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
      console.error("Error resuming enrollment:", error);
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
      console.error("Error cancelling enrollment:", error);
      return false;
    }
  }

  async updateSequenceAnalytics(sequenceId: string): Promise<boolean> {
    try {
      // Calculate analytics data for the sequence
      const { data: enrollments, error: enrollmentsError } = await supabase
        .from('email_sequence_enrollments')
        .select('*')
        .eq('sequence_id', sequenceId);
        
      if (enrollmentsError) throw enrollmentsError;
      
      // Calculate analytics metrics
      const totalEnrollments = enrollments.length;
      const activeEnrollments = enrollments.filter(e => e.status === 'active').length;
      const completedEnrollments = enrollments.filter(e => e.status === 'completed').length;
      const conversionRate = totalEnrollments > 0 ? completedEnrollments / totalEnrollments : 0;

      // Calculate average time to complete
      let averageTimeToComplete = 0;
      const completedWithTimes = enrollments.filter(e => e.status === 'completed' && e.completed_at && e.started_at);
      
      if (completedWithTimes.length > 0) {
        const totalHours = completedWithTimes.reduce((sum, enrollment) => {
          const startDate = new Date(enrollment.started_at || enrollment.created_at);
          const endDate = new Date(enrollment.completed_at);
          const diffInMs = endDate.getTime() - startDate.getTime();
          const diffInHours = diffInMs / (1000 * 60 * 60);
          return sum + diffInHours;
        }, 0);
        
        averageTimeToComplete = totalHours / completedWithTimes.length;
      }
      
      // Check if analytics record exists
      const { data: existingAnalytics, error: analyticsError } = await supabase
        .from('email_sequence_analytics')
        .select('*')
        .eq('sequence_id', sequenceId)
        .maybeSingle();
        
      if (analyticsError) throw analyticsError;
      
      if (existingAnalytics) {
        // Update existing record
        const { error: updateError } = await supabase
          .from('email_sequence_analytics')
          .update({
            total_enrollments: totalEnrollments,
            active_enrollments: activeEnrollments,
            completed_enrollments: completedEnrollments,
            conversion_rate: conversionRate,
            average_time_to_complete: averageTimeToComplete,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingAnalytics.id);
          
        if (updateError) throw updateError;
      } else {
        // Create new record
        const { error: insertError } = await supabase
          .from('email_sequence_analytics')
          .insert({
            sequence_id: sequenceId,
            total_enrollments: totalEnrollments,
            active_enrollments: activeEnrollments,
            completed_enrollments: completedEnrollments,
            conversion_rate: conversionRate,
            average_time_to_complete: averageTimeToComplete
          });
          
        if (insertError) throw insertError;
      }
      
      return true;
    } catch (error) {
      console.error("Error updating sequence analytics:", error);
      return false;
    }
  }

  async triggerSequenceProcessing(sequenceId?: string): Promise<boolean> {
    try {
      // In a real implementation, this would trigger an edge function
      // or backend job to process the sequence
      
      // For now, we'll just return success
      console.log(`Processing ${sequenceId ? `sequence ${sequenceId}` : 'all sequences'}...`);

      // If we have a specific sequence ID, update its analytics
      if (sequenceId) {
        await this.updateSequenceAnalytics(sequenceId);
      }
      
      return true;
    } catch (error) {
      console.error("Error triggering sequence processing:", error);
      return false;
    }
  }

  async sendTestEmail(templateId: string, recipientEmail: string, personalizations?: Record<string, string>): Promise<boolean> {
    try {
      // In a real implementation, this would call an API to send the email
      console.log(`Sending test email using template ${templateId} to ${recipientEmail}`);
      console.log('Personalizations:', personalizations);
      
      // Mock successful email sending
      return true;
    } catch (error) {
      console.error("Error sending test email:", error);
      return false;
    }
  }
}

export const emailService = new EmailService();
