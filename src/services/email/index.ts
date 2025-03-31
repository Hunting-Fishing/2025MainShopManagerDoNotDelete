
import { emailSequenceService } from './sequences/emailSequenceService';
import { emailTemplateService } from './templates/emailTemplateService';
import { schedulingService } from './scheduling/schedulingService';
import { abTestingService } from './ab-testing/abTestingService';
import { sequenceProcessingService } from './sequences/sequenceProcessingService';
import { emailCampaignService } from './campaigns/emailCampaignService';

// Combine smaller services into the email processing service for backward compatibility
export const emailProcessingService = {
  // Schedule management
  getSequenceProcessingSchedule: schedulingService.getSequenceProcessingSchedule,
  updateSequenceProcessingSchedule: schedulingService.updateSequenceProcessingSchedule,
  
  // Sequence processing
  triggerSequenceProcessing: sequenceProcessingService.triggerSequenceProcessing,
  
  // A/B testing
  selectABTestWinner: abTestingService.selectABTestWinner
};

// Export a combined emailService that maintains the same API structure
export const emailService = {
  // Email sequence processing methods
  ...emailProcessingService,
  
  // Email sequence methods
  ...emailSequenceService,
  
  // Email template methods
  ...emailTemplateService,

  // Email campaign methods
  ...emailCampaignService
};

// Also export individual services for more granular usage
export {
  emailSequenceService,
  emailTemplateService,
  emailProcessingService,
  schedulingService,
  abTestingService,
  sequenceProcessingService,
  emailCampaignService
};
