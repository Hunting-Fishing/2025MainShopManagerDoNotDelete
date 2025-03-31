
import { 
  EmailCampaign, 
  EmailCampaignAnalytics, 
  EmailABTest, 
  EmailABTestResult, 
  EmailCampaignTimelinePoint 
} from '@/types/email';
import { parseJsonField } from '@/services/email/utils';
import { validateCampaignStatus, parseABTest, standardizeTimelineData } from '@/hooks/email/campaign/utils/emailCampaignUtils';

/**
 * Adapts database campaign data to a compatible EmailCampaign object
 */
export function adaptCampaignData(campaignData: any): EmailCampaign {
  if (!campaignData) {
    throw new Error('Campaign data is missing');
  }
  
  // Process arrays and objects from JSON strings
  const recipientIds = parseJsonField(campaignData.recipient_ids, []);
  const segmentIds = parseJsonField(campaignData.segment_ids, []);
  const personalizations = parseJsonField(campaignData.personalizations, {});
  const metadata = parseJsonField(campaignData.metadata, {});
  const abTest = parseABTest(campaignData.ab_test);

  return {
    id: campaignData.id,
    name: campaignData.name,
    subject: campaignData.subject,
    content: campaignData.content || '',
    body: campaignData.content, // For backward compatibility
    status: validateCampaignStatus(campaignData.status),
    template_id: campaignData.template_id,
    segment_ids: segmentIds,
    segment_id: undefined, // Not in the database schema
    recipientIds: recipientIds, // For compatibility
    recipient_ids: recipientIds,
    personalizations: personalizations,
    metadata: metadata,
    ab_test: abTest,
    scheduled_at: campaignData.scheduled_date,
    scheduled_for: campaignData.scheduled_date,
    sent_at: campaignData.sent_date,
    created_at: campaignData.created_at,
    updated_at: campaignData.updated_at,
    totalRecipients: campaignData.total_recipients,
    total_recipients: campaignData.total_recipients,
    opened: campaignData.opened,
    clicked: campaignData.clicked,
    scheduledDate: campaignData.scheduled_date,
    sentDate: campaignData.sent_date
  };
}

/**
 * Adapts analytics data to a compatible EmailCampaignAnalytics object
 */
export function adaptAnalyticsData(analyticsData: any): EmailCampaignAnalytics {
  if (!analyticsData) {
    throw new Error('Analytics data is missing');
  }
  
  // Parse timeline data
  const timelineData = standardizeTimelineData(analyticsData.timeline);
  
  return {
    id: analyticsData.id,
    name: analyticsData.name,
    campaign_id: analyticsData.campaign_id,
    // Map both old and new property names
    total_sent: analyticsData.sent || analyticsData.total_sent || 0,
    total_delivered: analyticsData.delivered || analyticsData.total_delivered || 0,
    total_opened: analyticsData.opened || analyticsData.total_opened || 0,
    total_clicked: analyticsData.clicked || analyticsData.total_clicked || 0,
    total_bounced: analyticsData.bounced || analyticsData.total_bounced || 0,
    total_unsubscribed: analyticsData.unsubscribed || analyticsData.total_unsubscribed || 0,
    total_complaints: analyticsData.complained || analyticsData.total_complaints || 0,
    
    // Legacy property names for backward compatibility
    sent: analyticsData.sent || analyticsData.total_sent || 0,
    delivered: analyticsData.delivered || analyticsData.total_delivered || 0,
    opened: analyticsData.opened || analyticsData.total_opened || 0,
    clicked: analyticsData.clicked || analyticsData.total_clicked || 0,
    bounced: analyticsData.bounced || analyticsData.total_bounced || 0,
    unsubscribed: analyticsData.unsubscribed || analyticsData.total_unsubscribed || 0,
    complained: analyticsData.complained || analyticsData.total_complaints || 0,
    
    // Rates
    open_rate: analyticsData.open_rate || 0,
    click_rate: analyticsData.click_rate || 0,
    click_to_open_rate: analyticsData.click_to_open_rate || 0,
    unsubscribe_rate: analyticsData.unsubscribe_rate || 0,
    bounce_rate: analyticsData.bounce_rate || 0,
    bounced_rate: analyticsData.bounce_rate || 0, // For compatibility
    
    // Timeline and metadata
    timeline: timelineData,
    created_at: analyticsData.created_at,
    updated_at: analyticsData.updated_at
  };
}

/**
 * Adapts AB test result data to a compatible EmailABTestResult object
 */
export function adaptABTestResult(resultData: any): EmailABTestResult | undefined {
  if (!resultData) return undefined;
  
  try {
    // Parse if it's a string
    const data = typeof resultData === 'string' ? JSON.parse(resultData) : resultData;
    
    return {
      testId: data.testId || data.id || '',
      campaignId: data.campaignId || data.campaign_id || '',
      winnerId: data.winnerId || data.winner_id || null,
      winnerName: data.winnerName || '',
      confidenceLevel: data.confidenceLevel || 0,
      metrics: data.metrics || {},
      
      // Additional properties for compatibility
      variants: data.variants || [],
      winner: data.winner || null,
      winnerSelectedAt: data.winnerSelectedAt || data.winner_selected_at || null,
      winnerCriteria: data.winnerCriteria || data.selection_criteria || 'open_rate',
      isComplete: data.isComplete || data.status === 'completed' || false,
      winningVariantId: data.winningVariantId || data.winner_id || null
    };
  } catch (error) {
    console.error('Error adapting AB test result:', error);
    return undefined;
  }
}
