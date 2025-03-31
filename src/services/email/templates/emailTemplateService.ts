import { supabase } from '@/lib/supabase';
import { EmailTemplate, EmailCategory } from '@/types/email';
import { GenericResponse } from '../utils/supabaseHelper';

/**
 * Service for managing email templates
 */
export const emailTemplateService = {
  /**
   * Get all email templates
   */
  async getEmailTemplates(): Promise<GenericResponse<EmailTemplate[]>> {
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Convert to EmailTemplate array with proper typing
      const templates: EmailTemplate[] = data.map(template => ({
        id: template.id,
        name: template.name,
        subject: template.subject,
        description: template.description || '',
        category: template.category as EmailCategory,
        content: template.content,
        variables: template.variables || [],
        created_at: template.created_at,
        updated_at: template.updated_at,
        body: template.content, // alias for content
        is_archived: template.is_archived || false
      }));

      return { data: templates, error: null };
    } catch (error) {
      console.error('Error fetching email templates:', error);
      return { data: null, error };
    }
  },

  /**
   * Get a template by ID
   */
  async getEmailTemplateById(templateId: string): Promise<GenericResponse<EmailTemplate>> {
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .eq('id', templateId)
        .single();

      if (error) throw error;

      // Convert to EmailTemplate with proper typing
      const template: EmailTemplate = {
        id: data.id,
        name: data.name,
        subject: data.subject,
        description: data.description || '',
        category: data.category as EmailCategory,
        content: data.content,
        variables: data.variables || [],
        created_at: data.created_at,
        updated_at: data.updated_at,
        body: data.content, // alias for content
        is_archived: data.is_archived || false
      };

      return { data: template, error: null };
    } catch (error) {
      console.error(`Error fetching email template ${templateId}:`, error);
      return { data: null, error };
    }
  },

  /**
   * Create a new template
   */
  async createEmailTemplate(template: Partial<EmailTemplate>): Promise<GenericResponse<EmailTemplate>> {
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .insert({
          name: template.name,
          subject: template.subject,
          description: template.description,
          category: template.category,
          content: template.content || template.body,
          variables: template.variables,
          is_archived: template.is_archived
        })
        .select()
        .single();

      if (error) throw error;

      // Convert to EmailTemplate with proper typing
      const newTemplate: EmailTemplate = {
        id: data.id,
        name: data.name,
        subject: data.subject,
        description: data.description || '',
        category: data.category as EmailCategory,
        content: data.content,
        variables: data.variables || [],
        created_at: data.created_at,
        updated_at: data.updated_at,
        body: data.content, // alias for content
        is_archived: data.is_archived || false
      };

      return { data: newTemplate, error: null };
    } catch (error) {
      console.error('Error creating email template:', error);
      return { data: null, error };
    }
  },

  /**
   * Update an existing template
   */
  async updateEmailTemplate(
    templateId: string, 
    template: Partial<EmailTemplate>
  ): Promise<GenericResponse<EmailTemplate>> {
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .update({
          name: template.name,
          subject: template.subject,
          description: template.description,
          category: template.category,
          content: template.content || template.body,
          variables: template.variables,
          is_archived: template.is_archived,
          updated_at: new Date().toISOString()
        })
        .eq('id', templateId)
        .select()
        .single();

      if (error) throw error;

      // Convert to EmailTemplate with proper typing
      const updatedTemplate: EmailTemplate = {
        id: data.id,
        name: data.name,
        subject: data.subject,
        description: template.description || '',
        category: data.category as EmailCategory,
        content: data.content,
        variables: data.variables || [],
        created_at: data.created_at,
        updated_at: data.updated_at,
        body: data.content, // alias for content
        is_archived: data.is_archived || false
      };

      return { data: updatedTemplate, error: null };
    } catch (error) {
      console.error(`Error updating email template ${templateId}:`, error);
      return { data: null, error };
    }
  },

  /**
   * Delete a template
   */
  async deleteEmailTemplate(templateId: string): Promise<GenericResponse<boolean>> {
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
   * Archive a template
   */
  async archiveEmailTemplate(
    templateId: string, 
    archive: boolean = true
  ): Promise<GenericResponse<EmailTemplate>> {
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .update({
          is_archived: archive,
          updated_at: new Date().toISOString()
        })
        .eq('id', templateId)
        .select()
        .single();

      if (error) throw error;

      // Convert to EmailTemplate with proper typing
      const updatedTemplate: EmailTemplate = {
        id: data.id,
        name: data.name,
        subject: data.subject,
        description: data.description || '',
        category: data.category as EmailCategory,
        content: data.content,
        variables: data.variables || [],
        created_at: data.created_at,
        updated_at: data.updated_at,
        body: data.content, // alias for content
        is_archived: data.is_archived || false
      };

      return { data: updatedTemplate, error: null };
    } catch (error) {
      console.error(`Error ${archive ? 'archiving' : 'unarchiving'} email template ${templateId}:`, error);
      return { data: null, error };
    }
  }
};
