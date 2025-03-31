
import { EmailCampaignStatus, EmailABTest, EmailABTestVariant } from '@/types/email';
import { parseJsonField } from '@/services/email/utils';

/**
 * Helper function to validate campaign status
 * @param status Status to validate
 * @returns A validated EmailCampaignStatus
 */
export const validateCampaignStatus = (status: any): EmailCampaignStatus => {
  const validStatuses: EmailCampaignStatus[] = [
    'draft',
    'scheduled',
    'sending',
    'sent',
    'cancelled',
    'failed',
    'paused',
    'completed'
  ];
  
  return validStatuses.includes(status as EmailCampaignStatus) 
    ? status as EmailCampaignStatus 
    : 'draft';
};

/**
 * Parse AB test data from campaign
 * @param abTestData JSON or object with AB test data
 * @returns EmailABTest object or undefined
 */
export const parseABTest = (abTestData: any): EmailABTest | undefined => {
  if (!abTestData) return undefined;
  
  try {
    // If it's a string, try to parse it
    const parsedData = typeof abTestData === 'string' 
      ? JSON.parse(abTestData)
      : abTestData;
    
    if (!parsedData || typeof parsedData !== 'object') return undefined;
    
    // Ensure we have the necessary properties
    const abTest: EmailABTest = {
      id: parsedData.id,
      name: parsedData.name,
      campaign_id: parsedData.campaign_id,
      test_type: parsedData.test_type,
      variants: Array.isArray(parsedData.variants) ? parsedData.variants : [],
      winner_id: parsedData.winner_id,
      winner_selected_at: parsedData.winner_selected_at,
      selection_criteria: parsedData.selection_criteria,
      test_size_percent: parsedData.test_size_percent,
      testing_duration_hours: parsedData.testing_duration_hours,
      status: parsedData.status,
      created_at: parsedData.created_at,
      updated_at: parsedData.updated_at,
      
      // Additional properties for compatibility
      enabled: parsedData.enabled !== undefined ? parsedData.enabled : true,
      winnerCriteria: parsedData.winnerCriteria || parsedData.selection_criteria || 'open_rate',
      winnerSelectionDate: parsedData.winnerSelectionDate || parsedData.winner_selected_at,
      winnerId: parsedData.winnerId || parsedData.winner_id
    };
    
    return abTest;
  } catch (error) {
    console.error('Error parsing AB test data:', error);
    return undefined;
  }
};

/**
 * Creates a standardized structure for timeline data from various sources
 * @param timelineData Raw timeline data
 * @returns Standardized timeline array
 */
export const standardizeTimelineData = (timelineData: any): any[] => {
  if (!timelineData) return [];
  
  // If it's already an array, check its contents
  if (Array.isArray(timelineData)) {
    return timelineData.map(point => ({
      date: point.date || point.event_time || '',
      opens: point.opens || 0,
      clicks: point.clicks || 0,
      unsubscribes: point.unsubscribes || 0,
      complaints: point.complaints || 0
    }));
  }
  
  // Try to parse it as JSON
  try {
    const parsed = parseJsonField(timelineData, []);
    if (Array.isArray(parsed)) {
      return parsed.map(point => ({
        date: point.date || point.event_time || '',
        opens: point.opens || 0,
        clicks: point.clicks || 0,
        unsubscribes: point.unsubscribes || 0,
        complaints: point.complaints || 0
      }));
    }
  } catch (e) {
    console.error('Error parsing timeline data:', e);
  }
  
  return [];
};
