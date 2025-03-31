
import { emailTemplateService } from './emailTemplateService';
import { emailSequenceService } from './emailSequenceService';
import { emailProcessingService } from './emailProcessingService';

// Export combined service
export const emailService = {
  // Email template service methods
  ...emailTemplateService,
  
  // Email sequence service methods
  ...emailSequenceService,
  
  // Email processing service methods
  ...emailProcessingService
};
