
import { supabase } from '@/lib/supabase';
import { EmailSequence, EmailSequenceAnalytics, EmailSequenceEnrollment } from '@/types/email';
import { parseJsonField } from './utils';

export const emailSequenceService = {
  /**
   * Gets all email sequences
   * @returns Promise<EmailSequence[]> list of sequences
   */
  async getSequences(): Promise<EmailSequence[]> {
    try {
      const { data, error } = await supabase
        .from('email_sequences')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return (data || []).map(sequence => {
        // Parse steps from JSON
        const steps = parseJsonField(sequence.steps, []);
        
        return {
          id: sequence.id,
          name: sequence.name,
          description: sequence.description || '',
          steps: steps,
          created_at: sequence.created_at,
          updated_at: sequence.updated_at,
          shop_id: sequence.shop_id,
          created_by: sequence.created_by,
          trigger_type: (sequence.trigger_type as "manual" | "event" | "schedule") || "manual",
          trigger_event: sequence.trigger_event,
          is_active: sequence.is_active,
          triggerType: (sequence.trigger_type as "manual" | "event" | "schedule") || "manual",
          triggerEvent: sequence.trigger_event,
          isActive: sequence.is_active,
          createdAt: sequence.created_at,
          updatedAt: sequence.updated_at
        };
      });
    } catch (error) {
      console.error('Error fetching email sequences:', error);
      return [];
    }
  },

  /**
   * Gets a specific email sequence by ID
   * @param id Sequence ID to fetch
   * @returns Promise<EmailSequence | null> the sequence or null if not found
   */
  async getSequenceById(id: string): Promise<EmailSequence | null> {
    try {
      const { data, error } = await supabase
        .from('email_sequences')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      if (!data) return null;
      
      // Parse steps from JSON
      const steps = parseJsonField(data.steps, []);
      
      return {
        id: data.id,
        name: data.name,
        description: data.description || '',
        steps: steps,
        created_at: data.created_at,
        updated_at: data.updated_at,
        shop_id: data.shop_id,
        created_by: data.created_by,
        trigger_type: (data.trigger_type as "manual" | "event" | "schedule") || "manual",
        trigger_event: data.trigger_event,
        is_active: data.is_active,
        triggerType: (data.trigger_type as "manual" | "event" | "schedule") || "manual",
        triggerEvent: data.trigger_event,
        isActive: data.is_active,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    } catch (error) {
      console.error('Error fetching email sequence:', error);
      return null;
    }
  },

  /**
   * Creates a new email sequence
   * @param sequence The sequence data to create
   * @returns Promise<EmailSequence | null> the created sequence or null if failed
   */
  async createSequence(sequence: Partial<EmailSequence>): Promise<EmailSequence | null> {
    try {
      const triggerType = sequence.trigger_type || sequence.triggerType || "manual";
      
      const { data, error } = await supabase
        .from('email_sequences')
        .insert({
          name: sequence.name,
          description: sequence.description,
          steps: sequence.steps || [],
          trigger_type: triggerType,
          trigger_event: sequence.trigger_event || sequence.triggerEvent,
          is_active: sequence.is_active || sequence.isActive || false
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Parse steps from JSON
      const steps = parseJsonField(data.steps, []);
      
      return {
        id: data.id,
        name: data.name,
        description: data.description || '',
        steps: steps,
        created_at: data.created_at,
        updated_at: data.updated_at,
        shop_id: data.shop_id,
        created_by: data.created_by,
        trigger_type: (data.trigger_type as "manual" | "event" | "schedule"),
        trigger_event: data.trigger_event,
        is_active: data.is_active,
        triggerType: (data.trigger_type as "manual" | "event" | "schedule"),
        triggerEvent: data.trigger_event,
        isActive: data.is_active,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    } catch (error) {
      console.error('Error creating email sequence:', error);
      return null;
    }
  },

  /**
   * Updates an existing email sequence
   * @param id The sequence ID to update
   * @param sequence The updated sequence data
   * @returns Promise<EmailSequence | null> the updated sequence or null if failed
   */
  async updateSequence(id: string, sequence: Partial<EmailSequence>): Promise<EmailSequence | null> {
    try {
      const triggerType = sequence.trigger_type || sequence.triggerType || "manual";
      
      const { data, error } = await supabase
        .from('email_sequences')
        .update({
          name: sequence.name,
          description: sequence.description,
          steps: sequence.steps,
          trigger_type: triggerType,
          trigger_event: sequence.trigger_event || sequence.triggerEvent,
          is_active: sequence.is_active || sequence.isActive
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      // Parse steps from JSON
      const steps = parseJsonField(data.steps, []);
      
      return {
        id: data.id,
        name: data.name,
        description: data.description || '',
        steps: steps,
        created_at: data.created_at,
        updated_at: data.updated_at,
        shop_id: data.shop_id,
        created_by: data.created_by,
        trigger_type: (data.trigger_type as "manual" | "event" | "schedule"),
        trigger_event: data.trigger_event,
        is_active: data.is_active,
        triggerType: (data.trigger_type as "manual" | "event" | "schedule"),
        triggerEvent: data.trigger_event,
        isActive: data.is_active,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    } catch (error) {
      console.error('Error updating email sequence:', error);
      return null;
    }
  },

  /**
   * Deletes an email sequence
   * @param id The sequence ID to delete
   * @returns Promise<boolean> indicating success or failure
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
      console.error('Error deleting email sequence:', error);
      return false;
    }
  }
};
