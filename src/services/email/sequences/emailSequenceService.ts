
import { supabase } from '@/lib/supabase';
import { 
  EmailSequence, 
  EmailSequenceStep, 
  EmailSequenceEnrollment 
} from '@/types/email';
import { GenericResponse, parseJsonField, prepareForSupabase } from '../utils/supabaseHelper';

// Define a mapping of DB status to typed status
const enrollmentStatusMap = {
  'active': 'active',
  'paused': 'paused',
  'completed': 'completed',
  'cancelled': 'cancelled'
} as const;

// Type for the mapping
type EnrollmentStatusKeys = keyof typeof enrollmentStatusMap;

/**
 * Map database status string to typed status
 */
const mapDbStatusToTypedStatus = (status: string): "active" | "paused" | "completed" | "cancelled" => {
  return enrollmentStatusMap[status as EnrollmentStatusKeys] || 'active';
};

/**
 * Map database enrollment to typed enrollment
 */
const mapDbEnrollmentToTyped = (enrollment: any): EmailSequenceEnrollment => {
  return {
    id: enrollment.id,
    sequence_id: enrollment.sequence_id,
    sequenceId: enrollment.sequence_id,
    customer_id: enrollment.customer_id,
    customerId: enrollment.customer_id,
    status: mapDbStatusToTypedStatus(enrollment.status),
    current_step_id: enrollment.current_step_id,
    currentStepId: enrollment.current_step_id,
    created_at: enrollment.created_at,
    createdAt: enrollment.created_at,
    updated_at: enrollment.updated_at,
    updatedAt: enrollment.updated_at,
    started_at: enrollment.started_at,
    startedAt: enrollment.started_at,
    completed_at: enrollment.completed_at,
    completedAt: enrollment.completed_at,
    next_send_time: enrollment.next_send_time,
    nextSendTime: enrollment.next_send_time,
    metadata: parseJsonField(enrollment.metadata, {})
  };
};

/**
 * Service for managing email sequences
 */
export const emailSequenceService = {
  /**
   * Create a new sequence step
   */
  async createSequenceStep(step: Partial<EmailSequenceStep>): Promise<GenericResponse<EmailSequenceStep>> {
    try {
      const { data, error } = await supabase
        .from('email_sequence_steps')
        .insert({
          sequence_id: step.sequence_id,
          name: step.name || 'New Step',
          template_id: step.template_id,
          position: step.position || step.order || 0,
          delay_hours: step.delay_hours || step.delayHours || 0,
          delay_type: step.delay_type || step.delayType || 'fixed',
          is_active: step.isActive !== undefined ? step.isActive : true,
          condition_type: step.condition?.type,
          condition_value: step.condition?.value,
          condition_operator: step.condition?.operator
        })
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
      console.error('Error creating sequence step:', error);
      return { data: null, error };
    }
  },

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

      const formattedSequences = (data || []).map(seq => ({
        id: seq.id,
        name: seq.name,
        description: seq.description,
        steps: [],  // Initialize with empty steps array
        created_at: seq.created_at,
        updated_at: seq.updated_at,
        shop_id: seq.shop_id,
        created_by: seq.created_by,
        trigger_type: seq.trigger_type,
        trigger_event: seq.trigger_event,
        is_active: seq.is_active,
        
        // UI component support
        triggerType: seq.trigger_type,
        triggerEvent: seq.trigger_event,
        isActive: seq.is_active,
        createdAt: seq.created_at,
        updatedAt: seq.updated_at,
        
        // Additional fields for system schedules
        last_run: null,
        next_run: null,
        run_frequency: null
      })) as EmailSequence[];

      return { data: formattedSequences, error: null };
    } catch (error) {
      console.error('Error getting email sequences:', error);
      return { data: null, error };
    }
  },

  /**
   * Get a sequence by ID
   */
  async getSequenceById(sequenceId: string): Promise<GenericResponse<EmailSequence>> {
    try {
      const { data, error } = await supabase
        .from('email_sequences')
        .select('*')
        .eq('id', sequenceId)
        .single();

      if (error) throw error;

      const formattedSequence = {
        id: data.id,
        name: data.name,
        description: data.description,
        steps: [],  // Initialize with empty steps array
        created_at: data.created_at,
        updated_at: data.updated_at,
        shop_id: data.shop_id,
        created_by: data.created_by,
        trigger_type: data.trigger_type,
        trigger_event: data.trigger_event,
        is_active: data.is_active,
        
        // UI component support
        triggerType: data.trigger_type,
        triggerEvent: data.trigger_event,
        isActive: data.is_active,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        
        // Additional fields for system schedules
        last_run: null,
        next_run: null,
        run_frequency: null
      } as EmailSequence;

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
        
        // UI component support
        triggerType: data.trigger_type,
        triggerEvent: data.trigger_event,
        isActive: data.is_active,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        
        // Additional fields for system schedules
        last_run: null,
        next_run: null,
        run_frequency: null
      } as EmailSequence;

      return { data: formattedSequence, error: null };
    } catch (error) {
      console.error('Error creating email sequence:', error);
      return { data: null, error };
    }
  },

  /**
   * Update an email sequence
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
        
        // UI component support
        triggerType: data.trigger_type,
        triggerEvent: data.trigger_event,
        isActive: data.is_active,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        
        // Additional fields for system schedules
        last_run: null,
        next_run: null,
        run_frequency: null
      } as EmailSequence;

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
