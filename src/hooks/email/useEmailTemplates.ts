
import { useState, useCallback } from "react";
import { emailTemplateService } from "@/services/email/emailTemplateService";
import { EmailTemplate, EmailTemplatePreview, EmailCategory } from "@/types/email";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

export const useEmailTemplates = (category?: EmailCategory) => {
  const [templates, setTemplates] = useState<EmailTemplatePreview[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    try {
      // Remove the category parameter if undefined to fetch all templates
      const data = await emailTemplateService.getTemplates(category);
      if (Array.isArray(data)) {
        const previews: EmailTemplatePreview[] = data.map(template => ({
          id: template.id,
          name: template.name,
          subject: template.subject,
          category: template.category,
          created_at: template.created_at,
          description: template.description
        }));
        setTemplates(previews);
      } else {
        console.error("Expected an array of templates but received a different data structure");
        setTemplates([]);
      }
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
  }, [category, toast]);

  const fetchTemplateById = async (id: string) => {
    setLoading(true);
    try {
      const template = await emailTemplateService.getTemplateById(id);
      return template;
    } catch (error) {
      console.error("Error fetching email template:", error);
      toast({
        title: "Error",
        description: "Failed to load email template",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createTemplate = async (template: Partial<EmailTemplate>) => {
    try {
      const newTemplate = await emailTemplateService.createTemplate(template);
      if (newTemplate) {
        setTemplates((prev) => [
          {
            id: newTemplate.id,
            name: newTemplate.name,
            subject: newTemplate.subject,
            category: newTemplate.category,
            created_at: newTemplate.created_at,
            description: newTemplate.description
          },
          ...prev,
        ]);
        toast({
          title: "Success",
          description: "Email template created successfully",
        });
      }
      return newTemplate;
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

  const updateTemplate = async (id: string, template: Partial<EmailTemplate>) => {
    try {
      const updatedTemplate = await emailTemplateService.updateTemplate(id, template);
      if (updatedTemplate) {
        setTemplates((prev) =>
          prev.map((t) =>
            t.id === id
              ? {
                  ...t,
                  name: updatedTemplate.name,
                  subject: updatedTemplate.subject,
                  category: updatedTemplate.category,
                  description: updatedTemplate.description
                }
              : t
          )
        );
        toast({
          title: "Success",
          description: "Email template updated successfully",
        });
      }
      return updatedTemplate;
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

  const deleteTemplate = async (id: string) => {
    try {
      const success = await emailTemplateService.deleteTemplate(id);
      if (success) {
        setTemplates((prev) => prev.filter((t) => t.id !== id));
        toast({
          title: "Success",
          description: "Email template deleted successfully",
        });
      }
      return success;
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

  const sendTestEmail = async (templateId: string, recipientEmail: string) => {
    try {
      // Get the template
      const template = await fetchTemplateById(templateId);
      if (!template) {
        throw new Error("Template not found");
      }

      // Call the edge function to send a test email
      const { data, error } = await supabase.functions.invoke('send-test-email', {
        body: {
          email: recipientEmail,
          subject: template.subject,
          content: template.content,
          senderName: "Test Email Service",
          senderEmail: "no-reply@example.com"
        },
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Test email sent successfully",
      });
      
      return true;
    } catch (error) {
      console.error("Error sending test email:", error);
      toast({
        title: "Error",
        description: "Failed to send test email",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    templates,
    loading,
    fetchTemplates,
    fetchTemplateById,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    sendTestEmail
  };
};
