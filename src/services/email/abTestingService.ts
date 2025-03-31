
import { supabase } from '@/lib/supabase';
import { GenericResponse } from './utils/supabaseHelper';

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
  async selectABTestWinner(
    campaignId: string, 
    forceWinnerId?: string
  ): Promise<GenericResponse<{
    winnerId: string;
    winnerSelectionDate: string;
    confidenceLevel?: number;
  }>> {
    try {
      // Get the A/B test data
      const { data: abTestData, error: abTestError } = await supabase
        .from('email_campaigns')
        .select('ab_test')
        .eq('id', campaignId)
        .single();
      
      if (abTestError) throw abTestError;
      
      // Parse the abTest data
      const abTest = abTestData?.ab_test;
      if (!abTest || typeof abTest !== 'object') {
        throw new Error("A/B testing is not enabled for this campaign");
      }
      
      let winnerId = forceWinnerId;
      let confidenceLevel = 0;
      
      // If no winner ID is forced, calculate the winner based on metrics
      if (!winnerId) {
        // Call the calculate_ab_test_winner function
        const { data: winnerData, error: calcError } = await supabase
          .rpc('calculate_ab_test_winner', {
            campaign_id: campaignId,
            criteria: typeof abTest === 'object' && 'winnerCriteria' in abTest ? 
              abTest.winnerCriteria : 
              (typeof abTest === 'object' && 'winner_criteria' in abTest ? 
                abTest.winner_criteria : 'open_rate')
          });
        
        if (calcError) throw calcError;
        
        // Extract the winner information from the response
        if (winnerData && typeof winnerData === 'object') {
          // Access the winner data properties safely
          winnerId = typeof winnerData === 'string' ? winnerData : 
                    'winner_id' in winnerData ? String(winnerData.winner_id) : null;
          
          confidenceLevel = typeof winnerData === 'string' ? 0 : 
                          'confidence_level' in winnerData ? Number(winnerData.confidence_level) : 0;
        }
        
        if (!winnerId) {
          throw new Error("Could not determine a winner");
        }
      }
      
      // Create a timestamp for the winner selection
      const winnerSelectionDate = new Date().toISOString();
      
      // Create a properly typed object for the update
      const updatedAbTestData = typeof abTest === 'object' ? 
        {
          ...abTest,
          winnerId: winnerId,
          winner_id: winnerId,
          winnerSelectionDate: winnerSelectionDate,
          winner_selection_date: winnerSelectionDate,
          confidenceLevel: confidenceLevel,
          confidence_level: confidenceLevel
        } : {
          enabled: true,
          variants: [],
          winnerCriteria: 'open_rate',
          winner_criteria: 'open_rate',
          winnerId: winnerId,
          winner_id: winnerId,
          winnerSelectionDate: winnerSelectionDate,
          winner_selection_date: winnerSelectionDate,
          confidenceLevel: confidenceLevel,
          confidence_level: confidenceLevel
        };
      
      // Update the campaign with the winner information
      const { error: updateError } = await supabase
        .from('email_campaigns')
        .update({
          ab_test: updatedAbTestData
        })
        .eq('id', campaignId);
      
      if (updateError) throw updateError;
      
      return {
        data: {
          winnerId,
          winnerSelectionDate,
          confidenceLevel
        },
        error: null
      };
    } catch (error) {
      console.error('Error selecting A/B test winner:', error);
      return { data: null, error };
    }
  }
};
