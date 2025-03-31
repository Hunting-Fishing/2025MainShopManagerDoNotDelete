import { supabase } from '@/lib/supabase';
import { 
  EmailSequence, 
  EmailSequenceStep, 
  EmailSequenceEnrollment,
  EmailSequenceAnalytics
} from '@/types/email';
import { GenericResponse } from '../utils/supabaseHelper';

/**
 * Service for email sequence management
 */
export const emailSequenceService = {
  /**
   * Get sequence analytics
   * @param sequenceId ID of the sequence to get analytics for
   * @returns Analytics data for the sequence
   */
  async getSequenceAnalytics(sequenceId: string): Promise<GenericResponse<EmailSequenceAnalytics>> {
    try {
      // Get enrollments data
      const { data, error } = await supabase
        .from('email_sequence_enrollments')
        .select('*')
        .eq('sequence_id', sequenceId);
        
      if (error) throw error;
      
      // Convert database records to EmailSequenceEnrollment objects
      const enrollments: EmailSequenceEnrollment[] = data.map(record => ({
        id: record.id,
        sequence_id: record.sequence_id,
        customer_id: record.customer_id,
        status: record.status as 'active' | 'paused' | 'completed' | 'cancelled',
        current_step_id: record.current_step_id,
        created_at: record.created_at,
        updated_at: record.updated_at,
        completed_at: record.completed_at,
        // Support for UI components
        sequenceId: record.sequence_id,
        customerId: record.customer_id,
        currentStepId: record.current_step_id,
        completedAt: record.completed_at,
        metadata: record.metadata
      }));
      
      // Calculate analytics from enrollments
      const totalEnrollments = enrollments.length;
      const activeEnrollments = enrollments.filter(e => e.status === 'active').length;
      const completedEnrollments = enrollments.filter(e => e.status === 'completed').length;
      const cancelledEnrollments = enrollments.filter(e => e.status === 'cancelled').length;
      
      // Calculate conversion rate
      const conversionRate = totalEnrollments > 0
        ? (completedEnrollments / totalEnrollments) * 100
        : 0;
      
      // Calculate average time to complete for completed enrollments
      let totalTimeToComplete = 0;
      let completedCount = 0;
      
      for (const enrollment of enrollments) {
        if (enrollment.status === 'completed' && enrollment.completed_at && enrollment.created_at) {
          const startDate = new Date(enrollment.created_at);
          const endDate = new Date(enrollment.completed_at);
          const timeToComplete = endDate.getTime() - startDate.getTime();
          totalTimeToComplete += timeToComplete;
          completedCount++;
        }
      }
      
      const averageTimeToComplete = completedCount > 0
        ? totalTimeToComplete / completedCount
        : 0;
      
      const analytics: EmailSequenceAnalytics = {
        id: `analytics-${sequenceId}`,
        sequence_id: sequenceId,
        sequenceId: sequenceId,
        total_enrollments: totalEnrollments,
        totalEnrollments: totalEnrollments,
        active_enrollments: activeEnrollments,
        activeEnrollments: activeEnrollments,
        completed_enrollments: completedEnrollments,
        completedEnrollments: completedEnrollments,
        cancelled_enrollments: cancelledEnrollments,
        conversion_rate: conversionRate,
        conversionRate: conversionRate,
        average_time_to_complete: averageTimeToComplete,
        averageTimeToComplete: averageTimeToComplete,
        updated_at: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      return { data: analytics, error: null };
    } catch (error) {
      console.error('Error getting sequence analytics:', error);
      return { data: null, error };
    }
  },

  /**
   * Update a sequence step's active status
   * @param stepId The ID of the step to update
   * @param isActive Whether the step should be active
   */
  async updateStepActiveStatus(stepId: string, isActive: boolean): Promise<GenericResponse<EmailSequenceStep>> {
    try {
      const { data, error } = await supabase
        .from('email_sequence_steps')
        .update({ isActive: isActive }) // Updated from is_active to isActive
        .eq('id', stepId)
        .select()
        .single();
        
      if (error) throw error;
      
      // Convert database record to EmailSequenceStep
      const step: EmailSequenceStep = {
        id: data.id,
        sequence_id: data.sequence_id,
        order: data.order,
        delay_hours: data.delay_hours,
        delay_type: data.delay_type,
        email_template_id: data.email_template_id,
        created_at: data.created_at,
        updated_at: data.updated_at,
        // UI component support
        name: data.name,
        type: data.type,
        templateId: data.email_template_id,
        delayHours: data.delay_hours,
        delayType: data.delay_type,
        position: data.order,
        isActive: data.isActive // Updated from is_active to isActive
      };
      
      return { data: step, error: null };
    } catch (error) {
      console.error('Error updating step active status:', error);
      return { data: null, error };
    }
  },

  /**
   * Get all sequences
   * @returns Array of all sequences
   */
  async getSequences(): Promise<GenericResponse<EmailSequence[]>> {
    try {
      const { data, error } = await supabase
        .from('email_sequences')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      // Convert database records to EmailSequence objects with empty steps array
      const sequences: EmailSequence[] = data.map(record => ({
        id: record.id,
        name: record.name,
        description: record.description,
        steps: [], // Initialize with empty steps, can be populated later if needed
        created_at: record.created_at,
        updated_at: record.updated_at,
        shop_id: record.shop_id,
        created_by: record.created_by,
        trigger_type: record.trigger_type,
        trigger_event: record.trigger_event,
        is_active: record.is_active,
        // UI support
        triggerType: record.trigger_type,
        triggerEvent: record.trigger_event,
        isActive: record.is_active,
        createdAt: record.created_at,
        updatedAt: record.updated_at
      }));
      
      return { data: sequences, error: null };
    } catch (error) {
      console.error('Error getting sequences:', error);
      return { data: [], error };
    }
  },

  /**
   * Get a sequence by ID
   * @param id The sequence ID
   * @returns The sequence with its steps
   */
  async getSequenceById(id: string): Promise<GenericResponse<EmailSequence>> {
    try {
      // First get the sequence details
      const { data, error } = await supabase
        .from('email_sequences')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) throw error;
      
      // Convert database record to EmailSequence with empty steps array
      const sequence: EmailSequence = {
        id: data.id,
        name: data.name,
        description: data.description,
        steps: [], // Initialize with empty steps, to be populated next
        created_at: data.created_at,
        updated_at: data.updated_at,
        shop_id: data.shop_id,
        created_by: data.created_by,
        trigger_type: data.trigger_type,
        trigger_event: data.trigger_event,
        is_active: data.is_active,
        // UI support
        triggerType: data.trigger_type,
        triggerEvent: data.trigger_event,
        isActive: data.is_active,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
      
      // Then get the steps for this sequence
      const { data: stepsData, error: stepsError } = await supabase
        .from('email_sequence_steps')
        .select('*')
        .eq('sequence_id', id)
        .order('order', { ascending: true });
        
      if (stepsError) throw stepsError;
      
      // Convert database records to EmailSequenceStep objects and add to sequence
      sequence.steps = stepsData.map(step => ({
        id: step.id,
        sequence_id: step.sequence_id,
        order: step.order,
        delay_hours: step.delay_hours,
        delay_type: step.delay_type,
        email_template_id: step.email_template_id,
        created_at: step.created_at,
        updated_at: step.updated_at,
        // UI support
        name: step.name,
        type: step.type,
        templateId: step.email_template_id,
        delayHours: step.delay_hours,
        delayType: step.delay_type,
        position: step.order,
        isActive: step.isActive
      }));
      
      return { data: sequence, error: null };
    } catch (error) {
      console.error('Error getting sequence by ID:', error);
      return { data: null, error };
    }
  },

  /**
   * Create a new sequence step
   * @param step The step to create
   * @returns The created step
   */
  async createSequenceStep(step: Partial<EmailSequenceStep>): Promise<GenericResponse<EmailSequenceStep>> {
    try {
      // Ensure required fields are present
      if (!step.sequence_id) {
        return {
          data: null,
          error: new Error('Sequence ID is required')
        };
      }
      
      // Prepare step data for insertion
      const stepData = {
        sequence_id: step.sequence_id,
        order: step.order || 0,
        delay_hours: step.delay_hours || 0,
        delay_type: step.delay_type || 'hours',
        email_template_id: step.email_template_id,
        name: step.name,
        type: step.type || 'email',
        isActive: step.isActive !== undefined ? step.isActive : true, // Updated from is_active to isActive
      };
      
      const { data, error } = await supabase
        .from('email_sequence_steps')
        .insert(stepData)
        .select()
        .single();
        
      if (error) throw error;
      
      // Convert database record to EmailSequenceStep
      const createdStep: EmailSequenceStep = {
        id: data.id,
        sequence_id: data.sequence_id,
        order: data.order,
        delay_hours: data.delay_hours,
        delay_type: data.delay_type,
        email_template_id: data.email_template_id,
        created_at: data.created_at,
        updated_at: data.updated_at,
        // UI support
        name: data.name,
        type: data.type,
        templateId: data.email_template_id,
        delayHours: data.delay_hours,
        delayType: data.delay_type,
        position: data.order,
        isActive: data.isActive // Updated from is_active to isActive
      };
      
      return { data: createdStep, error: null };
    } catch (error) {
      console.error('Error creating sequence step:', error);
      return { data: null, error };
    }
  },

  /**
   * Create a new email sequence
   * @param sequence The sequence to create
   * @returns The created sequence
   */
  async createSequence(sequence: Partial<EmailSequence>): Promise<GenericResponse<EmailSequence>> {
    try {
      const { data, error } = await supabase
        .from('email_sequences')
        .insert({
          name: sequence.name,
          description: sequence.description,
          trigger_type: sequence.trigger_type || sequence.triggerType || 'manual',
          trigger_event: sequence.trigger_event || sequence.triggerEvent,
          is_active: sequence.is_active !== undefined ? sequence.is_active : (sequence.isActive || false)
        })
        .select()
        .single();
        
      if (error) throw error;
      
      const formattedSequence = {
        id: data.id,
        name: data.name,
        description: data.description,
        steps: [], // Initialize with empty steps array
        created_at: data.created_at,
        updated_at: data.updated_at,
        shop_id: data.shop_id,
        created_by: data.created_by,
        trigger_type: data.trigger_type,
        trigger_event: data.trigger_event,
        is_active: data.is_active,
        // UI support
        triggerType: data.trigger_type,
        triggerEvent: data.trigger_event,
        isActive: data.is_active,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      } as EmailSequence;
      
      return { data: formattedSequence, error: null };
    } catch (error) {
      console.error('Error creating email sequence:', error);
      return { data: null, error };
    }
  },

  /**
   * Update an email sequence
   * @param sequenceId The ID of the sequence to update
   * @param sequence The updated sequence data
   * @returns The updated sequence
   */
  async updateSequence(
    sequenceId: string,
    sequence: Partial<EmailSequence>
  ): Promise<GenericResponse<EmailSequence>> {
    try {
      const { data, error } = await supabase
        .from('email_sequences')
        .update({
          name: sequence.name,
          description: sequence.description,
          trigger_type: sequence.trigger_type || sequence.triggerType,
          trigger_event: sequence.trigger_event || sequence.triggerEvent,
          is_active: sequence.is_active !== undefined ? sequence.is_active : sequence.isActive
        })
        .eq('id', sequenceId)
        .select()
        .single();
        
      if (error) throw error;
      
      const formattedSequence = {
        id: data.id,
        name: data.name,
        description: data.description,
        steps: [], // Initialize with empty steps array
        created_at: data.created_at,
        updated_at: data.updated_at,
        shop_id: data.shop_id,
        created_by: data.created_by,
        trigger_type: data.trigger_type,
        trigger_event: data.trigger_event,
        is_active: data.is_active,
        // UI support
        triggerType: data.trigger_type,
        triggerEvent: data.trigger_event,
        isActive: data.is_active,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      } as EmailSequence;
      
      return { data: formattedSequence, error: null };
    } catch (error) {
      console.error(`Error updating email sequence ${sequenceId}:`, error);
      return { data: null, error };
    }
  },

  /**
   * Delete an email sequence
   * @param sequenceId The ID of the sequence to delete
   * @returns Whether the deletion was successful
   */
  async deleteSequence(sequenceId: string): Promise<GenericResponse<boolean>> {
    try {
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
   * Get all steps for a sequence
   * @param sequenceId The ID of the sequence
   * @returns Array of steps for the sequence
   */
  async getSequenceSteps(sequenceId: string): Promise<GenericResponse<EmailSequenceStep[]>> {
    try {
      const { data, error } = await supabase
        .from('email_sequence_steps')
        .select('*')
        .eq('sequence_id', sequenceId)
        .order('position', { ascending: true });
        
      if (error) throw error;
      
      return { 
        data: (data || []).map(step => ({
          id: step.id,
          sequence_id: step.sequence_id,
          name: step.name,
          template_id: step.template_id,
          position: step.position,
          order: step.position,
          delay_hours: step.delay_hours,
          delayHours: step.delay_hours,
          delay_type: step.delay_type,
          delayType: step.delay_type,
          isActive: step.is_active,
          created_at: step.created_at,
          updated_at: step.updated_at,
          condition: step.condition_type ? {
            type: step.condition_type as 'event' | 'property',
            value: step.condition_value,
            operator: step.condition_operator as '=' | '!=' | '>' | '<' | '>=' | '<='
          } : undefined
        })), 
        error: null 
      };
    } catch (error) {
      console.error(`Error getting sequence steps for sequence ${sequenceId}:`, error);
      return { data: null, error };
    }
  },

  /**
   * Update a sequence step
   * @param stepId The ID of the step to update
   * @param step The updated step data
   * @returns The updated step
   */
  async updateSequenceStep(
    stepId: string, 
    step: Partial<EmailSequenceStep>
  ): Promise<GenericResponse<EmailSequenceStep>> {
    try {
      const { data, error } = await supabase
        .from('email_sequence_steps')
        .update({
          name: step.name,
          template_id: step.template_id,
          position: step.position || step.order,
          delay_hours: step.delay_hours || step.delayHours,
          delay_type: step.delay_type || step.delayType,
          is_active: step.isActive,
          condition_type: step.condition?.type,
          condition_value: step.condition?.value,
          condition_operator: step.condition?.operator
        })
        .eq('id', stepId)
        .select()
        .single();
        
      if (error) throw error;
      
      return {
        data: {
          id: data.id,
          sequence_id: data.sequence_id,
          name: data.name,
          template_id: data.template_id,
          position: data.position,
          order: data.position,
          delay_hours: data.delay_hours,
          delayHours: data.delay_hours,
          delay_type: data.delay_type,
          delayType: data.delay_type,
          isActive: data.is_active,
          created_at: data.created_at,
          updated_at: data.updated_at,
          condition: data.condition_type ? {
            type: data.condition_type as 'event' | 'property',
            value: data.condition_value,
            operator: data.condition_operator as '=' | '!=' | '>' | '<' | '>=' | '<='
          } : undefined
        },
        error: null
      };
    } catch (error) {
      console.error(`Error updating sequence step ${stepId}:`, error);
      return { data: null, error };
    }
  },

  /**
   * Delete a sequence step
   * @param stepId The ID of the step to delete
   * @returns Whether the deletion was successful
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
   * Get all enrollments for a sequence
   * @param sequenceId The ID of the sequence
   * @returns Array of enrollments for the sequence
   */
  async getEnrollmentsBySequenceId(sequenceId: string): Promise<GenericResponse<EmailSequenceEnrollment[]>> {
    try {
      const { data, error } = await supabase
        .from('email_sequence_enrollments')
        .select('*')
        .eq('sequence_id', sequenceId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      // Map to EmailSequenceEnrollment type with proper status typing
      const enrollments: EmailSequenceEnrollment[] = (data || []).map(mapDbEnrollmentToTyped);
      
      return { data: enrollments, error: null };
    } catch (error) {
      console.error(`Error getting enrollments for sequence ${sequenceId}:`, error);
      return { data: [], error };
    }
  },

  /**
   * Get enrollments by customer ID
   * @param customerId The customer ID
   * @returns Array of enrollments for the customer
   */
  async getEnrollmentsByCustomerId(customerId: string): Promise<GenericResponse<EmailSequenceEnrollment[]>> {
    try {
      const { data, error } = await supabase
        .from('email_sequence_enrollments')
        .select('*')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      // Map to EmailSequenceEnrollment type with proper status typing
      const enrollments: EmailSequenceEnrollment[] = (data || []).map(mapDbEnrollmentToTyped);
      
      return { data: enrollments, error: null };
    } catch (error) {
      console.error(`Error getting enrollments for customer ${customerId}:`, error);
      return { data: [], error };
    }
  },

  /**
   * Pause an enrollment
   * @param enrollmentId The ID of the enrollment to pause
   * @returns Whether the pause was successful
   */
  async pauseEnrollment(enrollmentId: string): Promise<GenericResponse<boolean>> {
    try {
      const { error } = await supabase
        .from('email_sequence_enrollments')
        .update({ status: 'paused' })
        .eq('id', enrollmentId);
        
      if (error) throw error;
      
      return { data: true, error: null };
    } catch (error) {
      console.error(`Error pausing enrollment ${enrollmentId}:`, error);
      return { data: false, error };
    }
  },

  /**
   * Resume an enrollment
   * @param enrollmentId The ID of the enrollment to resume
   * @returns Whether the resume was successful
   */
  async resumeEnrollment(enrollmentId: string): Promise<GenericResponse<boolean>> {
    try {
      const { error } = await supabase
        .from('email_sequence_enrollments')
        .update({ status: 'active' })
        .eq('id', enrollmentId);
        
      if (error) throw error;
      
      return { data: true, error: null };
    } catch (error) {
      console.error(`Error resuming enrollment ${enrollmentId}:`, error);
      return { data: false, error };
    }
  },

  /**
   * Cancel an enrollment
   * @param enrollmentId The ID of the enrollment to cancel
   * @returns Whether the cancellation was successful
   */
  async cancelEnrollment(enrollmentId: string): Promise<GenericResponse<boolean>> {
    try {
      const { error } = await supabase
        .from('email_sequence_enrollments')
        .update({ status: 'cancelled' })
        .eq('id', enrollmentId);
        
      if (error) throw error;
      
      return { data: true, error: null };
    } catch (error) {
      console.error(`Error cancelling enrollment ${enrollmentId}:`, error);
      return { data: false, error };
    }
  }
};
