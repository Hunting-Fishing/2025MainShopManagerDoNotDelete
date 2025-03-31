
import { supabase } from '@/lib/supabase';
import { GenericResponse } from './utils/supabaseHelper';

export interface SequenceProcessingSchedule {
  enabled: boolean;
  cron: string;
}

/**
 * Service for managing email sequence processing schedules
 */
export const schedulingService = {
  /**
   * Get the current sequence processing schedule
   * @returns Processing schedule configuration
   */
  async getSequenceProcessingSchedule(): Promise<GenericResponse<SequenceProcessingSchedule>> {
    try {
      // Query the email_system_settings table directly
      const { data, error } = await supabase
        .from('email_system_settings')
        .select('*')
        .eq('key', 'processing_schedule')
        .single();
        
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      if (!data || !data.value) {
        return {
          data: { enabled: false, cron: '0 * * * *' },
          error: null
        };
      }
      
      // Cast the value to access the properties
      const valueObj = data.value as Record<string, any>;
      
      return {
        data: {
          enabled: valueObj.enabled === true,
          cron: valueObj.cron || '0 * * * *'
        },
        error: null
      };
    } catch (error) {
      console.error('Error getting sequence processing schedule:', error);
      return {
        data: { enabled: false, cron: '0 * * * *' },
        error
      };
    }
  },

  /**
   * Update the sequence processing schedule
   * @param config Schedule configuration
   * @returns Success status
   */
  async updateSequenceProcessingSchedule(config: { 
    cron?: string; 
    enabled: boolean;
    sequenceIds?: string[];
  }): Promise<GenericResponse<{success: boolean}>> {
    try {
      // Check for existing schedule
      const { data: existing, error: fetchError } = await supabase
        .from('email_system_settings')
        .select('*')
        .eq('key', 'processing_schedule')
        .single();
      
      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }
      
      if (existing) {
        // Update existing schedule
        const existingValue = existing.value as Record<string, any>;
        const { error } = await supabase
          .from('email_system_settings')
          .update({
            value: {
              enabled: config.enabled,
              cron: config.cron || existingValue.cron || '0 * * * *',
              sequence_ids: config.sequenceIds || existingValue.sequence_ids || []
            }
          })
          .eq('key', 'processing_schedule');
        
        if (error) throw error;
        return { data: { success: true }, error: null };
      } else {
        // Create new schedule
        const { error } = await supabase
          .from('email_system_settings')
          .insert({
            key: 'processing_schedule',
            value: {
              enabled: config.enabled,
              cron: config.cron || '0 * * * *',
              sequence_ids: config.sequenceIds || []
            }
          });
        
        if (error) throw error;
        return { data: { success: true }, error: null };
      }
    } catch (error) {
      console.error('Error updating sequence processing schedule:', error);
      return { data: { success: false }, error };
    }
  }
};
