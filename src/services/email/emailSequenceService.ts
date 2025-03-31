
import { supabase } from '@/lib/supabase';
import { EmailSequence } from '@/types/email';
import { parseJsonField } from './utils';

export const emailSequenceService = {
  /**
   * Retrieves all email sequences
   * @returns Promise<EmailSequence[]> list of email sequences
   */
  async getSequences(): Promise<EmailSequence[]> {
    try {
      const { data, error } = await supabase
        .from('email_sequences')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Transform the database records to match the EmailSequence type
      return (data || []).map(sequence => ({
        id: sequence.id,
        name: sequence.name,
        description: sequence.description || '',
        steps: [], // Initialize with empty steps array, they'll be fetched separately if needed
        created_at: sequence.created_at,
        updated_at: sequence.updated_at,
        shop_id: sequence.shop_id,
        created_by: sequence.created_by,
        trigger_type: (sequence.trigger_type as 'manual' | 'event' | 'schedule') || 'manual',
        trigger_event: sequence.trigger_event,
        is_active: sequence.is_active,
        
        // UI component support
        triggerType: (sequence.trigger_type as 'manual' | 'event' | 'schedule') || 'manual',
        triggerEvent: sequence.trigger_event,
        isActive: sequence.is_active,
        createdAt: sequence.created_at,
        updatedAt: sequence.updated_at
      }));
    } catch (error) {
      console.error('Error fetching email sequences:', error);
      return [];
    }
  },

  /**
   * Retrieves a specific email sequence by ID
   * @param id The sequence ID to fetch
   * @returns Promise<EmailSequence | null> the sequence or null if not found
   */
  async getSequenceById(id: string): Promise<EmailSequence | null> {
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
      
      if (!data) return null;
      
      // Transform the sequence steps to match the EmailSequenceStep type
      const steps = (data.steps || []).map(step => ({
        id: step.id,
        sequence_id: step.sequence_id,
        type: step.delay_hours > 0 ? 'delay' : 'email' as 'delay' | 'email',
        order: step.position,
        delay_duration: step.delay_hours ? `${step.delay_hours}h` : undefined,
        email_template_id: step.template_id,
        created_at: step.created_at,
        updated_at: step.updated_at,
        
        // UI component support
        name: step.name,
        templateId: step.template_id,
        delayHours: step.delay_hours,
        delayType: step.delay_type as 'fixed' | 'business_days',
        position: step.position,
        isActive: step.is_active,
        condition: step.condition_type ? {
          type: step.condition_type as 'event' | 'property',
          value: step.condition_value,
          operator: step.condition_operator as '=' | '!=' | '>' | '<' | '>=' | '<='
        } : undefined
      }));
      
      return {
        id: data.id,
        name: data.name,
        description: data.description || '',
        steps: steps,
        created_at: data.created_at,
        updated_at: data.updated_at,
        shop_id: data.shop_id,
        created_by: data.created_by,
        trigger_type: (data.trigger_type as 'manual' | 'event' | 'schedule') || 'manual',
        trigger_event: data.trigger_event,
        is_active: data.is_active,
        
        // UI component support
        triggerType: (data.trigger_type as 'manual' | 'event' | 'schedule') || 'manual',
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
      const { data, error } = await supabase
        .from('email_sequences')
        .insert({
          name: sequence.name,
          description: sequence.description,
          trigger_type: sequence.triggerType || 'manual',
          trigger_event: sequence.triggerEvent,
          is_active: sequence.isActive !== undefined ? sequence.isActive : true
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Return the created sequence with empty steps array
      return {
        id: data.id,
        name: data.name,
        description: data.description || '',
        steps: [], // New sequence has no steps yet
        created_at: data.created_at,
        updated_at: data.updated_at,
        shop_id: data.shop_id,
        created_by: data.created_by,
        trigger_type: (data.trigger_type as 'manual' | 'event' | 'schedule') || 'manual',
        trigger_event: data.trigger_event,
        is_active: data.is_active,
        
        // UI component support
        triggerType: (data.trigger_type as 'manual' | 'event' | 'schedule') || 'manual',
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
      const { data, error } = await supabase
        .from('email_sequences')
        .update({
          name: sequence.name,
          description: sequence.description,
          trigger_type: sequence.triggerType || sequence.trigger_type || 'manual',
          trigger_event: sequence.triggerEvent || sequence.trigger_event,
          is_active: sequence.isActive !== undefined ? sequence.isActive : sequence.is_active
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      // Return the updated sequence with empty steps array (steps would be fetched separately if needed)
      return {
        id: data.id,
        name: data.name,
        description: data.description || '',
        steps: sequence.steps || [], // Preserve steps if provided, otherwise empty array
        created_at: data.created_at,
        updated_at: data.updated_at,
        shop_id: data.shop_id,
        created_by: data.created_by,
        trigger_type: (data.trigger_type as 'manual' | 'event' | 'schedule') || 'manual',
        trigger_event: data.trigger_event,
        is_active: data.is_active,
        
        // UI component support
        triggerType: (data.trigger_type as 'manual' | 'event' | 'schedule') || 'manual',
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
