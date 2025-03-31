import { supabase } from '@/lib/supabase';
import { EmailTemplate, EmailCategory } from '@/types/email';
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
      
      // Convert from DB type to our application type
      const templates: EmailTemplate[] = data.map(template => ({
        id: template.id,
        name: template.name,
        subject: template.subject,
        description: template.description || '',
        category: template.category as EmailCategory,
        content: template.content,
        variables: template.variables ? 
          (typeof template.variables === 'string' ? 
            JSON.parse(template.variables) : template.variables) : [],
        created_at: template.created_at,
        updated_at: template.updated_at,
        is_archived: template.is_archived,
        createdAt: template.created_at
      }));
      
      return { data: templates, error: null };
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
      
      // Convert from DB type to our application type
      const template: EmailTemplate = {
        id: data.id,
        name: data.name,
        subject: data.subject,
        description: data.description || '',
        category: data.category as EmailCategory,
        content: data.content,
        variables: data.variables ? 
          (typeof data.variables === 'string' ? 
            JSON.parse(data.variables) : data.variables) : [],
        created_at: data.created_at,
        updated_at: data.updated_at,
        is_archived: data.is_archived,
        createdAt: data.created_at
      };
      
      return { data: template, error: null };
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
      // Prepare variables for storage
      const variables = template.variables ? 
        (typeof template.variables === 'object' ? 
          JSON.stringify(template.variables) : template.variables) : null;
      
      const { data, error } = await supabase
        .from('email_templates')
        .insert({
          name: template.name || 'Untitled Template',
          subject: template.subject || '',
          content: template.content || template.body,
          category: template.category || 'marketing',
          description: template.description,
          variables: variables,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      
      // Convert from DB type to our application type
      const newTemplate: EmailTemplate = {
        id: data.id,
        name: data.name,
        subject: data.subject,
        content: data.content,
        body: data.content,
        category: data.category as EmailCategory,
        description: data.description,
        variables: data.variables ? 
          (typeof data.variables === 'string' ? 
            JSON.parse(data.variables) : data.variables) : [],
        created_at: data.created_at,
        updated_at: data.updated_at,
        is_archived: data.is_archived,
        createdAt: data.created_at
      };
      
      return { data: newTemplate, error: null };
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
      // Prepare variables for storage
      const variables = updates.variables ? 
        (typeof updates.variables === 'object' ? 
          JSON.stringify(updates.variables) : updates.variables) : undefined;
      
      const { data, error } = await supabase
        .from('email_templates')
        .update({
          name: updates.name,
          subject: updates.subject,
          content: updates.content,
          category: updates.category,
          description: updates.description,
          variables: variables,
          is_archived: updates.is_archived
        })
        .eq('id', templateId)
        .select()
        .single();

      if (error) throw error;
      
      // Convert from DB type to our application type
      const updatedTemplate: EmailTemplate = {
        id: data.id,
        name: data.name,
        subject: data.subject,
        content: data.content,
        body: data.content,
        category: data.category as EmailCategory,
        description: data.description,
        variables: data.variables ? 
          (typeof data.variables === 'string' ? 
            JSON.parse(data.variables) : data.variables) : [],
        created_at: data.created_at,
        updated_at: data.updated_at,
        is_archived: data.is_archived,
        createdAt: data.created_at
      };
      
      return { data: updatedTemplate, error: null };
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
