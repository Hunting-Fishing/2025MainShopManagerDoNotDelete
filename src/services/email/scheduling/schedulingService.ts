
import { supabase } from '@/lib/supabase';
import { GenericResponse } from '../utils/supabaseHelper';

export interface SequenceProcessingSchedule {
  enabled: boolean;
  cron: string;
  sequence_ids?: string[];
}

/**
 * Service for handling email processing schedules
 */
export const schedulingService = {
  /**
   * Get the sequence processing schedule
   * @returns Processing schedule configuration
   */
  async getSequenceProcessingSchedule(): Promise<GenericResponse<SequenceProcessingSchedule>> {
    try {
      // Query the email_system_settings table for the processing schedule
      const { data, error } = await supabase
        .from('email_system_settings')
        .select('*')
        .eq('key', 'processing_schedule')
        .single();
        
      if (error) {
        console.error('Error fetching sequence processing schedule:', error);
        return {
          data: { enabled: false, cron: '0 * * * *' },
          error
        };
      }
      
      if (!data) {
        return {
          data: { enabled: false, cron: '0 * * * *' },
          error: null
        };
      }
      
      // Cast the value from JSONB to our expected type
      const settings = data.value as Record<string, any>;
      
      return {
        data: {
          enabled: settings.enabled === true,
          cron: settings.cron || '0 * * * *',
          sequence_ids: settings.sequence_ids || []
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
    sequence_ids?: string[];
  }): Promise<GenericResponse<SequenceProcessingSchedule>> {
    try {
      // Check for existing schedule
      const { data: existingData, error: fetchError } = await supabase
        .from('email_system_settings')
        .select('*')
        .eq('key', 'processing_schedule')
        .single();
      
      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }
      
      // Prepare the value to store
      const valueToStore = {
        enabled: config.enabled,
        cron: config.cron || (existingData?.value?.cron || '0 * * * *'),
        sequence_ids: config.sequence_ids || (existingData?.value?.sequence_ids || [])
      };
      
      if (existingData) {
        // Update existing record
        const { data, error } = await supabase
          .from('email_system_settings')
          .update({ value: valueToStore })
          .eq('key', 'processing_schedule')
          .select()
          .single();
        
        if (error) throw error;
        
        return {
          data: valueToStore,
          error: null
        };
      } else {
        // Create new record
        const { data, error } = await supabase
          .from('email_system_settings')
          .insert({
            key: 'processing_schedule',
            value: valueToStore
          })
          .select()
          .single();
        
        if (error) throw error;
        
        return {
          data: valueToStore,
          error: null
        };
      }
    } catch (error) {
      console.error('Error updating sequence processing schedule:', error);
      return { 
        data: null, 
        error 
      };
    }
  }
};
