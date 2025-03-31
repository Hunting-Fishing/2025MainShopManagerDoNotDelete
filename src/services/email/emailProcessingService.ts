
import { supabase } from '@/lib/supabase';

export const emailProcessingService = {
  /**
   * Triggers processing for email sequences
   * @param sequenceId Optional specific sequence ID to process
   * @returns Promise<boolean> indicating success
   */
  async triggerSequenceProcessing(sequenceId?: string): Promise<boolean> {
    try {
      // If we have a specific sequence ID, add it to the request
      const payload = sequenceId ? { sequence_id: sequenceId } : {};
      
      // Call the serverless function
      const { error } = await supabase.functions.invoke('process-email-sequences', {
        body: payload
      });
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error triggering sequence processing:', error);
      return false;
    }
  },
  
  /**
   * Creates or updates a processing schedule for email sequences
   * @param schedule Schedule configuration
   * @returns Promise<boolean> indicating success
   */
  async createProcessingSchedule(schedule: {
    cron?: string;
    enabled: boolean;
    sequenceIds?: string[];
  }): Promise<boolean> {
    try {
      // Create or update the schedule configuration
      // @ts-ignore - Using the system_schedules table which isn't in the type definitions
      const { error } = await supabase
        .from('system_schedules')
        .upsert({
          type: 'email_sequence_processing',
          configuration: schedule,
          enabled: schedule.enabled,
          last_run: null,
          next_run: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error creating processing schedule:', error);
      return false;
    }
  },
  
  /**
   * Selects a winner for an A/B test
   * @param testId The A/B test ID
   * @param variantId The winning variant ID
   * @returns Promise<boolean> indicating success
   */
  async selectABTestWinner(testId: string, variantId: string): Promise<boolean> {
    try {
      // Update the A/B test with the winning variant
      // @ts-ignore - Using the email_ab_tests table which isn't in the type definitions
      const { error } = await supabase
        .from('email_ab_tests')
        .update({
          winner_id: variantId,
          winner_selected_at: new Date().toISOString(),
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', testId);
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error selecting A/B test winner:', error);
      return false;
    }
  }
};
