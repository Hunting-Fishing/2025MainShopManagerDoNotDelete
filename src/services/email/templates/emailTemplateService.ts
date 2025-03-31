
import { supabase } from '@/lib/supabase';
import { EmailTemplate } from '@/types/email';
import { GenericResponse } from '../utils/supabaseHelper';

/**
 * Service for managing email templates
 */
export const emailTemplateService = {
  /**
   * Get a list of all email templates
   */
  async getTemplates(): Promise<GenericResponse<EmailTemplate[]>> {
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching email templates:', error);
      return { data: null, error };
    }
  },

  /**
   * Get a specific email template by ID
   */
  async getTemplateById(templateId: string): Promise<GenericResponse<EmailTemplate>> {
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .eq('id', templateId)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error(`Error fetching email template ${templateId}:`, error);
      return { data: null, error };
    }
  },

  /**
   * Create a new email template
   */
  async createTemplate(template: Partial<EmailTemplate>): Promise<GenericResponse<EmailTemplate>> {
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .insert(template)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error creating email template:', error);
      return { data: null, error };
    }
  },

  /**
   * Update an existing email template
   */
  async updateTemplate(templateId: string, updates: Partial<EmailTemplate>): Promise<GenericResponse<EmailTemplate>> {
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .update(updates)
        .eq('id', templateId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error(`Error updating email template ${templateId}:`, error);
      return { data: null, error };
    }
  },

  /**
   * Delete an email template
   */
  async deleteTemplate(templateId: string): Promise<GenericResponse<boolean>> {
    try {
      const { error } = await supabase
        .from('email_templates')
        .delete()
        .eq('id', templateId);

      if (error) throw error;
      return { data: true, error: null };
    } catch (error) {
      console.error(`Error deleting email template ${templateId}:`, error);
      return { data: false, error };
    }
  },

  /**
   * Send a test email using a template
   */
  async sendTestEmail(templateId: string, recipientEmail: string): Promise<GenericResponse<any>> {
    try {
      const { data, error } = await supabase.functions.invoke('send-test-email', {
        body: { 
          templateId,
          recipientEmail
        }
      });
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error("Error sending test email:", error);
      return { data: null, error };
    }
  }
};
