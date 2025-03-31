
import { supabase } from '@/lib/supabase';
import { GenericResponse } from '../utils/supabaseHelper';
import { EmailABTest, EmailABTestVariant } from '@/types/email';

/**
 * Service for handling A/B testing functionality
 */
export const abTestingService = {
  /**
   * Select a winner for an A/B test based on performance metrics
   * @param campaignId ID of the campaign with A/B test
   * @param forceWinnerId Optional ID to force as the winner
   * @returns Winner information
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
      // Get the campaign with AB test data
      const { data: campaign, error: campaignError } = await supabase
        .from('email_campaigns')
        .select('ab_test')
        .eq('id', campaignId)
        .single();
      
      if (campaignError) throw campaignError;
      
      if (!campaign?.ab_test) {
        throw new Error("No A/B test found for this campaign");
      }
      
      // Parse AB test data
      const abTestData = typeof campaign.ab_test === 'string' 
        ? JSON.parse(campaign.ab_test) 
        : campaign.ab_test;
      
      // Check if A/B testing is enabled
      if (!abTestData || !abTestData.enabled) {
        throw new Error("A/B testing is not enabled for this campaign");
      }
      
      // Get the variants from the AB test data
      const variants = abTestData.variants || [];
      if (!Array.isArray(variants) || variants.length === 0) {
        throw new Error("No variants found in A/B test");
      }

      // Get the winner criteria
      const criteria = abTestData.winner_criteria || abTestData.winnerCriteria || 'open_rate';

      // If a winning variant ID is specified, use that
      let winnerId = forceWinnerId;
      let confidenceLevel: number | undefined = undefined;
      
      if (!winnerId) {
        // Call the Supabase function to calculate the winner
        const { data: winnerData, error: winnerError } = await supabase.rpc(
          'calculate_ab_test_winner',
          { 
            campaign_id: campaignId,
            criteria
          }
        );
        
        if (winnerError) {
          console.error('Error calculating A/B test winner:', winnerError);
          
          // Fallback: Select the winner manually by comparing rates
          let bestValue = -1;
          
          for (const variant of variants) {
            const openRate = variant.recipients > 0 ? variant.opened / variant.recipients : 0;
            const clickRate = variant.recipients > 0 ? variant.clicked / variant.recipients : 0;
            
            const valueToCompare = criteria === 'open_rate' ? openRate : clickRate;
            
            if (valueToCompare > bestValue) {
              bestValue = valueToCompare;
              winnerId = variant.id;
            }
          }
          
          // Calculate a simple confidence level
          if (winnerId) {
            const winnerVariant = variants.find(v => v.id === winnerId);
            const otherVariants = variants.filter(v => v.id !== winnerId);
            
            if (winnerVariant && otherVariants.length > 0) {
              const winnerRate = criteria === 'open_rate'
                ? (winnerVariant.recipients > 0 ? winnerVariant.opened / winnerVariant.recipients : 0)
                : (winnerVariant.recipients > 0 ? winnerVariant.clicked / winnerVariant.recipients : 0);
                
              const otherRates = otherVariants.map(v => criteria === 'open_rate'
                ? (v.recipients > 0 ? v.opened / v.recipients : 0)
                : (v.recipients > 0 ? v.clicked / v.recipients : 0));
                
              const avgOtherRate = otherRates.reduce((sum, rate) => sum + rate, 0) / otherRates.length;
              
              if (winnerRate > 0 && avgOtherRate > 0) {
                const difference = winnerRate - avgOtherRate;
                confidenceLevel = Math.min(Math.round((difference / avgOtherRate) * 100), 95);
              }
            }
          }
        } else {
          winnerId = winnerData;
          confidenceLevel = 95; // Default confidence level when using the database function
        }
      }
      
      if (!winnerId) {
        throw new Error("Could not determine a winner");
      }
      
      // Update the campaign with the winner information
      const winnerSelectionDate = new Date().toISOString();
      
      // Create updated ab_test data
      const updatedAbTest = {
        ...abTestData,
        winnerId: winnerId,
        winner_id: winnerId,
        variants: abTestData.variants || [],
        winnerSelectionDate: winnerSelectionDate,
        winner_selection_date: winnerSelectionDate,
        winnerCriteria: criteria,
        winner_criteria: criteria,
        confidenceLevel,
        confidence_level: confidenceLevel
      };
      
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
      console.error('Error selecting A/B test winner:', error);
      return { 
        data: null, 
        error 
      };
    }
  }
};
