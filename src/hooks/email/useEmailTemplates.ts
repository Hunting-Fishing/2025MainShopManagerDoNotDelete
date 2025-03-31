
import { useState, useEffect } from "react";
import { emailService } from "@/services/email/emailService";
import { EmailTemplate, EmailTemplatePreview, EmailCategory } from "@/types/email";
import { useToast } from "@/hooks/use-toast";

export const useEmailTemplates = (categoryFilter?: EmailCategory) => {
  const [templates, setTemplates] = useState<EmailTemplatePreview[]>([]);
  const [currentTemplate, setCurrentTemplate] = useState<EmailTemplate | null>(null);
  const [loading, setLoading] = useState(false);
  const [templateLoading, setTemplateLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchTemplates();
  }, [categoryFilter]);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      let data;
      if (categoryFilter) {
        // Use getTemplates with category filter since getTemplatesByCategory doesn't exist
        data = await emailService.getTemplates(categoryFilter);
      } else {
        data = await emailService.getTemplates();
      }
      setTemplates(data);
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
    setTemplateLoading(true);
    try {
      const template = await emailService.getTemplateById(id);
      setCurrentTemplate(template);
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
      setTemplateLoading(false);
    }
  };

  const createTemplate = async (template: Partial<EmailTemplate>) => {
    try {
      const newTemplate = await emailService.createTemplate(template);
      setTemplates((prev) => [newTemplate, ...prev]);
      toast({
        title: "Success",
        description: "Email template created successfully",
      });
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
      setTemplates((prev) => 
        prev.map((t) => t.id === id ? { ...t, ...updatedTemplate } : t)
      );
      if (currentTemplate && currentTemplate.id === id) {
        setCurrentTemplate(updatedTemplate);
      }
      toast({
        title: "Success",
        description: "Email template updated successfully",
      });
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
      if (currentTemplate && currentTemplate.id === id) {
        setCurrentTemplate(null);
      }
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

  const sendTestEmail = async (templateId: string, recipientEmail: string) => {
    try {
      // Fix: Remove the third parameter that's causing the error
      await emailService.sendTestEmail(templateId, recipientEmail);
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
    currentTemplate,
    loading,
    templateLoading,
    fetchTemplates,
    fetchTemplateById,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    sendTestEmail,
  };
};
