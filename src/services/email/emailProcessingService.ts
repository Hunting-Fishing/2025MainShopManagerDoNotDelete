
import { supabase } from '@/lib/supabase';
import { parseJsonField } from './utils';
import { EmailSequence } from '@/types/email';

export const emailProcessingService = {
  /**
   * Retrieves the current processing schedule for email sequences
   */
  getSequenceProcessingSchedule: async () => {
    try {
      // @ts-ignore - Custom table not in type definition
      const { data, error } = await supabase
        .from('system_schedules')
        .select('*')
        .eq('type', 'email_sequence_processing')
        .maybeSingle();
      
      if (error) throw error;
      
      if (!data) {
        return {
          enabled: false,
          cron: '*/30 * * * *', // Default to every 30 minutes
          lastRun: null,
          nextRun: null,
          sequenceIds: []
        };
      }
      
      return {
        enabled: data.enabled,
        cron: data.cron_expression,
        lastRun: data.last_run,
        nextRun: data.next_run,
        sequenceIds: parseJsonField(data.sequence_ids, [])
      };
    } catch (error) {
      console.error('Error fetching sequence processing schedule:', error);
      return {
        enabled: false,
        cron: '*/30 * * * *',
        lastRun: null,
        nextRun: null,
        sequenceIds: []
      };
    }
  },

  /**
   * Updates the email sequence processing schedule
   */
  updateSequenceProcessingSchedule: async (config: {
    cron?: string;
    enabled: boolean;
    sequenceIds?: string[];
  }) => {
    try {
      // @ts-ignore - Custom table not in type definition
      const { data: existingSchedule, error: fetchError } = await supabase
        .from('system_schedules')
        .select('*')
        .eq('type', 'email_sequence_processing')
        .maybeSingle();
      
      if (fetchError) throw fetchError;
      
      if (existingSchedule) {
        // @ts-ignore - Custom table not in type definition
        const { error } = await supabase
          .from('system_schedules')
          .update({
            enabled: config.enabled,
            cron_expression: config.cron ?? existingSchedule.cron_expression,
            sequence_ids: config.sequenceIds ? JSON.stringify(config.sequenceIds) : existingSchedule.sequence_ids,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingSchedule.id);
        
        if (error) throw error;
      } else {
        // @ts-ignore - Custom table not in type definition
        const { error } = await supabase
          .from('system_schedules')
          .insert({
            type: 'email_sequence_processing',
            enabled: config.enabled,
            cron_expression: config.cron ?? '*/30 * * * *',
            sequence_ids: config.sequenceIds ? JSON.stringify(config.sequenceIds) : '[]',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        
        if (error) throw error;
      }
      
      return true;
    } catch (error) {
      console.error('Error updating sequence processing schedule:', error);
      return false;
    }
  },

  /**
   * Selects the winner for an A/B test
   */
  selectABTestWinner: async (campaignId: string, forceWinnerId?: string) => {
    try {
      // Check if the A/B test data exists
      // @ts-ignore - Custom table not in type definition
      const { data: campaignData, error: campaignError } = await supabase
        .from('email_campaigns')
        .select('ab_test')
        .eq('id', campaignId)
        .single();
      
      if (campaignError) throw campaignError;
      if (!campaignData || !campaignData.ab_test) {
        return { error: 'No A/B test data found for this campaign' };
      }
      
      const abTest = parseJsonField(campaignData.ab_test, null);
      if (!abTest || !abTest.enabled || !Array.isArray(abTest.variants) || abTest.variants.length === 0) {
        return { error: 'Invalid A/B test configuration' };
      }
      
      // If a winner ID is forced, use that
      if (forceWinnerId) {
        const variant = abTest.variants.find(v => v.id === forceWinnerId);
        if (!variant) {
          return { error: 'Specified variant not found' };
        }
        
        // Update the campaign with the winner
        // @ts-ignore - Custom table not in type definition
        const { error: updateError } = await supabase
          .from('email_campaigns')
          .update({
            ab_test: {
              ...abTest,
              winnerId: forceWinnerId,
              winnerSelectionDate: new Date().toISOString()
            }
          })
          .eq('id', campaignId);
        
        if (updateError) throw updateError;
        
        return {
          winnerId: forceWinnerId,
          winnerSelectionDate: new Date().toISOString(),
          confidenceLevel: null
        };
      }
      
      // Determine winner based on criteria
      const criteria = abTest.winnerCriteria || 'open_rate';
      
      // Call the database function to calculate the winner
      const { data: winnerId, error: winnerError } = await supabase.rpc(
        'calculate_ab_test_winner',
        { campaign_id: campaignId, criteria }
      );
      
      if (winnerError) throw winnerError;
      
      return {
        winnerId,
        winnerSelectionDate: new Date().toISOString(),
        confidenceLevel: 95 // This is a placeholder - in reality, we would calculate confidence
      };
    } catch (error) {
      console.error('Error selecting A/B test winner:', error);
      return { error: 'Failed to select A/B test winner' };
    }
  },

  /**
   * Trigger email sequence processing
   */
  triggerSequenceProcessing: async (sequenceId?: string) => {
    try {
      let sequencesToProcess: EmailSequence[] = [];
      
      if (sequenceId) {
        // Process a specific sequence
        const { data, error } = await supabase
          .from('email_sequences')
          .select('*')
          .eq('id', sequenceId)
          .eq('is_active', true)
          .single();
        
        if (error) throw error;
        if (data) sequencesToProcess = [data];
      } else {
        // Process all active sequences
        const { data, error } = await supabase
          .from('email_sequences')
          .select('*')
          .eq('is_active', true);
        
        if (error) throw error;
        if (data) sequencesToProcess = data;
      }
      
      // Now process each sequence
      const results = await Promise.all(
        sequencesToProcess.map(async (sequence) => {
          // Call our sequence processing edge function
          const { data, error } = await supabase.functions.invoke('process-email-sequence', {
            body: { sequenceId: sequence.id }
          });
          
          if (error) {
            console.error(`Error processing sequence ${sequence.id}:`, error);
            return { sequenceId: sequence.id, success: false, error };
          }
          
          return { sequenceId: sequence.id, success: true, data };
        })
      );
      
      return results;
    } catch (error) {
      console.error('Error triggering sequence processing:', error);
      return [{ success: false, error }];
    }
  }
};
