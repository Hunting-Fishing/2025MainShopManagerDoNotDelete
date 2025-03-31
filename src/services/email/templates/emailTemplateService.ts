
import { supabase } from '@/lib/supabase';
import { EmailCategory, EmailTemplate, EmailTemplateVariable } from '@/types/email';
import { GenericResponse, parseJsonField } from '../utils/supabaseHelper';

/**
 * Service for managing email templates
 */
export const emailTemplateService = {
  /**
   * Get all email templates
   */
  async getTemplates(): Promise<GenericResponse<EmailTemplate[]>> {
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform the data to match the EmailTemplate type
      const templates: EmailTemplate[] = data.map(template => ({
        id: template.id,
        name: template.name,
        subject: template.subject,
        description: template.description || '',
        category: template.category as EmailCategory,
        content: template.content,
        variables: parseJsonField<EmailTemplateVariable[]>(template.variables, []),
        created_at: template.created_at,
        updated_at: template.updated_at,
        is_archived: template.is_archived || false,
        body: template.content // For backward compatibility
      }));

      return { data: templates, error: null };
    } catch (error) {
      console.error('Error getting email templates:', error);
      return { data: null, error };
    }
  },

  /**
   * Get a template by ID
   * @param id Template ID
   */
  async getTemplateById(id: string): Promise<GenericResponse<EmailTemplate>> {
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      const template: EmailTemplate = {
        id: data.id,
        name: data.name,
        subject: data.subject,
        description: data.description || '',
        category: data.category as EmailCategory,
        content: data.content,
        variables: parseJsonField<EmailTemplateVariable[]>(data.variables, []),
        created_at: data.created_at,
        updated_at: data.updated_at,
        is_archived: data.is_archived || false,
        body: data.content // For backward compatibility
      };

      return { data: template, error: null };
    } catch (error) {
      console.error(`Error getting email template with ID ${id}:`, error);
      return { data: null, error };
    }
  },

  /**
   * Create a new email template
   * @param template Template data
   */
  async createTemplate(template: Partial<EmailTemplate>): Promise<GenericResponse<EmailTemplate>> {
    try {
      // Convert variables to JSON if it exists
      const variables = template.variables ? 
        JSON.stringify(template.variables) : null;

      const { data, error } = await supabase
        .from('email_templates')
        .insert({
          name: template.name,
          subject: template.subject,
          description: template.description,
          category: template.category,
          content: template.content || template.body,
          variables,
          is_archived: template.is_archived || false
        })
        .select()
        .single();

      if (error) throw error;

      const newTemplate: EmailTemplate = {
        id: data.id,
        name: data.name,
        subject: data.subject,
        description: data.description || '',
        category: data.category as EmailCategory,
        content: data.content,
        variables: parseJsonField<EmailTemplateVariable[]>(data.variables, []),
        created_at: data.created_at,
        updated_at: data.updated_at,
        is_archived: data.is_archived || false,
        body: data.content // For backward compatibility
      };

      return { data: newTemplate, error: null };
    } catch (error) {
      console.error('Error creating email template:', error);
      return { data: null, error };
    }
  },

  /**
   * Update an existing email template
   * @param id Template ID
   * @param template Updated template data
   */
  async updateTemplate(id: string, template: Partial<EmailTemplate>): Promise<GenericResponse<EmailTemplate>> {
    try {
      // Convert variables to JSON if it exists
      const variables = template.variables ? 
        JSON.stringify(template.variables) : null;

      const { data, error } = await supabase
        .from('email_templates')
        .update({
          name: template.name,
          subject: template.subject,
          description: template.description,
          category: template.category,
          content: template.content || template.body,
          variables,
          is_archived: template.is_archived
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updatedTemplate: EmailTemplate = {
        id: data.id,
        name: data.name,
        subject: data.subject,
        description: data.description || '',
        category: data.category as EmailCategory,
        content: data.content,
        variables: parseJsonField<EmailTemplateVariable[]>(data.variables, []),
        created_at: data.created_at,
        updated_at: data.updated_at,
        is_archived: data.is_archived || false,
        body: data.content // For backward compatibility
      };

      return { data: updatedTemplate, error: null };
    } catch (error) {
      console.error(`Error updating email template ${id}:`, error);
      return { data: null, error };
    }
  },

  /**
   * Delete an email template
   * @param id Template ID
   */
  async deleteTemplate(id: string): Promise<GenericResponse<boolean>> {
    try {
      const { error } = await supabase
        .from('email_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return { data: true, error: null };
    } catch (error) {
      console.error(`Error deleting email template ${id}:`, error);
      return { data: false, error };
    }
  },

  /**
   * Archive an email template
   * @param id Template ID
   * @param archive Whether to archive (true) or unarchive (false)
   */
  async archiveTemplate(id: string, archive: boolean = true): Promise<GenericResponse<EmailTemplate>> {
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .update({
          is_archived: archive
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const template: EmailTemplate = {
        id: data.id,
        name: data.name,
        subject: data.subject,
        description: data.description || '',
        category: data.category as EmailCategory,
        content: data.content,
        variables: parseJsonField<EmailTemplateVariable[]>(data.variables, []),
        created_at: data.created_at,
        updated_at: data.updated_at,
        is_archived: data.is_archived || false,
        body: data.content // For backward compatibility
      };

      return { data: template, error: null };
    } catch (error) {
      console.error(`Error ${archive ? 'archiving' : 'unarchiving'} email template ${id}:`, error);
      return { data: null, error };
    }
  }
};
