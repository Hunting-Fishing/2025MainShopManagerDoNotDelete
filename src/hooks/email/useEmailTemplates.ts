import { useState, useEffect } from 'react';
import { EmailTemplate } from '@/types/email';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export const useEmailTemplates = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  /**
   * Fetch all email templates
   */
  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setTemplates(data || []);
    } catch (error) {
      console.error("Error fetching email templates:", error);
      toast({
        title: "Error",
        description: "Failed to load email templates",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get a single template by ID
   */
  const getTemplateById = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      return data as EmailTemplate;
    } catch (error) {
      console.error("Error fetching email template:", error);
      toast({
        title: "Error",
        description: "Failed to load email template",
        variant: "destructive",
      });
      return null;
    }
  };

  /**
   * Create a new email template
   */
  const createTemplate = async (template: Partial<EmailTemplate>) => {
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .insert({
          name: template.name,
          subject: template.subject,
          body: template.body,
          category: template.category || 'marketing',
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Email template created successfully",
      });

      fetchTemplates();
      return data as EmailTemplate;
    } catch (error) {
      console.error("Error creating email template:", error);
      toast({
        title: "Error",
        description: "Failed to create email template",
        variant: "destructive",
      });
      return null;
    }
  };

  /**
   * Update an existing email template
   */
  const updateTemplate = async (id: string, template: Partial<EmailTemplate>) => {
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .update({
          name: template.name,
          subject: template.subject,
          body: template.body,
          category: template.category,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Email template updated successfully",
      });

      fetchTemplates();
      return data as EmailTemplate;
    } catch (error) {
      console.error("Error updating email template:", error);
      toast({
        title: "Error",
        description: "Failed to update email template",
        variant: "destructive",
      });
      return null;
    }
  };

  /**
   * Delete an email template
   */
  const deleteTemplate = async (id: string) => {
    try {
      const { error } = await supabase
        .from('email_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Email template deleted successfully",
      });

      fetchTemplates();
      return true;
    } catch (error) {
      console.error("Error deleting email template:", error);
      toast({
        title: "Error",
        description: "Failed to delete email template",
        variant: "destructive",
      });
      return false;
    }
  };

  // Load templates on initial mount
  useEffect(() => {
    fetchTemplates();
  }, []);
  
  /**
   * Send a test email using a template
   */
  const sendTestEmail = async (templateId: string, recipientEmail: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('send-test-email', {
        body: { 
          templateId,
          recipientEmail
        }
      });
      
      if (error) throw error;
      
      toast({
        title: "Test Email Sent",
        description: `A test email has been sent to ${recipientEmail}`,
      });
      
      return { success: true, data };
    } catch (error) {
      console.error("Error sending test email:", error);
      toast({
        title: "Error",
        description: "Failed to send test email",
        variant: "destructive",
      });
      return { success: false, error };
    }
  };

  return {
    templates,
    loading,
    fetchTemplates,
    getTemplateById,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    sendTestEmail
  };
};
