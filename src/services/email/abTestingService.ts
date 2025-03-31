
import { supabase } from '@/lib/supabase';
import { customTableQuery, GenericResponse } from './utils/supabaseHelper';

/**
 * Service for managing email A/B testing functionality
 */
export const abTestingService = {
  /**
   * Select a winner for an A/B test in a campaign
   * @param campaignId Campaign ID
   * @param forceWinnerId Optional ID to force a specific variant to win
   * @returns The winner ID and related data
   */
  async selectABTestWinner(campaignId: string, forceWinnerId?: string) {
    try {
      // Get the A/B test data
      const abTestResponse = await customTableQuery('email_ab_tests')
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
