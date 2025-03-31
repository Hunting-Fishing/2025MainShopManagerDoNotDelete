import { useState, useEffect } from "react";
import { emailService } from "@/services/email/emailService";
import { EmailTemplate, EmailTemplatePreview, EmailCategory } from "@/types/email";
import { useToast } from "@/hooks/use-toast";

export const useEmailTemplates = (category?: EmailCategory) => {
  const [templates, setTemplates] = useState<EmailTemplatePreview[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchTemplates();
  }, [category]);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const data = await emailService.getTemplates();
      if (Array.isArray(data)) {
        setTemplates(data);
      } else {
        console.error("Expected an array of templates but received a single template");
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
  };

  const fetchTemplateById = async (id: string) => {
    setLoading(true);
    try {
      const template = await emailService.getTemplateById(id);
      if (template) {
        return template;
      }
      return null;
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
      const tempTemplate = {
        id: Date.now().toString(),
        ...template
      } as EmailTemplate;
      
      const newTemplate = await emailService.createTemplate(tempTemplate);
      if (newTemplate) {
        setTemplates((prev) => [
          {
            id: newTemplate.id,
            name: newTemplate.name,
            subject: newTemplate.subject,
            category: newTemplate.category,
            created_at: newTemplate.created_at
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
      const updatedTemplate = await emailService.updateTemplate(id, template);
      if (updatedTemplate) {
        setTemplates((prev) =>
          prev.map((t) =>
            t.id === id
              ? {
                  ...t,
                  name: updatedTemplate.name,
                  subject: updatedTemplate.subject,
                  category: updatedTemplate.category,
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
      await emailService.deleteTemplate(id);
      setTemplates((prev) => prev.filter((t) => t.id !== id));
      toast({
        title: "Success",
        description: "Email template deleted successfully",
      });
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

  const sendTestEmail = async (templateId: string, recipientEmail: string, personalizations?: Record<string, string>) => {
    try {
      const result = await emailService.sendTestEmail(templateId, recipientEmail, personalizations);
      if (result) {
        toast({
          title: "Success",
          description: "Test email sent successfully",
        });
      }
      return result;
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
