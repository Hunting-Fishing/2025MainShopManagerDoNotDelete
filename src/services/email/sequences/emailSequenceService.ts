import { supabase } from '@/lib/supabase';
import { 
  EmailSequence, 
  EmailSequenceStep, 
  EmailSequenceEnrollment, 
  EmailSequenceAnalytics 
} from '@/types/email';
import { GenericResponse, parseJsonField } from '../utils/supabaseHelper';

// Helper function to parse and validate sequence step data
const mapDbStepToSequenceStep = (step: any): EmailSequenceStep => {
  return {
    id: step.id,
    sequence_id: step.sequence_id,
    sequenceId: step.sequence_id,
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
    type: 'email',
    isActive: step.is_active === true,
    condition: step.condition_type ? {
      type: step.condition_type as 'event' | 'property',
      value: step.condition_value,
      operator: step.condition_operator as '=' | '!=' | '>' | '<' | '>=' | '<='
    } : undefined
  };
};

// Helper function to parse and validate sequence data
const mapDbSequenceToEmailSequence = (sequence: any, steps: EmailSequenceStep[] = []): EmailSequence => {
  return {
    id: sequence.id,
    name: sequence.name,
    description: sequence.description || '',
    steps: steps,
    created_at: sequence.created_at,
    createdAt: sequence.created_at,
    updated_at: sequence.updated_at,
    updatedAt: sequence.updated_at,
    shop_id: sequence.shop_id,
    created_by: sequence.created_by,
    trigger_type: sequence.trigger_type as 'manual' | 'event' | 'schedule',
    triggerType: sequence.trigger_type as 'manual' | 'event' | 'schedule',
    trigger_event: sequence.trigger_event,
    triggerEvent: sequence.trigger_event,
    is_active: sequence.is_active === true,
    isActive: sequence.is_active === true
  };
};

// Helper function to parse enrollments
const mapDbEnrollmentToSequenceEnrollment = (enrollment: any): EmailSequenceEnrollment => {
  return {
    id: enrollment.id,
    sequence_id: enrollment.sequence_id,
    sequenceId: enrollment.sequence_id,
    customer_id: enrollment.customer_id,
    customerId: enrollment.customer_id,
    status: enrollment.status as 'active' | 'paused' | 'completed' | 'cancelled',
    current_step_id: enrollment.current_step_id,
    currentStepId: enrollment.current_step_id,
    created_at: enrollment.created_at,
    updated_at: enrollment.updated_at,
    completed_at: enrollment.completed_at,
    completedAt: enrollment.completed_at,
    startedAt: enrollment.started_at,
    nextSendTime: enrollment.next_send_time,
    metadata: parseJsonField(enrollment.metadata, {})
  };
};

// Helper function to parse analytics
const mapDbAnalyticsToSequenceAnalytics = (analytics: any): EmailSequenceAnalytics => {
  return {
    id: analytics.id,
    sequence_id: analytics.sequence_id,
    sequenceId: analytics.sequence_id,
    total_enrollments: analytics.total_enrollments,
    totalEnrollments: analytics.total_enrollments,
    active_enrollments: analytics.active_enrollments,
    activeEnrollments: analytics.active_enrollments,
    completed_enrollments: analytics.completed_enrollments,
    completedEnrollments: analytics.completed_enrollments,
    cancelled_enrollments: analytics.cancelled_enrollments || 0,
    total_emails_sent: analytics.total_emails_sent || 0,
    totalEmailsSent: analytics.total_emails_sent || 0,
    open_rate: analytics.open_rate || 0,
    openRate: analytics.open_rate || 0,
    click_rate: analytics.click_rate || 0,
    clickRate: analytics.click_rate || 0,
    conversion_rate: analytics.conversion_rate,
    conversionRate: analytics.conversion_rate,
    average_time_to_complete: analytics.average_time_to_complete,
    averageTimeToComplete: analytics.average_time_to_complete,
    updated_at: analytics.updated_at,
    updatedAt: analytics.updated_at,
    created_at: analytics.created_at || analytics.updated_at,
    createdAt: analytics.created_at || analytics.updated_at
  };
};

/**
 * Service for managing email sequences
 */
