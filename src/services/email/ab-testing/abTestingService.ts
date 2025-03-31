
import { supabase } from '@/lib/supabase';
import { EmailABTest, EmailABTestVariant } from '@/types/email';
import { GenericResponse, customTableQuery } from '../utils/supabaseHelper';

/**
 * Calculate confidence level for AB test results using basic statistical methods
 */
const calculateConfidenceLevel = (
  variantA: EmailABTestVariant,
  variantB: EmailABTestVariant,
  criteria: 'open_rate' | 'click_rate'
): number => {
  // Basic implementation - can be enhanced with more sophisticated statistical methods
  const metricA = criteria === 'open_rate' 
    ? (variantA.opened / variantA.recipients)
    : (variantA.clicked / variantA.recipients);
  
  const metricB = criteria === 'open_rate' 
    ? (variantB.opened / variantB.recipients)
    : (variantB.clicked / variantB.recipients);
  
  // Calculate a simple difference ratio
  const diff = Math.abs(metricA - metricB) / Math.max(metricA, metricB);
  
  // Convert to confidence percentage (simplified approach)
  return Math.min(Math.round(diff * 100 * 2), 99);
};

/**
 * Service for handling A/B testing related operations
 */
export const abTestingService = {
  /**
   * Select a winner for an A/B test based on performance data
   */
  async selectABTestWinner(campaignId: string, forceWinnerId?: string): Promise<GenericResponse<any>> {
    try {
      // Get the campaign with A/B test data
      const { data: campaign, error: campaignError } = await supabase
        .from('email_campaigns')
        .select('*')
        .eq('id', campaignId)
        .single();
      
      if (campaignError) throw campaignError;
      
      // Parse AB test data
      const abTest = campaign.ab_test as any;
      
      if (!abTest || !abTest.enabled) {
        return { 
          data: null, 
          error: 'No A/B test configured for this campaign' 
        };
      }
      
      let winnerId: string;
      let confidenceLevel: number | undefined;

      // If a winner ID is forced (manual selection), use that
      if (forceWinnerId) {
        winnerId = forceWinnerId;
      } else {
        // Get variants data
        const variants = abTest.variants || [];
        
        if (variants.length < 2) {
          return { 
            data: null, 
            error: 'A/B test requires at least 2 variants' 
          };
        }
        
        // Get the winner selection criteria
        const criteria = abTest.winner_criteria || abTest.winnerCriteria || 'open_rate';
        
        // Find the best performing variant
        let bestVariant: any = null;
        let bestMetric = -1;
        
        for (const variant of variants) {
          const numerator = criteria === 'open_rate' ? variant.opened : variant.clicked;
          const denominator = variant.recipients || 1; // Avoid division by zero
          const metric = numerator / denominator;
          
          if (metric > bestMetric) {
            bestMetric = metric;
            bestVariant = variant;
          }
        }
        
        if (!bestVariant) {
          return { 
            data: null, 
            error: 'Could not determine a winner' 
          };
        }
        
        // Calculate confidence level if we have multiple variants
        if (variants.length >= 2) {
          const runnerUp = variants.find(v => v.id !== bestVariant.id) || variants[1];
          confidenceLevel = calculateConfidenceLevel(bestVariant, runnerUp, criteria as any);
        }
        
        winnerId = bestVariant.id;
      }
      
      // Update the AB test with the winner
      const winnerSelectionDate = new Date().toISOString();
      
      // Convert to JSON to ensure proper storage
      const updatedAbTest = {
        ...abTest,
        winnerId: winnerId,
        winner_id: winnerId,
        winnerSelectionDate: winnerSelectionDate,
        winner_selection_date: winnerSelectionDate
      };
      
      // If we calculated a confidence level, include it
      if (confidenceLevel !== undefined) {
        updatedAbTest.confidenceLevel = confidenceLevel;
        updatedAbTest.confidence_level = confidenceLevel;
      }
      
      // Update the campaign with the winner
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
      return { 
        data: null, 
        error: error 
      };
    }
  },
  
  /**
   * Get A/B test results for a campaign
   */
  async getABTestResults(campaignId: string): Promise<GenericResponse<any>> {
    try {
      const { data: campaign, error: campaignError } = await supabase
        .from('email_campaigns')
        .select('*')
        .eq('id', campaignId)
        .single();
      
      if (campaignError) throw campaignError;
      
      const abTest = campaign.ab_test as any;
      
      if (!abTest || !abTest.enabled) {
        return { 
          data: null, 
          error: 'No A/B test configured for this campaign' 
        };
      }
      
      // Get winner ID
      const winnerId = abTest.winnerId || abTest.winner_id;
      const isComplete = !!winnerId;
      
      // Get variants with additional metrics
      const variants = (abTest.variants || []).map((variant: any) => {
        const isWinner = variant.id === winnerId;
        const openRate = variant.recipients > 0 ? variant.opened / variant.recipients : 0;
        const clickRate = variant.recipients > 0 ? variant.clicked / variant.recipients : 0;
        const clickToOpenRate = variant.opened > 0 ? variant.clicked / variant.opened : 0;
        
        return {
          ...variant,
          metrics: {
            openRate,
            clickRate,
            clickToOpenRate
          },
          isWinner
        };
      });
      
      return {
        data: {
          campaignId,
          variants,
          winnerSelectionDate: abTest.winnerSelectionDate || abTest.winner_selection_date,
          winnerCriteria: abTest.winnerCriteria || abTest.winner_criteria,
          winnerId,
          isComplete,
          confidenceLevel: abTest.confidenceLevel || abTest.confidence_level
        },
        error: null
      };
    } catch (error) {
      console.error(`Error getting A/B test results for campaign ${campaignId}:`, error);
      return { 
        data: null, 
        error: error 
      };
    }
  }
};
