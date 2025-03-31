
import { supabase } from '@/lib/supabase';
import { GenericResponse } from '../utils/supabaseHelper';

interface SequenceProcessingSchedule {
  enabled: boolean;
  cron: string;
}

/**
 * Service for managing email processing schedules
 */
export const schedulingService = {
  /**
   * Get the current sequence processing schedule configuration
   * @returns The schedule configuration
   */
  async getSequenceProcessingSchedule(): Promise<GenericResponse<SequenceProcessingSchedule>> {
    try {
      // Use a safer approach - fetch from a key/value settings table instead
      const { data, error } = await supabase
        .from('email_system_settings')
        .select('*')
        .eq('key', 'processing_schedule')
        .single();
      
      if (error) {
        console.error('Error fetching sequence processing schedule:', error);
        // Return default values
        return {
          data: {
            enabled: false,
            cron: '*/30 * * * *' // Every 30 minutes
          },
          error: null
        };
      }
      
      // Parse the settings value
      try {
        const settings = JSON.parse(data.value);
        return {
          data: {
            enabled: settings.enabled || false,
            cron: settings.cron || '*/30 * * * *'
          },
          error: null
        };
      } catch (parseError) {
        console.error('Error parsing schedule settings:', parseError);
        return {
          data: {
            enabled: false,
            cron: '*/30 * * * *'
          },
          error: null
        };
      }
    } catch (error) {
      console.error('Error in getSequenceProcessingSchedule:', error);
      
      // Return default values
      return {
        data: {
          enabled: false,
          cron: '*/30 * * * *' // Every 30 minutes
        },
        error
      };
    }
  },

  /**
   * Update the sequence processing schedule configuration
   * @param schedule The new schedule configuration
   * @returns Success status
   */
  async updateSequenceProcessingSchedule(
    schedule: SequenceProcessingSchedule
  ): Promise<GenericResponse<boolean>> {
    try {
      // Check if the setting already exists
      const { data: existingData } = await supabase
        .from('email_system_settings')
        .select('*')
        .eq('key', 'processing_schedule')
        .single();
      
      // Stringify the settings object
      const settingsValue = JSON.stringify({
        enabled: schedule.enabled,
        cron: schedule.cron
      });
      
      if (existingData) {
        // Update existing setting
        const { error } = await supabase
          .from('email_system_settings')
          .update({ value: settingsValue })
          .eq('key', 'processing_schedule');
          
        if (error) throw error;
      } else {
        // Insert new setting
        const { error } = await supabase
          .from('email_system_settings')
          .insert({
            key: 'processing_schedule',
            value: settingsValue
          });
          
        if (error) throw error;
      }
      
      return { data: true, error: null };
    } catch (error) {
      console.error('Error in updateSequenceProcessingSchedule:', error);
      return { data: false, error };
    }
  }
};
