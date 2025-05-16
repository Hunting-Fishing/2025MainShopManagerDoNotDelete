
import { useWorkOrderTemplates } from "@/hooks/useWorkOrderTemplates";

// This file now re-exports the hook that fetches data from the database
export { useWorkOrderTemplates };

// For backwards compatibility with any code that imports directly
import { WorkOrderTemplate } from "@/types/workOrder";
export const workOrderTemplates: WorkOrderTemplate[] = [];

// Update this function to return a properly typed WorkOrderTemplate
export const updateTemplateUsage = async (templateId: string) => {
  console.warn('Using deprecated function. Please use useWorkOrderTemplates hook instead.');
  // This is a no-op for compatibility
};

// Update this function to return a properly typed WorkOrderTemplate
export const createTemplate = async () => {
  console.warn('Using deprecated function. Please use useWorkOrderTemplates hook instead.');
  return {
    id: '',
    name: '',
    description: '',
    status: 'active', 
    createdAt: new Date().toISOString(),
    usageCount: 0
  } as WorkOrderTemplate;
};
