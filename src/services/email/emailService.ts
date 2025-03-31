
import { supabase } from '@/lib/supabase';

export const emailService = {
  /**
   * Triggers the processing of email sequences
   * @param sequenceId Optional - specific sequence ID to process, or all sequences if omitted
   * @returns Promise<boolean> indicating success or failure
   */
  async triggerSequenceProcessing(sequenceId?: string): Promise<boolean> {
    try {
      const { error } = await supabase.functions.invoke('process-email-sequences', {
        body: { 
          sequenceId, 
          action: 'process' 
        }
      });
      
      if (error) {
        console.error('Error triggering sequence processing:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Exception in triggerSequenceProcessing:', error);
      return false;
    }
  },
  
  /**
   * Creates a cron job to automatically process email sequences
   * @param interval String representing the processing interval (e.g., 'hourly', 'daily')
   * @returns Promise<boolean> indicating success or failure
   */
  async createProcessingSchedule(interval: 'hourly' | 'daily' | 'every_6_hours'): Promise<boolean> {
    try {
      const { error } = await supabase.functions.invoke('process-email-sequences', {
        body: { 
          action: 'create_schedule',
          interval
        }
      });
      
      if (error) {
        console.error('Error creating processing schedule:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Exception in createProcessingSchedule:', error);
      return false;
    }
  }
};
