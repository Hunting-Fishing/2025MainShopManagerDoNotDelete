
import { emailSequenceService } from './emailSequenceService';
import { emailTemplateService } from './emailTemplateService';
import { emailProcessingService } from './emailProcessingService';
import { schedulingService } from './schedulingService';
import { abTestingService } from './abTestingService';
import { sequenceProcessingService } from './sequenceProcessingService';

// Export a combined emailService that maintains the same API structure
export const emailService = {
  // Email sequence processing methods
  ...emailProcessingService,
  
  // Email sequence methods
  ...emailSequenceService,
  
  // Email template methods
  ...emailTemplateService
};

// Also export individual services for more granular usage
export {
  emailSequenceService,
  emailTemplateService,
  emailProcessingService,
  schedulingService,
  abTestingService,
  sequenceProcessingService
};
