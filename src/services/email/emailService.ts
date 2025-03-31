import { supabase } from '@/lib/supabase';
import {
  EmailTemplate,
  EmailTemplatePreview,
  EmailCategory,
  EmailCampaign,
  EmailCampaignPreview,
  EmailSequence,
  EmailSequenceStep,
  EmailSequenceEnrollment,
  EmailTemplateVariable
} from '@/types/email';

// Mock data for development - keeping as reference
const mockTemplates = [
  {
    id: '1',
    name: 'Welcome Email',
    subject: 'Welcome to Our Service!',
    description: 'Initial welcome email for new customers',
    category: 'welcome' as EmailCategory,
    createdAt: '2023-06-01T10:00:00Z',
    updatedAt: '2023-06-01T10:00:00Z'
  },
  {
    id: '2',
    name: 'Discount Offer',
    subject: 'Exclusive Discount Inside!',
    description: 'Email offering a discount to loyal customers',
    category: 'marketing' as EmailCategory,
    createdAt: '2023-06-05T14:30:00Z',
    updatedAt: '2023-06-05T14:30:00Z'
  },
  {
    id: '3',
    name: 'Appointment Reminder',
    subject: 'Reminder: Your Appointment is Coming Up',
    description: 'Reminder email for upcoming appointments',
    category: 'reminder' as EmailCategory,
    createdAt: '2023-06-10T09:15:00Z',
    updatedAt: '2023-06-10T09:15:00Z'
  },
];

const mockCampaigns = [
  {
    id: '101',
    name: 'Summer Sale',
    subject: 'Our Biggest Sale of the Year!',
    status: 'draft',
    scheduledDate: '2023-07-01T00:00:00Z',
    sentDate: null,
    totalRecipients: 500,
    opened: 250,
    clicked: 50,
    createdAt: '2023-06-15T11:00:00Z',
    updatedAt: '2023-06-15T11:00:00Z'
  },
  {
    id: '102',
    name: 'New Product Launch',
    subject: 'Introducing Our Latest Innovation',
    status: 'scheduled',
    scheduledDate: '2023-06-25T00:00:00Z',
    sentDate: null,
    totalRecipients: 300,
    opened: 150,
    clicked: 30,
    createdAt: '2023-06-20T16:45:00Z',
    updatedAt: '2023-06-20T16:45:00Z'
  },
];

