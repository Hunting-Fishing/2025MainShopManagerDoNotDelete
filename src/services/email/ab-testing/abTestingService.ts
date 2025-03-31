import { supabase } from '@/lib/supabase';
import { EmailABTest, EmailABTestVariant } from '@/types/email';
import { GenericResponse, parseJsonField } from '../utils/supabaseHelper';

/**
 * Service for A/B testing functionality
 */
export const abTestingService = {
  /**
   * Get A/B test data for a campaign
   * @param campaignId Campaign ID
   * @returns A/B test data
   */
  async getABTestData(campaignId: string): Promise<GenericResponse<EmailABTest>> {
    try {
      const { data, error } = await supabase
        .from('email_campaigns')
        .select('ab_test')
        .eq('id', campaignId)
        .single();

      if (error) throw error;

      // Parse the AB test data
      const abTestData = parseJsonField<EmailABTest | null>(data?.ab_test, null);
      
      return { data: abTestData, error: null };
    } catch (error) {
      console.error(`Error getting A/B test data for campaign ${campaignId}:`, error);
      return { data: null, error };
    }
  },

  /**
   * Select a winner for an A/B test
   * @param campaignId Campaign ID
   * @param forceWinnerId Optional ID to force as winner
   * @returns Winner selection result
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
      // First get the current AB test data
      const { data: abTest, error: fetchError } = await this.getABTestData(campaignId);
      
      if (fetchError) throw fetchError;
      if (!abTest || !abTest.enabled) {
        throw new Error("A/B testing is not enabled for this campaign");
      }

      let winnerId: string | null = null;
      let confidenceLevel: number | undefined = undefined;
      
      if (forceWinnerId) {
        // If a winner is forced, use that ID
        winnerId = forceWinnerId;
        
        // Validate that the forced winner ID actually exists in the variants
        const variantExists = abTest.variants.some(v => v.id === forceWinnerId);
        if (!variantExists) {
          throw new Error(`Forced winner ID ${forceWinnerId} does not exist in variants`);
        }
      } else {
        // Otherwise, calculate the winner based on metrics
        const { data: winnerData, error: calcError } = await supabase
          .rpc('calculate_ab_test_winner', {
            campaign_id_param: campaignId,
            criteria_param: abTest.winnerCriteria || abTest.winner_criteria || 'open_rate'
          });
          
        if (calcError) throw calcError;
        
        winnerId = winnerData?.winner_id;
        confidenceLevel = winnerData?.confidence_level;
        
        if (!winnerId) {
          throw new Error("Could not determine a winner");
        }
      }
      
      // Update the AB test data with the winner
      const winnerSelectionDate = new Date().toISOString();
      
      // Create updated AB test object
      const updatedAbTest: EmailABTest = {
        enabled: abTest.enabled,
        variants: abTest.variants,
        winnerCriteria: abTest.winnerCriteria || abTest.winner_criteria || 'open_rate',
        winner_criteria: abTest.winnerCriteria || abTest.winner_criteria || 'open_rate',
        winnerSelectionDate: winnerSelectionDate,
        winner_selection_date: winnerSelectionDate,
        winnerId: winnerId,
        winner_id: winnerId,
        confidenceLevel: confidenceLevel,
        confidence_level: confidenceLevel
      };
      
      // Update the campaign with the winner information
      const { error: updateError } = await supabase
        .from('email_campaigns')
        .update({
          ab_test: updatedAbTest
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
      console.error(`Error selecting A/B test winner for campaign ${campaignId}:`, error);
      return { data: null, error };
    }
  }
};
