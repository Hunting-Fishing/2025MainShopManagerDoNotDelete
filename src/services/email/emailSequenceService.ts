
import { supabase } from '@/lib/supabase';
import { EmailSequence, EmailSequenceStep } from '@/types/email';
import { parseJsonField } from './utils';

export const emailSequenceService = {
  /**
   * Get all email sequences
   * @returns Promise<EmailSequence[]>
   */
  async getSequences(): Promise<EmailSequence[]> {
    try {
      const { data, error } = await supabase
        .from('email_sequences')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Process each sequence to include its steps
      const sequences = data.map(sequence => {
        // @ts-ignore - We use parseJsonField to safely parse the steps
        const steps = parseJsonField(sequence.steps, []);
        
        return {
          id: sequence.id,
          name: sequence.name,
          description: sequence.description,
          steps: steps,
          created_at: sequence.created_at,
          updated_at: sequence.updated_at,
          shop_id: sequence.shop_id,
          created_by: sequence.created_by,
          trigger_type: sequence.trigger_type as "manual" | "event" | "schedule",
          trigger_event: sequence.trigger_event,
          is_active: sequence.is_active,
          last_run: sequence.last_run,
          next_run: sequence.next_run,
          run_frequency: sequence.run_frequency,
          createdAt: sequence.created_at,
          updatedAt: sequence.updated_at
        };
      });

      return sequences;
    } catch (error) {
      console.error('Error fetching email sequences:', error);
      throw error;
    }
  },

  /**
   * Get a single email sequence by ID
   * @param id The sequence ID
   * @returns Promise<EmailSequence>
   */
  async getSequenceById(id: string): Promise<EmailSequence> {
    try {
      const { data, error } = await supabase
        .from('email_sequences')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      // @ts-ignore - We use parseJsonField to safely parse the steps
      const steps = parseJsonField(data.steps, []);
      
      const sequence: EmailSequence = {
        id: data.id,
        name: data.name,
        description: data.description,
        steps: steps,
        created_at: data.created_at,
        updated_at: data.updated_at,
        shop_id: data.shop_id,
        created_by: data.created_by,
        trigger_type: data.trigger_type as "manual" | "event" | "schedule",
        trigger_event: data.trigger_event,
        is_active: data.is_active,
        last_run: data.last_run,
        next_run: data.next_run,
        run_frequency: data.run_frequency,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      return sequence;
    } catch (error) {
      console.error(`Error fetching email sequence with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create a new email sequence
   * @param sequence The sequence data
   * @returns Promise<EmailSequence>
   */
  async createSequence(sequence: Partial<EmailSequence>): Promise<EmailSequence> {
    try {
      // Extract steps for separate storage
      const { steps, ...sequenceData } = sequence;
      
      // Insert the sequence record
      const { data, error } = await supabase
        .from('email_sequences')
        .insert({
          name: sequenceData.name || 'New Sequence',
          description: sequenceData.description || '',
          steps: JSON.stringify(steps || []),
          shop_id: sequenceData.shop_id || '',
          created_by: sequenceData.created_by || '',
          trigger_type: (sequenceData.trigger_type as string) || 'manual',
          trigger_event: sequenceData.trigger_event || '',
          is_active: sequenceData.is_active || false,
          run_frequency: sequenceData.run_frequency || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      // @ts-ignore - We use parseJsonField to safely parse the steps
      const parsedSteps = parseJsonField(data.steps, []);
      
      // Format the response
      const createdSequence: EmailSequence = {
        id: data.id,
        name: data.name,
        description: data.description,
        steps: parsedSteps,
        created_at: data.created_at,
        updated_at: data.updated_at,
        shop_id: data.shop_id,
        created_by: data.created_by,
        trigger_type: data.trigger_type as "manual" | "event" | "schedule",
        trigger_event: data.trigger_event,
        is_active: data.is_active,
        last_run: data.last_run,
        next_run: data.next_run,
        run_frequency: data.run_frequency,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      return createdSequence;
    } catch (error) {
      console.error('Error creating email sequence:', error);
      throw error;
    }
  },

  /**
   * Update an existing email sequence
   * @param id The sequence ID
   * @param sequence The sequence data to update
   * @returns Promise<EmailSequence>
   */
  async updateSequence(id: string, sequence: Partial<EmailSequence>): Promise<EmailSequence> {
    try {
      // Extract steps for separate storage
      const { steps, ...sequenceData } = sequence;
      
      // Update the sequence record
      const { data, error } = await supabase
        .from('email_sequences')
        .update({
          name: sequenceData.name,
          description: sequenceData.description,
          steps: steps ? JSON.stringify(steps) : undefined,
          shop_id: sequenceData.shop_id,
          trigger_type: sequenceData.trigger_type as string,
          trigger_event: sequenceData.trigger_event,
          is_active: sequenceData.is_active,
          last_run: sequenceData.last_run,
          next_run: sequenceData.next_run,
          run_frequency: sequenceData.run_frequency,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // @ts-ignore - We use parseJsonField to safely parse the steps
      const parsedSteps = parseJsonField(data.steps, []);
      
      // Format the response
      const updatedSequence: EmailSequence = {
        id: data.id,
        name: data.name,
        description: data.description,
        steps: parsedSteps,
        created_at: data.created_at,
        updated_at: data.updated_at,
        shop_id: data.shop_id,
        created_by: data.created_by,
        trigger_type: data.trigger_type as "manual" | "event" | "schedule",
        trigger_event: data.trigger_event,
        is_active: data.is_active,
        last_run: data.last_run,
        next_run: data.next_run,
        run_frequency: data.run_frequency,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      return updatedSequence;
    } catch (error) {
      console.error(`Error updating email sequence with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete an email sequence
   * @param id The sequence ID
   * @returns Promise<boolean> indicating success
   */
  async deleteSequence(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('email_sequences')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error(`Error deleting email sequence with ID ${id}:`, error);
      throw error;
    }
  }
};
