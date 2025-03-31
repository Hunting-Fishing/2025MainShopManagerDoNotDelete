
import { supabase } from '@/lib/supabase';
import { EmailSequence } from '@/types/email';

// We need to use any type for tables that aren't in the generated types
// Using generic PostgrestResponse to avoid TypeScript circular reference issues
type GenericResponse<T = any> = { data: T | null, error: any };

export const emailProcessingService = {
  /**
   * Get the current sequence processing schedule
   * @returns Processing schedule configuration
   */
  async getSequenceProcessingSchedule() {
    try {
      // Force any type to bypass type checking entirely
      const response = await (supabase as any)
        .from('system_schedules')
        .select('*')
        .eq('type', 'email_sequence_processing')
        .maybeSingle();
        
      // Cast the response to break the circular type reference
      const { data, error } = response as GenericResponse;
      
      if (error) throw error;
      
      return {
        enabled: data?.is_active || false,
        cron: data?.cron_expression || '0 * * * *', // Default to hourly
        lastRun: data?.last_run || null,
        nextRun: data?.next_run || null,
        sequenceIds: data?.sequence_ids ? 
          (Array.isArray(data.sequence_ids) ? data.sequence_ids : JSON.parse(data.sequence_ids as string)) 
          : []
      };
    } catch (error) {
      console.error('Error getting sequence processing schedule:', error);
      return {
        enabled: false,
        cron: '0 * * * *',
        lastRun: null,
        nextRun: null,
        sequenceIds: []
      };
    }
  },

  /**
   * Update the sequence processing schedule
   * @param config Schedule configuration
   * @returns Success status
   */
  async updateSequenceProcessingSchedule(config: { 
    cron?: string; 
    enabled: boolean;
    sequenceIds?: string[];
  }) {
    try {
      // Check for existing schedule using direct casting
      const existingResponse = await (supabase as any)
        .from('system_schedules')
        .select('*')
        .eq('type', 'email_sequence_processing')
        .maybeSingle();
      
      // Cast to avoid circular type reference
      const { data: existing, error: fetchError } = existingResponse as GenericResponse;
      
      if (fetchError) throw fetchError;
      
      if (existing) {
        // Update existing schedule with direct casting
        const updateResponse = await (supabase as any)
          .from('system_schedules')
          .update({
            is_active: config.enabled,
            cron_expression: config.cron || existing.cron_expression,
            sequence_ids: config.sequenceIds || existing.sequence_ids,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id)
          .select();
        
        const { data, error } = updateResponse as GenericResponse;
        
        if (error) throw error;
        return { success: true, data };
      } else {
        // Create new schedule with direct casting
        const insertResponse = await (supabase as any)
          .from('system_schedules')
          .insert({
            type: 'email_sequence_processing',
            is_active: config.enabled,
            cron_expression: config.cron || '0 * * * *',
            sequence_ids: config.sequenceIds || []
          })
          .select();
        
        const { data, error } = insertResponse as GenericResponse;
        
        if (error) throw error;
        return { success: true, data };
      }
    } catch (error) {
      console.error('Error updating sequence processing schedule:', error);
      return { success: false, error };
    }
  },

  /**
   * Trigger the processing of email sequences
   * @param options Processing options
   * @returns Success status
   */
  async triggerSequenceProcessing(options?: { 
    sequenceId?: string; 
    force?: boolean;
  }) {
    try {
      // Get active sequences that need processing
      const { data: sequences, error: sequencesError } = await supabase
        .from('email_sequences')
        .select('*')
        .eq('is_active', true);
      
      if (sequencesError) throw sequencesError;
      
      // If a specific sequence ID is provided, filter to just that one
      const sequencesToProcess = options?.sequenceId 
        ? sequences.filter(seq => seq.id === options.sequenceId) 
        : sequences;
      
      // Map to proper EmailSequence type, with a default empty steps array
      const typedSequences: EmailSequence[] = sequencesToProcess.map(seq => ({
        ...seq,
        steps: [], // Default empty steps array; we'll fetch steps separately if needed
        trigger_type: seq.trigger_type as 'manual' | 'event' | 'schedule',
        triggerType: seq.trigger_type as 'manual' | 'event' | 'schedule',
        triggerEvent: seq.trigger_event,
        isActive: seq.is_active,
        createdAt: seq.created_at,
        updatedAt: seq.updated_at
      }));
      
      // Invoke the edge function to process the sequences
      const { data, error } = await supabase.functions.invoke('process-email-sequences', {
        body: { 
          sequenceIds: typedSequences.map(seq => seq.id),
          force: options?.force || false 
        }
      });
      
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error triggering sequence processing:', error);
      return { success: false, error };
    }
  },

  /**
   * Select a winner for an A/B test in a campaign
   * @param campaignId Campaign ID
   * @param forceWinnerId Optional ID to force a specific variant to win
   * @returns The winner ID and related data
   */
  async selectABTestWinner(campaignId: string, forceWinnerId?: string) {
    try {
      // Use direct casting for the custom table
      const abTestResponse = await (supabase as any)
        .from('email_ab_tests')
        .select('*')
        .eq('campaign_id', campaignId)
        .single();
      
      // Cast to avoid circular type reference
      const { data: abTest, error: abTestError } = abTestResponse as GenericResponse;
      
      if (abTestError) throw abTestError;
      
      let winnerId = forceWinnerId;
      let confidenceLevel = 0;
      
      // If no winner ID is forced, calculate the winner based on metrics
      if (!winnerId && abTest) {
        // Implement winner selection logic based on metrics
        // This is a simplified example; you'd typically use statistical methods
        
        // For now, just choose the variant with the highest metric value
        const variants = Array.isArray(abTest.variants) ? abTest.variants : [];
        const criterion = abTest.winner_criteria || 'open_rate';
        
        if (variants.length > 0) {
          let highestMetric = -1;
          let winner = null;
          
          for (const variant of variants) {
            const metricValue = variant.metrics ? 
              (criterion === 'open_rate' ? variant.metrics.openRate : variant.metrics.clickRate) : 0;
            
            if (metricValue > highestMetric) {
              highestMetric = metricValue;
              winner = variant;
              // Simulate a confidence level based on the margin of difference
              // In real applications, this would use a statistical significance test
              confidenceLevel = Math.min(99, Math.round((metricValue || 0) * 100));
            }
          }
          
          if (winner) {
            winnerId = winner.id;
          }
        }
      }
      
      // If we have a winner, update the campaign
      if (winnerId) {
        const { data: updatedCampaign, error: updateError } = await supabase
          .from('email_campaigns')
          .update({
            ab_test: {
              ...abTest,
              winnerId: winnerId,
              winner_id: winnerId,
              winnerSelectionDate: new Date().toISOString(),
              winner_selection_date: new Date().toISOString(),
              confidenceLevel: confidenceLevel,
              confidence_level: confidenceLevel
            }
          })
          .eq('id', campaignId)
          .select()
          .single();
        
        if (updateError) throw updateError;
        
        return {
          success: true,
          winnerId,
          winnerSelectionDate: new Date().toISOString(),
          confidenceLevel
        };
      }
      
      throw new Error('Could not determine a winner');
    } catch (error) {
      console.error('Error selecting A/B test winner:', error);
      return { success: false, error };
    }
  }
};
