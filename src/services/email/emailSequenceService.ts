
import { supabase } from '@/lib/supabase';
import { EmailSequence, EmailSequenceStep, EmailSequenceAnalytics } from '@/types/email';
import { parseJsonField } from './utils';

export const emailSequenceService = {
  /**
   * Fetch all email sequences
   */
  getSequences: async () => {
    try {
      const { data, error } = await supabase
        .from('email_sequences')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data?.map(sequence => ({
        ...sequence,
        // Add camelCase versions of properties for UI components
        triggerType: sequence.trigger_type,
        triggerEvent: sequence.trigger_event,
        isActive: sequence.is_active,
        createdAt: sequence.created_at,
        updatedAt: sequence.updated_at,
        // Add defaults for properties that might not exist
        last_run: sequence.last_run || null,
        next_run: sequence.next_run || null,
        run_frequency: sequence.run_frequency || null
      })) || [];
    } catch (error) {
      console.error('Error fetching email sequences:', error);
      return [];
    }
  },
  
  /**
   * Get a single sequence by ID
   */
  getSequenceById: async (id: string) => {
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
      
      // Format steps to include camelCase properties
      const formattedSteps = (data.steps || []).map((step: any) => ({
        ...step,
        templateId: step.email_template_id,
        position: step.position || step.order,
        type: step.type || (step.email_template_id ? 'email' : 'delay'),
        delayHours: step.delay_hours,
        delayType: step.delay_type,
      }));
      
      return {
        ...data,
        steps: formattedSteps,
        // Add camelCase versions of properties for UI components
        triggerType: data.trigger_type,
        triggerEvent: data.trigger_event,
        isActive: data.is_active,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        // Add defaults for properties that might not exist
        last_run: data.last_run || null,
        next_run: data.next_run || null,
        run_frequency: data.run_frequency || null
      };
    } catch (error) {
      console.error('Error fetching sequence by ID:', error);
      return null;
    }
  },
  
  /**
   * Create a new email sequence
   */
  createSequence: async (sequenceData: Partial<EmailSequence>) => {
    try {
      const { data, error } = await supabase
        .from('email_sequences')
        .insert({
          name: sequenceData.name || 'New Sequence',
          description: sequenceData.description || '',
          trigger_type: sequenceData.triggerType || sequenceData.trigger_type || 'manual',
          trigger_event: sequenceData.triggerEvent || sequenceData.trigger_event || null,
          is_active: sequenceData.isActive || sequenceData.is_active || false,
          created_by: sequenceData.created_by || null,
          shop_id: sequenceData.shop_id || null
        })
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        ...data,
        steps: [],
        // Add camelCase versions of properties for UI components
        triggerType: data.trigger_type,
        triggerEvent: data.trigger_event,
        isActive: data.is_active,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        // Add defaults for properties that might not exist
        last_run: data.last_run || null,
        next_run: data.next_run || null,
        run_frequency: data.run_frequency || null
      };
    } catch (error) {
      console.error('Error creating email sequence:', error);
      return null;
    }
  },
  
  /**
   * Update an existing email sequence
   */
  updateSequence: async (id: string, sequenceData: Partial<EmailSequence>) => {
    try {
      const { error } = await supabase
        .from('email_sequences')
        .update({
          name: sequenceData.name,
          description: sequenceData.description,
          trigger_type: sequenceData.triggerType || sequenceData.trigger_type,
          trigger_event: sequenceData.triggerEvent || sequenceData.trigger_event,
          is_active: sequenceData.isActive !== undefined ? sequenceData.isActive : sequenceData.is_active
        })
        .eq('id', id);
      
      if (error) throw error;
      
      // Fetch the updated sequence
      return await emailSequenceService.getSequenceById(id);
    } catch (error) {
      console.error('Error updating email sequence:', error);
      return null;
    }
  },
  
  /**
   * Delete an email sequence
   */
  deleteSequence: async (id: string) => {
    try {
      // Delete the sequence steps first
      const { error: stepsError } = await supabase
        .from('email_sequence_steps')
        .delete()
        .eq('sequence_id', id);
      
      if (stepsError) throw stepsError;
      
      // Then delete the sequence
      const { error } = await supabase
        .from('email_sequences')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error deleting email sequence:', error);
      return false;
    }
  },
  
  /**
   * Get sequence steps
   */
  getSequenceSteps: async (sequenceId: string) => {
    try {
      const { data, error } = await supabase
        .from('email_sequence_steps')
        .select('*')
        .eq('sequence_id', sequenceId)
        .order('position', { ascending: true });
      
      if (error) throw error;
      
      return data?.map(step => ({
        ...step,
        templateId: step.email_template_id,
        position: step.position || step.order,
        type: step.type || (step.email_template_id ? 'email' : 'delay'),
        delayHours: step.delay_hours,
        delayType: step.delay_type,
        // Add defaults for properties that might not exist
        last_run: step.last_run || null,
        next_run: step.next_run || null,
        run_frequency: step.run_frequency || null
      })) || [];
    } catch (error) {
      console.error('Error fetching sequence steps:', error);
      return [];
    }
  },
  
  /**
   * Create or update a sequence step
   */
  upsertSequenceStep: async (sequenceId: string, stepData: Partial<EmailSequenceStep>) => {
    try {
      const stepToSave = {
        sequence_id: sequenceId,
        position: stepData.position || stepData.order || 0,
        email_template_id: stepData.templateId || stepData.email_template_id,
        delay_hours: stepData.delayHours || stepData.delay_hours || 0,
        delay_type: stepData.delayType || stepData.delay_type || 'fixed',
        name: stepData.name || '',
        condition_type: stepData.condition?.type,
        condition_value: stepData.condition?.value,
        condition_operator: stepData.condition?.operator
      };
      
      if (stepData.id) {
        // Update existing step
        const { error } = await supabase
          .from('email_sequence_steps')
          .update(stepToSave)
          .eq('id', stepData.id);
        
        if (error) throw error;
        
        return { ...stepData, ...stepToSave };
      } else {
        // Create new step
        const { data, error } = await supabase
          .from('email_sequence_steps')
          .insert(stepToSave)
          .select()
          .single();
        
        if (error) throw error;
        
        return {
          ...data,
          templateId: data.email_template_id,
          type: data.email_template_id ? 'email' : 'delay',
          delayHours: data.delay_hours,
          delayType: data.delay_type,
          // Add defaults for properties that might not exist
          last_run: data.last_run || null,
          next_run: data.next_run || null,
          run_frequency: data.run_frequency || null
        };
      }
    } catch (error) {
      console.error('Error upserting sequence step:', error);
      return null;
    }
  },
  
  /**
   * Delete a sequence step
   */
  deleteSequenceStep: async (stepId: string) => {
    try {
      const { error } = await supabase
        .from('email_sequence_steps')
        .delete()
        .eq('id', stepId);
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error deleting sequence step:', error);
      return false;
    }
  },
  
  /**
   * Get sequence analytics
   */
  getSequenceAnalytics: async (sequenceId: string) => {
    try {
      const { data, error } = await supabase
        .from('email_sequence_analytics')
        .select('*')
        .eq('sequence_id', sequenceId)
        .maybeSingle();
      
      if (error) throw error;
      
      if (!data) {
        return {
          id: '',
          sequence_id: sequenceId,
          sequenceId: sequenceId,
          total_enrollments: 0,
          totalEnrollments: 0,
          active_enrollments: 0,
          activeEnrollments: 0,
          completed_enrollments: 0,
          completedEnrollments: 0,
          cancelled_enrollments: 0,
          conversion_rate: 0,
          conversionRate: 0,
          average_time_to_complete: 0,
          averageTimeToComplete: 0,
          updated_at: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          created_at: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          total_emails_sent: 0,
          totalEmailsSent: 0,
          open_rate: 0,
          openRate: 0,
          click_rate: 0,
          clickRate: 0
        } as EmailSequenceAnalytics;
      }
      
      return {
        ...data,
        sequenceId: data.sequence_id,
        totalEnrollments: data.total_enrollments,
        activeEnrollments: data.active_enrollments,
        completedEnrollments: data.completed_enrollments,
        cancelled_enrollments: data.cancelled_enrollments || 0,
        conversionRate: data.conversion_rate,
        averageTimeToComplete: data.average_time_to_complete,
        updatedAt: data.updated_at,
        createdAt: data.created_at || data.updated_at,
        total_emails_sent: data.total_emails_sent || 0,
        totalEmailsSent: data.total_emails_sent || 0,
        open_rate: data.open_rate || 0,
        openRate: data.open_rate || 0,
        click_rate: data.click_rate || 0,
        clickRate: data.click_rate || 0
      } as EmailSequenceAnalytics;
    } catch (error) {
      console.error('Error fetching sequence analytics:', error);
      
      // Return default values if analytics don't exist yet
      return {
        id: '',
        sequence_id: sequenceId,
        sequenceId: sequenceId,
        total_enrollments: 0,
        totalEnrollments: 0,
        active_enrollments: 0,
        activeEnrollments: 0,
        completed_enrollments: 0,
        completedEnrollments: 0,
        cancelled_enrollments: 0,
        conversion_rate: 0,
        conversionRate: 0,
        average_time_to_complete: 0,
        averageTimeToComplete: 0,
        updated_at: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        created_at: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        total_emails_sent: 0,
        totalEmailsSent: 0,
        open_rate: 0,
        openRate: 0,
        click_rate: 0,
        clickRate: 0
      } as EmailSequenceAnalytics;
    }
  }
};
