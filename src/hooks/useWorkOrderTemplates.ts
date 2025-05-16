
import { useState, useCallback, useEffect } from "react";
import { WorkOrderTemplate } from "@/types/workOrder";
import { toast } from "sonner";

// Service functions (to be implemented or imported)
const fetchTemplates = async (): Promise<WorkOrderTemplate[]> => {
  // This would be a real API call in a complete implementation
  // For now, return mock data
  return [
    {
      id: "template-1",
      name: "Basic Maintenance",
      description: "Standard maintenance template",
      status: "pending",
      priority: "medium",
      technician: "John Doe",
      notes: "Regular maintenance inspection",
      usage_count: 12,
      last_used: "2023-10-15"
    },
    {
      id: "template-2",
      name: "Full Service",
      description: "Complete vehicle service template",
      status: "pending",
      priority: "high",
      technician: "Jane Smith",
      notes: "Complete inspection and service",
      usage_count: 8,
      last_used: "2023-09-22"
    },
    {
      id: "template-3",
      name: "Quick Oil Change",
      description: "Fast oil change service",
      status: "pending",
      priority: "low",
      technician: "",
      notes: "Oil and filter change only",
      usage_count: 24,
      last_used: "2023-10-18"
    }
  ];
};

const createTemplate = async (template: Omit<WorkOrderTemplate, "id" | "usage_count">): Promise<WorkOrderTemplate> => {
  // This would make a real API call in a complete implementation
  // For now, simulate creating a new template
  return {
    ...template,
    id: `template-${Date.now()}`,
    usage_count: 0,
  };
};

const updateTemplateUsage = async (templateId: string): Promise<void> => {
  // This would make a real API call in a complete implementation
  console.log(`Template ${templateId} usage updated`);
};

export const useWorkOrderTemplates = () => {
  const [templates, setTemplates] = useState<WorkOrderTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  
  const loadTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchTemplates();
      setTemplates(data);
    } catch (error) {
      console.error("Failed to load templates:", error);
      toast.error("Failed to load templates");
    } finally {
      setLoading(false);
    }
  }, []);
  
  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);
  
  const handleApplyTemplate = useCallback((template: WorkOrderTemplate) => {
    // Update template usage
    updateTemplateUsage(template.id).catch(console.error);
    
    // Return template for use
    return template;
  }, []);
  
  const handleSaveTemplate = useCallback(async (newTemplate: Omit<WorkOrderTemplate, "id" | "usage_count">) => {
    try {
      // Save the template
      const savedTemplate = await createTemplate(newTemplate);
      
      // Update local state
      setTemplates(prev => [...prev, savedTemplate]);
      
      toast.success("Template saved successfully");
      return savedTemplate;
    } catch (error) {
      console.error("Failed to save template:", error);
      toast.error("Failed to save template");
      throw error;
    }
  }, []);
  
  return {
    templates,
    loading,
    handleApplyTemplate,
    handleSaveTemplate,
    refreshTemplates: loadTemplates
  };
};
