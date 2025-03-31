
import { supabase } from '@/lib/supabase';
import { EmailSequence, EmailSequenceStep, EmailSequenceAnalytics } from '@/types/email';
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
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Format the sequence data to match our expected types
      const formattedSequences: EmailSequence[] = data.map(seq => ({
        id: seq.id,
        name: seq.name,
        description: seq.description,
        steps: [], // We'll load steps separately if needed for performance
        created_at: seq.created_at,
        updated_at: seq.updated_at,
        trigger_type: seq.trigger_type,
        trigger_event: seq.trigger_event,
        is_active: seq.is_active,
        shop_id: seq.shop_id,
        created_by: seq.created_by,
        
        // UI component support aliases
        triggerType: seq.trigger_type,
        triggerEvent: seq.trigger_event,
        isActive: seq.is_active,
        createdAt: seq.created_at,
        updatedAt: seq.updated_at
      }));

      return { data: formattedSequences, error: null };
    } catch (error) {
      console.error('Error getting email sequences:', error);
      return { data: null, error };
    }
  },

  /**
   * Get a sequence by ID with its steps
   */
  async getSequenceById(sequenceId: string): Promise<GenericResponse<EmailSequence>> {
    try {
      // Get the sequence
      const { data: sequence, error: sequenceError } = await supabase
        .from('email_sequences')
        .select('*')
        .eq('id', sequenceId)
        .single();

      if (sequenceError) throw sequenceError;
      
      // Get the steps
      const { data: steps, error: stepsError } = await supabase
        .from('email_sequence_steps')
        .select('*')
        .eq('sequence_id', sequenceId)
        .order('position', { ascending: true });
      
      if (stepsError) throw stepsError;
      
      // Format the steps
      const formattedSteps: EmailSequenceStep[] = steps.map(step => ({
        id: step.id,
        sequence_id: step.sequence_id,
        order: step.position,
        position: step.position,
        delay_hours: step.delay_hours,
        delayHours: step.delay_hours,
        delay_type: step.delay_type,
        delayType: step.delay_type,
        email_template_id: step.template_id,
        template_id: step.template_id,
        templateId: step.template_id,
        created_at: step.created_at,
        updated_at: step.updated_at,
        name: step.name,
        type: 'email', // Assume all steps are emails for now
        isActive: step.is_active,
        condition: step.condition_type ? {
          type: step.condition_type as 'event' | 'property',
          value: step.condition_value,
          operator: step.condition_operator as '=' | '!=' | '>' | '<' | '>=' | '<='
        } : undefined
      }));
      
      // Format the sequence with its steps
      const formattedSequence: EmailSequence = {
        id: sequence.id,
        name: sequence.name,
        description: sequence.description,
        steps: formattedSteps,
        created_at: sequence.created_at,
        updated_at: sequence.updated_at,
        trigger_type: sequence.trigger_type,
        trigger_event: sequence.trigger_event,
        is_active: sequence.is_active,
        shop_id: sequence.shop_id,
        created_by: sequence.created_by,
        
        // UI component support aliases
        triggerType: sequence.trigger_type,
        triggerEvent: sequence.trigger_event,
        isActive: sequence.is_active,
        createdAt: sequence.created_at,
        updatedAt: sequence.updated_at
      };

      return { data: formattedSequence, error: null };
    } catch (error) {
      console.error(`Error getting email sequence ${sequenceId}:`, error);
      return { data: null, error };
    }
  },

  /**
   * Create a new email sequence
   */
  async createSequence(sequence: Partial<EmailSequence>): Promise<GenericResponse<EmailSequence>> {
    try {
      const { data, error } = await supabase
        .from('email_sequences')
        .insert({
          name: sequence.name,
          description: sequence.description,
          trigger_type: sequence.triggerType || sequence.trigger_type,
          trigger_event: sequence.triggerEvent || sequence.trigger_event,
          is_active: sequence.isActive !== undefined ? sequence.isActive : false
        })
        .select()
        .single();

      if (error) throw error;
      
      // Format the created sequence
      const formattedSequence: EmailSequence = {
        id: data.id,
        name: data.name,
        description: data.description,
        steps: [], // New sequence has no steps
        created_at: data.created_at,
        updated_at: data.updated_at,
        trigger_type: data.trigger_type,
        trigger_event: data.trigger_event,
        is_active: data.is_active,
        shop_id: data.shop_id,
        created_by: data.created_by,
        
        // UI component support aliases
        triggerType: data.trigger_type,
        triggerEvent: data.trigger_event,
        isActive: data.is_active,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      return { data: formattedSequence, error: null };
    } catch (error) {
      console.error('Error creating email sequence:', error);
      return { data: null, error };
    }
  },

  /**
   * Update an existing email sequence
   */
  async updateSequence(
    sequenceId: string, 
    updates: Partial<EmailSequence>
  ): Promise<GenericResponse<EmailSequence>> {
    try {
      const { data, error } = await supabase
        .from('email_sequences')
        .update({
          name: updates.name,
          description: updates.description,
          trigger_type: updates.triggerType || updates.trigger_type,
          trigger_event: updates.triggerEvent || updates.trigger_event,
          is_active: updates.isActive !== undefined ? updates.isActive : updates.is_active
        })
        .eq('id', sequenceId)
        .select()
        .single();

      if (error) throw error;
      
      // Format the updated sequence
      const formattedSequence: EmailSequence = {
        id: data.id,
        name: data.name,
        description: data.description,
        steps: updates.steps || [], // Keep any existing steps data
        created_at: data.created_at,
        updated_at: data.updated_at,
        trigger_type: data.trigger_type,
        trigger_event: data.trigger_event,
        is_active: data.is_active,
        shop_id: data.shop_id,
        created_by: data.created_by,
        
        // UI component support aliases
        triggerType: data.trigger_type,
        triggerEvent: data.trigger_event,
        isActive: data.is_active,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      return { data: formattedSequence, error: null };
    } catch (error) {
      console.error(`Error updating email sequence ${sequenceId}:`, error);
      return { data: null, error };
    }
  },

  /**
   * Delete an email sequence
   */
  async deleteSequence(sequenceId: string): Promise<GenericResponse<boolean>> {
    try {
      // First delete all steps in the sequence
      const { error: stepsError } = await supabase
        .from('email_sequence_steps')
        .delete()
        .eq('sequence_id', sequenceId);
        
      if (stepsError) throw stepsError;
      
      // Then delete the sequence itself
      const { error } = await supabase
        .from('email_sequences')
        .delete()
        .eq('id', sequenceId);
        
      if (error) throw error;
      
      return { data: true, error: null };
    } catch (error) {
      console.error(`Error deleting email sequence ${sequenceId}:`, error);
      return { data: false, error };
    }
  },

  /**
   * Get a sequence step by ID
   */
  async getSequenceStep(stepId: string): Promise<GenericResponse<EmailSequenceStep>> {
    try {
      const { data, error } = await supabase
        .from('email_sequence_steps')
        .select('*')
        .eq('id', stepId)
        .single();
        
      if (error) throw error;
      
      // Format the step
      const formattedStep: EmailSequenceStep = {
        id: data.id,
        sequence_id: data.sequence_id,
        order: data.position,
        position: data.position,
        delay_hours: data.delay_hours,
        delayHours: data.delay_hours,
        delay_type: data.delay_type,
        delayType: data.delay_type,
        email_template_id: data.template_id,
        template_id: data.template_id,
        templateId: data.template_id,
        created_at: data.created_at,
        updated_at: data.updated_at,
        name: data.name,
        type: 'email', // Assume all steps are emails for now
        isActive: data.is_active,
        condition: data.condition_type ? {
          type: data.condition_type as 'event' | 'property',
          value: data.condition_value,
          operator: data.condition_operator as '=' | '!=' | '>' | '<' | '>=' | '<='
        } : undefined
      };
      
      return { data: formattedStep, error: null };
    } catch (error) {
      console.error(`Error getting sequence step ${stepId}:`, error);
      return { data: null, error };
    }
  },

  /**
   * Create a sequence step
   */
  async createSequenceStep(step: Partial<EmailSequenceStep>): Promise<GenericResponse<EmailSequenceStep>> {
    try {
      if (!step.sequence_id) {
        throw new Error("sequence_id is required");
      }
      
      // Get the count of existing steps to determine position
      const { data: existingSteps, error: countError } = await supabase
        .from('email_sequence_steps')
        .select('id')
        .eq('sequence_id', step.sequence_id);
        
      if (countError) throw countError;
      
      const position = step.position || (existingSteps.length + 1);
      
      const { data, error } = await supabase
        .from('email_sequence_steps')
        .insert({
          sequence_id: step.sequence_id,
          template_id: step.template_id || step.templateId || step.email_template_id,
          name: step.name || 'New Step',
          position: position,
          delay_hours: step.delay_hours || step.delayHours || 24,
          delay_type: step.delay_type || step.delayType || 'fixed',
          is_active: step.isActive !== undefined ? step.isActive : true,
          condition_type: step.condition?.type,
          condition_value: step.condition?.value,
          condition_operator: step.condition?.operator
        })
        .select()
        .single();
        
      if (error) throw error;
      
      // Format the created step
      const formattedStep: EmailSequenceStep = {
        id: data.id,
        sequence_id: data.sequence_id,
        order: data.position,
        position: data.position,
        delay_hours: data.delay_hours,
        delayHours: data.delay_hours,
        delay_type: data.delay_type,
        delayType: data.delay_type,
        email_template_id: data.template_id,
        template_id: data.template_id,
        templateId: data.template_id,
        created_at: data.created_at,
        updated_at: data.updated_at,
        name: data.name,
        type: 'email',
        isActive: data.is_active,
        condition: data.condition_type ? {
          type: data.condition_type as 'event' | 'property',
          value: data.condition_value,
          operator: data.condition_operator as '=' | '!=' | '>' | '<' | '>=' | '<='
        } : undefined
      };
      
      return { data: formattedStep, error: null };
    } catch (error) {
      console.error('Error creating sequence step:', error);
      return { data: null, error };
    }
  },

  /**
   * Update a sequence step
   */
  async updateSequenceStep(
    stepId: string, 
    updates: Partial<EmailSequenceStep>
  ): Promise<GenericResponse<EmailSequenceStep>> {
    try {
      const { data, error } = await supabase
        .from('email_sequence_steps')
        .update({
          sequence_id: updates.sequence_id,
          template_id: updates.template_id || updates.templateId || updates.email_template_id,
          name: updates.name,
          position: updates.position || updates.order,
          delay_hours: updates.delay_hours || updates.delayHours,
          delay_type: updates.delay_type || updates.delayType,
          is_active: updates.isActive !== undefined ? updates.isActive : undefined,
          condition_type: updates.condition?.type,
          condition_value: updates.condition?.value,
          condition_operator: updates.condition?.operator
        })
        .eq('id', stepId)
        .select()
        .single();
        
      if (error) throw error;
      
      // Format the updated step
      const formattedStep: EmailSequenceStep = {
        id: data.id,
        sequence_id: data.sequence_id,
        order: data.position,
        position: data.position,
        delay_hours: data.delay_hours,
        delayHours: data.delay_hours,
        delay_type: data.delay_type,
        delayType: data.delay_type,
        email_template_id: data.template_id,
        template_id: data.template_id,
        templateId: data.template_id,
        created_at: data.created_at,
        updated_at: data.updated_at,
        name: data.name,
        type: 'email',
        isActive: data.is_active,
        condition: data.condition_type ? {
          type: data.condition_type as 'event' | 'property',
          value: data.condition_value,
          operator: data.condition_operator as '=' | '!=' | '>' | '<' | '>=' | '<='
        } : undefined
      };
      
      return { data: formattedStep, error: null };
    } catch (error) {
      console.error(`Error updating sequence step ${stepId}:`, error);
      return { data: null, error };
    }
  },

  /**
   * Delete a sequence step
   */
  async deleteSequenceStep(stepId: string): Promise<GenericResponse<boolean>> {
    try {
      const { error } = await supabase
        .from('email_sequence_steps')
        .delete()
        .eq('id', stepId);
        
      if (error) throw error;
      
      return { data: true, error: null };
    } catch (error) {
      console.error(`Error deleting sequence step ${stepId}:`, error);
      return { data: false, error };
    }
  },

  /**
   * Get analytics for a sequence step
   * This is a placeholder method that would be replaced with actual analytics
   */
  async getSequenceStepAnalytics(stepId: string): Promise<GenericResponse<any>> {
    try {
      // Use a custom RPC function to get analytics or create a view
      // For now, we'll return mock data since email_sequence_step_stats may not exist yet
      
      // Mock analytics data
      const analytics = {
        total_sent: 0,
        total_opened: 0,
        total_clicked: 0,
        open_rate: 0,
        click_rate: 0,
        click_to_open_rate: 0
      };
      
      return { data: analytics, error: null };
    } catch (error) {
      console.error(`Error getting sequence step analytics ${stepId}:`, error);
      return { data: null, error };
    }
  },

  /**
   * Get analytics for a sequence
   */
  async getSequenceAnalytics(sequenceId: string): Promise<GenericResponse<EmailSequenceAnalytics>> {
    try {
      // Get analytics from the database
      const { data, error } = await supabase
        .from('email_sequence_analytics')
        .select('*')
        .eq('sequence_id', sequenceId)
        .single();
        
      if (error && error.code !== 'PGRST116') { // PGRST116 is "Results contain 0 rows"
        throw error;
      }
      
      // If no analytics found, return defaults
      if (!data) {
        const defaultAnalytics: EmailSequenceAnalytics = {
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
          total_emails_sent: 0,
          totalEmailsSent: 0,
          open_rate: 0,
          openRate: 0,
          click_rate: 0,
          clickRate: 0
        };
        
        return { data: defaultAnalytics, error: null };
      }
      
      // Format the analytics
      const formattedAnalytics: EmailSequenceAnalytics = {
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
        conversion_rate: data.conversion_rate,
        conversionRate: data.conversion_rate,
        average_time_to_complete: data.average_time_to_complete,
        averageTimeToComplete: data.average_time_to_complete,
        updated_at: data.updated_at,
        updatedAt: data.updated_at,
        total_emails_sent: data.total_emails_sent || 0,
        totalEmailsSent: data.total_emails_sent || 0,
        open_rate: data.open_rate || 0,
        openRate: data.open_rate || 0,
        click_rate: data.click_rate || 0,
        clickRate: data.click_rate || 0
      };
      
      return { data: formattedAnalytics, error: null };
    } catch (error) {
      console.error(`Error getting sequence analytics ${sequenceId}:`, error);
      return { data: null, error };
    }
  }
};
