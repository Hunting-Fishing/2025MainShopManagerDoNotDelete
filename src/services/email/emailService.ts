
import { supabase } from '@/lib/supabase';
import { EmailSequence, EmailTemplate, EmailCategory, EmailTemplateVariable } from '@/types/email';

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
      
      // Transform the database records to match the EmailSequence type
      return (data || []).map(sequence => ({
        id: sequence.id,
        name: sequence.name,
        description: sequence.description || '',
        steps: [], // Initialize with empty steps array, they'll be fetched separately if needed
        created_at: sequence.created_at,
        updated_at: sequence.updated_at,
        shop_id: sequence.shop_id,
        created_by: sequence.created_by,
        trigger_type: sequence.trigger_type as 'manual' | 'event' | 'schedule',
        trigger_event: sequence.trigger_event,
        is_active: sequence.is_active,
        
        // UI component support
        triggerType: sequence.trigger_type as 'manual' | 'event' | 'schedule',
        triggerEvent: sequence.trigger_event,
        isActive: sequence.is_active,
        createdAt: sequence.created_at,
        updatedAt: sequence.updated_at
      }));
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
      
      if (!data) return null;
      
      // Transform the sequence steps to match the EmailSequenceStep type
      const steps = (data.steps || []).map(step => ({
        id: step.id,
        sequence_id: step.sequence_id,
        type: step.delay_hours > 0 ? 'delay' : 'email' as 'delay' | 'email',
        order: step.position,
        delay_duration: step.delay_hours ? `${step.delay_hours}h` : undefined,
        email_template_id: step.template_id,
        created_at: step.created_at,
        updated_at: step.updated_at,
        
        // UI component support
        name: step.name,
        templateId: step.template_id,
        delayHours: step.delay_hours,
        delayType: step.delay_type as 'fixed' | 'business_days',
        position: step.position,
        isActive: step.is_active,
        condition: step.condition_type ? {
          type: step.condition_type as 'event' | 'property',
          value: step.condition_value,
          operator: step.condition_operator as '=' | '!=' | '>' | '<' | '>=' | '<='
        } : undefined
      }));
      
      return {
        id: data.id,
        name: data.name,
        description: data.description || '',
        steps: steps,
        created_at: data.created_at,
        updated_at: data.updated_at,
        shop_id: data.shop_id,
        created_by: data.created_by,
        trigger_type: data.trigger_type as 'manual' | 'event' | 'schedule',
        trigger_event: data.trigger_event,
        is_active: data.is_active,
        
        // UI component support
        triggerType: data.trigger_type as 'manual' | 'event' | 'schedule',
        triggerEvent: data.trigger_event,
        isActive: data.is_active,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
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
      
      // Return the created sequence with empty steps array
      return {
        id: data.id,
        name: data.name,
        description: data.description || '',
        steps: [], // New sequence has no steps yet
        created_at: data.created_at,
        updated_at: data.updated_at,
        shop_id: data.shop_id,
        created_by: data.created_by,
        trigger_type: data.trigger_type as 'manual' | 'event' | 'schedule',
        trigger_event: data.trigger_event,
        is_active: data.is_active,
        
        // UI component support
        triggerType: data.trigger_type as 'manual' | 'event' | 'schedule',
        triggerEvent: data.trigger_event,
        isActive: data.is_active,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
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
      
      // Return the updated sequence with empty steps array (steps would be fetched separately if needed)
      return {
        id: data.id,
        name: data.name,
        description: data.description || '',
        steps: sequence.steps || [], // Preserve steps if provided, otherwise empty array
        created_at: data.created_at,
        updated_at: data.updated_at,
        shop_id: data.shop_id,
        created_by: data.created_by,
        trigger_type: data.trigger_type as 'manual' | 'event' | 'schedule',
        trigger_event: data.trigger_event,
        is_active: data.is_active,
        
        // UI component support
        triggerType: data.trigger_type as 'manual' | 'event' | 'schedule',
        triggerEvent: data.trigger_event,
        isActive: data.is_active,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
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
      
      // Map the database records to the EmailTemplate type
      return (data || []).map(template => {
        // Safely convert variables from Json type to EmailTemplateVariable[]
        let variables: EmailTemplateVariable[] = [];
        if (template.variables) {
          try {
            // Handle both string and array formats
            const varsData = typeof template.variables === 'string' 
              ? JSON.parse(template.variables) 
              : template.variables;
            
            if (Array.isArray(varsData)) {
              variables = varsData.map((v: any) => ({
                id: v.id || String(Math.random()),
                name: v.name || '',
                description: v.description || '',
                default_value: v.default_value || v.defaultValue || '',
                defaultValue: v.defaultValue || v.default_value || ''
              }));
            }
          } catch (e) {
            console.error('Error parsing template variables:', e);
          }
        }
        
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
          body: template.content, // For backward compatibility
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
      
      // Safely convert variables from Json type to EmailTemplateVariable[]
      let variables: EmailTemplateVariable[] = [];
      if (data.variables) {
        try {
          // Handle both string and array formats
          const varsData = typeof data.variables === 'string' 
            ? JSON.parse(data.variables) 
            : data.variables;
          
          if (Array.isArray(varsData)) {
            variables = varsData.map((v: any) => ({
              id: v.id || String(Math.random()),
              name: v.name || '',
              description: v.description || '',
              default_value: v.default_value || v.defaultValue || '',
              defaultValue: v.defaultValue || v.default_value || ''
            }));
          }
        } catch (e) {
          console.error('Error parsing template variables:', e);
        }
      }
      
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
        body: data.content, // For backward compatibility
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
          content: template.content || template.body
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Safely convert variables from Json type to EmailTemplateVariable[]
      let variables: EmailTemplateVariable[] = [];
      if (data.variables) {
        try {
          // Handle both string and array formats
          const varsData = typeof data.variables === 'string' 
            ? JSON.parse(data.variables) 
            : data.variables;
          
          if (Array.isArray(varsData)) {
            variables = varsData.map((v: any) => ({
              id: v.id || String(Math.random()),
              name: v.name || '',
              description: v.description || '',
              default_value: v.default_value || v.defaultValue || '',
              defaultValue: v.defaultValue || v.default_value || ''
            }));
          }
        } catch (e) {
          console.error('Error parsing template variables:', e);
        }
      }
      
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
        body: data.content, // For backward compatibility
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
          content: template.content || template.body
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      // Safely convert variables from Json type to EmailTemplateVariable[]
      let variables: EmailTemplateVariable[] = [];
      if (data.variables) {
        try {
          // Handle both string and array formats
          const varsData = typeof data.variables === 'string' 
            ? JSON.parse(data.variables) 
            : data.variables;
          
          if (Array.isArray(varsData)) {
            variables = varsData.map((v: any) => ({
              id: v.id || String(Math.random()),
              name: v.name || '',
              description: v.description || '',
              default_value: v.default_value || v.defaultValue || '',
              defaultValue: v.defaultValue || v.default_value || ''
            }));
          }
        } catch (e) {
          console.error('Error parsing template variables:', e);
        }
      }
      
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
        body: data.content, // For backward compatibility
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
