
import { supabase } from '@/lib/supabase';
import { EmailABTestResult } from '@/types/email';
import { GenericResponse } from '../utils/supabaseHelper';

/**
 * Service for managing A/B testing for email campaigns
 */
export const abTestingService = {
  /**
   * Select a winner for an A/B test based on performance metrics
   * @param campaignId ID of the campaign with the A/B test
   * @param forceWinnerId Optional ID to force a specific variant as winner
   */
  async selectABTestWinner(campaignId: string, forceWinnerId?: string): Promise<GenericResponse<{
    winnerId: string;
    winnerSelectionDate: string;
    confidenceLevel?: number;
  }>> {
    try {
      // Get the campaign to check if it has an A/B test
      const { data: campaign, error: campaignError } = await supabase
        .from('email_campaigns')
        .select('*')
        .eq('id', campaignId)
        .single();
      
      if (campaignError) throw campaignError;
      
      if (!campaign.ab_test || !campaign.ab_test.enabled) {
        throw new Error("Campaign does not have an enabled A/B test");
      }
      
      // If a winner ID is forced, use that
      let winnerId = forceWinnerId;
      let confidenceLevel: number | undefined = undefined;
      
      // If no winner is forced, determine the winner based on metrics
      if (!winnerId) {
        const abTest = campaign.ab_test;
        const variants = abTest.variants || [];
        
        if (variants.length === 0) {
          throw new Error("No variants found in A/B test");
        }
        
        // Determine metric to use for winner selection
        const metric = abTest.winner_criteria || abTest.winnerCriteria || 'open_rate';
        
        // Find variant with best performance for the selected metric
        let bestVariant = variants[0];
        let bestValue = 0;
        
        variants.forEach(variant => {
          // Skip variants with no recipients
          if (!variant.recipients || variant.recipients === 0) return;
          
          let currentValue;
          if (metric === 'open_rate') {
            currentValue = variant.opened / variant.recipients;
          } else if (metric === 'click_rate') {
            currentValue = variant.clicked / variant.recipients;
          } else {
            // Default to open rate
            currentValue = variant.opened / variant.recipients;
          }
          
          // Ensure we have valid numbers for comparison
          currentValue = isNaN(currentValue) ? 0 : currentValue;
          
          if (currentValue > bestValue) {
            bestValue = currentValue;
            bestVariant = variant;
          }
        });
        
        winnerId = bestVariant.id;
        
        // Calculate confidence level - simplified calculation
        // In a real-world scenario, you would use more sophisticated statistical methods
        const winnerMetric = bestValue;
        const otherVariants = variants.filter(v => v.id !== winnerId);
        const otherVariantsAverage = otherVariants.reduce((sum, v) => {
          const value = metric === 'open_rate' 
            ? (v.opened / v.recipients || 0)
            : (v.clicked / v.recipients || 0);
          return sum + (isNaN(value) ? 0 : value);
        }, 0) / (otherVariants.length || 1);
        
        if (winnerMetric > 0 && otherVariantsAverage > 0) {
          // Simple confidence calculation - higher difference means higher confidence
          const difference = winnerMetric - otherVariantsAverage;
          const confidenceRatio = difference / otherVariantsAverage;
          confidenceLevel = Math.min(Math.round(confidenceRatio * 100) + 70, 99);
        }
      }
      
      if (!winnerId) {
        throw new Error("Could not determine a winner for the A/B test");
      }
      
      // Get the current date
      const winnerSelectionDate = new Date().toISOString();
      
      // Update the A/B test in the campaign
      const updatedAbTest = {
        ...campaign.ab_test,
        winnerId: winnerId,
        winner_id: winnerId,
        winnerSelectionDate: winnerSelectionDate,
        winner_selection_date: winnerSelectionDate,
        confidenceLevel: confidenceLevel,
        confidence_level: confidenceLevel
      };
      
      // Update the campaign
      const { error: updateError } = await supabase
        .from('email_campaigns')
        .update({ ab_test: updatedAbTest })
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
      console.error("Error selecting A/B test winner:", error);
      return { data: null, error };
    }
  },
  
  /**
   * Get the results of an A/B test
   */
  async getABTestResults(campaignId: string): Promise<GenericResponse<EmailABTestResult>> {
    try {
      const { data: campaign, error: campaignError } = await supabase
        .from('email_campaigns')
        .select('*')
        .eq('id', campaignId)
        .single();
      
      if (campaignError) throw campaignError;
      
      if (!campaign.ab_test || !campaign.ab_test.enabled) {
        throw new Error("Campaign does not have an enabled A/B test");
      }
      
      const abTest = campaign.ab_test;
      
      // Find the winner if one has been selected
      let winner = null;
      if (abTest.winnerId || abTest.winner_id) {
        const winnerId = abTest.winnerId || abTest.winner_id;
        winner = abTest.variants.find(v => v.id === winnerId) || null;
      }
      
      const result: EmailABTestResult = {
        testId: campaign.id,
        test_id: campaign.id,
        campaignId: campaign.id,
        campaign_id: campaign.id,
        variants: abTest.variants || [],
        winner: winner,
        winnerSelectedAt: abTest.winnerSelectionDate || abTest.winner_selection_date || null,
        winner_selected_at: abTest.winnerSelectionDate || abTest.winner_selection_date || null,
        winnerCriteria: abTest.winnerCriteria || abTest.winner_criteria || 'open_rate',
        winner_criteria: abTest.winnerCriteria || abTest.winner_criteria || 'open_rate',
        isComplete: !!winner,
        is_complete: !!winner,
        winningVariantId: winner ? winner.id : undefined,
        winning_variant_id: winner ? winner.id : undefined,
        confidenceLevel: abTest.confidenceLevel || abTest.confidence_level,
        confidence_level: abTest.confidenceLevel || abTest.confidence_level
      };
      
      return { data: result, error: null };
    } catch (error) {
      console.error("Error getting A/B test results:", error);
      return { data: null, error };
    }
  }
};
