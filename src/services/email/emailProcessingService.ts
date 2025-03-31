
import { supabase } from '@/lib/supabase';

export const emailProcessingService = {
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
  },

  /**
   * Sends a test email using a specific template
   * @param templateId The template ID to use
   * @param recipientEmail The email address to send to
   * @param personalizations Optional personalization variables
   * @returns Promise<boolean> indicating success or failure
   */
  async sendTestEmail(templateId: string, recipientEmail: string, personalizations?: Record<string, string>): Promise<boolean> {
    try {
      const { error } = await supabase.functions.invoke('send-test-email', {
        body: { 
          templateId,
          recipientEmail,
          personalizations
        }
      });
      
      if (error) {
        console.error('Error sending test email:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Exception in sendTestEmail:', error);
      return false;
    }
  },
  
  /**
   * Selects a winner for an A/B test campaign
   * @param campaignId The campaign ID to select a winner for
   * @param forceWinnerId Optional - force a specific variant as the winner
   * @param confidenceThreshold Optional - minimum confidence level required to select a winner (default: 95)
   * @returns Promise with the winner information or null on failure
   */
  async selectABTestWinner(campaignId: string, forceWinnerId?: string, confidenceThreshold?: number): Promise<any> {
    try {
      const { data, error } = await supabase.functions.invoke('select-abtest-winner', {
        body: { 
          campaignId,
          forceWinnerId,
          confidenceThreshold
        }
      });
      
      if (error) {
        console.error('Error selecting A/B test winner:', error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Exception in selectABTestWinner:', error);
      return null;
    }
  }
};
