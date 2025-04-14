
import { useState } from "react";
import { WorkOrderTemplate } from "@/types/workOrder";
import { v4 as uuidv4 } from "uuid";
import { toast } from "@/hooks/use-toast";

// In-memory storage for templates (to be replaced with database)
let templates: WorkOrderTemplate[] = [];

export function useWorkOrderTemplates() {
  const [loading, setLoading] = useState<boolean>(false);

  const getTemplates = async (): Promise<WorkOrderTemplate[]> => {
    setLoading(true);
    try {
      // In a real app, this would fetch from a database
      return templates;
    } catch (error) {
      console.error("Error fetching templates:", error);
      toast({
        title: "Error",
        description: "Failed to fetch templates",
        variant: "destructive",
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  const createTemplate = async (templateData: Partial<WorkOrderTemplate>): Promise<{ 
    success: boolean; 
    message: string;
    id?: string;
  }> => {
    setLoading(true);
    try {
      // Generate a unique ID
      const id = uuidv4();
      
      // Create a new template
      const newTemplate: WorkOrderTemplate = {
        id,
        name: templateData.name || "Unnamed Template",
        description: templateData.description || "",
        status: templateData.status || "pending",
        priority: templateData.priority || "medium",
        technician: templateData.technician || "",
        notes: templateData.notes || "",
        inventoryItems: templateData.inventoryItems || [],
        createdAt: new Date().toISOString(),
        usageCount: 0,
        lastUsed: undefined,
      };
      
      // Add to in-memory storage (would be database in real app)
      templates.push(newTemplate);
      
      return {
        success: true,
        message: "Template created successfully",
        id
      };
    } catch (error) {
      console.error("Error creating template:", error);
      return {
        success: false,
        message: "Failed to create template"
      };
    } finally {
      setLoading(false);
    }
  };

  const updateTemplateUsage = async (templateId: string): Promise<boolean> => {
    try {
      // Find the template
      const template = templates.find(t => t.id === templateId);
      if (!template) return false;
      
      // Update usage count and last used date
      template.usageCount += 1;
      template.lastUsed = new Date().toISOString();
      
      return true;
    } catch (error) {
      console.error("Error updating template usage:", error);
      return false;
    }
  };

  return {
    templates,
    loading,
    getTemplates,
    createTemplate,
    updateTemplateUsage
  };
}
