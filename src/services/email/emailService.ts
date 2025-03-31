
import { supabase } from '@/lib/supabase';
import { EmailSequence, EmailTemplate } from '@/types/email';

export const emailService = {
  /**
   * Triggers the processing of email sequences
   * @param sequenceId Optional - specific sequence ID to process, or all sequences if omitted
   * @returns Promise<boolean> indicating success or failure
   */
  async triggerSequenceProcessing(sequenceId?: string): Promise<boolean> {
    try {
      const { error } = await supabase.functions.invoke('process-email-sequences', {
        body: { 
          sequenceId, 
          action: 'process' 
        }
      });
      
      if (error) {
        console.error('Error triggering sequence processing:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Exception in triggerSequenceProcessing:', error);
      return false;
    }
  },
  
  /**
   * Creates a cron job to automatically process email sequences
   * @param interval String representing the processing interval (e.g., 'hourly', 'daily')
   * @returns Promise<boolean> indicating success or failure
   */
  async createProcessingSchedule(interval: 'hourly' | 'daily' | 'every_6_hours'): Promise<boolean> {
    try {
      const { error } = await supabase.functions.invoke('process-email-sequences', {
        body: { 
          action: 'create_schedule',
          interval
        }
      });
      
      if (error) {
        console.error('Error creating processing schedule:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Exception in createProcessingSchedule:', error);
      return false;
    }
  },

  /**
   * Retrieves all email sequences
   * @returns Promise<EmailSequence[]> list of email sequences
   */
  async getSequences(): Promise<EmailSequence[]> {
    try {
      const { data, error } = await supabase
        .from('email_sequences')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching email sequences:', error);
      return [];
    }
  },

  /**
   * Retrieves a specific email sequence by ID
   * @param id The sequence ID to fetch
   * @returns Promise<EmailSequence | null> the sequence or null if not found
   */
  async getSequenceById(id: string): Promise<EmailSequence | null> {
    try {
      const { data, error } = await supabase
        .from('email_sequences')
        .select(`
          *,
          steps:email_sequence_steps(*)
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching email sequence:', error);
      return null;
    }
  },

  /**
   * Creates a new email sequence
   * @param sequence The sequence data to create
   * @returns Promise<EmailSequence | null> the created sequence or null if failed
   */
  async createSequence(sequence: Partial<EmailSequence>): Promise<EmailSequence | null> {
    try {
      const { data, error } = await supabase
        .from('email_sequences')
        .insert({
          name: sequence.name,
          description: sequence.description,
          trigger_type: sequence.triggerType || 'manual',
          trigger_event: sequence.triggerEvent,
          is_active: sequence.isActive !== undefined ? sequence.isActive : true
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating email sequence:', error);
      return null;
    }
  },

  /**
   * Updates an existing email sequence
   * @param id The sequence ID to update
   * @param sequence The updated sequence data
   * @returns Promise<EmailSequence | null> the updated sequence or null if failed
   */
  async updateSequence(id: string, sequence: Partial<EmailSequence>): Promise<EmailSequence | null> {
    try {
      const { data, error } = await supabase
        .from('email_sequences')
        .update({
          name: sequence.name,
          description: sequence.description,
          trigger_type: sequence.triggerType || sequence.trigger_type,
          trigger_event: sequence.triggerEvent || sequence.trigger_event,
          is_active: sequence.isActive !== undefined ? sequence.isActive : sequence.is_active
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating email sequence:', error);
      return null;
    }
  },

  /**
   * Deletes an email sequence
   * @param id The sequence ID to delete
   * @returns Promise<boolean> indicating success or failure
   */
  async deleteSequence(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('email_sequences')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting email sequence:', error);
      return false;
    }
  },

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
      return data || [];
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
      return data;
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
          content: template.content || template.body
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
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
          content: template.content || template.body
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
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
  },

  /**
   * Sends a test email using a specific template
   * @param templateId The template ID to use
   * @param recipientEmail The email address to send to
   * @param personalizations Optional personalization variables
   * @returns Promise<boolean> indicating success or failure
   */
  async sendTestEmail(templateId: string, recipientEmail: string, personalizations?: Record<string, string>): Promise<boolean> {
    try {
      const { error } = await supabase.functions.invoke('send-test-email', {
        body: { 
          templateId,
          recipientEmail,
          personalizations
        }
      });
      
      if (error) {
        console.error('Error sending test email:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Exception in sendTestEmail:', error);
      return false;
    }
  }
};
