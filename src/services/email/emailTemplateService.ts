
import { supabase } from '@/lib/supabase';
import { EmailTemplate, EmailCategory, EmailTemplateVariable } from '@/types/email';

export const emailTemplateService = {
  /**
   * Retrieves all email templates, optionally filtered by category
   * @param category Optional category to filter templates
   * @returns Promise<EmailTemplate[]> list of email templates
   */
  async getTemplates(category?: string): Promise<EmailTemplate[]> {
    try {
      let query = supabase
        .from('email_templates')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (category) {
        query = query.eq('category', category);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Map the database records to the EmailTemplate type
      return (data || []).map(template => {
        // Parse variables from JSON
        const variables = template.variables ? 
          (Array.isArray(template.variables) ? template.variables : []) : [];
        
        return {
          id: template.id,
          name: template.name,
          subject: template.subject,
          description: template.description || '',
          category: template.category as EmailCategory,
          content: template.content,
          variables: variables,
          created_at: template.created_at,
          updated_at: template.updated_at,
          is_archived: template.is_archived || false
        };
      });
    } catch (error) {
      console.error('Error fetching email templates:', error);
      return [];
    }
  },

  /**
   * Retrieves a specific email template by ID
   * @param id The template ID to fetch
   * @returns Promise<EmailTemplate | null> the template or null if not found
   */
  async getTemplateById(id: string): Promise<EmailTemplate | null> {
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      if (!data) return null;
      
      // Parse variables from JSON
      const variables = data.variables ? 
        (Array.isArray(data.variables) ? data.variables : []) : [];
      
      // Map the database record to the EmailTemplate type
      return {
        id: data.id,
        name: data.name,
        subject: data.subject,
        description: data.description || '',
        category: data.category as EmailCategory,
        content: data.content,
        variables: variables,
        created_at: data.created_at,
        updated_at: data.updated_at,
        is_archived: data.is_archived || false
      };
    } catch (error) {
      console.error('Error fetching email template:', error);
      return null;
    }
  },

  /**
   * Creates a new email template
   * @param template The template data to create
   * @returns Promise<EmailTemplate | null> the created template or null if failed
   */
  async createTemplate(template: Partial<EmailTemplate>): Promise<EmailTemplate | null> {
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .insert({
          name: template.name,
          subject: template.subject,
          description: template.description,
          category: template.category,
          content: template.content,
          variables: template.variables
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Parse variables from JSON
      const variables = data.variables ? 
        (Array.isArray(data.variables) ? data.variables : []) : [];
      
      // Map the database record to the EmailTemplate type
      return {
        id: data.id,
        name: data.name,
        subject: data.subject,
        description: data.description || '',
        category: data.category as EmailCategory,
        content: data.content,
        variables: variables,
        created_at: data.created_at,
        updated_at: data.updated_at,
        is_archived: data.is_archived || false
      };
    } catch (error) {
      console.error('Error creating email template:', error);
      return null;
    }
  },

  /**
   * Updates an existing email template
   * @param id The template ID to update
   * @param template The updated template data
   * @returns Promise<EmailTemplate | null> the updated template or null if failed
   */
  async updateTemplate(id: string, template: Partial<EmailTemplate>): Promise<EmailTemplate | null> {
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .update({
          name: template.name,
          subject: template.subject,
          description: template.description,
          category: template.category,
          content: template.content,
          variables: template.variables
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      // Parse variables from JSON
      const variables = data.variables ? 
        (Array.isArray(data.variables) ? data.variables : []) : [];
      
      // Map the database record to the EmailTemplate type
      return {
        id: data.id,
        name: data.name,
        subject: data.subject,
        description: data.description || '',
        category: data.category as EmailCategory,
        content: data.content,
        variables: variables,
        created_at: data.created_at,
        updated_at: data.updated_at,
        is_archived: data.is_archived || false
      };
    } catch (error) {
      console.error('Error updating email template:', error);
      return null;
    }
  },

  /**
   * Deletes an email template
   * @param id The template ID to delete
   * @returns Promise<boolean> indicating success or failure
   */
  async deleteTemplate(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('email_templates')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting email template:', error);
      return false;
    }
  }
};