// Email Templates
export const emailService = {
  getTemplates: async (): Promise<EmailTemplatePreview[]> => {
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform snake_case to camelCase to match the interface
      return data?.map(template => ({
        id: template.id,
        name: template.name,
        subject: template.subject,
        description: template.description,
        category: template.category as EmailCategory,
        createdAt: template.created_at,
        updatedAt: template.updated_at
      })) || [];
    } catch (error) {
      console.error('Error fetching email templates:', error);
      return [];
    }
  },

  getTemplateById: async (id: string): Promise<EmailTemplate | null> => {
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      
      if (!data) return null;
      
      // Transform to match EmailTemplate interface
      return {
        id: data.id,
        name: data.name,
        subject: data.subject,
        description: data.description,
        category: data.category as EmailCategory,
        content: data.content,
        variables: Array.isArray(data.variables) ? data.variables : [],
        isArchived: data.is_archived || false,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    } catch (error) {
      console.error('Error fetching email template:', error);
      return null;
    }
  },

  createTemplate: async (template: Partial<EmailTemplate>): Promise<EmailTemplate | null> => {
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .insert({
          name: template.name,
          subject: template.subject,
          description: template.description,
          category: template.category,
          content: template.content,
          variables: template.variables || [],
          is_archived: false,
        })
        .select()
        .single();

      if (error) throw error;
      
      if (!data) return null;
      
      // Transform to match EmailTemplate interface
      return {
        id: data.id,
        name: data.name,
        subject: data.subject,
        description: data.description,
        category: data.category as EmailCategory,
        content: data.content,
        variables: Array.isArray(data.variables) ? data.variables : [],
        isArchived: data.is_archived || false,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    } catch (error) {
      console.error('Error creating email template:', error);
      return null;
    }
  },

  updateTemplate: async (id: string, template: Partial<EmailTemplate>): Promise<EmailTemplate | null> => {
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .update({
          name: template.name,
          subject: template.subject,
          description: template.description,
          category: template.category,
          content: template.content,
          variables: template.variables || [],
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      if (!data) return null;
      
      // Transform to match EmailTemplate interface
      return {
        id: data.id,
        name: data.name,
        subject: data.subject,
        description: data.description,
        category: data.category as EmailCategory,
        content: data.content,
        variables: Array.isArray(data.variables) ? data.variables : [],
        isArchived: data.is_archived || false,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    } catch (error) {
      console.error('Error updating email template:', error);
      return null;
    }
  },

  deleteTemplate: async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('email_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting email template:', error);
      return false;
    }
  },

  // Email Campaigns
  getCampaigns: async (id?: string): Promise<EmailCampaignPreview[] | EmailCampaign | null> => {
    try {
      if (id) {
        const { data, error } = await supabase
          .from('email_campaigns')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        
        if (!data) return null;
        
        // Transform to match EmailCampaign interface
        return {
          id: data.id,
          name: data.name,
          subject: data.subject,
          status: data.status as any,
          scheduledDate: data.scheduled_date,
          sentDate: data.sent_date,
          totalRecipients: data.total_recipients,
          opened: data.opened,
          clicked: data.clicked,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
          templateId: data.template_id,
          content: data.content,
          segmentIds: Array.isArray(data.segment_ids) ? data.segment_ids : [],
          recipientIds: Array.isArray(data.recipient_ids) ? data.recipient_ids : [],
          personalizations: Array.isArray(data.personalizations) ? data.personalizations : [],
          metadata: typeof data.metadata === 'object' ? data.metadata : {},
          abTest: data.ab_test || null,
        };
      } else {
        const { data, error } = await supabase
          .from('email_campaigns')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        // Transform to match EmailCampaignPreview interface
        return data?.map(campaign => ({
          id: campaign.id,
          name: campaign.name,
          subject: campaign.subject,
          status: campaign.status as any,
          scheduledDate: campaign.scheduled_date,
          sentDate: campaign.sent_date,
          totalRecipients: campaign.total_recipients,
          opened: campaign.opened,
          clicked: campaign.clicked,
          createdAt: campaign.created_at,
          updatedAt: campaign.updated_at
        })) || [];
      }
    } catch (error) {
      console.error('Error fetching email campaigns:', error);
      return [];
    }
  },

  createCampaign: async (campaign: Partial<EmailCampaign>): Promise<EmailCampaign | null> => {
    try {
      const { data, error } = await supabase
        .from('email_campaigns')
        .insert({
          name: campaign.name,
          subject: campaign.subject,
          status: 'draft',
          scheduled_date: campaign.scheduledDate,
          template_id: campaign.templateId,
          content: campaign.content,
          segment_ids: campaign.segmentIds || [],
          recipient_ids: campaign.recipientIds || [],
          personalizations: campaign.personalizations || [],
          metadata: campaign.metadata || {},
          ab_test: campaign.abTest,
        })
        .select()
        .single();

      if (error) throw error;
      
      if (!data) return null;
      
      // Transform to match EmailCampaign interface
      return {
        id: data.id,
        name: data.name,
        subject: data.subject,
        status: data.status as any,
        scheduledDate: data.scheduled_date,
        sentDate: data.sent_date,
        totalRecipients: data.total_recipients,
        opened: data.opened,
        clicked: data.clicked,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        templateId: data.template_id,
        content: data.content,
        segmentIds: Array.isArray(data.segment_ids) ? data.segment_ids : [],
        recipientIds: Array.isArray(data.recipient_ids) ? data.recipient_ids : [],
        personalizations: Array.isArray(data.personalizations) ? data.personalizations : [],
        metadata: typeof data.metadata === 'object' ? data.metadata : {},
        abTest: data.ab_test || null,
      };
    } catch (error) {
      console.error('Error creating email campaign:', error);
      return null;
    }
  },

  updateCampaign: async (id: string, campaign: Partial<EmailCampaign>): Promise<EmailCampaign | null> => {
    try {
      const { data, error } = await supabase
        .from('email_campaigns')
        .update({
          name: campaign.name,
          subject: campaign.subject,
          status: campaign.status,
          scheduled_date: campaign.scheduledDate,
          template_id: campaign.templateId,
          content: campaign.content,
          segment_ids: campaign.segmentIds || [],
          recipient_ids: campaign.recipientIds || [],
          personalizations: campaign.personalizations || [],
          metadata: campaign.metadata || {},
          ab_test: campaign.abTest,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      if (!data) return null;
      
      // Transform to match EmailCampaign interface
      return {
        id: data.id,
        name: data.name,
        subject: data.subject,
        status: data.status as any,
        scheduledDate: data.scheduled_date,
        sentDate: data.sent_date,
        totalRecipients: data.total_recipients,
        opened: data.opened,
        clicked: data.clicked,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        templateId: data.template_id,
        content: data.content,
        segmentIds: Array.isArray(data.segment_ids) ? data.segment_ids : [],
        recipientIds: Array.isArray(data.recipient_ids) ? data.recipient_ids : [],
        personalizations: Array.isArray(data.personalizations) ? data.personalizations : [],
        metadata: typeof data.metadata === 'object' ? data.metadata : {},
        abTest: data.ab_test || null,
      };
    } catch (error) {
      console.error('Error updating email campaign:', error);
      return null;
    }
  },

  scheduleCampaign: async (id: string, date: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('email_campaigns')
        .update({
          scheduled_date: date,
          status: 'scheduled',
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error scheduling email campaign:', error);
      return false;
    }
  },

  sendCampaignNow: async (id: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('email_campaigns')
        .update({
          status: 'sending',
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error sending email campaign:', error);
      return false;
    }
  },

  pauseCampaign: async (id: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('email_campaigns')
        .update({
          status: 'paused',
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error pausing email campaign:', error);
      return false;
    }
  },

  cancelCampaign: async (id: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('email_campaigns')
        .update({
          status: 'cancelled',
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error cancelling email campaign:', error);
      return false;
    }
  },

  // Email Sequences
  getSequences: async (): Promise<EmailSequence[]> => {
    try {
      const { data, error } = await supabase
        .from('email_sequences')
        .select(`
          *,
          steps:email_sequence_steps(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform to match EmailSequence interface
      return data?.map(sequence => ({
        id: sequence.id,
        name: sequence.name,
        description: sequence.description,
        triggerType: sequence.trigger_type as 'manual' | 'event' | 'schedule',
        triggerEvent: sequence.trigger_event,
        steps: (sequence.steps || []).map((step: any) => ({
          id: step.id,
          name: step.name,
          templateId: step.template_id,
          delayHours: step.delay_hours,
          delayType: step.delay_type as 'fixed' | 'business_days',
          position: step.position,
          isActive: step.is_active,
          condition: step.condition_type ? {
            type: step.condition_type as 'event' | 'property',
            value: step.condition_value,
            operator: step.condition_operator as '=' | '!=' | '>' | '<' | '>=' | '<='
          } : undefined
        })),
        isActive: sequence.is_active,
        createdBy: sequence.created_by,
        createdAt: sequence.created_at,
        updatedAt: sequence.updated_at
      })) || [];
    } catch (error) {
      console.error('Error fetching email sequences:', error);
      return [];
    }
  },

  getSequenceById: async (id: string): Promise<EmailSequence | null> => {
    try {
      const { data, error } = await supabase
        .from('email_sequences')
        .select(`
          *,
          steps:email_sequence_steps(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      
      if (!data) return null;
      
      // Transform to match EmailSequence interface
      return {
        id: data.id,
        name: data.name,
        description: data.description,
        triggerType: data.trigger_type as 'manual' | 'event' | 'schedule',
        triggerEvent: data.trigger_event,
        steps: (data.steps || []).map((step: any) => ({
          id: step.id,
          name: step.name,
          templateId: step.template_id,
          delayHours: step.delay_hours,
          delayType: step.delay_type as 'fixed' | 'business_days',
          position: step.position,
          isActive: step.is_active,
          condition: step.condition_type ? {
            type: step.condition_type as 'event' | 'property',
            value: step.condition_value,
            operator: step.condition_operator as '=' | '!=' | '>' | '<' | '>=' | '<='
          } : undefined
        })),
        isActive: data.is_active,
        createdBy: data.created_by,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    } catch (error) {
      console.error('Error fetching email sequence:', error);
      return null;
    }
  },

  createSequence: async (sequence: Partial<EmailSequence>): Promise<EmailSequence | null> => {
    try {
      // First create the sequence
      const { data: sequenceData, error: sequenceError } = await supabase
        .from('email_sequences')
        .insert({
          name: sequence.name,
          description: sequence.description,
          trigger_type: sequence.triggerType,
          trigger_event: sequence.triggerEvent,
          is_active: sequence.isActive
        })
        .select()
        .single();

      if (sequenceError) throw sequenceError;

      // Then create the steps if any
      if (sequence.steps && sequence.steps.length > 0) {
        const stepsToInsert = sequence.steps.map(step => ({
          sequence_id: sequenceData.id,
          name: step.name,
          template_id: step.templateId,
          delay_hours: step.delayHours,
          delay_type: step.delayType,
          position: step.position,
          is_active: step.isActive,
          condition_type: step.condition?.type,
          condition_value: step.condition?.value,
          condition_operator: step.condition?.operator
        }));

        const { error: stepsError } = await supabase
          .from('email_sequence_steps')
          .insert(stepsToInsert);

        if (stepsError) throw stepsError;
      }

      // Return the full sequence with steps
      return await emailService.getSequenceById(sequenceData.id);
    } catch (error) {
      console.error('Error creating email sequence:', error);
      return null;
    }
  },

  updateSequence: async (id: string, sequence: Partial<EmailSequence>): Promise<EmailSequence | null> => {
    try {
      // Update the sequence
      const { error: sequenceError } = await supabase
        .from('email_sequences')
        .update({
          name: sequence.name,
          description: sequence.description,
          trigger_type: sequence.triggerType,
          trigger_event: sequence.triggerEvent,
          is_active: sequence.isActive
        })
        .eq('id', id);

      if (sequenceError) throw sequenceError;

      // Handle steps updates if provided
      if (sequence.steps) {
        // Get existing steps
        const { data: existingSteps, error: fetchError } = await supabase
          .from('email_sequence_steps')
          .select('*')
          .eq('sequence_id', id);

        if (fetchError) throw fetchError;

        // Identify steps to delete, update, or insert
        const existingIds = existingSteps?.map(step => step.id) || [];
        const newStepIds = sequence.steps.map(step => step.id);
        
        const stepsToDelete = existingIds.filter(id => !newStepIds.includes(id));
        const stepsToUpdate = sequence.steps.filter(step => existingIds.includes(step.id));
        const stepsToInsert = sequence.steps.filter(step => !existingIds.includes(step.id) && !step.id.startsWith('temp-'));

        // Delete steps
        if (stepsToDelete.length > 0) {
          const { error: deleteError } = await supabase
            .from('email_sequence_steps')
            .delete()
            .in('id', stepsToDelete);

          if (deleteError) throw deleteError;
        }

        // Update steps
        for (const step of stepsToUpdate) {
          const { error: updateError } = await supabase
            .from('email_sequence_steps')
            .update({
              name: step.name,
              template_id: step.templateId,
              delay_hours: step.delayHours,
              delay_type: step.delayType,
              position: step.position,
              is_active: step.isActive,
              condition_type: step.condition?.type,
              condition_value: step.condition?.value,
              condition_operator: step.condition?.operator
            })
            .eq('id', step.id);

          if (updateError) throw updateError;
        }

        // Insert new steps
        if (stepsToInsert.length > 0) {
          const newSteps = stepsToInsert.map(step => ({
            sequence_id: id,
            name: step.name,
            template_id: step.template_id,
            delay_hours: step.delayHours,
            delay_type: step.delayType,
            position: step.position,
            is_active: step.isActive,
            condition_type: step.condition?.type,
            condition_value: step.condition?.value,
            condition_operator: step.condition?.operator
          }));

          const { error: insertError } = await supabase
            .from('email_sequence_steps')
            .insert(newSteps);

          if (insertError) throw insertError;
        }

        // Insert temporary steps (new steps without real IDs)
        const tempSteps = sequence.steps.filter(step => step.id.startsWith('temp-'));
        if (tempSteps.length > 0) {
          const newTempSteps = tempSteps.map(step => ({
            sequence_id: id,
            name: step.name,
            template_id: step.template_id,
            delay_hours: step.delayHours,
            delay_type: step.delayType,
            position: step.position,
            is_active: step.isActive,
            condition_type: step.condition?.type,
            condition_value: step.condition?.value,
            condition_operator: step.condition?.operator
          }));

          const { error: insertTempError } = await supabase
            .from('email_sequence_steps')
            .insert(newTempSteps);

          if (insertTempError) throw insertTempError;
        }
      }

      // Return the updated sequence with steps
      return await emailService.getSequenceById(id);
    } catch (error) {
      console.error('Error updating email sequence:', error);
      return null;
    }
  },

  deleteSequence: async (id: string): Promise<boolean> => {
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
      console.error('Error deleting email sequence:', error);
      return false;
    }
  },

  enrollCustomerInSequence: async (sequenceId: string, customerId: string): Promise<boolean> => {
    try {
      // Get the sequence to check if it's active
      const { data: sequence, error: sequenceError } = await supabase
        .from('email_sequences')
        .select('*, steps:email_sequence_steps(*)')
        .eq('id', sequenceId)
        .single();

      if (sequenceError) throw sequenceError;

      // Check if sequence is active
      if (!sequence.is_active) {
        throw new Error('Cannot enroll customer in inactive sequence');
      }

      // Get the first step
      const firstStep = sequence.steps.sort((a, b) => a.position - b.position)[0];
      if (!firstStep) {
        throw new Error('Sequence has no steps');
      }

      // Calculate next send time based on the first step
      const now = new Date();
      let nextSendTime;

      if (firstStep.delay_hours > 0) {
        // Use delay for the first step
        if (firstStep.delay_type === 'fixed') {
          nextSendTime = new Date(now.getTime() + firstStep.delay_hours * 60 * 60 * 1000);
        } else {
          // Business days logic would be implemented here
          // For simplicity, using fixed delay for now
          nextSendTime = new Date(now.getTime() + firstStep.delay_hours * 60 * 60 * 1000);
        }
      } else {
        // Send immediately
        nextSendTime = now;
      }

      // Create enrollment
      const { error: enrollError } = await supabase
        .from('email_sequence_enrollments')
        .insert({
          sequence_id: sequenceId,
          customer_id: customerId,
          current_step_id: firstStep.id,
          status: 'active',
          started_at: now.toISOString(),
          next_send_time: nextSendTime.toISOString()
        });

      if (enrollError) throw enrollError;

      // Update analytics
      await emailService.updateSequenceAnalytics(sequenceId);

      return true;
    } catch (error) {
      console.error('Error enrolling customer in sequence:', error);
      return false;
    }
  },

  pauseCustomerEnrollment: async (enrollmentId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('email_sequence_enrollments')
        .update({
          status: 'paused'
        })
        .eq('id', enrollmentId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error pausing customer enrollment:', error);
      return false;
    }
  },

  resumeCustomerEnrollment: async (enrollmentId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('email_sequence_enrollments')
        .update({
          status: 'active',
          // Set next send time to now for immediate processing
          next_send_time: new Date().toISOString()
        })
        .eq('id', enrollmentId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error resuming customer enrollment:', error);
      return false;
    }
  },

  cancelCustomerEnrollment: async (enrollmentId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('email_sequence_enrollments')
        .update({
          status: 'cancelled'
        })
        .eq('id', enrollmentId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error cancelling customer enrollment:', error);
      return false;
    }
  },

  getCustomerEnrollments: async (customerId: string): Promise<any[]> => {
    try {
      const { data, error } = await supabase
        .from('email_sequence_enrollments')
        .select(`
          *,
          sequence:email_sequences(id, name)
        `)
        .eq('customer_id', customerId);

      if (error) throw error;
      
      // Return raw data to be transformed in the hook
      return data || [];
    } catch (error) {
      console.error('Error fetching customer enrollments:', error);
      return [];
    }
  },

  getSequenceAnalytics: async (sequenceId: string) => {
    try {
      const { data, error } = await supabase
        .from('email_sequence_analytics')
        .select('*')
        .eq('sequence_id', sequenceId)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "Row not found"
      
      // Return raw data to be transformed in the hook
      return data || {
        sequence_id: sequenceId,
        total_enrollments: 0,
        active_enrollments: 0,
        completed_enrollments: 0,
        average_time_to_complete: null,
        updated_at: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error fetching sequence analytics:', error);
      return null;
    }
  },

  updateSequenceAnalytics: async (sequenceId: string): Promise<boolean> => {
    try {
      // This function would normally be called by the edge function
      // But we provide a client-side version for immediate feedback
      
      // Call the edge function to update analytics
      const response = await fetch(`${process.env.SUPABASE_URL}/functions/v1/process-email-sequences`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({ sequenceId, action: 'updateAnalytics' })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update analytics: ${response.statusText}`);
      }
      
      return true;
    } catch (error) {
      console.error('Error updating sequence analytics:', error);
      return false;
    }
  },

  // Mock methods for testing purposes
  sendTestEmail: async (templateId: string, recipientEmail: string): Promise<boolean> => {
    console.log(`Sending test email using template ${templateId} to ${recipientEmail}`);
    return true;
  },
};
