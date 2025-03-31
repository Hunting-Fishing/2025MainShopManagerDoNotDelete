
// Export all email-related services 
export * from './ab-testing/abTestingService';
export * from './campaigns/emailCampaignService';
export * from './scheduling/schedulingService';
export * from './sequences/emailSequenceService';
export * from './templates/emailTemplateService';
export * from './utils/supabaseHelper';
export * from './sequences/sequenceProcessingService';
export * from './emailProcessingService';

// Export combined service for backward compatibility
import { schedulingService } from './scheduling/schedulingService';
import { abTestingService } from './ab-testing/abTestingService';
import { sequenceProcessingService } from './sequences/sequenceProcessingService';
import { emailSequenceService } from './sequences/emailSequenceService';

// Combined email service for components that use emailService
export const emailService = {
  // Scheduling methods
  getSequenceProcessingSchedule: schedulingService.getSequenceProcessingSchedule,
  updateSequenceProcessingSchedule: schedulingService.updateSequenceProcessingSchedule,
  
  // A/B testing methods
  selectABTestWinner: abTestingService.selectABTestWinner,
  
  // Sequence processing methods
  triggerSequenceProcessing: sequenceProcessingService.triggerSequenceProcessing,
  
  // All sequence methods
  ...emailSequenceService
};
