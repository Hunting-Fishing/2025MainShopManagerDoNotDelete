
import { supabase } from '@/lib/supabase';
import { EmailSequence, EmailSequenceStep } from '@/types/email';
import { GenericResponse } from '../utils/supabaseHelper';

/**
 * Service for managing email sequences
 */
export const emailSequenceService = {
  /**
   * Get a list of all email sequences
   */
  async getSequences(): Promise<GenericResponse<EmailSequence[]>> {
    try {
      const { data: sequences, error } = await supabase
        .from('email_sequences')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Format the response
      const formattedSequences: EmailSequence[] = sequences.map(seq => ({
        ...seq,
        steps: [], // Default empty steps, they will be fetched separately when needed
        triggerType: seq.trigger_type as 'manual' | 'event' | 'schedule',
        trigger_type: seq.trigger_type as 'manual' | 'event' | 'schedule',
        triggerEvent: seq.trigger_event,
        isActive: seq.is_active,
        createdAt: seq.created_at,
        updatedAt: seq.updated_at
      }));
      
      return { data: formattedSequences, error: null };
    } catch (error) {
      console.error('Error fetching email sequences:', error);
      return { data: null, error };
    }
  },

  /**
   * Get a specific email sequence by ID
   */
  async getSequenceById(sequenceId: string): Promise<GenericResponse<EmailSequence>> {
    try {
      const { data: sequence, error } = await supabase
        .from('email_sequences')
        .select('*')
        .eq('id', sequenceId)
        .single();

      if (error) throw error;
      
      // Get the steps for this sequence
      const { data: steps, error: stepsError } = await supabase
        .from('email_sequence_steps')
        .select('*')
        .eq('sequence_id', sequenceId)
        .order('delay_days', { ascending: true });
      
      if (stepsError) throw stepsError;
      
      // Format the steps
      const formattedSteps: EmailSequenceStep[] = steps.map(step => ({
        ...step,
        sequenceId: step.sequence_id,
        templateId: step.template_id,
        delayDays: step.delay_days,
        createdAt: step.created_at,
        updatedAt: step.updated_at
      }));
      
      // Build the full sequence object
      const formattedSequence: EmailSequence = {
        ...sequence,
        steps: formattedSteps,
        triggerType: sequence.trigger_type as 'manual' | 'event' | 'schedule',
        trigger_type: sequence.trigger_type as 'manual' | 'event' | 'schedule',
        triggerEvent: sequence.trigger_event,
        isActive: sequence.is_active,
        createdAt: sequence.created_at,
        updatedAt: sequence.updated_at
      };
      
      return { data: formattedSequence, error: null };
    } catch (error) {
      console.error(`Error fetching email sequence ${sequenceId}:`, error);
      return { data: null, error };
    }
  },

  /**
   * Create a new email sequence
   */
  async createSequence(sequence: Partial<EmailSequence>): Promise<GenericResponse<EmailSequence>> {
    try {
      // Prepare the sequence data for insertion
      const sequenceData = {
        name: sequence.name,
        description: sequence.description,
        trigger_type: sequence.triggerType || sequence.trigger_type,
        trigger_event: sequence.triggerEvent || sequence.trigger_event,
        is_active: sequence.isActive !== undefined ? sequence.isActive : true,
        metadata: sequence.metadata || {}
      };
      
      const { data, error } = await supabase
        .from('email_sequences')
        .insert(sequenceData)
        .select()
        .single();

      if (error) throw error;
      
      // Format the response
      const formattedSequence: EmailSequence = {
        ...data,
        steps: [], // No steps yet for a new sequence
        triggerType: data.trigger_type as 'manual' | 'event' | 'schedule',
        trigger_type: data.trigger_type as 'manual' | 'event' | 'schedule',
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
  async updateSequence(sequenceId: string, updates: Partial<EmailSequence>): Promise<GenericResponse<EmailSequence>> {
    try {
      // Prepare the sequence data for update
      const sequenceData = {
        name: updates.name,
        description: updates.description,
        trigger_type: updates.triggerType || updates.trigger_type,
        trigger_event: updates.triggerEvent || updates.trigger_event,
        is_active: updates.isActive !== undefined ? updates.isActive : undefined,
        metadata: updates.metadata
      };
      
      // Filter out undefined values
      const filteredData = Object.fromEntries(
        Object.entries(sequenceData).filter(([_, v]) => v !== undefined)
      );
      
      const { data, error } = await supabase
        .from('email_sequences')
        .update(filteredData)
        .eq('id', sequenceId)
        .select()
        .single();

      if (error) throw error;
      
      // Format the response
      const formattedSequence: EmailSequence = {
        ...data,
        steps: updates.steps || [], // Keep the steps from the update if provided
        triggerType: data.trigger_type as 'manual' | 'event' | 'schedule',
        trigger_type: data.trigger_type as 'manual' | 'event' | 'schedule',
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
      // First, delete all steps associated with this sequence
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
   * Get steps for an email sequence
   */
  async getSequenceSteps(sequenceId: string): Promise<GenericResponse<EmailSequenceStep[]>> {
    try {
      const { data: steps, error } = await supabase
        .from('email_sequence_steps')
        .select('*')
        .eq('sequence_id', sequenceId)
        .order('delay_days', { ascending: true });
      
      if (error) throw error;
      
      // Format the steps
      const formattedSteps: EmailSequenceStep[] = steps.map(step => ({
        ...step,
        sequenceId: step.sequence_id,
        templateId: step.template_id,
        delayDays: step.delay_days,
        createdAt: step.created_at,
        updatedAt: step.updated_at
      }));
      
      return { data: formattedSteps, error: null };
    } catch (error) {
      console.error(`Error fetching steps for sequence ${sequenceId}:`, error);
      return { data: null, error };
    }
  },

  /**
   * Add or update a step in an email sequence
   */
  async upsertSequenceStep(step: Partial<EmailSequenceStep>): Promise<GenericResponse<EmailSequenceStep>> {
    try {
      // Prepare the step data
      const stepData = {
        id: step.id, // Include ID for update operations
        sequence_id: step.sequenceId || step.sequence_id,
        template_id: step.templateId || step.template_id,
        delay_days: step.delayDays || step.delay_days || 0,
        subject: step.subject,
        content: step.content,
        is_active: step.isActive !== undefined ? step.isActive : true,
        metadata: step.metadata || {}
      };
      
      // Perform the upsert
      const { data, error } = await supabase
        .from('email_sequence_steps')
        .upsert(stepData, {
          onConflict: 'id',
          ignoreDuplicates: false
        })
        .select()
        .single();

      if (error) throw error;
      
      // Format the response
      const formattedStep: EmailSequenceStep = {
        ...data,
        sequenceId: data.sequence_id,
        templateId: data.template_id,
        delayDays: data.delay_days,
        isActive: data.is_active,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
      
      return { data: formattedStep, error: null };
    } catch (error) {
      console.error('Error upserting sequence step:', error);
      return { data: null, error };
    }
  },

  /**
   * Delete a step from an email sequence
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
   * Get analytics for an email sequence
   */
  async getSequenceAnalytics(sequenceId: string): Promise<GenericResponse<any>> {
    try {
      // Get enrollments for this sequence
      const { data: enrollments, error: enrollmentsError } = await supabase
        .from('email_sequence_enrollments')
        .select('*')
        .eq('sequence_id', sequenceId);
      
      if (enrollmentsError) throw enrollmentsError;
      
      // Get steps and their stats
      const { data: steps, error: stepsError } = await supabase
        .from('email_sequence_steps')
        .select('*')
        .eq('sequence_id', sequenceId);
      
      if (stepsError) throw stepsError;
      
      // Get sequence send stats (simplified - in real implementation you would get actual email open/click data)
      const stepIds = steps.map(step => step.id);
      
      const { data: stepStats, error: statsError } = await supabase
        .from('email_sequence_step_stats')
        .select('*')
        .in('step_id', stepIds);
      
      if (statsError && statsError.code !== 'PGRST116') throw statsError;
      
      // Compute analytics
      const totalEnrollments = enrollments.length;
      const activeEnrollments = enrollments.filter(e => e.status === 'active').length;
      const completedEnrollments = enrollments.filter(e => e.status === 'completed').length;
      const pausedEnrollments = enrollments.filter(e => e.status === 'paused').length;
      const cancelledEnrollments = enrollments.filter(e => e.status === 'cancelled').length;
      
      // Prepare step statistics
      const stepAnalytics = steps.map(step => {
        const stats = stepStats?.filter(s => s.step_id === step.id) || [];
        const sent = stats.reduce((sum, s) => sum + (s.sent || 0), 0);
        const opened = stats.reduce((sum, s) => sum + (s.opened || 0), 0);
        const clicked = stats.reduce((sum, s) => sum + (s.clicked || 0), 0);
        
        return {
          id: step.id,
          name: `Day ${step.delay_days}`,
          delayDays: step.delay_days,
          sent,
          opened,
          clicked,
          openRate: sent > 0 ? (opened / sent) * 100 : 0,
          clickRate: sent > 0 ? (clicked / sent) * 100 : 0,
          clickToOpenRate: opened > 0 ? (clicked / opened) * 100 : 0
        };
      });
      
      // Return the analytics data
      return {
        data: {
          sequenceId,
          enrollmentStats: {
            total: totalEnrollments,
            active: activeEnrollments,
            completed: completedEnrollments,
            paused: pausedEnrollments,
            cancelled: cancelledEnrollments
          },
          stepAnalytics
        },
        error: null
      };
    } catch (error) {
      console.error(`Error getting analytics for sequence ${sequenceId}:`, error);
      return { data: null, error };
    }
  }
};