export const emailSequenceService = {
  /**
   * Get all sequences
   */
  async getSequences(): Promise<GenericResponse<EmailSequence[]>> {
    try {
      const { data, error } = await supabase
        .from('email_sequences')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Map the sequences to the expected format
      const mappedSequences: EmailSequence[] = data.map(sequence => ({
        id: sequence.id,
        name: sequence.name,
        description: sequence.description || '',
        steps: [], // Steps will be fetched separately
        created_at: sequence.created_at,
        updated_at: sequence.updated_at,
        shop_id: sequence.shop_id,
        created_by: sequence.created_by,
        trigger_type: sequence.trigger_type as 'manual' | 'event' | 'schedule',
        trigger_event: sequence.trigger_event,
        is_active: sequence.is_active,
        
        // UI component support
        triggerType: sequence.trigger_type as 'manual' | 'event' | 'schedule',
        triggerEvent: sequence.trigger_event,
        isActive: sequence.is_active,
        createdAt: sequence.created_at,
        updatedAt: sequence.updated_at
      }));
      
      return { data: mappedSequences, error: null };
    } catch (error) {
      console.error('Error getting sequences:', error);
      return { data: null, error };
    }
  },

  /**
   * Get a sequence by ID with its steps
   */
  async getSequenceById(sequenceId: string): Promise<GenericResponse<EmailSequence>> {
    try {
      // Fetch the sequence
      const { data: sequence, error } = await supabase
        .from('email_sequences')
        .select('*')
        .eq('id', sequenceId)
        .single();
      
      if (error) throw error;
      
      // Fetch the steps for this sequence
      const { data: steps, error: stepsError } = await supabase
        .from('email_sequence_steps')
        .select('*')
        .eq('sequence_id', sequenceId)
        .order('position', { ascending: true });
      
      if (stepsError) throw stepsError;
      
      // Map the sequence and steps to the expected format
      const mappedSequence: EmailSequence = {
        id: sequence.id,
        name: sequence.name,
        description: sequence.description || '',
        steps: steps ? steps.map(mapDbStepToSequenceStep) : [],
        created_at: sequence.created_at,
        updated_at: sequence.updated_at,
        shop_id: sequence.shop_id,
        created_by: sequence.created_by,
        trigger_type: sequence.trigger_type as 'manual' | 'event' | 'schedule',
        trigger_event: sequence.trigger_event,
        is_active: sequence.is_active,
        
        // UI component support
        triggerType: sequence.trigger_type as 'manual' | 'event' | 'schedule',
        triggerEvent: sequence.trigger_event,
        isActive: sequence.is_active,
        createdAt: sequence.created_at,
        updatedAt: sequence.updated_at
      };
      
      return { data: mappedSequence, error: null };
    } catch (error) {
      console.error(`Error getting sequence ${sequenceId}:`, error);
      return { data: null, error };
    }
  },

  /**
   * Create a new sequence
   */
  async createSequence(sequence: Partial<EmailSequence>): Promise<GenericResponse<EmailSequence>> {
    try {
      const { data, error } = await supabase
        .from('email_sequences')
        .insert({
          name: sequence.name,
          description: sequence.description,
          trigger_type: sequence.triggerType || sequence.trigger_type || 'manual',
          trigger_event: sequence.triggerEvent || sequence.trigger_event,
          is_active: sequence.isActive !== undefined ? sequence.isActive : true
        })
        .select()
        .single();
      
      if (error) throw error;
      
      const mappedSequence: EmailSequence = {
        id: data.id,
        name: data.name,
        description: data.description || '',
        steps: [],
        created_at: data.created_at,
        updated_at: data.updated_at,
        shop_id: data.shop_id,
        created_by: data.created_by,
        trigger_type: data.trigger_type as 'manual' | 'event' | 'schedule',
        trigger_event: data.trigger_event,
        is_active: data.is_active,
        
        // UI component support
        triggerType: data.trigger_type as 'manual' | 'event' | 'schedule',
        triggerEvent: data.trigger_event,
        isActive: data.is_active,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
      
      return { data: mappedSequence, error: null };
    } catch (error) {
      console.error('Error creating sequence:', error);
      return { data: null, error };
    }
  },

  /**
   * Update an existing sequence
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
          trigger_type: sequence.triggerType || sequence.trigger_type,
          trigger_event: sequence.triggerEvent || sequence.trigger_event,
          is_active: sequence.isActive
        })
        .eq('id', sequenceId)
        .select()
        .single();
      
      if (error) throw error;
      
      const mappedSequence: EmailSequence = {
        id: data.id,
        name: data.name,
        description: data.description || '',
        steps: [],
        created_at: data.created_at,
        updated_at: data.updated_at,
        shop_id: data.shop_id,
        created_by: data.created_by,
        trigger_type: data.trigger_type as 'manual' | 'event' | 'schedule',
        trigger_event: data.trigger_event,
        is_active: data.is_active,
        
        // UI component support
        triggerType: data.trigger_type as 'manual' | 'event' | 'schedule',
        triggerEvent: data.trigger_event,
        isActive: data.is_active,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
      
      return { data: mappedSequence, error: null };
    } catch (error) {
      console.error(`Error updating sequence ${sequenceId}:`, error);
      return { data: null, error };
    }
  },

  /**
   * Delete a sequence
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
      console.error(`Error deleting sequence ${sequenceId}:`, error);
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
      
      // Map the steps to the expected format
      const mappedSteps: EmailSequenceStep[] = data.map(mapDbStepToSequenceStep);
      
      return { data: mappedSteps, error: null };
    } catch (error) {
      console.error(`Error getting steps for sequence ${sequenceId}:`, error);
      return { data: null, error };
    }
  },

  /**
   * Update a sequence step
   * @param stepId Step ID
   * @param stepData Step data to update
   * @returns Updated step
   */
  async updateSequenceStep(
    stepId: string, 
    stepData: Partial<EmailSequenceStep>
  ): Promise<GenericResponse<EmailSequenceStep>> {
    try {
      // Convert from EmailSequenceStep properties to database column names
      const dbData: Record<string, any> = {
        name: stepData.name,
        template_id: stepData.templateId || stepData.template_id,
        position: stepData.position,
        delay_hours: stepData.delayHours || stepData.delay_hours,
        delay_type: stepData.delayType || stepData.delay_type,
        is_active: stepData.isActive ?? true,
        condition_type: stepData.condition?.type,
        condition_value: stepData.condition?.value,
        condition_operator: stepData.condition?.operator
      };
      
      // Clean undefined values
      Object.keys(dbData).forEach(key => {
        if (dbData[key] === undefined) {
          delete dbData[key];
        }
      });
      
      const { data, error } = await supabase
        .from('email_sequence_steps')
        .update(dbData)
        .eq('id', stepId)
        .select('*')
        .single();
      
      if (error) throw error;
      
      return { 
        data: mapDbStepToSequenceStep(data), 
        error: null 
      };
    } catch (error) {
      console.error('Error updating sequence step:', error);
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
   * Create a new sequence step
   */
  async createSequenceStep(
    stepData: Partial<EmailSequenceStep>
  ): Promise<GenericResponse<EmailSequenceStep>> {
    try {
      const { data, error } = await supabase
        .from('email_sequence_steps')
        .insert({
          sequence_id: stepData.sequence_id || stepData.sequenceId,
          name: stepData.name || 'New Step',
          template_id: stepData.template_id || stepData.templateId || stepData.email_template_id,
          position: stepData.position || stepData.order || 0,
          delay_hours: stepData.delay_hours || stepData.delayHours || 24,
          delay_type: stepData.delay_type || stepData.delayType || 'fixed',
          is_active: stepData.isActive !== undefined ? stepData.isActive : true,
          condition_type: stepData.condition?.type,
          condition_value: stepData.condition?.value,
          condition_operator: stepData.condition?.operator
        })
        .select()
        .single();
      
      if (error) throw error;
      
      return { data: mapDbStepToSequenceStep(data), error: null };
    } catch (error) {
      console.error('Error creating sequence step:', error);
      return { data: null, error };
    }
  },

  /**
   * Get analytics for a sequence
   */
  async getAnalytics(sequenceId: string): Promise<GenericResponse<any>> {
    try {
      const { data, error } = await supabase
        .from('email_sequence_analytics')
        .select('*')
        .eq('sequence_id', sequenceId)
        .single();
      
      if (error) throw error;
      
      return { data, error: null };
    } catch (error) {
      console.error(`Error getting analytics for sequence ${sequenceId}:`, error);
      return { data: null, error };
    }
  },

  /**
   * Get detailed sequence analytics
   */
  async getSequenceAnalytics(sequenceId: string): Promise<GenericResponse<EmailSequenceAnalytics>> {
    try {
      // Fetch the analytics from the table
      const { data, error } = await supabase
        .from('email_sequence_analytics')
        .select('*')
        .eq('sequence_id', sequenceId)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      if (!data) {
        // If no analytics found, create default values
        return {
          data: {
            id: '', // This would be filled when saved
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
            total_emails_sent: 0,
            totalEmailsSent: 0,
            open_rate: 0,
            openRate: 0,
            click_rate: 0,
            clickRate: 0,
            updated_at: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            created_at: new Date().toISOString(),
            createdAt: new Date().toISOString()
          },
          error: null
        };
      }
      
      // Add additional properties that might not be in the base analytics
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
        cancelled_enrollments: 0, // Default value if not present
        conversion_rate: data.conversion_rate,
        conversionRate: data.conversion_rate,
        average_time_to_complete: data.average_time_to_complete,
        averageTimeToComplete: data.average_time_to_complete,
        total_emails_sent: 0, // Default value if not present
        totalEmailsSent: 0, // Default value if not present
        open_rate: 0, // Default value if not present
        openRate: 0, // Default value if not present
        click_rate: 0, // Default value if not present
        clickRate: 0, // Default value if not present
        updated_at: data.updated_at,
        updatedAt: data.updated_at,
        created_at: data.updated_at, // Use updated_at as fallback
        createdAt: data.updated_at
      };
      
      return { data: analytics, error: null };
    } catch (error) {
      console.error(`Error getting sequence analytics for ${sequenceId}:`, error);
      return { data: null, error };
    }
  },

  /**
   * Get all enrollments for a sequence
   */
  async getEnrollments(sequenceId: string): Promise<GenericResponse<EmailSequenceEnrollment[]>> {
    try {
      const { data, error } = await supabase
        .from('email_sequence_enrollments')
        .select('*')
        .eq('sequence_id', sequenceId);
      
      if (error) throw error;
      
      return { data, error: null };
    } catch (error) {
      console.error(`Error getting enrollments for sequence ${sequenceId}:`, error);
      return { data: null, error };
    }
  },

  /**
   * Enroll a customer in a sequence
   */
  async enrollCustomer(sequenceId: string, customerId: string): Promise<GenericResponse<boolean>> {
    try {
      const { data, error } = await supabase
        .from('email_sequence_enrollments')
        .insert({
          sequence_id: sequenceId,
          customer_id: customerId,
          status: 'active'
        })
        .select()
        .single();
      
      if (error) throw error;
      
      return { data: true, error: null };
    } catch (error) {
      console.error(`Error enrolling customer ${customerId} in sequence ${sequenceId}:`, error);
      return { data: false, error };
    }
  },

  /**
   * Pause an enrollment
   */
  async pauseEnrollment(enrollmentId: string): Promise<GenericResponse<boolean>> {
    try {
      const { data, error } = await supabase
        .from('email_sequence_enrollments')
        .update({ status: 'paused' })
        .eq('id', enrollmentId)
        .select()
        .single();
      
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
      const { data, error } = await supabase
        .from('email_sequence_enrollments')
        .update({ status: 'active' })
        .eq('id', enrollmentId)
        .select()
        .single();
      
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
      const { data, error } = await supabase
        .from('email_sequence_enrollments')
        .update({ status: 'cancelled' })
        .eq('id', enrollmentId)
        .select()
        .single();
      
      if (error) throw error;
      
      return { data: true, error: null };
    } catch (error) {
      console.error(`Error cancelling enrollment ${enrollmentId}:`, error);
      return { data: false, error };
    }
  },

  /**
   * Get customer enrollments for a sequence
   * @param customerId Customer ID
   * @returns List of sequence enrollments
   */
  async getCustomerEnrollments(
    customerId: string
  ): Promise<GenericResponse<EmailSequenceEnrollment[]>> {
    try {
      const { data, error } = await supabase
        .from('email_sequence_enrollments')
        .select('*')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const enrollments = data.map(enrollment => mapDbEnrollmentToSequenceEnrollment(enrollment));
      
      return { data: enrollments, error: null };
    } catch (error) {
      console.error('Error getting customer enrollments:', error);
      return { data: [], error };
    }
  }
};
