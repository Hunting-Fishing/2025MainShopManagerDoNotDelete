
/**
 * This file is now a re-export of the modular email services.
 * See individual service files for implementation details.
 */

import { emailTemplateService } from './emailTemplateService';

// Export a combined emailService that maintains the API structure
export const emailService = {
  // Email template methods
  ...emailTemplateService,
  
  // Add additional email-related services here as needed
  
  /**
   * Sends a test email for a template
   * @param templateId The ID of the template to test
   * @param recipientEmail The email address to send the test to
   * @param personalizations Optional personalization variables
   * @returns Promise<boolean> indicating success or failure
   */
  async sendTestEmail(
    templateId: string, 
    recipientEmail: string, 
    personalizations?: Record<string, string>
  ): Promise<boolean> {
    try {
      // Get the template
      const template = await emailTemplateService.getTemplateById(templateId);
      if (!template) {
        throw new Error("Template not found");
      }

      // This would be where you call an API or edge function to send the email
      console.log("Sending test email", { 
        templateId, 
        recipientEmail, 
        personalizations 
      });
      
      return true;
    } catch (error) {
      console.error("Error sending test email:", error);
      return false;
    }
  }
};
