
import { supabase } from '@/lib/supabase';
import { GenericResponse } from '../utils/supabaseHelper';

export interface SequenceProcessingSchedule {
  enabled: boolean;
  cron: string;
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
      const { data, error } = await supabase
        .from('email_system_settings')
        .select('*')
        .eq('key', 'processing_schedule')
        .single();

      if (error) throw error;
      
      if (!data) {
        return { 
          data: { enabled: false, cron: '*/30 * * * *' },
          error: null
        };
      }
      
      const scheduleData = data.value;
      if (!scheduleData || typeof scheduleData !== 'object') {
        return { 
          data: { enabled: false, cron: '*/30 * * * *' },
          error: null
        };
      }
      
      // Cast to get proper type access
      const typedData = scheduleData as Record<string, any>;
      
      return {
        data: {
          enabled: typedData.enabled === true,
          cron: typedData.cron || '*/30 * * * *'
        },
        error: null
      };
    } catch (error) {
      console.error('Error getting sequence processing schedule:', error);
      return { 
        data: { enabled: false, cron: '*/30 * * * *' },
        error
      };
    }
  },

  /**
   * Update the sequence processing schedule
   * @param schedule New schedule settings
   * @returns Success status
   */
  async updateSequenceProcessingSchedule(
    schedule: SequenceProcessingSchedule
  ): Promise<GenericResponse<SequenceProcessingSchedule>> {
    try {
      // First check if settings already exist
      const { data: existingData, error: existingError } = await supabase
        .from('email_system_settings')
        .select('*')
        .eq('key', 'processing_schedule')
        .single();

      if (existingError && existingError.code !== 'PGRST116') {
        throw existingError;
      }
      
      let result;
      
      if (existingData) {
        // Update existing record
        const { data, error } = await supabase
          .from('email_system_settings')
          .update({
            value: {
              enabled: schedule.enabled,
              cron: schedule.cron
            }
          })
          .eq('key', 'processing_schedule')
          .select()
          .single();
        
        if (error) throw error;
        result = data;
      } else {
        // Insert new record
        const { data, error } = await supabase
          .from('email_system_settings')
          .insert({
            key: 'processing_schedule',
            value: {
              enabled: schedule.enabled,
              cron: schedule.cron
            }
          })
          .select()
          .single();
        
        if (error) throw error;
        result = data;
      }
      
      // Safely extract the settings
      const resultValue = result?.value;
      const typedData = resultValue as Record<string, any>;
      
      return {
        data: {
          enabled: typedData?.enabled === true,
          cron: typedData?.cron || '*/30 * * * *'
        },
        error: null
      };
    } catch (error) {
      console.error('Error updating sequence processing schedule:', error);
      return { data: null, error };
    }
  }
};
