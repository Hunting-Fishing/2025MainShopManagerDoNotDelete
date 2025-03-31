
import { supabase } from '@/lib/supabase';
import { EmailABTest } from '@/types/email';
import { GenericResponse, parseJsonField, prepareForSupabase } from '../utils/supabaseHelper';

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
      const { data: campaignData, error: campaignError } = await supabase
        .from('email_campaigns')
        .select('ab_test')
        .eq('id', campaignId)
        .single();
      
      if (campaignError) throw campaignError;
      
      // Parse the abTest data
      const abTest = parseJsonField<EmailABTest>(campaignData?.ab_test, { 
        enabled: false, 
        variants: [],
        winnerCriteria: 'open_rate',
        winnerSelectionDate: null,
        winnerId: null
      });
      
      if (!abTest || !abTest.enabled) {
        throw new Error("A/B testing is not enabled for this campaign");
      }
      
      let winnerId = forceWinnerId;
      let confidenceLevel = 0;
      
      // If no winner ID is forced, calculate the winner based on metrics
      if (!winnerId) {
        // Call the calculate_ab_test_winner function
        const { data: winnerData, error: calcError } = await supabase.rpc(
          'calculate_ab_test_winner',
          { 
            campaign_id: campaignId,
            criteria: abTest.winnerCriteria || 'open_rate' 
          }
        );
        
        if (calcError) throw calcError;
        
        if (typeof winnerData === 'string') {
          winnerId = winnerData;
        } else if (winnerData && typeof winnerData === 'object') {
          // Use optional chaining for accessing potentially undefined properties
          winnerId = winnerData.winner_id || null;
          confidenceLevel = winnerData.confidence_level || 0;
        }
        
        if (!winnerId) {
          throw new Error("Could not determine a winner");
        }
      }
      
      // Create a timestamp for the winner selection
      const winnerSelectionDate = new Date().toISOString();
      
      // Create a properly typed update for the AB test
      const updatedAbTest: EmailABTest = {
        ...abTest,
        winnerId: winnerId,
        winnerSelectionDate: winnerSelectionDate,
        confidenceLevel: confidenceLevel
      };
      
      // Convert to a format suitable for Supabase
      const supabaseAbTest = prepareForSupabase(updatedAbTest);
      
      // Update the campaign with the winner information
      const { error: updateError } = await supabase
        .from('email_campaigns')
        .update({
          ab_test: supabaseAbTest
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
