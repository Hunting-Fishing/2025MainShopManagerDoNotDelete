
import { supabase } from '@/lib/supabase';
import { GenericResponse } from '../utils/supabaseHelper';

/**
 * Service for managing email sequence scheduling
 */
export const schedulingService = {
  /**
   * Get the current email sequence processing schedule
   */
  async getSequenceProcessingSchedule(): Promise<GenericResponse<{
    isEnabled: boolean;
    frequency: 'hourly' | 'daily' | 'weekly';
    lastRun: string | null;
    nextRun: string | null;
  }>> {
    try {
      const { data, error } = await supabase
        .from('email_system_settings')
        .select('*')
        .eq('key', 'sequence_processing_schedule')
        .single();

      if (error) {
        // If not found, return default schedule
        if (error.code === 'PGRST116') {
          return {
            data: {
              isEnabled: false,
              frequency: 'daily',
              lastRun: null,
              nextRun: null
            },
            error: null
          };
        }
        throw error;
      }

      // Parse the value which should be a JSON string
      const schedule = typeof data.value === 'string' 
        ? JSON.parse(data.value)
        : data.value;

      return {
        data: {
          isEnabled: schedule.isEnabled ?? false,
          frequency: schedule.frequency ?? 'daily',
          lastRun: schedule.lastRun ?? null,
          nextRun: schedule.nextRun ?? null
        },
        error: null
      };
    } catch (error) {
      console.error('Error getting sequence processing schedule:', error);
      return {
        data: {
          isEnabled: false,
          frequency: 'daily',
          lastRun: null,
          nextRun: null
        },
        error
      };
    }
  },

  /**
   * Update the email sequence processing schedule
   */
  async updateSequenceProcessingSchedule(schedule: {
    isEnabled: boolean;
    frequency: 'hourly' | 'daily' | 'weekly';
  }): Promise<GenericResponse<boolean>> {
    try {
      // Calculate the next run time based on frequency
      const now = new Date();
      let nextRun: Date = new Date(now);

      if (schedule.frequency === 'hourly') {
        nextRun.setHours(nextRun.getHours() + 1);
      } else if (schedule.frequency === 'daily') {
        nextRun.setDate(nextRun.getDate() + 1);
        nextRun.setHours(0, 0, 0, 0); // Run at midnight
      } else if (schedule.frequency === 'weekly') {
        // Run on next Monday
        const daysUntilMonday = 1 - now.getDay();
        const daysToAdd = daysUntilMonday <= 0 ? daysUntilMonday + 7 : daysUntilMonday;
        nextRun.setDate(nextRun.getDate() + daysToAdd);
        nextRun.setHours(0, 0, 0, 0); // Run at midnight
      }

      const scheduleData = {
        ...schedule,
        lastRun: schedule.isEnabled ? now.toISOString() : null,
        nextRun: schedule.isEnabled ? nextRun.toISOString() : null
      };

      // Upsert the schedule to the settings table
      const { error } = await supabase
        .from('email_system_settings')
        .upsert({
          key: 'sequence_processing_schedule',
          value: scheduleData,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'key'
        });

      if (error) throw error;

      // If enabled, trigger immediate processing
      if (schedule.isEnabled) {
        await supabase.functions.invoke('process-email-sequences', {
          body: { force: true }
        });
      }

      return { data: true, error: null };
    } catch (error) {
      console.error('Error updating sequence processing schedule:', error);
      return { data: false, error };
    }
  }
};
