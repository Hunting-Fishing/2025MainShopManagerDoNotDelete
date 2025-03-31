
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
        .rpc('get_email_processing_schedule');

      if (error) throw error;
      
      if (!data) {
        return { 
          data: { enabled: false, cron: '*/30 * * * *' },
          error: null
        };
      }
      
      return {
        data: {
          enabled: data.enabled === true,
          cron: data.cron || '*/30 * * * *'
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
      const { data, error } = await supabase
        .rpc('update_email_processing_schedule', {
          new_settings: {
            enabled: schedule.enabled,
            cron: schedule.cron
          }
        });

      if (error) throw error;
      
      return {
        data: {
          enabled: data?.enabled === true,
          cron: data?.cron || '*/30 * * * *'
        },
        error: null
      };
    } catch (error) {
      console.error('Error updating sequence processing schedule:', error);
      return { data: null, error };
    }
  }
};
