
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
  async getSequenceProcessingSchedule(): Promise<SequenceProcessingSchedule> {
    try {
      // Instead of using email_system_settings, use key-value storage approach
      // We'll use a custom RPC function that returns the configuration
      const { data, error } = await supabase.rpc(
        'get_email_processing_schedule'
      );
      
      if (error) {
        console.error('Error fetching sequence processing schedule:', error);
        // Return default values
        return {
          enabled: false,
          cron: '*/30 * * * *' // Every 30 minutes
        };
      }
      
      // Handle the case where the RPC function might not exist yet
      if (!data) {
        // Return default values
        return {
          enabled: false,
          cron: '*/30 * * * *' // Every 30 minutes
        };
      }
      
      return {
        enabled: data.enabled || false,
        cron: data.cron || '*/30 * * * *'
      };
    } catch (error) {
      console.error('Error in getSequenceProcessingSchedule:', error);
      
      // Return default values
      return {
        enabled: false,
        cron: '*/30 * * * *' // Every 30 minutes
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
  ): Promise<boolean> {
    try {
      // Instead of using email_system_settings, use a custom RPC function to update config
      const { data, error } = await supabase.rpc(
        'update_email_processing_schedule',
        {
          p_enabled: schedule.enabled,
          p_cron: schedule.cron
        }
      );
      
      if (error) {
        console.error('Error updating sequence processing schedule:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error in updateSequenceProcessingSchedule:', error);
      return false;
    }
  }
};
