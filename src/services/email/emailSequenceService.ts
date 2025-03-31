
import { supabase } from '@/lib/supabase';
import { EmailSequence, EmailSequenceStep, EmailSequenceEnrollment } from '@/types/email';
import { parseJsonField } from './utils';

export const emailSequenceService = {
  /**
   * Get all email sequences
   * @returns Promise with array of sequences
   */
  async getSequences(): Promise<EmailSequence[]> {
    try {
      // @ts-ignore - Table exists in Supabase but not in TypeScript definitions
      const { data, error } = await supabase
        .from('email_sequences')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data.map((sequence: any) => {
        // @ts-ignore - Adding steps array to match interface
        const sequenceWithSteps: EmailSequence = {
          ...sequence,
          steps: [],
          // Add camelCase aliases for component compatibility
          triggerType: sequence.trigger_type,
          triggerEvent: sequence.trigger_event,
          isActive: sequence.is_active,
          createdAt: sequence.created_at,
          updatedAt: sequence.updated_at,
          // Add fields that may not be in the database
          last_run: sequence.last_run || null,
          next_run: sequence.next_run || null,
          run_frequency: sequence.run_frequency || null
        };
        return sequenceWithSteps;
      });
    } catch (error) {
      console.error('Error fetching email sequences:', error);
      return [];
    }
  },

  /**
   * Get a specific email sequence by ID
   * @param id The sequence ID
   * @returns Promise with the sequence or null if not found
   */
  async getSequenceById(id: string): Promise<EmailSequence | null> {
    try {
      // @ts-ignore - Table exists in Supabase but not in TypeScript definitions
      const { data: sequence, error: sequenceError } = await supabase
        .from('email_sequences')
        .select('*')
        .eq('id', id)
        .single();

      if (sequenceError) {
        throw sequenceError;
      }

      // @ts-ignore - Table exists in Supabase but not in TypeScript definitions
      const { data: steps, error: stepsError } = await supabase
        .from('email_sequence_steps')
        .select('*')
        .eq('sequence_id', id)
        .order('position', { ascending: true });

      if (stepsError) {
        throw stepsError;
      }

      // Transform sequence data to match the interface
      const formattedSequence: EmailSequence = {
        ...sequence,
        steps: steps || [],
        // Add camelCase aliases for component compatibility
        triggerType: sequence.trigger_type,
        triggerEvent: sequence.trigger_event,
        isActive: sequence.is_active,
        createdAt: sequence.created_at,
        updatedAt: sequence.updated_at,
        // Add fields that may not be in the database
        last_run: sequence.last_run || null,
        next_run: sequence.next_run || null,
        run_frequency: sequence.run_frequency || null
      };

      return formattedSequence;
    } catch (error) {
      console.error('Error fetching email sequence:', error);
      return null;
    }
  },

  /**
   * Create a new email sequence
   * @param sequence The sequence data
   * @returns Promise with the created sequence or null on error
   */
  async createSequence(sequence: Partial<EmailSequence>): Promise<EmailSequence | null> {
    try {
      const sequenceData = {
        name: sequence.name || 'New Sequence',
        description: sequence.description || '',
        trigger_type: sequence.trigger_type || sequence.triggerType || 'manual',
        trigger_event: sequence.trigger_event || sequence.triggerEvent || '',
        is_active: sequence.is_active !== undefined ? sequence.is_active : 
                  (sequence.isActive !== undefined ? sequence.isActive : false),
        shop_id: sequence.shop_id || null,
        created_by: sequence.created_by || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // @ts-ignore - Table exists in Supabase but not in TypeScript definitions
      const { data, error } = await supabase
        .from('email_sequences')
        .insert(sequenceData)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // If steps are provided, create them
      let steps: EmailSequenceStep[] = [];
      if (sequence.steps && sequence.steps.length > 0) {
        const stepsData = sequence.steps.map((step, index) => ({
          sequence_id: data.id,
          template_id: step.template_id || step.templateId || '',
          position: index,
          name: step.name || `Step ${index + 1}`,
          delay_hours: step.wait_days || step.delayHours || 0,
          delay_type: step.delayType || 'fixed',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));

        // @ts-ignore - Table exists in Supabase but not in TypeScript definitions
        const { data: createdSteps, error: stepsError } = await supabase
          .from('email_sequence_steps')
          .insert(stepsData)
          .select();

        if (stepsError) {
          throw stepsError;
        }

        steps = createdSteps;
      }

      // Transform sequence data to match the interface
      const formattedSequence: EmailSequence = {
        ...data,
        steps: steps || [],
        // Add camelCase aliases for component compatibility
        triggerType: data.trigger_type,
        triggerEvent: data.trigger_event,
        isActive: data.is_active,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        // Add fields that may not be in the database
        last_run: data.last_run || null,
        next_run: data.next_run || null,
        run_frequency: data.run_frequency || null
      };

      return formattedSequence;
    } catch (error) {
      console.error('Error creating email sequence:', error);
      return null;
    }
  },

  /**
   * Update an existing email sequence
   * @param id The sequence ID
   * @param sequence The updated sequence data
   * @returns Promise with the updated sequence or null on error
   */
  async updateSequence(id: string, sequence: Partial<EmailSequence>): Promise<EmailSequence | null> {
    try {
      const sequenceData = {
        name: sequence.name,
        description: sequence.description,
        trigger_type: sequence.trigger_type || sequence.triggerType,
        trigger_event: sequence.trigger_event || sequence.triggerEvent,
        is_active: sequence.is_active !== undefined ? sequence.is_active : 
                  (sequence.isActive !== undefined ? sequence.isActive : undefined),
        updated_at: new Date().toISOString()
      };

      // @ts-ignore - Table exists in Supabase but not in TypeScript definitions
      const { data, error } = await supabase
        .from('email_sequences')
        .update(sequenceData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // If steps are provided, update them
      let steps: EmailSequenceStep[] = [];
      if (sequence.steps && sequence.steps.length > 0) {
        // First delete existing steps
        // @ts-ignore - Table exists in Supabase but not in TypeScript definitions
        const { error: deleteError } = await supabase
          .from('email_sequence_steps')
          .delete()
          .eq('sequence_id', id);

        if (deleteError) {
          throw deleteError;
        }

        // Then create new steps
        const stepsData = sequence.steps.map((step, index) => ({
          sequence_id: id,
          template_id: step.template_id || step.templateId || '',
          position: index,
          name: step.name || `Step ${index + 1}`,
          delay_hours: step.wait_days || step.delayHours || 0,
          delay_type: step.delayType || 'fixed',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));

        // @ts-ignore - Table exists in Supabase but not in TypeScript definitions
        const { data: createdSteps, error: stepsError } = await supabase
          .from('email_sequence_steps')
          .insert(stepsData)
          .select();

        if (stepsError) {
          throw stepsError;
        }

        steps = createdSteps;
      } else {
        // Fetch existing steps
        // @ts-ignore - Table exists in Supabase but not in TypeScript definitions
        const { data: existingSteps, error: stepsError } = await supabase
          .from('email_sequence_steps')
          .select('*')
          .eq('sequence_id', id)
          .order('position', { ascending: true });

        if (stepsError) {
          throw stepsError;
        }

        steps = existingSteps || [];
      }

      // Transform sequence data to match the interface
      const formattedSequence: EmailSequence = {
        ...data,
        steps: steps,
        // Add camelCase aliases for component compatibility
        triggerType: data.trigger_type,
        triggerEvent: data.trigger_event,
        isActive: data.is_active,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        // Add fields that may not be in the database
        last_run: data.last_run || null,
        next_run: data.next_run || null,
        run_frequency: data.run_frequency || null
      };

      return formattedSequence;
    } catch (error) {
      console.error('Error updating email sequence:', error);
      return null;
    }
  },

  /**
   * Delete an email sequence
   * @param id The sequence ID
   * @returns Promise indicating success
   */
  async deleteSequence(id: string): Promise<boolean> {
    try {
      // First delete related steps
      // @ts-ignore - Table exists in Supabase but not in TypeScript definitions
      const { error: stepsError } = await supabase
        .from('email_sequence_steps')
        .delete()
        .eq('sequence_id', id);

      if (stepsError) {
        throw stepsError;
      }

      // Then delete the sequence
      // @ts-ignore - Table exists in Supabase but not in TypeScript definitions
      const { error } = await supabase
        .from('email_sequences')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error deleting email sequence:', error);
      return false;
    }
  },

  /**
   * Get enrollments for a sequence
   * @param sequenceId The sequence ID
   * @returns Promise with array of enrollments
   */
  async getSequenceEnrollments(sequenceId: string): Promise<EmailSequenceEnrollment[]> {
    try {
      // @ts-ignore - Table exists in Supabase but not in TypeScript definitions
      const { data, error } = await supabase
        .from('email_sequence_enrollments')
        .select('*, customers(*)')
        .eq('sequence_id', sequenceId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data.map((enrollment: any) => ({
        ...enrollment,
        customer_name: enrollment.customers ? 
          `${enrollment.customers.first_name} ${enrollment.customers.last_name}` : '',
        customer_email: enrollment.customers?.email || '',
        nextSendTime: enrollment.next_send_time
      }));
    } catch (error) {
      console.error('Error fetching sequence enrollments:', error);
      return [];
    }
  }
};
