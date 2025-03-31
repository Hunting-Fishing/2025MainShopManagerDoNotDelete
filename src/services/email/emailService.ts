
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
  getSequenceProcessingSchedule: emailProcessingService.getSequenceProcessingSchedule,
  updateSequenceProcessingSchedule: emailProcessingService.updateSequenceProcessingSchedule,
  triggerSequenceProcessing: emailProcessingService.triggerSequenceProcessing,
  selectABTestWinner: emailProcessingService.selectABTestWinner,
  
  // Email sequence methods
  getSequences: emailSequenceService.getSequences,
  getSequenceById: emailSequenceService.getSequenceById,
  createSequence: emailSequenceService.createSequence,
  updateSequence: emailSequenceService.updateSequence,
  deleteSequence: emailSequenceService.deleteSequence,
  getSequenceSteps: emailSequenceService.getSequenceSteps,
  upsertSequenceStep: emailSequenceService.upsertSequenceStep,
  deleteSequenceStep: emailSequenceService.deleteSequenceStep,
  getSequenceAnalytics: emailSequenceService.getSequenceAnalytics,
  
  // Email template methods
  getTemplates: emailTemplateService.getTemplates,
  getTemplateById: emailTemplateService.getTemplateById,
  createTemplate: emailTemplateService.createTemplate,
  updateTemplate: emailTemplateService.updateTemplate,
  deleteTemplate: emailTemplateService.deleteTemplate
};
