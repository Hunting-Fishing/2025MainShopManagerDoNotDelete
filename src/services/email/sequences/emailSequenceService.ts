
import { supabase } from '@/lib/supabase';
import { EmailSequence, EmailSequenceStep, EmailSequenceEnrollment, EmailSequenceAnalytics } from '@/types/email';
import { GenericResponse } from '../utils/supabaseHelper';

/**
 * Service for managing email sequences
 */
export const emailSequenceService = {
  /**
   * Get all email sequences
   */
  async getSequences(): Promise<GenericResponse<EmailSequence[]>> {
    try {
      const { data, error } = await supabase
        .from('email_sequences')
        .select(`
          *,
          steps:email_sequence_steps(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Format and return sequences with their steps included
      const formatted: EmailSequence[] = (data || []).map(sequence => ({
        id: sequence.id,
        name: sequence.name,
        description: sequence.description || '',
        steps: (sequence.steps || []).map(step => formatSequenceStep(step)),
        created_at: sequence.created_at,
        updated_at: sequence.updated_at,
        trigger_type: ensureTriggerType(sequence.trigger_type),
        trigger_event: sequence.trigger_event || '',
        is_active: sequence.is_active || false,
        shop_id: sequence.shop_id,
        created_by: sequence.created_by,
        triggerType: ensureTriggerType(sequence.trigger_type),
        triggerEvent: sequence.trigger_event || '',
        isActive: sequence.is_active || false,
        createdAt: sequence.created_at,
        updatedAt: sequence.updated_at
      }));

      return { data: formatted, error: null };
    } catch (error) {
      console.error('Error getting email sequences:', error);
      return { data: null, error };
    }
  },

  /**
   * Get a sequence by ID
   * @param id Sequence ID
   */
  async getSequenceById(id: string): Promise<GenericResponse<EmailSequence>> {
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

      // Format the sequence and its steps
      const sequence: EmailSequence = {
        id: data.id,
        name: data.name,
        description: data.description || '',
        steps: (data.steps || []).map(step => formatSequenceStep(step)),
        created_at: data.created_at,
        updated_at: data.updated_at,
        trigger_type: ensureTriggerType(data.trigger_type),
        trigger_event: data.trigger_event || '',
        is_active: data.is_active || false,
        shop_id: data.shop_id,
        created_by: data.created_by,
        triggerType: ensureTriggerType(data.trigger_type),
        triggerEvent: data.trigger_event || '',
        isActive: data.is_active || false,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      return { data: sequence, error: null };
    } catch (error) {
      console.error(`Error getting email sequence with ID ${id}:`, error);
      return { data: null, error };
    }
  },

  /**
   * Create a new email sequence
   * @param sequence Sequence data
   */
  async createSequence(sequence: Partial<EmailSequence>): Promise<GenericResponse<EmailSequence>> {
    try {
      // Insert sequence data
      const { data, error } = await supabase
        .from('email_sequences')
        .insert({
          name: sequence.name,
          description: sequence.description,
          trigger_type: ensureTriggerType(sequence.trigger_type || sequence.triggerType),
          trigger_event: sequence.trigger_event || sequence.triggerEvent,
          is_active: sequence.is_active || sequence.isActive || false,
          shop_id: sequence.shop_id,
          created_by: sequence.created_by
        })
        .select()
        .single();

      if (error) throw error;

      // Create a new sequence object with the returned data
      const newSequence: EmailSequence = {
        id: data.id,
        name: data.name,
        description: data.description || '',
        steps: [], // New sequence has no steps yet
        created_at: data.created_at,
        updated_at: data.updated_at,
        trigger_type: ensureTriggerType(data.trigger_type),
        trigger_event: data.trigger_event || '',
        is_active: data.is_active || false,
        shop_id: data.shop_id,
        created_by: data.created_by,
        triggerType: ensureTriggerType(data.trigger_type),
        triggerEvent: data.trigger_event || '',
        isActive: data.is_active || false,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      return { data: newSequence, error: null };
    } catch (error) {
      console.error('Error creating email sequence:', error);
      return { data: null, error };
    }
  },

  /**
   * Update an existing email sequence
   * @param id Sequence ID
   * @param sequence Updated sequence data
   */
  async updateSequence(id: string, sequence: Partial<EmailSequence>): Promise<GenericResponse<EmailSequence>> {
    try {
      const { data, error } = await supabase
        .from('email_sequences')
        .update({
          name: sequence.name,
          description: sequence.description,
          trigger_type: ensureTriggerType(sequence.trigger_type || sequence.triggerType),
          trigger_event: sequence.trigger_event || sequence.triggerEvent,
          is_active: sequence.is_active || sequence.isActive,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Get the steps for this sequence
      const { data: stepsData, error: stepsError } = await supabase
        .from('email_sequence_steps')
        .select('*')
        .eq('sequence_id', id)
        .order('position', { ascending: true });

      if (stepsError) throw stepsError;

      // Format the steps
      const steps: EmailSequenceStep[] = (stepsData || []).map(step => formatSequenceStep(step));

      // Create a formatted sequence object with the updated data
      const updatedSequence: EmailSequence = {
        id: data.id,
        name: data.name,
        description: data.description || '',
        steps,
        created_at: data.created_at,
        updated_at: data.updated_at,
        trigger_type: ensureTriggerType(data.trigger_type),
        trigger_event: data.trigger_event || '',
        is_active: data.is_active || false,
        shop_id: data.shop_id,
        created_by: data.created_by,
        triggerType: ensureTriggerType(data.trigger_type),
        triggerEvent: data.trigger_event || '',
        isActive: data.is_active || false,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      return { data: updatedSequence, error: null };
    } catch (error) {
      console.error(`Error updating email sequence ${id}:`, error);
      return { data: null, error };
    }
  },

  /**
   * Delete an email sequence
   * @param id Sequence ID
   */
  async deleteSequence(id: string): Promise<GenericResponse<boolean>> {
    try {
      // First delete all related steps
      const { error: stepsError } = await supabase
        .from('email_sequence_steps')
        .delete()
        .eq('sequence_id', id);

      if (stepsError) throw stepsError;

      // Then delete the sequence itself
      const { error } = await supabase
        .from('email_sequences')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return { data: true, error: null };
    } catch (error) {
      console.error(`Error deleting email sequence ${id}:`, error);
      return { data: false, error };
    }
  },

  /**
   * Get a sequence step by ID
   * @param id Step ID
   */
  async getSequenceStepById(id: string): Promise<GenericResponse<EmailSequenceStep>> {
    try {
      const { data, error } = await supabase
        .from('email_sequence_steps')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      return { data: formatSequenceStep(data), error: null };
    } catch (error) {
      console.error(`Error getting email sequence step ${id}:`, error);
      return { data: null, error };
    }
  },

  /**
   * Create a new step in a sequence
   * @param step Step data
   */
  async createSequenceStep(step: Partial<EmailSequenceStep>): Promise<GenericResponse<EmailSequenceStep>> {
    try {
      // Validate the step data
      if (!step.sequence_id) {
        throw new Error('Sequence ID is required');
      }
      if (!step.template_id) {
        throw new Error('Template ID is required');
      }

      // Get current highest position for this sequence
      const { data: lastStep, error: posError } = await supabase
        .from('email_sequence_steps')
        .select('position')
        .eq('sequence_id', step.sequence_id)
        .order('position', { ascending: false })
        .limit(1)
        .single();

      const newPosition = lastStep ? (lastStep.position + 1) : 0;

      const { data, error } = await supabase
        .from('email_sequence_steps')
        .insert({
          sequence_id: step.sequence_id,
          name: step.name || `Step ${newPosition + 1}`,
          template_id: step.template_id,
          position: newPosition,
          delay_hours: step.delay_hours || 0,
          delay_type: step.delay_type || 'fixed',
          is_active: step.is_active !== undefined ? step.is_active : true,
          condition_type: step.condition_type,
          condition_value: step.condition_value,
          condition_operator: step.condition_operator
        })
        .select()
        .single();

      if (error) throw error;

      return { data: formatSequenceStep(data), error: null };
    } catch (error) {
      console.error('Error creating email sequence step:', error);
      return { data: null, error };
    }
  },

  /**
   * Update an existing sequence step
   * @param id Step ID
   * @param step Updated step data
   */
  async updateSequenceStep(id: string, step: Partial<EmailSequenceStep>): Promise<GenericResponse<EmailSequenceStep>> {
    try {
      const { data, error } = await supabase
        .from('email_sequence_steps')
        .update({
          name: step.name,
          template_id: step.template_id,
          position: step.position || step.order,
          delay_hours: step.delay_hours || step.delayHours,
          delay_type: step.delay_type || step.delayType,
          is_active: step.is_active !== undefined ? step.is_active : step.isActive,
          condition_type: step.condition_type || (step.condition ? step.condition.type : null),
          condition_value: step.condition_value || (step.condition ? step.condition.value : null),
          condition_operator: step.condition_operator || (step.condition ? step.condition.operator : null),
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return { data: formatSequenceStep(data), error: null };
    } catch (error) {
      console.error(`Error updating email sequence step ${id}:`, error);
      return { data: null, error };
    }
  },

  /**
   * Delete a sequence step
   * @param id Step ID
   */
  async deleteSequenceStep(id: string): Promise<GenericResponse<boolean>> {
    try {
      // Get the step to be deleted
      const { data: stepData, error: fetchError } = await supabase
        .from('email_sequence_steps')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      // Delete the step
      const { error: deleteError } = await supabase
        .from('email_sequence_steps')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      // Reorder remaining steps if needed
      if (stepData) {
        const { data: remainingSteps, error: getError } = await supabase
          .from('email_sequence_steps')
          .select('*')
          .eq('sequence_id', stepData.sequence_id)
          .order('position', { ascending: true });

        if (getError) throw getError;

        // Update positions to be sequential
        for (let i = 0; i < remainingSteps.length; i++) {
          const step = remainingSteps[i];
          if (step.position !== i) {
            const { error: updateError } = await supabase
              .from('email_sequence_steps')
              .update({ position: i })
              .eq('id', step.id);

            if (updateError) throw updateError;
          }
        }
      }

      return { data: true, error: null };
    } catch (error) {
      console.error(`Error deleting email sequence step ${id}:`, error);
      return { data: false, error };
    }
  },

  /**
   * Get analytics for a sequence
   * @param sequenceId Sequence ID
   */
  async getSequenceAnalytics(sequenceId: string): Promise<GenericResponse<EmailSequenceAnalytics>> {
    try {
      const { data, error } = await supabase
        .from('email_sequence_analytics')
        .select('*')
        .eq('sequence_id', sequenceId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No analytics records found, create default analytics
          return this.createDefaultSequenceAnalytics(sequenceId);
        }
        throw error;
      }

      const analytics: EmailSequenceAnalytics = {
        id: data.id,
        sequence_id: data.sequence_id,
        sequenceId: data.sequence_id,
        total_enrollments: data.total_enrollments,
        totalEnrollments: data.total_enrollments,
        active_enrollments: data.active_enrollments,
        activeEnrollments: data.active_enrollments,
        completed_enrollments: data.completed_enrollments,
        completedEnrollments: data.completed_enrollments,
        cancelled_enrollments: data.cancelled_enrollments || 0,
        total_emails_sent: data.total_emails_sent || 0,
        totalEmailsSent: data.total_emails_sent || 0,
        open_rate: data.open_rate || 0,
        openRate: data.open_rate || 0,
        click_rate: data.click_rate || 0,
        clickRate: data.click_rate || 0,
        conversion_rate: data.conversion_rate,
        conversionRate: data.conversion_rate,
        average_time_to_complete: data.average_time_to_complete,
        averageTimeToComplete: data.average_time_to_complete,
        updated_at: data.updated_at,
        updatedAt: data.updated_at
      };

      return { data: analytics, error: null };
    } catch (error) {
      console.error(`Error getting sequence analytics for ${sequenceId}:`, error);
      return { data: null, error };
    }
  },

  /**
   * Create default analytics for a sequence
   * @param sequenceId Sequence ID
   */
  async createDefaultSequenceAnalytics(sequenceId: string): Promise<GenericResponse<EmailSequenceAnalytics>> {
    try {
      const { data, error } = await supabase
        .from('email_sequence_analytics')
        .insert({
          sequence_id: sequenceId,
          total_enrollments: 0,
          active_enrollments: 0,
          completed_enrollments: 0,
          conversion_rate: 0,
          average_time_to_complete: 0
        })
        .select()
        .single();

      if (error) throw error;

      const analytics: EmailSequenceAnalytics = {
        id: data.id,
        sequence_id: data.sequence_id,
        sequenceId: data.sequence_id,
        total_enrollments: data.total_enrollments,
        totalEnrollments: data.total_enrollments,
        active_enrollments: data.active_enrollments,
        activeEnrollments: data.active_enrollments,
        completed_enrollments: data.completed_enrollments,
        completedEnrollments: data.completed_enrollments,
        cancelled_enrollments: 0,
        total_emails_sent: 0,
        totalEmailsSent: 0,
        open_rate: 0,
        openRate: 0,
        click_rate: 0,
        clickRate: 0,
        conversion_rate: data.conversion_rate,
        conversionRate: data.conversion_rate,
        average_time_to_complete: data.average_time_to_complete,
        averageTimeToComplete: data.average_time_to_complete,
        updated_at: data.updated_at,
        updatedAt: data.updated_at
      };

      return { data: analytics, error: null };
    } catch (error) {
      console.error(`Error creating default analytics for sequence ${sequenceId}:`, error);
      return { data: null, error };
    }
  }
};

// Helper function to format a sequence step from the database
const formatSequenceStep = (step: any): EmailSequenceStep => {
  return {
    id: step.id,
    sequence_id: step.sequence_id,
    order: step.position,
    delay_hours: step.delay_hours,
    delay_type: step.delay_type,
    email_template_id: step.template_id,
    template_id: step.template_id,
    created_at: step.created_at,
    updated_at: step.updated_at,
    name: step.name,
    type: 'email',
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
  };
};

// Helper function to ensure trigger_type is one of the valid values
const ensureTriggerType = (type: string): 'manual' | 'event' | 'schedule' => {
  const validTypes: Array<'manual' | 'event' | 'schedule'> = ['manual', 'event', 'schedule'];
  return validTypes.includes(type as any) ? (type as 'manual' | 'event' | 'schedule') : 'manual';
};
