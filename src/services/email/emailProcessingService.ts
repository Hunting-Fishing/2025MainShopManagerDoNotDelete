
import { supabase } from '@/lib/supabase';
import { EmailSequence } from '@/types/email';

export const emailProcessingService = {
  /**
   * Get the current sequence processing schedule
   */
  getSequenceProcessingSchedule: async () => {
    try {
      // @ts-ignore - system_schedules is a custom table that's not in the TypeScript definition
      const { data, error } = await supabase
        .from('system_schedules')
        .select('*')
        .eq('type', 'email_sequence_processing')
        .single();
      
      if (error) {
        console.error("Error fetching sequence processing schedule:", error);
        return {
          enabled: false,
          cron: "0 */6 * * *", // Default: every 6 hours
          lastRun: null,
          nextRun: null,
          sequenceIds: []
        };
      }
      
      // If we have data, return it
      if (data) {
        return {
          enabled: data.is_active || false,
          cron: data.cron_expression || "0 */6 * * *",
          lastRun: data.last_run || null,
          nextRun: data.next_run || null,
          sequenceIds: Array.isArray(data.sequence_ids) ? data.sequence_ids : []
        };
      }
      
      // If no schedule exists yet, return defaults
      return {
        enabled: false,
        cron: "0 */6 * * *",
        lastRun: null,
        nextRun: null,
        sequenceIds: []
      };
    } catch (error) {
      console.error("Error getting sequence processing schedule:", error);
      return {
        enabled: false,
        cron: "0 */6 * * *",
        lastRun: null,
        nextRun: null,
        sequenceIds: []
      };
    }
  },
  
  /**
   * Update the sequence processing schedule
   */
  updateSequenceProcessingSchedule: async (config: { cron?: string; enabled: boolean; sequenceIds?: string[] }) => {
    try {
      // @ts-ignore - system_schedules is a custom table that's not in the TypeScript definition
      const { data: existingSchedule, error: fetchError } = await supabase
        .from('system_schedules')
        .select('*')
        .eq('type', 'email_sequence_processing')
        .single();
      
      const scheduleData = {
        type: 'email_sequence_processing',
        is_active: config.enabled,
        cron_expression: config.cron || "0 */6 * * *",
        sequence_ids: config.sequenceIds || (existingSchedule ? existingSchedule.sequence_ids || [] : [])
      };
      
      if (existingSchedule) {
        // Update existing schedule
        // @ts-ignore - system_schedules is a custom table that's not in the TypeScript definition
        const { data, error } = await supabase
          .from('system_schedules')
          .update(scheduleData)
          .eq('id', existingSchedule.id)
          .select()
          .single();
        
        if (error) throw error;
        return { success: true, data };
      } else {
        // Create new schedule
        // @ts-ignore - system_schedules is a custom table that's not in the TypeScript definition
        const { data, error } = await supabase
          .from('system_schedules')
          .insert(scheduleData)
          .select()
          .single();
        
        if (error) throw error;
        return { success: true, data };
      }
    } catch (error) {
      console.error("Error updating sequence processing schedule:", error);
      return { success: false, error };
    }
  },
  
  /**
   * Trigger processing of a specific sequence or all active sequences
   */
  triggerSequenceProcessing: async (sequenceId?: string) => {
    try {
      let sequences: EmailSequence[] = [];
      
      if (sequenceId) {
        // Process single sequence
        const { data, error } = await supabase
          .from('email_sequences')
          .select('*')
          .eq('id', sequenceId)
          .eq('is_active', true);
        
        if (error) throw error;
        sequences = data || [];
      } else {
        // Process all active sequences
        const { data, error } = await supabase
          .from('email_sequences')
          .select('*')
          .eq('is_active', true);
        
        if (error) throw error;
        sequences = data || [];
      }
      
      // No sequences to process
      if (sequences.length === 0) {
        return { 
          success: true, 
          processed: 0,
          message: sequenceId ? "Specified sequence not found or not active" : "No active sequences found" 
        };
      }
      
      // Map database sequences to EmailSequence type
      const emailSequences = sequences.map(seq => ({
        ...seq,
        steps: [],  // Will be populated when needed
        triggerType: seq.trigger_type,
        triggerEvent: seq.trigger_event,
        isActive: seq.is_active
      })) as EmailSequence[];
      
      // Call the edge function to process these sequences
      const { data, error } = await supabase.functions.invoke('process-email-sequences', {
        body: { 
          sequenceIds: emailSequences.map(seq => seq.id),
          action: 'process' 
        }
      });
      
      if (error) throw error;
      
      return {
        success: true,
        processed: sequences.length,
        data
      };
    } catch (error) {
      console.error("Error triggering sequence processing:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : String(error)
      };
    }
  },
  
  /**
   * Select a winner for an A/B test
   */
  selectABTestWinner: async (campaignId: string, forceWinnerId?: string) => {
    try {
      // @ts-ignore - email_ab_tests is a custom table not in the type definition
      const { data: abTest, error: abTestError } = await supabase
        .from('email_ab_tests')
        .select('*')
        .eq('campaign_id', campaignId)
        .single();
      
      if (abTestError) {
        console.error("Error fetching A/B test:", abTestError);
        return { 
          success: false, 
          error: "A/B test not found for this campaign" 
        };
      }
      
      // Call the edge function to select the winner
      const { data, error } = await supabase.functions.invoke('process-ab-test', {
        body: { 
          campaignId,
          testId: abTest.id,
          action: 'select_winner',
          forceWinnerId
        }
      });
      
      if (error) throw error;
      
      return {
        success: true,
        winnerId: data.winnerId,
        winnerSelectionDate: data.winnerSelectionDate,
        confidenceLevel: data.confidenceLevel
      };
    } catch (error) {
      console.error("Error selecting A/B test winner:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
};
