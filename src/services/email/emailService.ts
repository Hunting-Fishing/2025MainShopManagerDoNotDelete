
/**
 * This file is now a re-export of the modular email services.
 * See individual service files for implementation details.
 */

import { emailSequenceService } from './emailSequenceService';
import { emailTemplateService } from './emailTemplateService';
import { emailProcessingService } from './emailProcessingService';

// Export a combined emailService that maintains the same API structure
export const emailService = {
  // Email sequence processing methods
  ...emailProcessingService,
  
  // Email sequence methods
  ...emailSequenceService,
  
  // Email template methods
  ...emailTemplateService
};
